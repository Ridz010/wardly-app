import type { Metadata } from "next";
import { Suspense } from "react";

import { Workspace } from "@/components/bedah/workspace";
import { PageHeader } from "@/components/shared/page-header";
import { PageLoader } from "@/components/shared/page-loader";
import { PageShell } from "@/components/shared/page-shell";
import { getUser } from "@/lib/auth/session";
import { getScanQuota } from "@/lib/services/scan-guard";

export const metadata: Metadata = {
  title: "Bedah",
  description: "Periksa teks, tautan, screenshot, atau profil yang mencurigakan dan lihat tanda bahayanya.",
};

async function Checker() {
  const [user, quota] = await Promise.all([getUser(), getScanQuota()]);
  return <Workspace signedIn={Boolean(user)} quota={quota} />;
}

export default function BedahPage() {
  return (
    <PageShell>
      <PageHeader
        title="Ragu sama sesuatu?"
        highlight="Bedah dulu."
        description="Pilih jenis yang ingin kamu periksa, isi, lalu baca tandanya. Kami tunjukkan alasannya, bukan sekadar vonis."
      />
      <Suspense fallback={<PageLoader label="Menyiapkan" className="min-h-64" />}>
        <Checker />
      </Suspense>
    </PageShell>
  );
}
