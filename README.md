# Ward-Ly

Pemeriksa pesan mencurigakan berbahasa Indonesia. Next.js 16, Tailwind 4, shadcn (Base UI), React Bits, Supabase.

## Menjalankan

1. Salin `.env.example` menjadi `.env.local`, lalu isi nilainya.
2. (Disarankan) jalankan `supabase/migrations/20261102000000_rate_limit.sql` di SQL editor Supabase.
3. `npm install` lalu `npm run dev`.

## Setup admin

1. Jalankan aplikasi, daftar lewat `/sign-up` (atau Google), dan konfirmasi email bila diminta.
2. Buka SQL Editor Supabase, lalu jalankan `supabase/admin-setup.sql` setelah mengganti email di dalamnya.
3. Muat ulang aplikasi. Menu "Panel admin" muncul di sidebar dashboard, atau buka `/admin` langsung.
4. Admin berikutnya dan moderator diatur dari `/admin/pengguna`. Moderator hanya mengakses ringkasan dan moderasi.

`profiles.role` bernilai `user`, `moderator`, atau `admin`.

## Fitur AI

`OPEN_ROUTER_API_KEY` mengaktifkan: analisis tambahan pada Bedah, pembacaan screenshot, dan Dity (chat). Tanpa kunci, Bedah tetap jalan dengan aturan dan pola tautan; screenshot dan chat bebas menampilkan pesan bahwa AI belum aktif. Pilih model yang mendukung gambar (misalnya `openai/gpt-4o-mini`) agar screenshot terbaca.

## Rute

| Area | Rute |
| --- | --- |
| Publik | `/`, `/bedah`, `/latih`, `/latih/[slug]`, `/lindungi`, `/lindungi/[slug]`, `/komunitas`, `/blog`, `/blog/[slug]`, `/radar` |
| Auth | `/sign-in`, `/sign-up`, `/auth/callback` |
| Pengguna | `/dashboard`, `/dashboard/riwayat`, `/dashboard/lencana`, `/dashboard/pengaturan` |
| Admin | `/admin`, `/admin/moderasi`, `/admin/pengguna`, `/admin/[aturan, kategori, skenario, langkah, pilihan, panduan, butir, blog]` |

## Arsitektur

- `src/env` — validasi env (public dan server-only).
- `src/lib/supabase` — klien browser, server, admin, dan `proxy` sesi.
- `src/lib/auth` — sesi, profil, pengecekan peran.
- `src/lib/services` — logika bisnis (analisis pesan).
- `src/lib/data` — pembacaan konten publik dengan `use cache` dan tag.
- `src/lib/admin/resources.ts` — konfigurasi CRUD admin; satu halaman generik melayani semua tabel konten.
- `src/lib/rate-limit.ts` — batas permintaan per tindakan (RPC `consume_rate_limit`, cadangan di memori).
- `src/lib/validation.ts` — seluruh skema zod.

## Keamanan

- CSP dan header keamanan di `next.config.ts`.
- Semua aksi server memvalidasi input dengan zod, memeriksa peran, dan dibatasi rate limit.
- Kunci `service_role` hanya dipakai di sisi server (`server-only`).
- Pesan pengguna disamarkan (`redact`) sebelum dikirim ke LLM.
- Parameter `next` disaring agar tidak menjadi open redirect.
