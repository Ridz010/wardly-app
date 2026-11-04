import type { Metadata } from "next";
import Link from "next/link";
import { AwardIcon, FlameIcon, ScanSearchIcon, SwordsIcon, ZapIcon } from "lucide-react";
import { Suspense } from "react";

import { PageHeader } from "@/components/shared/page-header";
import { PageLoader } from "@/components/shared/page-loader";
import { RiskBadge } from "@/components/shared/risk-badge";
import { StatGrid } from "@/components/shared/stat-card";
import { buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { requireUser } from "@/lib/auth/session";
import { getScenarios } from "@/lib/data/content";
import { getLatihProgress } from "@/lib/data/progress";
import { formatDate } from "@/lib/format";
import { levelInfo } from "@/lib/gamification";
import { createAdminClient } from "@/lib/supabase/admin";
import { cn } from "cn";

export const metadata: Metadata = { title: "Ringkasan" };

async function Overview() {
  const user = await requireUser("/dashboard");
  const admin = createAdminClient();
  const [progress, scenarios, analyses, attempts] = await Promise.all([
    getLatihProgress(user.id),
    getScenarios(),
    admin
      .from("analyses")
      .select("id,risk_level,input_excerpt,created_at", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
    admin
      .from("scenario_attempts")
      .select("id,scenario_id,score,max_score,xp_earned,completed_at")
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false })
      .limit(5),
  ]);

  const level = levelInfo(progress.xp);
  const titles = new Map(scenarios.map((item) => [item.id, item.title]));

  return (
    <div className="flex flex-col gap-8">
      <StatGrid
        stats={[
          { label: "Level", value: level.level, hint: level.title, icon: <ZapIcon /> },
          { label: "Total XP", value: progress.xp, hint: `${level.needed - level.current} XP lagi ke level berikutnya`, icon: <SwordsIcon /> },
          { label: "Streak", value: `${progress.streak} hari`, hint: progress.activeToday ? "Sudah berlatih hari ini" : "Latihan hari ini belum", icon: <FlameIcon /> },
          { label: "Lencana", value: progress.badgeIds.length, hint: "Lihat di halaman Lencana", icon: <AwardIcon /> },
        ]}
      />

      <div className="flex flex-col gap-2 rounded-2xl border border-border p-5">
        <div className="flex items-center justify-between text-sm">
          <span>
            Level {level.level} · {level.title}
          </span>
          <span className="text-muted-foreground tabular-nums">
            {level.current}/{level.needed} XP
          </span>
        </div>
        <Progress value={level.progress} aria-label="Progres level" className="[&_[data-slot=progress-track]]:h-2" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="flex flex-col gap-4 rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-medium">Latihan terakhir</h2>
            <Link href="/latih" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-full font-normal")}>
              Ke dojo
            </Link>
          </div>
          {attempts.data?.length ? (
            <ul className="flex flex-col divide-y divide-border">
              {attempts.data.map((row) => (
                <li key={row.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate">{titles.get(row.scenario_id) ?? "Skenario"}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(row.completed_at)}</span>
                  </span>
                  <span className="shrink-0 text-right text-xs text-muted-foreground tabular-nums">
                    {row.score}/{row.max_score}
                    <span className="block text-primary">+{row.xp_earned} XP</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Belum ada latihan. Coba satu skenario untuk mulai mengumpulkan XP.</p>
          )}
        </section>

        <section className="flex flex-col gap-4 rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-medium">Pemeriksaan terakhir</h2>
            <Link href="/bedah" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5 rounded-full font-normal")}>
              <ScanSearchIcon className="size-3.5" />
              Periksa pesan
            </Link>
          </div>
          {analyses.data?.length ? (
            <ul className="flex flex-col divide-y divide-border">
              {analyses.data.map((row) => (
                <li key={row.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate">{row.input_excerpt ?? "Pesan"}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(row.created_at)}</span>
                  </span>
                  <RiskBadge level={row.risk_level} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              Riwayat kosong. Pemeriksaan disimpan bila kamu mengaktifkannya di pengaturan.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <>
      <PageHeader animate={false} title="Ringkasan" description="Progres latihan dan aktivitas pemeriksaanmu." />
      <Suspense fallback={<PageLoader />}>
        <Overview />
      </Suspense>
    </>
  );
}
