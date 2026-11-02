import type { Metadata } from "next";

import { LegalPage } from "@/components/shared/legal-page";

export const metadata: Metadata = { title: "Keamanan" };

export default function SecurityPage() {
  return (
    <LegalPage
      title="Keamanan"
      updated="November 2026"
      sections={[
        {
          heading: "Perlindungan data",
          body: ["Koneksi dienkripsi, akses data dibatasi per peran, dan kunci layanan hanya dipakai di sisi server."],
        },
        {
          heading: "Pembatasan permintaan",
          body: ["Pemeriksaan, masuk, dan kiriman komunitas dibatasi per periode untuk mencegah penyalahgunaan."],
        },
        {
          heading: "Melaporkan celah",
          body: ["Jika menemukan celah keamanan, laporkan secara tertutup kepada kami sebelum mengumumkannya."],
        },
      ]}
    />
  );
}
