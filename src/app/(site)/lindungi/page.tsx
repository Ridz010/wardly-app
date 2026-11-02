import type { Metadata } from "next";
import { LifeBuoyIcon } from "lucide-react";
import { Suspense } from "react";

import { CardGrid } from "@/components/shared/card-grid";
import { ContentCard } from "@/components/shared/content-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { PageLoader } from "@/components/shared/page-loader";
import { PageShell } from "@/components/shared/page-shell";
import { getGuides } from "@/lib/data/content";

export const metadata: Metadata = {
  title: "Lindungi",
  description: "Panduan langkah demi langkah sebelum dan sesudah terkena penipuan.",
};

const PHASE = { sebelum: "Pencegahan", sesudah: "Setelah kejadian" } as const;

async function GuideList() {
  const guides = await getGuides();

  if (!guides.length) {
    return (
      <EmptyState
        icon={<LifeBuoyIcon />}
        title="Panduan belum tersedia"
        description="Panduan perlindungan akan muncul di sini."
      />
    );
  }

  return (
    <div className="flex flex-col gap-12">
      {(["sebelum", "sesudah"] as const).map((phase) => {
        const items = guides.filter((guide) => guide.phase === phase);
        if (!items.length) return null;
        return (
          <section key={phase} className="flex flex-col gap-4">
            <h2 className="font-heading text-xl font-light tracking-tight">{PHASE[phase]}</h2>
            <CardGrid>
              {items.map((guide) => (
                <ContentCard
                  key={guide.id}
                  href={`/lindungi/${guide.slug}`}
                  title={guide.title}
                  description={guide.summary}
                  badges={guide.category ? [guide.category.name] : []}
                  meta={PHASE[phase]}
                />
              ))}
            </CardGrid>
          </section>
        );
      })}
    </div>
  );
}

export default function LindungiPage() {
  return (
    <PageShell>
      <PageHeader
        title="Tahu langkahnya,"
        highlight="sebelum dan sesudah."
        description="Panduan singkat yang bisa kamu ikuti dan bagikan ke keluarga."
      />
      <Suspense fallback={<PageLoader />}>
        <GuideList />
      </Suspense>
    </PageShell>
  );
}
