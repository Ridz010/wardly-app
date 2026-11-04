import Image from "next/image";
import Link from "next/link";
import {
  AwardIcon,
  CrownIcon,
  FlameIcon,
  LockIcon,
  ShieldIcon,
  SwordsIcon,
  TargetIcon,
  TrophyIcon,
} from "lucide-react";

import CountUp from "@/components/CountUp";
import { Progress } from "@/components/ui/progress";
import { buttonVariants } from "@/components/ui/button";
import type { BadgeItem, LeaderboardRow } from "@/lib/data/content";
import type { LatihProgress } from "@/lib/data/progress";
import { levelInfo } from "@/lib/gamification";
import { initials } from "@/lib/format";
import { cn } from "cn";

const BADGE_ICONS: Record<string, typeof AwardIcon> = {
  flame: FlameIcon,
  target: TargetIcon,
  shield: ShieldIcon,
};

export function PlayerCard({
  name,
  progress,
  total,
}: {
  name: string | null;
  progress: LatihProgress | null;
  total: number;
}) {
  if (!progress) {
    return (
      <div className="relative flex flex-col gap-5 overflow-hidden rounded-[2rem] bg-linear-to-br from-[#0b4a5c] via-[#158ab0] to-[#2fb6c9] p-6 text-white sm:flex-row sm:items-center sm:p-8">
        <Image src="/animated_maskot.gif" alt="" width={112} height={112} unoptimized className="size-24 shrink-0 object-contain sm:size-28" />
        <div className="flex flex-1 flex-col gap-2">
          <h2 className="font-heading text-2xl font-medium tracking-tight">Main sebagai tamu, atau simpan progresmu.</h2>
          <p className="max-w-lg text-sm text-white/80">
            Kamu tetap bisa berlatih tanpa akun. Masuk untuk mengumpulkan XP, naik level, menjaga streak harian, dan
            membuka lencana.
          </p>
        </div>
        <Link
          href="/sign-in?next=/latih"
          className={cn(buttonVariants({ size: "lg" }), "h-11 shrink-0 rounded-full bg-white px-6 font-normal text-brand-deep hover:bg-white/90")}
        >
          Masuk dan simpan XP
        </Link>
      </div>
    );
  }

  const level = levelInfo(progress.xp);
  const played = Object.keys(progress.scenarios).length;
  const stars = Object.values(progress.scenarios).reduce((sum, item) => sum + item.stars, 0);

  return (
    <div className="relative grid gap-6 overflow-hidden rounded-[2rem] bg-linear-to-br from-[#0b4a5c] via-[#158ab0] to-[#2fb6c9] p-6 text-white sm:p-8 lg:grid-cols-[auto_1fr_auto] lg:items-center">
      <div aria-hidden="true" className="pointer-events-none absolute -top-20 -right-16 size-72 rounded-full bg-brand-aqua/30 blur-3xl" />
      <div className="relative flex items-center gap-4">
        <span className="relative">
          <Image src="/animated_maskot.gif" alt="" width={96} height={96} unoptimized className="size-20 object-contain" />
          <span className="absolute -right-1 -bottom-1 flex size-8 items-center justify-center rounded-full bg-white font-heading text-sm text-brand-deep shadow">
            {level.level}
          </span>
        </span>
        <div className="flex flex-col">
          <span className="text-xs tracking-widest text-white/70 uppercase">Level {level.level}</span>
          <span className="font-heading text-2xl font-medium tracking-tight">{level.title}</span>
          <span className="truncate text-sm text-white/80">{name ?? "Penjaga Ward-Ly"}</span>
        </div>
      </div>

      <div className="relative flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-white/80">
          <span>Menuju level {level.level + 1}</span>
          <span className="tabular-nums">
            {level.current}/{level.needed} XP
          </span>
        </div>
        <Progress
          value={level.progress}
          aria-label="Progres level"
          className="[&_[data-slot=progress-indicator]]:bg-brand-aqua [&_[data-slot=progress-track]]:h-2.5 [&_[data-slot=progress-track]]:bg-white/20"
        />
        <span className="text-xs text-white/70">Total {progress.xp} XP</span>
      </div>

      <dl className="relative grid grid-cols-3 gap-2 text-center">
        <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
          <dt className="flex items-center justify-center gap-1 text-xs text-white/70">
            <FlameIcon className="size-3.5" /> Streak
          </dt>
          <dd className="font-heading text-2xl tabular-nums">
            <CountUp to={progress.streak} />
          </dd>
        </div>
        <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
          <dt className="flex items-center justify-center gap-1 text-xs text-white/70">
            <SwordsIcon className="size-3.5" /> Misi
          </dt>
          <dd className="font-heading text-2xl tabular-nums">
            {played}/{total}
          </dd>
        </div>
        <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
          <dt className="flex items-center justify-center gap-1 text-xs text-white/70">
            <TrophyIcon className="size-3.5" /> Bintang
          </dt>
          <dd className="font-heading text-2xl tabular-nums">
            <CountUp to={stars} />
          </dd>
        </div>
      </dl>
    </div>
  );
}

