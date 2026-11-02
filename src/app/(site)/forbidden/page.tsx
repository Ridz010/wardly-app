import type { Metadata } from "next";

import { ErrorView } from "@/components/shared/error-view";

export const metadata: Metadata = { title: "Akses ditolak" };

export default function ForbiddenPage() {
  return (
    <ErrorView
      code="403"
      title="Kamu tidak punya akses"
      description="Halaman ini hanya untuk peran tertentu. Jika menurutmu ini keliru, hubungi admin."
    />
  );
}
