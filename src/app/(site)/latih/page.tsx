import type { Metadata } from "next";
import { SwordsIcon } from "lucide-react";
import { Suspense } from "react";

import CountUp from "@/components/CountUp";
import { MarqueeBand } from "@/components/shared/marquee-band";
import { CardGrid } from "@/components/shared/card-grid";
import { ContentCard } from "@/components/shared/content-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { PageLoader } from "@/components/shared/page-loader";
import { PageShell } from "@/components/shared/page-shell";
import { getScenarios } from "@/lib/data/content";

export const metadata: Metadata = {
  title: "Latih",
  description: "Skenario singkat untuk melatih naluri waspada terhadap pesan penipuan.",
};

async function ScenarioList() {
  const scenarios = await getScenarios();

  if (!scenarios.length) {
    return (
      <EmptyState
        icon={<SwordsIcon />}
        title="Skenario belum tersedia"
        description="Kami sedang menyiapkan latihan baru. Coba lagi nanti."
      />
    );
  }

  const totalXp = scenarios.reduce((sum, item) => sum + item.xp_reward, 0);

  return (
    <div className="flex flex-col gap-8">
      <MarqueeBand items={scenarios.map((item) => item.title)} />
      <dl className="grid max-w-md grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <dt className="text-xs text-muted-foreground">Skenario</dt>
          <dd className="font-heading text-4xl font-light tabular-nums"><CountUp to={scenarios.length} /></dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-xs text-muted-foreground">XP yang bisa diraih</dt>
          <dd className="font-heading text-4xl font-light tabular-nums text-primary"><CountUp to={totalXp} /></dd>
        </div>
      </dl>
    <CardGrid>
      {scenarios.map((item) => (
        <ContentCard
          key={item.id}
          href={`/latih/${item.slug}`}
          title={item.title}
          description={item.summary}
          badges={[item.difficulty, ...(item.category ? [item.category.name] : [])]}
          meta={`+${item.xp_reward} XP`}
        />
      ))}
    </CardGrid>
    </div>
  );
}

export default function LatihPage() {
  return (
    <PageShell>
      <PageHeader
        title="Dojo latihan:"
        highlight="hadapi chat penipu, tanpa risiko."
        description="Setiap skenario berjalan seperti percakapan sungguhan. Balas, lalu lihat kenapa responsmu aman atau berisiko."
      />
      <Suspense fallback={<PageLoader />}>
        <ScenarioList />
      </Suspense>
    </PageShell>
  );
}