export function DailyMission({ done, signedIn }: { done: boolean; signedIn: boolean }) {
  return (
    <div className="flex items-center gap-4 rounded-3xl border border-border bg-card p-5">
      <span
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-2xl",
          done ? "bg-amber-400/20 text-amber-600" : "bg-muted text-muted-foreground",
        )}
      >
        <FlameIcon className={cn("size-6", done && "fill-amber-400")} />
      </span>
      <div className="flex min-w-0 flex-col">
        <span className="text-xs text-muted-foreground">Misi harian</span>
        <span className="font-normal">{done ? "Selesai! Streak hari ini aman." : "Selesaikan 1 skenario hari ini"}</span>
        <span className="text-xs text-muted-foreground">
          {signedIn ? "Berlatih tiap hari menjaga streak dan membuka lencana Rutin Berjaga." : "Masuk untuk mulai mengumpulkan streak."}
        </span>
      </div>
    </div>
  );
}

export function Leaderboard({ rows, me }: { rows: LeaderboardRow[]; me: string | null }) {
  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-5" aria-labelledby="papan-skor">
      <div className="flex items-center gap-2">
        <CrownIcon className="size-5 text-amber-500" />
        <h2 id="papan-skor" className="font-heading text-lg font-medium tracking-tight">
          Papan skor
        </h2>
      </div>
      {rows.length ? (
        <ol className="flex flex-col gap-1.5">
          {rows.map((row, index) => (
            <li
              key={row.id}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-2 text-sm",
                row.id === me ? "bg-primary/10" : index < 3 ? "bg-muted/60" : undefined,
              )}
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full text-xs tabular-nums",
                  index === 0
                    ? "bg-amber-400 text-white"
                    : index === 1
                      ? "bg-slate-300 text-slate-700"
                      : index === 2
                        ? "bg-orange-300 text-orange-900"
                        : "bg-muted text-muted-foreground",
                )}
              >
                {index + 1}
              </span>
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
                {initials(row.name)}
              </span>
              <span className="flex min-w-0 flex-1 flex-col leading-tight">
                <span className="truncate">
                  {row.name}
                  {row.id === me ? <span className="text-primary"> (kamu)</span> : null}
                </span>
                <span className="text-xs text-muted-foreground">Level {row.level}</span>
              </span>
              <span className="shrink-0 tabular-nums text-primary">{row.xp} XP</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-sm text-muted-foreground">Belum ada yang mengumpulkan XP. Jadilah yang pertama di puncak!</p>
      )}
    </section>
  );
}

export function BadgeShelf({ badges, owned }: { badges: BadgeItem[]; owned: string[] }) {
  if (!badges.length) return null;
  const have = new Set(owned);

  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-5" aria-labelledby="lencana">
      <div className="flex items-center justify-between gap-2">
        <h2 id="lencana" className="font-heading text-lg font-medium tracking-tight">
          Lencana
        </h2>
        <span className="text-xs text-muted-foreground tabular-nums">
          {badges.filter((badge) => have.has(badge.id)).length}/{badges.length}
        </span>
      </div>
      <ul className="grid grid-cols-3 gap-3">
        {badges.map((badge) => {
          const unlocked = have.has(badge.id);
          const Icon = unlocked ? (BADGE_ICONS[badge.icon ?? ""] ?? AwardIcon) : LockIcon;
          return (
            <li key={badge.id} className="flex flex-col items-center gap-1.5 text-center" title={badge.description ?? undefined}>
              <span
                className={cn(
                  "flex size-14 items-center justify-center rounded-2xl transition-transform duration-300 hover:-translate-y-0.5",
                  unlocked
                    ? "bg-linear-to-br from-amber-200 to-amber-400 text-amber-900 shadow-[0_8px_20px_-8px_rgba(245,158,11,0.6)]"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <Icon className="size-6" />
              </span>
              <span className={cn("text-xs leading-tight", unlocked ? "text-foreground" : "text-muted-foreground")}>{badge.name}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
