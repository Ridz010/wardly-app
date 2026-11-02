-- Jadikan satu akun sebagai admin pertama.
-- 1. Daftar dulu lewat /sign-up atau Google, lalu konfirmasi email bila diminta.
-- 2. Ganti email di bawah, lalu jalankan di SQL Editor Supabase.

insert into public.profiles (id, display_name, role)
select
  u.id,
  coalesce(u.raw_user_meta_data ->> 'full_name', split_part(u.email, '@', 1)),
  'admin'
from auth.users u
where u.email = 'email-kamu@contoh.com'
on conflict (id) do update set role = 'admin';

-- Admin berikutnya bisa diatur dari halaman /admin/pengguna.
-- Untuk moderator, ganti 'admin' menjadi 'moderator'.
