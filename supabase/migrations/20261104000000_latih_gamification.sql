-- Latih: gamifikasi (XP, level, streak, lencana) + skenario awal.
-- Aman dijalankan ulang: skenario dan lencana hanya ditambahkan bila belum ada.
--
-- Aturan permainan (cerminkan di src/lib/gamification.ts):
--   * XP skenario = xp_reward x (skor / skor maksimum), dibulatkan.
--   * Mengulang skenario hanya memberi selisih XP terhadap yang sudah pernah didapat,
--     jadi XP tidak bisa "digiling" dengan mengulang skenario yang sama.
--   * Level = 1 + floor(xp / 100). Level tidak pernah turun.
--   * Streak naik bila berlatih di hari berturut-turut (zona waktu Asia/Jakarta).

-- 0. Peringatan bila ada trigger lama yang ikut menambah XP (bisa membuat XP ganda).
do $$
declare
    v_trigger record;
begin
    for v_trigger in
        select tgname, tgrelid::regclass as tbl
          from pg_trigger
         where not tgisinternal
           and tgrelid in ('public.scenario_attempts'::regclass, 'public.attempt_answers'::regclass)
    loop
        raise notice 'Trigger % pada % masih aktif. Pastikan tidak ikut menambah XP.', v_trigger.tgname, v_trigger.tbl;
    end loop;
end;
$$;

-- 1. Lencana baru.
insert into public.badges (code, name, description, icon)
select v.code, v.name, v.description, v.icon
  from (values
    ('streak_3', 'Rutin Berjaga', 'Berlatih tiga hari berturut-turut', 'flame'),
    ('five_scenarios', 'Pemburu Modus', 'Menyelesaikan lima skenario berbeda', 'target'),
    ('xp_300', 'Penjaga Tangguh', 'Mengumpulkan 300 XP dari latihan', 'shield')
  ) as v(code, name, description, icon)
 where not exists (select 1 from public.badges b where b.code = v.code);

-- 2. finish_scenario versi gamifikasi.
drop function if exists public.finish_scenario(uuid, uuid[]);
drop function if exists public.finish_scenario(uuid[], uuid);

create function public.finish_scenario(p_scenario_id uuid, p_choice_ids uuid[])
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user uuid := auth.uid();
    v_reward integer;
    v_branching boolean;
    v_score integer;
    v_max integer;
    v_answered integer;
    v_target integer;
    v_awarded integer;
    v_xp integer;
    v_attempt uuid;
    v_today date := (now() at time zone 'Asia/Jakarta')::date;
    v_last date;
    v_streak integer;
    v_total integer;
    v_old_level integer;
    v_level integer;
    v_completed integer;
    v_badges jsonb;
