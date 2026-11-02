import type { Metadata } from "next";

import { LegalPage } from "@/components/shared/legal-page";

export const metadata: Metadata = { title: "Kebijakan privasi" };

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Kebijakan privasi"
      updated="November 2026"
      sections={[
        {
          heading: "Data yang kami proses",
          body: [
            "Pesan yang kamu tempel diproses untuk dianalisis. Nomor telepon, email, nomor kartu, dan rekening disamarkan sebelum teks diteruskan ke layanan analisis.",
            "Riwayat pemeriksaan hanya disimpan jika kamu masuk dan mengaktifkan penyimpanan riwayat di pengaturan.",
          ],
        },
        {
          heading: "Akun",
          body: ["Kami menyimpan email, nama tampilan, dan progres belajarmu untuk menjalankan akun. Kamu dapat mematikan penyimpanan riwayat kapan saja."],
        },
        {
          heading: "Kontrol kamu",
          body: ["Hubungi kami untuk meminta penghapusan akun dan data terkait."],
        },
      ]}
    />
  );
}
