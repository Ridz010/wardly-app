# Ward-Ly

**Teman tenang saat kamu ragu sama sebuah pesan.** Ward-Ly adalah aplikasi web berbahasa Indonesia yang membantu anak muda mengenali tipuan digital, berlatih mengambil keputusan yang lebih aman, dan tahu apa yang harus dilakukan saat ada yang terasa janggal.

Dibuat untuk studi kasus **MIT-Week 2026 — Guardians of the Digital Space: Empowering Today's Generation Toward a Safer Cyber Ecosystem**.

| | |
| --- | --- |
| Live demo | https://wardly-app.vercel.app/ |
| Video demo | `https://<isi-tautan-video>` |
| Repositori | https://github.com/Ridz010/wardly-app |

> **Untuk juri, alur tercepat (± 2 menit, tanpa akun):** buka `/bedah` → klik salah satu contoh pesan atau tempel pesan fiktif → **Periksa** → baca skor, tanda bahaya, alasan, dan langkah berikutnya. Lanjutkan ke `/latih` untuk mencoba satu skenario, lalu `/lindungi` untuk panduan tindak lanjut.

---

## Daftar isi

1. [Latar belakang](#latar-belakang)
2. [Target pengguna](#target-pengguna)
3. [Solusi: kerangka Guardians](#solusi-kerangka-guardians)
4. [Alur penggunaan untuk diuji](#alur-penggunaan-untuk-diuji)
5. [Cara Ward-Ly menilai pesan](#cara-ward-ly-menilai-pesan)
6. [Keamanan, privasi, dan batasan](#keamanan-privasi-dan-batasan)
7. [Keterbatasan yang kami akui](#keterbatasan-yang-kami-akui)
8. [Teknologi dan arsitektur](#teknologi-dan-arsitektur)
9. [Menjalankan secara lokal](#menjalankan-secara-lokal)
10. [Rute aplikasi](#rute-aplikasi)

---

## Latar belakang

Setiap hari anak muda Indonesia menerima tawaran kerja palsu, giveaway penipuan, akun yang menyamar sebagai teman atau pihak resmi, tawaran pinjaman dan investasi yang menyesatkan, serta tautan phishing. Masalahnya ada di tiga titik:

1. **Saat menerima pesan**, sulit membedakan yang tepercaya dari yang menipu, apalagi saat pesan dibuat mendesak.
2. **Pengetahuan tidak terlatih.** Membaca artikel tentang modus berbeda dengan mengambil keputusan di tengah percakapan yang menekan.
3. **Setelah sadar menjadi target**, banyak orang tidak tahu langkah pertama, dan tidak tahu cara memperingatkan teman atau keluarga.

Ward-Ly dirancang untuk hadir di ketiga titik itu.

## Target pengguna

- **Utama:** pelajar, mahasiswa, dan pencari kerja usia 15–25 tahun yang aktif di WhatsApp, Instagram, marketplace, dan email.
- **Sekunder:** orang tua dan keluarga. Bahasa dibuat sederhana dan panduan Lindungi mudah dibagikan, sehingga pengguna utama bisa menjadi *guardian* bagi orang terdekatnya.

Jenis tipuan yang dicakup: lowongan kerja palsu, hadiah/giveaway, impersonasi (teman, kurir, bank, instansi), pinjaman dan investasi bodong, phishing dan tautan tiruan, serta penipuan jual beli online.

## Solusi: kerangka Guardians

Ward-Ly menggabungkan ketiga pendekatan dan menambahkan lapisan komunitas.

| Pilar | Fitur | Apa yang dilakukan pengguna | Respons aplikasi |
| --- | --- | --- | --- |
| **Recognize** | **Bedah** (`/bedah`) | Menempel teks pesan, tautan, atau screenshot; atau mencentang tanda pada profil akun | Skor risiko 0–100, level *rendah/waspada/tinggi*, daftar tanda bahaya yang ditemukan beserta alasannya, ringkasan, dan langkah berikutnya |
| **Recognize** | **Radar** (`/radar`) | Melihat pola penipuan yang paling sering diperiksa dan memakai Cek Cepat | Pola yang sedang ramai, contoh, dan cek kilat berbasis aturan saja |
| **Learn** | **Latih** (`/latih`) | Memainkan skenario chat fiktif dan memilih balasan | Umpan balik langsung per pilihan, sistem tiga nyawa, combo jawaban aman, XP, bintang, level, streak, dan lencana |
| **Act** | **Lindungi** (`/lindungi`) | Membuka panduan sebelum/sesudah kejadian dan mencentang langkah | Daftar periksa yang tersimpan (untuk pengguna masuk), langkah mengamankan akun, dan panduan pelaporan |
| **Act** | **Dity** (asisten chat) | Bertanya bebas saat ragu, misalnya “sudah terlanjur klik, lalu apa?” | Jawaban tenang dan langkah praktis dari asisten AI |
| **Komunitas** | **Komunitas** (`/komunitas`) | Menulis atau membaca cerita dan peringatan modus | Feed cerita yang dimoderasi, tombol “membantu”, dan pelaporan konten |

Pendekatan komunitas mendukung tema karena satu pengalaman yang dibagikan dapat mencegah orang lain jatuh ke modus yang sama: pengguna tidak hanya melindungi diri sendiri tetapi juga orang lain.

### Kenapa fitur utamanya responsif, bukan konten statis

Hasil Bedah sepenuhnya bergantung pada input pengguna: tanda bahaya, skor, alasan, dan langkah lanjut dihitung dari teks yang ditempel. Di Latih, setiap pilihan mengubah nyawa, skor, combo, dan umpan balik yang muncul. Di Lindungi, progres checklist berubah sesuai centang pengguna.

## Alur penggunaan untuk diuji

Semua alur berikut bisa diselesaikan **tanpa membuat akun**.

### 1. Mengenali pesan mencurigakan (Bedah)

1. Buka `/bedah` dan pilih tab **Teks**.
2. Klik salah satu chip contoh, atau tempel pesan fiktif berikut:
   ```
   Selamat! Nomor Anda terpilih sebagai pemenang hadiah Rp25.000.000 dari program undian resmi.
   Segera klaim dalam 1x24 jam di http://bit.ly/klaim-hadiah-resmi dan kirimkan kode OTP yang masuk untuk verifikasi.
   ```
3. Klik **Periksa**.
4. Hasil yang diharapkan: level **tinggi**, tanda bahaya seperti desakan waktu, permintaan OTP, dan tautan yang dipersingkat, masing-masing dengan penjelasan, lalu langkah aman berikutnya.
5. Coba juga tab **Tautan** (misalnya domain tiruan bank) dan tab **Profil** (centang tanda akun palsu) untuk melihat skor berubah sesuai input.

### 2. Berlatih mengambil keputusan (Latih)

1. Buka `/latih`, pilih satu skenario.
2. Pilih balasan di setiap langkah percakapan. Pilihan aman menambah skor dan combo, pilihan berisiko mengurangi nyawa, dan setiap pilihan langsung dijelaskan.
3. Selesaikan skenario untuk melihat bintang dan XP.

### 3. Tahu langkah selanjutnya (Lindungi + Dity)

1. Buka `/lindungi` dan pilih panduan, misalnya saat sudah terlanjur transfer atau mengklik tautan.
2. Centang langkah yang sudah dilakukan.
3. Klik tombol **Ragu? Tanya Dity** di pojok kanan bawah untuk bertanya bebas.

Pertanyaan umum tentang cara kerja, privasi, dan batasan juga tersedia di `/faq`.

## Cara Ward-Ly menilai pesan

Penilaian dibuat **dapat dijelaskan**: setiap poin skor berasal dari tanda yang bisa ditunjukkan ke pengguna.

```
Input pengguna
   │
   ├─ 1. Penyamaran data pribadi (redact)
   │     email, NIK/nomor kartu 16 digit, nomor telepon, nomor rekening → token seperti [NOMOR_TELEPON]
   │
   ├─ 2. Aturan tanda bahaya (red_flag_rules di database)
   │     pola regex berbobot: desakan waktu, permintaan OTP/PIN, biaya di muka, hadiah, dsb.
   │     dapat dikelola admin tanpa deploy ulang
   │
   ├─ 3. Pemeriksaan tautan (url-check)
   │     alamat IP, punycode/karakter menyerupai, penyingkat tautan, TLD yang sering disalahgunakan,
   │     struktur domain janggal, nama merek di domain yang bukan domain resminya, tanpa HTTPS
   │
   ├─ 4. Analisis AI (opsional, hanya jika OPEN_ROUTER_API_KEY diisi)
   │     menerima teks yang SUDAH disamarkan, menjelaskan konteks dalam bahasa sederhana
   │
   └─ Hasil: skor 0–100 → rendah (0–21) · waspada (22–49) · tinggi (50–100)
             + tanda bahaya + alasan + ringkasan + langkah berikutnya
```

- Level akhir diambil dari yang **lebih waspada** antara aturan dan AI, sehingga AI tidak dapat menurunkan peringatan dari aturan.
- Jika aturan gagal dimuat dan AI tidak tersedia, hasil ditandai **inconclusive** dengan pesan jelas bahwa hasil itu *bukan berarti pesannya aman*.
- Laporan selalu menyebut apakah analisis memakai **aturan saja** atau **aturan dan AI**.

## Keamanan, privasi, dan batasan

| Ketentuan lomba | Penerapan di Ward-Ly |
| --- | --- |
| Tetap berguna tanpa data sensitif | Semua fitur utama berjalan tanpa akun. Pengguna dianjurkan mengganti data asli dengan contoh, dan penilaian berbasis pola kalimat serta tautan tetap berfungsi. |
| Hindari mengumpulkan data pribadi | Data pribadi disamarkan otomatis sebelum diproses. Tamu tidak disimpan riwayatnya. Pengguna masuk dapat mematikan penyimpanan riwayat; yang disimpan hanya potongan teks yang sudah disamarkan. Identitas tamu untuk kuota harian adalah hash IP, bukan IP mentah. |
| Contoh fiktif dan aman | Skenario Latih dan contoh pesan di Bedah adalah fiktif. Tidak ada tautan berbahaya nyata yang dihosting, dan tautan yang diperiksa hanya ditampilkan sebagai teks (tidak dapat diklik dari laporan). |
| Transparan soal keterbatasan | Hasil tidak pernah menyatakan pesan “pasti aman”. Skor 0 dijelaskan sebagai “tidak ada pola yang cocok, bukan jaminan aman”. Lihat bagian berikut dan `/faq`. |
| Pengungkapan layanan pihak ketiga | Form Bedah, panel screenshot, dan sapaan Dity menyatakan bahwa teks (setelah disamarkan) dikirim ke layanan AI pihak ketiga (**OpenRouter**). Hal yang sama dijelaskan di `/faq` dan `/privacy`. |

Pengamanan teknis:

- Header keamanan dan **Content Security Policy** di `next.config.ts`.
- Seluruh aksi server memvalidasi input dengan **zod**, memeriksa peran, dan dibatasi **rate limit** (misalnya 12 analisis per 10 menit, chat tamu 4 per jam) serta kuota harian (tamu 3, pengguna 20 pemeriksaan per hari).
- Prompt AI memperlakukan teks pengguna sebagai data dan mengabaikan instruksi di dalamnya (mitigasi *prompt injection*); keluaran AI divalidasi skema sebelum ditampilkan.
- Kunci `service_role` Supabase hanya dipakai di server (`server-only`).
- Parameter `next` pada login disaring agar tidak menjadi *open redirect*.
- Konten komunitas melewati moderasi dan dapat dilaporkan.

## Keterbatasan yang kami akui

- **Bukan pendeteksi penipuan yang pasti.** Ward-Ly adalah alat bantu berbasis aturan dan AI. Hasil bisa keliru dua arah: pesan aman bisa tampak berisiko, dan modus baru bisa lolos.
- **Aturan berbasis pola** hanya mengenali yang sudah dipetakan; daftar aturan perlu terus diperbarui (dapat dilakukan admin dari `/admin`).
- **Pemeriksaan tautan bersifat struktural.** Ward-Ly tidak membuka tautan dan tidak memeriksa reputasi domain secara langsung, sehingga domain baru yang tampak wajar belum tentu terdeteksi.
- **Fitur AI bergantung pada layanan pihak ketiga.** Tanpa kunci API, pembacaan screenshot dan Dity tidak aktif, sedangkan pemeriksaan teks dan tautan tetap berjalan dengan aturan.
- **Penyamaran data berbasis pola** dapat melewatkan format yang tidak umum, karena itu pengguna tetap dianjurkan menutup data pribadi sebelum menempel.
- Keputusan akhir tetap di tangan pengguna. Ward-Ly selalu menyarankan verifikasi lewat kanal resmi.

## Teknologi dan arsitektur

- **Framework:** Next.js 16 (App Router, Cache Components / Partial Prerendering, React Compiler), React 19, TypeScript
- **UI:** Tailwind CSS 4, shadcn/ui (Base UI), komponen animasi React Bits, Motion
- **Backend:** Supabase (Postgres, Auth, Storage, Row Level Security), Server Actions
- **AI (opsional):** OpenRouter (default `openai/gpt-4o-mini`)
- **Validasi:** zod

```
src/
├── app/
│   ├── (site)/        halaman publik: bedah, radar, latih, lindungi, komunitas, blog, faq, legal
│   ├── (auth)/        sign-in, sign-up
│   ├── dashboard/     riwayat, lencana, pengaturan pengguna
│   └── admin/         CRUD konten, moderasi, manajemen pengguna
├── components/        UI per fitur + komponen animasi
├── env/               validasi variabel lingkungan (public dan server-only)
├── hooks/             use-lite-mode, use-first-interaction, dll.
└── lib/
    ├── services/      logika bisnis (analyze, scan-guard)
    ├── rules.ts       mesin aturan tanda bahaya
    ├── url-check.ts   heuristik tautan
    ├── redact.ts      penyamaran data pribadi
    ├── risk.ts        skor dan level risiko
    ├── llm.ts         klien OpenRouter
    ├── rate-limit.ts  rate limit dan kuota harian
    └── data/          pembacaan konten publik dengan `use cache`
```

### Performa

Landing page memakai banyak animasi, sehingga dioptimalkan agar tetap cepat:

- Hero dirender di server dengan animasi CSS murni, jadi teks dan tombol tampil tanpa menunggu JavaScript.
- Efek WebGL hero dan maskot animasi (≈500 KB) baru dimuat saat interaksi pertama; sebelumnya ditampilkan poster statis ≈20 KB.
- Efek berat (WebGL, fisika) dimatikan otomatis di layar ponsel, mode hemat data, perangkat berspesifikasi rendah, dan saat *reduced motion* aktif.
- Animasi scroll memakai Web Animations API tanpa membaca layout saat hydrate.

> Ukur performa pada build produksi (`npm run build && npm start`), bukan `npm run dev`. Mode dev tidak meminifikasi kode dan selalu menghasilkan skor jauh lebih rendah.

## Menjalankan secara lokal

Prasyarat: Node.js 20+, akun Supabase.

1. Salin `.env.example` menjadi `.env.local`, lalu isi nilainya.

   | Variabel | Wajib | Keterangan |
   | --- | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | ya | URL proyek Supabase |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | ya | Publishable/anon key |
   | `SUPABASE_SERVICE_ROLE_KEY` | ya | Hanya dipakai di server |
   | `NEXT_PUBLIC_SITE_URL` | ya | URL deployment, misalnya `http://localhost:3000` |
   | `OPEN_ROUTER_API_KEY` | tidak | Mengaktifkan analisis AI, pembacaan screenshot, dan Dity |
   | `OPEN_ROUTER_MODEL` | tidak | Default `openai/gpt-4o-mini`; pilih model yang mendukung gambar |

2. Jalankan file di `supabase/migrations/` secara berurutan di SQL editor Supabase. `20261104000000_latih_gamification.sql` wajib untuk XP, level, streak, lencana, dan skenario Latih.
3. `npm install`, lalu `npm run dev`.

### Setup admin

1. Daftar lewat `/sign-up` (atau Google) dan konfirmasi email bila diminta.
2. Di SQL Editor Supabase, jalankan `supabase/admin-setup.sql` setelah mengganti email di dalamnya.
3. Muat ulang aplikasi. Menu **Panel admin** muncul di sidebar dashboard, atau buka `/admin`.
4. Admin dan moderator berikutnya diatur dari `/admin/pengguna`. Moderator hanya mengakses ringkasan dan moderasi.

`profiles.role` bernilai `user`, `moderator`, atau `admin`.

## Rute aplikasi

| Area | Rute |
| --- | --- |
| Publik | `/`, `/bedah`, `/radar`, `/latih`, `/latih/[slug]`, `/lindungi`, `/lindungi/[slug]`, `/komunitas`, `/blog`, `/blog/[slug]`, `/faq` |
| Legal | `/privacy`, `/terms`, `/security` |
| Auth | `/sign-in`, `/sign-up`, `/auth/callback` |
| Pengguna | `/dashboard`, `/dashboard/riwayat`, `/dashboard/lencana`, `/dashboard/pengaturan` |
| Admin | `/admin`, `/admin/moderasi`, `/admin/pengguna`, `/admin/[aturan, kategori, skenario, langkah, pilihan, panduan, butir, blog]` |