begin
    if v_user is null then
        raise exception 'not authenticated' using errcode = '42501';
    end if;

    select s.xp_reward into v_reward
      from scenarios s
     where s.id = p_scenario_id and s.status = 'published';
    if v_reward is null then
        raise exception 'scenario not found' using errcode = 'P0002';
    end if;

    -- Satu jawaban per langkah. Bila ada lebih dari satu, ambil yang terburuk.
    select coalesce(sum(p.score_delta), 0), count(*)
      into v_score, v_answered
      from (
        select distinct on (c.step_id) c.step_id, c.score_delta
          from scenario_choices c
          join scenario_steps st on st.id = c.step_id
         where st.scenario_id = p_scenario_id
           and c.id = any(p_choice_ids)
         order by c.step_id, c.score_delta asc
      ) p;

    if v_answered = 0 then
        raise exception 'invalid choices' using errcode = '22023';
    end if;

    -- Skenario linear: skor maksimum dari semua langkah (berhenti di tengah tidak menguntungkan).
    -- Skenario bercabang: skor maksimum dari langkah yang benar-benar dilalui.
    select exists (
        select 1
          from scenario_choices c
          join scenario_steps st on st.id = c.step_id
         where st.scenario_id = p_scenario_id and c.next_step_id is not null
    ) into v_branching;

    select coalesce(sum(m.best), 0) into v_max
      from (
        select max(c.score_delta) as best
          from scenario_choices c
          join scenario_steps st on st.id = c.step_id
         where st.scenario_id = p_scenario_id
           and (
             not v_branching
             or c.step_id in (select c2.step_id from scenario_choices c2 where c2.id = any(p_choice_ids))
           )
         group by c.step_id
      ) m;

    v_score := least(greatest(v_score, 0), v_max);
    v_target := case when v_max > 0 then round(v_reward * v_score::numeric / v_max)::integer else 0 end;

    select coalesce(sum(a.xp_earned), 0) into v_awarded
      from scenario_attempts a
     where a.user_id = v_user and a.scenario_id = p_scenario_id;

    v_xp := greatest(v_target - v_awarded, 0);

    insert into scenario_attempts (user_id, scenario_id, score, max_score, xp_earned)
    values (v_user, p_scenario_id, v_score, v_max, v_xp)
    returning id into v_attempt;

    insert into attempt_answers (attempt_id, choice_id, step_id)
    select distinct on (c.step_id) v_attempt, c.id, c.step_id
      from scenario_choices c
      join scenario_steps st on st.id = c.step_id
     where st.scenario_id = p_scenario_id
       and c.id = any(p_choice_ids)
     order by c.step_id, c.score_delta asc;

    insert into profiles (id) values (v_user) on conflict (id) do nothing;

    select p.last_active_date, p.streak_count, p.xp, p.level
      into v_last, v_streak, v_total, v_old_level
      from profiles p
     where p.id = v_user
       for update;

    v_streak := case
        when v_last = v_today then greatest(v_streak, 1)
        when v_last = v_today - 1 then v_streak + 1
        else 1
    end;
    v_total := v_total + v_xp;
    v_level := greatest(v_old_level, 1 + v_total / 100);

    update profiles
       set xp = v_total,
           level = v_level,
           streak_count = v_streak,
           last_active_date = v_today
     where id = v_user;

    select count(distinct a.scenario_id) into v_completed
      from scenario_attempts a
     where a.user_id = v_user;

    with eligible as (
        select b.id, b.code, b.name
          from badges b
         where (b.code = 'first_scenario')
            or (b.code = 'perfect_run' and v_max > 0 and v_score >= v_max)
            or (b.code = 'streak_3' and v_streak >= 3)
            or (b.code = 'five_scenarios' and v_completed >= 5)
            or (b.code = 'xp_300' and v_total >= 300)
    ),
    inserted as (
        insert into user_badges (user_id, badge_id)
        select v_user, e.id
          from eligible e
         where not exists (
            select 1 from user_badges ub where ub.user_id = v_user and ub.badge_id = e.id
         )
        returning badge_id
    )
    select coalesce(jsonb_agg(jsonb_build_object('code', e.code, 'name', e.name)), '[]'::jsonb)
      into v_badges
      from inserted i
      join eligible e on e.id = i.badge_id;

    return jsonb_build_object(
        'xp_earned', v_xp,
        'score', v_score,
        'max_score', v_max,
        'xp_total', v_total,
        'level', v_level,
        'leveled_up', v_level > v_old_level,
        'streak', v_streak,
        'completed', v_completed,
        'new_badges', v_badges
    );
end;
$$;

revoke all on function public.finish_scenario(uuid, uuid[]) from public, anon;
grant execute on function public.finish_scenario(uuid, uuid[]) to authenticated;

-- 3. Lengkapi skenario magang yang baru punya satu langkah.
do $$
declare
    v_scenario uuid;
    v_step uuid;
begin
    select id into v_scenario from scenarios where slug = 'tawaran-magang-wa';
    if v_scenario is null or (select count(*) from scenario_steps where scenario_id = v_scenario) <> 1 then
        return;
    end if;

    insert into scenario_steps (scenario_id, step_order, channel, sender_name, narrative)
    values (v_scenario, 2, 'chat', 'Rina (HRD PT Maju Fiktif)',
        'Kami belum punya email kantor karena masih tahap ekspansi. Tapi tenang, ini foto ID card saya. Kalau tidak transfer sekarang, posisi Anda diberikan ke kandidat lain.')
    returning id into v_step;

    insert into scenario_choices (step_id, label, is_safe, score_delta, feedback, sort_order) values
    (v_step, 'Percaya karena sudah dikirimi foto ID card', false, 0,
        'Foto ID card mudah dipalsukan dan bukan bukti perusahaan itu nyata. Perusahaan sah punya domain email dan alamat yang bisa dicek.', 1),
    (v_step, 'Cari nama perusahaan di situs resmi dan ulasan pekerja', true, 10,
        'Langkah yang tepat. Cek AHU Kemenkumham, LinkedIn, dan ulasan karyawan. Lowongan palsu biasanya tidak meninggalkan jejak.', 2),
    (v_step, 'Tawar biaya pelatihannya jadi setengah', false, 2,
        'Menawar tetap berarti membayar penipu. Masalahnya bukan besar biaya, tapi adanya biaya di muka itu sendiri.', 3);

    insert into scenario_steps (scenario_id, step_order, channel, sender_name, narrative)
    values (v_scenario, 3, 'chat', 'Rina (HRD PT Maju Fiktif)',
        'Ya sudah, kalau ragu isi saja formulir data diri ini dulu: nama ibu kandung, foto KTP, dan selfie memegang KTP. Nanti biaya bisa dipotong dari gaji pertama.')
    returning id into v_step;

    insert into scenario_choices (step_id, label, is_safe, score_delta, feedback, sort_order) values
    (v_step, 'Kirim, toh tidak perlu bayar sekarang', false, 0,
        'Foto KTP + selfie + nama ibu kandung cukup untuk mendaftar pinjol atas namamu. Data pribadi sama berharganya dengan uang.', 1),
    (v_step, 'Tolak, blokir, lalu laporkan nomornya', true, 10,
        'Tepat. Laporkan ke aduannomor.id atau patrolisiber.id agar nomor ini tidak menjerat pelamar lain.', 2),
    (v_step, 'Kirim KTP saja tanpa selfie', false, 3,
        'Lebih sedikit tetap berisiko. KTP saja sudah bisa disalahgunakan untuk registrasi akun dan kartu SIM.', 3);
