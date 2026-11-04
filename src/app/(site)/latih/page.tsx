import type { Metadata } from "next";
import { SwordsIcon } from "lucide-react";
import { Suspense } from "react";

import { BadgeShelf, DailyMission, Leaderboard, PlayerCard } from "@/components/latih/progress-panels";
import { ScenarioBoard } from "@/components/latih/scenario-board";
import { MarqueeBand } from "@/components/shared/marquee-band";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { PageLoader } from "@/components/shared/page-loader";
import { PageShell } from "@/components/shared/page-shell";
import { getUser } from "@/lib/auth/session";
import { getBadges, getLeaderboard, getScenarios } from "@/lib/data/content";
import { getLatihProgress } from "@/lib/data/progress";

export const metadata: Metadata = {
  title: "Latih",
  description: "Skenario singkat bergaya game untuk melatih naluri waspada terhadap pesan penipuan.",
};

async function Dojo() {
  const [scenarios, badges, leaderboard, user] = await Promise.all([
    getScenarios(),
    getBadges(),
    getLeaderboard(),
    getUser(),
  ]);

  if (!scenarios.length) {
    return (
      <EmptyState
        icon={<SwordsIcon />}
        title="Skenario belum tersedia"
        description="Kami sedang menyiapkan latihan baru. Coba lagi nanti."
      />
    );
  }

  const progress = user ? await getLatihProgress(user.id) : null;

  return (
    <div className="flex flex-col gap-10">
      <PlayerCard name={user?.name ?? user?.email?.split("@")[0] ?? null} progress={progress} total={scenarios.length} />
      <MarqueeBand items={scenarios.map((item) => item.title)} />

      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <ScenarioBoard scenarios={scenarios} progress={progress?.scenarios ?? {}} />
        <aside className="flex flex-col gap-4">
          <DailyMission done={progress?.activeToday ?? false} signedIn={Boolean(user)} />
          <Leaderboard rows={leaderboard} me={user?.id ?? null} />
          <BadgeShelf badges={badges} owned={progress?.badgeIds ?? []} />
        </aside>
      </div>
    </div>
  );
}

export default function LatihPage() {
  return (
    <PageShell>
      <PageHeader
        title="Dojo latihan:"
        highlight="hadapi chat penipu, tanpa risiko."
        description="Setiap skenario berjalan seperti percakapan sungguhan. Jaga tiga nyawamu, bangun combo jawaban aman, dan kumpulkan bintang serta XP."
      />
      <Suspense fallback={<PageLoader />}>
        <Dojo />
      </Suspense>
    </PageShell>
  );
}
