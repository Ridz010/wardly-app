"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRightIcon, CheckIcon, StarIcon, SwordsIcon } from "lucide-react";

import AnimatedContent from "@/components/AnimatedContent";
import { FilterPills } from "@/components/blog/blog-grid";
import SpotlightCard from "@/components/SpotlightCard";
import { EmptyState } from "@/components/shared/empty-state";
import type { ScenarioCard } from "@/lib/data/content";
import type { ScenarioProgress } from "@/lib/data/progress";
import { difficultyOf } from "@/lib/gamification";
import { cn } from "cn";

type Props = {
    scenarios: ScenarioCard[];
    progress: Record<string, ScenarioProgress>;
};

function StarRow({ value }: { value: number }) {
    return (
        <span className="flex items-center gap-0.5" aria-label={value ? `${value} dari 3 bintang` : "Belum dimainkan"}>
            {[0, 1, 2].map((index) => (
                <StarIcon
                    key={index}
                    className={cn("size-4", index < value ? "fill-amber-400 text-amber-400" : "fill-muted text-border")}
                />
            ))}
        </span>
    );
}

const FILTERS = [
    { value: "semua", label: "Semua" },
    { value: "baru", label: "Belum dimainkan" },
    { value: "mudah", label: "Mudah" },
    { value: "sedang", label: "Sedang" },
    { value: "sulit", label: "Sulit" },
];

export function ScenarioBoard({ scenarios, progress }: Props) {
    const [filter, setFilter] = useState("semua");

    const visible = useMemo(
        () =>
            scenarios.filter((item) => {
                if (filter === "semua") return true;
                if (filter === "baru") return !progress[item.id];
                return item.difficulty === filter;
            }),
        [scenarios, progress, filter],
    );

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex flex-col gap-1">
                    <h2 className="font-heading text-2xl font-medium tracking-tight">Pilih misi</h2>
                    <p className="text-sm text-muted-foreground">Raih tiga bintang di setiap skenario untuk XP penuh.</p>
                </div>
                <FilterPills id="latih" options={FILTERS} value={filter} onChange={setFilter} />
            </div>

            {visible.length ? (
                <AnimatedContent
                    key={filter}
                    trigger="mount"
                    distance={24}
                    duration={0.55}
                    stagger={0.06}
                    className="grid gap-4 sm:grid-cols-2 [&>*]:min-w-0"
                >
                    {visible.map((item, index) => {
                        const entry = progress[item.id];
                        const difficulty = difficultyOf(item.difficulty);
                        const perfect = entry?.stars === 3;
                        return (
                            <SpotlightCard
                                key={item.id}
                                spotlightColor="rgba(93, 242, 231, 0.18)"
                                className={cn(
                                    "group relative h-full rounded-3xl border bg-card transition-colors duration-300",
                                    perfect ? "border-amber-300/70" : "border-border hover:border-primary/40",
                                )}
                            >
                                <Link
                                    href={`/latih/${item.slug}`}
                                    className="flex h-full flex-col gap-5 rounded-3xl p-5 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-brand-aqua/40 to-brand-blue/30 font-heading text-lg text-brand-deep">
                                            {String(index + 1).padStart(2, "0")}
                                        </span>
                                        <div className="flex flex-col items-end gap-1.5">
                                            <StarRow value={entry?.stars ?? 0} />
                                            {entry ? (
                                                <span className="flex items-center gap-1 text-xs text-primary">
                                                    <CheckIcon className="size-3.5" />
                                                    Dimainkan {entry.plays}×
                                                </span>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">Belum dimainkan</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-1 flex-col gap-2">
                                        <h3 className="font-heading text-lg leading-snug font-medium tracking-tight text-balance">{item.title}</h3>
                                        {item.summary ? <p className="line-clamp-2 text-sm text-muted-foreground">{item.summary}</p> : null}
                                    </div>

                                    <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
                                        <span className="flex flex-wrap items-center gap-1.5">
                                            <span className={cn("rounded-full px-2.5 py-0.5 text-xs", difficulty.tone)}>{difficulty.label}</span>
                                            {item.category ? (
                                                <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">{item.category.name}</span>
                                            ) : null}
                                        </span>
                                        <span className="flex shrink-0 items-center gap-1.5 text-sm text-primary">
                                            +{item.xp_reward} XP
                                            <ArrowRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                                        </span>
                                    </div>
                                </Link>
                            </SpotlightCard>
                        );
                    })}
                </AnimatedContent>
            ) : (
                <EmptyState
                    icon={<SwordsIcon />}
                    title={filter === "baru" ? "Semua skenario sudah kamu mainkan" : "Belum ada skenario di tingkat ini"}
                    description={filter === "baru" ? "Ulangi skenario untuk mengejar tiga bintang." : "Coba pilih tingkat kesulitan lain."}
                />
            )}
        </div>
    );
}
