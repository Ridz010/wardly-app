import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { CardGrid } from "@/components/shared/card-grid";
import { ContentCard } from "@/components/shared/content-card";
import { PageHeader } from "@/components/shared/page-header";
import { PageLoader } from "@/components/shared/page-loader";
import { PageShell } from "@/components/shared/page-shell";
import { getCategories, getTrendingCategories } from "@/lib/data/content";

export const metadata: Metadata = {
  title: "Modus penipuan",
  description: "Kenali modus penipuan yang paling sering muncul beserta cirinya.",
};

async function Modes() {
  const [categories, trending] = await Promise.all([getCategories(), getTrendingCategories(30)]);
  const totals = new Map(trending.map((row) => [row.category_slug, row.total]));
  const ranked = [...categories].sort((a, b) => (totals.get(b.slug) ?? 0) - (totals.get(a.slug) ?? 0));

  return (
    <CardGrid>
      {ranked.map((category) => {
        const total = totals.get(category.slug) ?? 0;
        return (
          <ContentCard
            key={category.id}
            href={`/lindungi`}
            title={category.name}
            description={category.description}
            meta={total ? `${total} pemeriksaan 30 hari terakhir` : "Belum ada pemeriksaan"}
          />
        );
      })}
    </CardGrid>
  );
}

export default function ModusPage() {
  return (
    <PageShell>
      <PageHeader
        title="Pola yang sering dipakai penipu."
        description="Diurutkan dari yang paling banyak diperiksa pengguna sebulan terakhir."
        actions={
          <Link href="/bedah" className="text-sm underline underline-offset-4">
            Periksa pesan
          </Link>
        }
      />
      <Suspense fallback={<PageLoader />}>
        <Modes />
      </Suspense>
    </PageShell>
  );
}
