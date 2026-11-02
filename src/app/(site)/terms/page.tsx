import type { Metadata } from "next";

import { LegalPage } from "@/components/shared/legal-page";

export const metadata: Metadata = { title: "Syarat layanan" };

export default function TermsPage() {
  return (
    <LegalPage
      title="Syarat layanan"
      updated="November 2026"
      sections={[
        {
          heading: "Sifat layanan",
          body: ["Ward-Ly memberi indikasi risiko, bukan vonis hukum. Hasil analisis tidak menggantikan keputusan atau pendapat pihak berwenang."],
        },
        {
          heading: "Penggunaan yang wajar",
          body: ["Jangan menyalahgunakan layanan, mengirim konten yang melanggar hukum, atau mencoba menembus pembatasan akses dan batas permintaan."],
        },
        {
          heading: "Konten komunitas",
          body: ["Kiriman komunitas ditinjau moderator dan dapat ditolak atau dihapus jika melanggar pedoman."],
        },
      ]}
    />
  );
}