end;
$$;

-- 4. Skenario baru.
do $$
declare
    v_item jsonb;
    v_step jsonb;
    v_choice jsonb;
    v_scenario uuid;
    v_step_id uuid;
    v_order integer;
    v_corder integer;
begin
    for v_item in select value from jsonb_array_elements($json$
[
  {
    "slug": "paket-tertahan-apk",
    "title": "Paket Tertahan, Kurir Kirim File",
    "summary": "Kurir bilang paketmu tertahan dan mengirim file untuk cek resi. Bagaimana kamu merespons?",
    "category": "phishing",
    "difficulty": "mudah",
    "xp": 40,
    "steps": [
      {
        "channel": "WhatsApp",
        "sender": "Kurir Ekspres",
        "narrative": "Selamat siang kak, paket atas nama kakak tertahan di gudang karena alamat kurang lengkap. Silakan cek foto resinya di file berikut ya: Foto_Resi.apk",
        "choices": [
          { "label": "Buka filenya untuk lihat resi", "safe": false, "score": 0, "feedback": "Foto tidak pernah berformat .apk. File ini aplikasi yang bisa membaca SMS dan OTP-mu begitu dipasang." },
          { "label": "Cek nomor resi langsung di aplikasi atau situs resmi ekspedisi", "safe": true, "score": 10, "feedback": "Tepat. Status paket asli selalu bisa dicek sendiri di kanal resmi tanpa membuka file dari orang asing." },
          { "label": "Balas: “Kirim fotonya biasa saja, jangan file”", "safe": true, "score": 6, "feedback": "Cukup waspada, tapi tetap membuka percakapan dengan penipu. Lebih aman cek mandiri lewat kanal resmi." }
        ]
      },
      {
        "channel": "WhatsApp",
        "sender": "Kurir Ekspres",
        "narrative": "Kak, kalau tidak dikonfirmasi dalam 1 jam paket akan dikembalikan ke pengirim dan kakak kena denda Rp 150.000 lho.",
        "choices": [
          { "label": "Panik dan langsung pasang filenya", "safe": false, "score": 0, "feedback": "Ancaman denda dan batas waktu adalah trik untuk membuatmu berhenti berpikir. Ekspedisi tidak menagih denda lewat chat." },
          { "label": "Abaikan tenggat, cek dulu ke layanan pelanggan resmi", "safe": true, "score": 10, "feedback": "Bagus. Tekanan waktu justru tanda bahaya. Nomor CS resmi ada di situs ekspedisi, bukan di chat ini." },
          { "label": "Tanya ke teman apakah pernah dapat pesan serupa", "safe": true, "score": 5, "feedback": "Bertanya itu baik, tapi pastikan juga lewat kanal resmi. Teman belum tentu tahu modus terbaru." }
        ]
      },
      {
        "channel": "WhatsApp",
        "sender": "Kurir Ekspres",
        "narrative": "Ternyata temanmu cerita: dia sudah terlanjur memasang file serupa kemarin, dan sekarang ada SMS OTP masuk terus.",
        "choices": [
          { "label": "Sarankan dia hapus aplikasinya saja, beres", "safe": false, "score": 3, "feedback": "Menghapus aplikasi belum cukup. Akses yang sudah dicuri tetap bisa dipakai pelaku." },
          { "label": "Minta dia putuskan internet, hubungi bank, dan ganti semua kata sandi", "safe": true, "score": 10, "feedback": "Ini langkah darurat yang benar: putus koneksi, blokir rekening lewat bank, ganti kata sandi, lalu lapor." },
          { "label": "Biarkan, mungkin OTP-nya cuma salah kirim", "safe": false, "score": 0, "feedback": "OTP yang terus masuk berarti ada yang mencoba masuk ke akunnya. Setiap menit berharga." }
        ]
      }
    ]
  },
  {
    "slug": "menang-giveaway-ongkir",
    "title": "Menang Giveaway, Bayar Ongkir Dulu",
    "summary": "Akun mirip selebgram mengumumkan kamu menang hadiah. Syaratnya cuma bayar ongkir.",
    "category": "giveaway",
    "difficulty": "mudah",
    "xp": 40,
    "steps": [
      {
        "channel": "Instagram DM",
        "sender": "giveaway.official_resmi",
        "narrative": "Selamat! Kamu terpilih jadi pemenang giveaway iPhone dari kami 🎉 Klaim hadiahmu sebelum jam 21.00 malam ini ya.",
        "choices": [
          { "label": "Langsung balas minta cara klaimnya", "safe": false, "score": 2, "feedback": "Membalas memberi sinyal kamu tertarik. Cek dulu: apakah kamu benar ikut giveaway itu?" },
          { "label": "Cek akun aslinya: centang biru, jumlah pengikut, dan pengumuman resmi", "safe": true, "score": 10, "feedback": "Tepat. Akun palsu biasanya menambah kata seperti “official” atau “resmi” dan baru dibuat." },
          { "label": "Abaikan karena tidak pernah ikut giveaway", "safe": true, "score": 8, "feedback": "Logika yang bagus. Tidak ikut, tidak mungkin menang. Akan lebih baik lagi jika dilaporkan." }
        ]
      },
      {
        "channel": "Instagram DM",
        "sender": "giveaway.official_resmi",
        "narrative": "Hadiah sudah siap kirim kak. Cukup transfer ongkir dan asuransi Rp 85.000 ke rekening admin kami, lalu kirim bukti transfernya.",
        "choices": [
          { "label": "Transfer, nominalnya kecil dibanding iPhone", "safe": false, "score": 0, "feedback": "Nominal kecil sengaja dipilih supaya kamu tidak berpikir panjang. Setelah ini biasanya muncul biaya “pajak” dan “admin”." },
          { "label": "Tolak. Hadiah asli tidak meminta pemenang membayar", "safe": true, "score": 10, "feedback": "Betul. Penyelenggara asli menanggung ongkir atau memotongnya dari hadiah, bukan meminta transfer ke rekening pribadi." },
          { "label": "Minta ongkir dipotong dari hadiah saja", "safe": true, "score": 4, "feedback": "Ide bagus untuk menguji, tapi penipu akan mencari alasan lain. Lebih aman berhenti di sini." }
        ]
      },
      {
        "channel": "Instagram DM",
        "sender": "giveaway.official_resmi",
        "narrative": "Kalau tidak diklaim, hadiahnya hangus dan akun kamu kami laporkan karena dianggap menipu panitia. 😡",
        "choices": [
          { "label": "Takut dilaporkan, akhirnya transfer", "safe": false, "score": 0, "feedback": "Ancaman balik adalah tanda klasik penipuan. Kamu tidak berutang apa pun pada mereka." },
          { "label": "Blokir dan laporkan akunnya ke Instagram", "safe": true, "score": 10, "feedback": "Sempurna. Melaporkan membantu menurunkan akun palsu sebelum menjerat orang lain." },
          { "label": "Balas dengan marah-marah", "safe": true, "score": 4, "feedback": "Tidak berbahaya, tapi hanya membuang energi. Blokir dan laporkan jauh lebih efektif." }
        ]
      }
    ]
  },
  {
    "slug": "teman-lama-pinjam-uang",
    "title": "Teman Lama Mendadak Pinjam Uang",
    "summary": "Akun teman SMA-mu menghubungi dan butuh bantuan mendesak. Benarkah itu dia?",
    "category": "impersonasi",
    "difficulty": "sedang",
    "xp": 60,
    "steps": [
      {
        "channel": "WhatsApp",
        "sender": "Dimas SMA",
        "narrative": "Bro, ini nomor baru gue ya, yang lama hilang. Lagi di rumah sakit nih, ibu gue mendadak dioperasi. Bisa pinjem 2 juta dulu? Besok gue ganti.",
        "choices": [
          { "label": "Langsung transfer, kasihan ibunya", "safe": false, "score": 0, "feedback": "Rasa iba adalah senjata utama modus ini. “Nomor baru” + darurat + minta uang = wajib verifikasi dulu." },
          { "label": "Telepon nomor lama Dimas atau hubungi keluarganya", "safe": true, "score": 10, "feedback": "Tepat. Verifikasi lewat kanal lain yang kamu percaya. Penipu tidak bisa menjawab telepon dari nomor aslinya." },
          { "label": "Tanya hal pribadi yang cuma Dimas tahu", "safe": true, "score": 7, "feedback": "Cukup cerdik, tapi info pribadi bisa dikorek dari media sosial. Telepon langsung tetap lebih kuat." }
        ]
      },
      {
        "channel": "WhatsApp",
        "sender": "Dimas SMA",
        "narrative": "Jangan telepon dulu bro, HP gue lagi rusak mic-nya. Chat aja ya. Plis cepet, administrasinya harus lunas sebelum jam 3.",
        "choices": [
          { "label": "Oke, kirim uang separuh dulu", "safe": false, "score": 1, "feedback": "Separuh tetap kerugian. Menolak telepon adalah tanda kuat bahwa itu bukan Dimas." },
          { "label": "Minta video call singkat 5 detik saja", "safe": true, "score": 10, "feedback": "Bagus. Penipu hampir selalu menghindari video call. Jika ditolak lagi, anggap ini penipuan." },
          { "label": "Tawarkan transfer langsung ke rekening rumah sakit", "safe": true, "score": 7, "feedback": "Langkah yang aman. Rumah sakit punya rekening resmi atas nama institusi, bukan perorangan." }
        ]
      },
      {
        "channel": "WhatsApp",
        "sender": "Dimas SMA",
        "narrative": "Ternyata Dimas yang asli membalas lewat Instagram: akunnya tidak pernah ganti nomor. Nomor tadi masih terus mengirim pesan.",
        "choices": [
          { "label": "Blokir saja, selesai", "safe": true, "score": 6, "feedback": "Aman untukmu, tapi teman-teman lain mungkin juga dihubungi nomor yang sama." },
          { "label": "Laporkan nomornya dan kabari teman-teman agar waspada", "safe": true, "score": 10, "feedback": "Sempurna. Penipu biasanya menghubungi banyak kontak dari satu lingkaran pertemanan." },
          { "label": "Kerjai penipunya dengan bukti transfer palsu", "safe": false, "score": 2, "feedback": "Melayani penipu membuang waktu dan bisa memancing ancaman. Lebih baik putus kontak dan lapor." }
        ]
      }
    ]
  },
  {
    "slug": "grup-investasi-profit-harian",
    "title": "Grup Investasi Profit 10% Sehari",
    "summary": "Kamu dimasukkan ke grup Telegram penuh testimoni untung besar. Tergoda ikut?",
    "category": "pinjol-investasi",
    "difficulty": "sedang",
    "xp": 60,
    "steps": [
      {
        "channel": "Telegram",
        "sender": "Mentor Cuan Sejahtera",
        "narrative": "Selamat bergabung! Member kami rata-rata profit 10% per hari dari robot trading. Modal mulai Rp 500 ribu, dijamin tanpa rugi. Cek testimoni di atas ya 👆",
        "choices": [
          { "label": "Testimoninya banyak, berarti terpercaya", "safe": false, "score": 0, "feedback": "Testimoni mudah dibuat dari akun palsu. Untung 10% per hari dan “tanpa rugi” tidak mungkin ada di investasi sah." },
          { "label": "Cek legalitasnya di situs OJK atau Bappebti", "safe": true, "score": 10, "feedback": "Tepat. Investasi resmi terdaftar dan bisa dicek. Kalau tidak terdaftar, jangan setor." },
          { "label": "Coba modal kecil dulu untuk membuktikan", "safe": false, "score": 2, "feedback": "Ini jebakan umum: modal kecil sering dibiarkan “untung” agar kamu menyetor lebih besar." }
        ]
      },
      {
        "channel": "Telegram",
        "sender": "Mentor Cuan Sejahtera",
        "narrative": "Tenang, kami sudah terdaftar kok. Ini fotonya: logo OJK dan sertifikat. Promo bonus 50% hanya untuk 10 pendaftar pertama hari ini!",
        "choices": [
          { "label": "Percaya karena ada logo OJK", "safe": false, "score": 0, "feedback": "Logo bisa ditempel siapa saja. Verifikasi harus dari daftar resmi, bukan dari gambar kiriman mereka." },
          { "label": "Cari nama entitasnya di daftar resmi OJK atau hubungi 157", "safe": true, "score": 10, "feedback": "Bagus. Cek sendiri di sumber resmi. Bonus terbatas waktu adalah tekanan klasik." },
          { "label": "Tanya member lain di grup", "safe": false, "score": 3, "feedback": "Member di grup seperti ini sering kali akun milik pelaku sendiri." }
        ]
      },
      {
        "channel": "Telegram",
        "sender": "Mentor Cuan Sejahtera",
        "narrative": "Teman yang sudah setor cerita: saldonya di aplikasi terlihat naik, tapi saat mau tarik dana diminta bayar “pajak penarikan” 20% dulu.",
        "choices": [
          { "label": "Sarankan bayar pajaknya supaya dana bisa cair", "safe": false, "score": 0, "feedback": "Ini tahap akhir penipuan. Setelah “pajak” akan ada biaya lain. Angka di aplikasi itu tidak nyata." },
          { "label": "Minta dia stop setor, simpan bukti, dan lapor ke OJK atau polisi", "safe": true, "score": 10, "feedback": "Tepat. Hentikan kerugian, kumpulkan bukti transfer dan chat, lalu laporkan." },
          { "label": "Sarankan menunggu, mungkin sistemnya sedang gangguan", "safe": false, "score": 2, "feedback": "Menunggu hanya memberi waktu pelaku menghilang. Dana sulit dilacak bila lapor terlambat." }
        ]
      }
    ]
  },
  {
    "slug": "cs-bank-minta-otp",
    "title": "CS Bank Minta Kode OTP",
    "summary": "Seseorang mengaku dari bank dan bilang rekeningmu akan diblokir. Ujian sesungguhnya.",
    "category": "impersonasi",
    "difficulty": "sulit",
    "xp": 80,
    "steps": [
      {
        "channel": "Telepon lalu WhatsApp",
        "sender": "CS Bank Nusantara",
        "narrative": "Selamat sore, kami dari bagian keamanan Bank Nusantara. Terdeteksi transaksi mencurigakan Rp 4,7 juta dari rekening Bapak/Ibu. Apakah benar Anda yang melakukannya?",
        "choices": [
          { "label": "Panik dan bilang bukan, minta dibantu blokir", "safe": false, "score": 2, "feedback": "Reaksi wajar, tapi kamu belum tahu ini benar bank atau bukan. Penipu justru menunggu kepanikanmu." },
          { "label": "Tutup, lalu telepon nomor resmi di balik kartu ATM", "safe": true, "score": 10, "feedback": "Tepat. Selalu hubungi bank lewat nomor yang kamu cari sendiri, bukan nomor yang menghubungimu." },
          { "label": "Minta penelepon menyebutkan nama dan ID pegawainya", "safe": true, "score": 5, "feedback": "Lumayan, tapi nama dan ID bisa dikarang. Verifikasi terbaik tetap menelepon balik ke nomor resmi." }
        ]
      },
      {
        "channel": "WhatsApp",
        "sender": "CS Bank Nusantara",
        "narrative": "Untuk membatalkan transaksi, sistem akan mengirim 6 digit kode ke HP Anda. Mohon sebutkan kodenya agar dana Anda aman. Kode ini hanya berlaku 2 menit.",
        "choices": [
          { "label": "Sebutkan kodenya agar dana aman", "safe": false, "score": 0, "feedback": "OTP adalah kunci akunmu. Bank tidak pernah meminta OTP, PIN, atau kata sandi dalam kondisi apa pun." },
          { "label": "Tolak. Bank tidak pernah meminta OTP", "safe": true, "score": 10, "feedback": "Sempurna. Isi SMS OTP biasanya bahkan menuliskan: “JANGAN BERIKAN KODE INI KEPADA SIAPA PUN”." },
          { "label": "Sebutkan tiga digit pertama saja", "safe": false, "score": 1, "feedback": "Sebagian kode tetap berbahaya. Pelaku bisa meminta sisanya dengan alasan lain." }
        ]
      },
      {
        "channel": "WhatsApp",
        "sender": "CS Bank Nusantara",
        "narrative": "Baik, kalau begitu kami kirim tautan formulir pengamanan: bank-nusantara-verifikasi.site. Login dengan user internet banking Anda ya.",
        "choices": [
          { "label": "Login lewat tautan itu, toh bukan OTP", "safe": false, "score": 0, "feedback": "Domain .site bukan domain bank. Halaman ini mencuri user dan kata sandimu secara langsung." },
          { "label": "Abaikan tautan, laporkan nomor ke bank lewat kanal resmi", "safe": true, "score": 10, "feedback": "Tepat. Bank punya kanal pelaporan penipuan. Laporanmu membantu memblokir nomor dan domain palsu." },
          { "label": "Buka tautannya untuk melihat saja tanpa login", "safe": false, "score": 3, "feedback": "Membuka tautan phishing tetap berisiko dan memberi tahu pelaku nomormu aktif." }
        ]
      }
    ]
  },
  {
    "slug": "link-daftar-bansos",
    "title": "Link Pendaftaran Bansos Viral",
    "summary": "Pesan berantai di grup keluarga menawarkan bantuan Rp 3,5 juta. Ikut sebar atau cek dulu?",
    "category": "misinformasi",
    "difficulty": "mudah",
    "xp": 40,
    "steps": [
      {
        "channel": "Grup WhatsApp Keluarga",
        "sender": "Tante Ani",
        "narrative": "Info penting!! Pemerintah bagi bantuan Rp 3,5 juta untuk semua warga ber-KTP. Daftar di sini sebelum ditutup: bansos-2026-daftar.blogspot.com. Sebarkan ke 10 grup ya!",
        "choices": [
          { "label": "Ikut sebarkan, siapa tahu bermanfaat", "safe": false, "score": 0, "feedback": "Pesan berantai dengan perintah “sebarkan” dan tautan blogspot adalah ciri hoaks. Menyebarkan bisa menjerat keluarga lain." },
          { "label": "Cek kebenarannya di situs resmi pemerintah atau cekfakta", "safe": true, "score": 10, "feedback": "Tepat. Program resmi diumumkan di situs .go.id dan bisa dicek di kanal cek fakta." },
          { "label": "Daftar dulu untuk diri sendiri", "safe": false, "score": 0, "feedback": "Formulir seperti ini biasanya meminta NIK, foto KTP, bahkan nomor rekening. Data itu yang dicari pelaku." }
        ]
      },
      {
        "channel": "Grup WhatsApp Keluarga",
        "sender": "Om Budi",
        "narrative": "Om sudah daftar tadi, isinya nama, NIK, nama ibu kandung, sama nomor rekening. Katanya dana cair 3 hari. Kamu nggak ikut?",
        "choices": [
          { "label": "Diam saja, tidak enak menegur orang tua", "safe": false, "score": 2, "feedback": "Rasa sungkan wajar, tapi data Om Budi sudah berisiko. Diam berarti membiarkan kerugian terjadi." },
          { "label": "Jelaskan dengan sopan bahwa itu hoaks, beri tautan cek fakta", "safe": true, "score": 10, "feedback": "Bagus. Koreksi yang ramah dan disertai sumber lebih mudah diterima keluarga." },
          { "label": "Balas di grup: “Om ketipu tuh!”", "safe": true, "score": 4, "feedback": "Isinya benar, tapi cara ini bisa membuat Om malu dan malah membela diri." }
        ]
      },
      {
        "channel": "Grup WhatsApp Keluarga",
        "sender": "Om Budi",
        "narrative": "Waduh, jadi gimana dong? Data Om sudah terlanjur masuk.",
        "choices": [
          { "label": "Sudah terlanjur, ya sudah pasrah", "safe": false, "score": 0, "feedback": "Masih banyak yang bisa dilakukan. Bertindak cepat mengurangi risiko penyalahgunaan." },
          { "label": "Bantu hubungi bank, pantau rekening, dan waspadai OTP atau pinjol atas namanya", "safe": true, "score": 10, "feedback": "Tepat. Beri tahu bank, aktifkan notifikasi transaksi, dan jangan berikan OTP yang tiba-tiba masuk." },
          { "label": "Suruh Om ganti nomor HP", "safe": true, "score": 4, "feedback": "Kurang tepat sasaran. Yang bocor adalah NIK dan rekening, jadi fokus pada bank dan pemantauan." }
        ]
      }
    ]
  },
  {
    "slug": "hp-murah-bayar-di-luar",
    "title": "HP Murah, Bayar di Luar Aplikasi",
    "summary": "Penjual di marketplace menawarkan diskon besar asal transaksi pindah ke WhatsApp.",
    "category": "manipulasi-tawaran",
    "difficulty": "sedang",
    "xp": 60,
    "steps": [
      {
        "channel": "Chat Marketplace",
        "sender": "Toko Gadget Murah88",
        "narrative": "Halo kak, HP yang kakak lihat bisa saya kasih Rp 2,1 juta saja (harga normal 6 juta). Tapi lanjut di WhatsApp ya biar nggak kena potongan aplikasi: 0812-xxxx-xxxx",
        "choices": [
          { "label": "Pindah ke WhatsApp, lumayan hemat", "safe": false, "score": 0, "feedback": "Begitu keluar dari aplikasi, kamu kehilangan perlindungan pembeli. Harga jauh di bawah pasar adalah umpan." },
          { "label": "Tetap bertransaksi di dalam aplikasi atau batalkan", "safe": true, "score": 10, "feedback": "Tepat. Dana di marketplace ditahan sampai barang diterima. Itu perlindunganmu." },
          { "label": "Tanya kenapa harganya bisa semurah itu", "safe": true, "score": 4, "feedback": "Pertanyaan wajar, tapi jawabannya akan selalu meyakinkan. Patokannya tetap: jangan keluar dari aplikasi." }
        ]
      },
      {
        "channel": "WhatsApp",
        "sender": "Toko Gadget Murah88",
        "narrative": "Stok tinggal 1 kak, banyak yang antre. Transfer DP 50% dulu ke rekening pribadi saya ya, nanti resi langsung saya kirim.",
        "choices": [
          { "label": "Transfer DP supaya tidak keduluan", "safe": false, "score": 0, "feedback": "“Stok tinggal 1” dan DP ke rekening pribadi adalah kombinasi tekanan yang sering berakhir dengan penjual menghilang." },
          { "label": "Cek nomor rekeningnya di cekrekening.id dan ulasan toko", "safe": true, "score": 10, "feedback": "Bagus. Rekening yang pernah dilaporkan bisa dicek. Toko baru tanpa ulasan juga perlu dicurigai." },
          { "label": "Minta COD saja", "safe": true, "score": 7, "feedback": "COD lebih aman, tapi tetap periksa barang sebelum membayar. Penipu sering menolak COD dengan berbagai alasan." }
        ]
      },
      {
        "channel": "WhatsApp",
        "sender": "Toko Gadget Murah88",
        "narrative": "Penjual mengirim foto resi, tapi saat kamu cek di situs ekspedisi nomornya tidak ditemukan. Ia meminta pelunasan sisa 50% sekarang.",
        "choices": [
          { "label": "Lunasi, mungkin resinya belum terupdate", "safe": false, "score": 0, "feedback": "Resi yang tidak terdaftar hampir pasti palsu. Melunasi berarti menggandakan kerugian." },
          { "label": "Stop transfer, simpan bukti, lapor ke cekrekening.id dan bank", "safe": true, "score": 10, "feedback": "Tepat. Laporan rekening penipu membantu pemblokiran dan memperingatkan pembeli lain." },
          { "label": "Minta uang DP dikembalikan dulu", "safe": true, "score": 4, "feedback": "Boleh dicoba, tapi jangan berharap banyak. Prioritaskan lapor ke bank secepatnya." }
        ]
      }
    ]
  }
]
$json$::jsonb)
    loop
        if exists (select 1 from scenarios where slug = v_item->>'slug') then
            continue;
        end if;

        insert into scenarios (slug, title, summary, difficulty, xp_reward, status, category_id)
        values (
            v_item->>'slug',
            v_item->>'title',
            v_item->>'summary',
            (v_item->>'difficulty')::difficulty_level,
            (v_item->>'xp')::integer,
            'published',
            (select id from scam_categories where slug = v_item->>'category')
        )
        returning id into v_scenario;

        v_order := 0;
        for v_step in select value from jsonb_array_elements(v_item->'steps')
        loop
            v_order := v_order + 1;
            insert into scenario_steps (scenario_id, step_order, channel, sender_name, narrative)
            values (v_scenario, v_order, v_step->>'channel', v_step->>'sender', v_step->>'narrative')
            returning id into v_step_id;

            v_corder := 0;
            for v_choice in select value from jsonb_array_elements(v_step->'choices')
            loop
                v_corder := v_corder + 1;
                insert into scenario_choices (step_id, label, is_safe, score_delta, feedback, sort_order)
                values (
                    v_step_id,
                    v_choice->>'label',
                    (v_choice->>'safe')::boolean,
                    (v_choice->>'score')::integer,
                    v_choice->>'feedback',
                    v_corder
                );
            end loop;
        end loop;
    end loop;
end;
$$;
