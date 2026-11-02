"use client";

import Link from "next/link";
import { useMemo, useOptimistic, useState, useTransition } from "react";
import { MessagesSquareIcon, PlusIcon, SearchIcon } from "lucide-react";
import { toast } from "sonner";

import { toggleHelpfulAction } from "@/app/(site)/komunitas/actions";
import AnimatedContent from "@/components/AnimatedContent";
import { FilterPills } from "@/components/blog/blog-grid";
import CountUp from "@/components/CountUp";
import { PostCard } from "@/components/komunitas/post-card";
import { PostDialog } from "@/components/komunitas/post-dialog";
import SpotlightCard from "@/components/SpotlightCard";
import StarBorder from "@/components/StarBorder";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CommunityCard } from "@/lib/data/content";
import { stripMarkdown } from "@/lib/format";

const PAGE = 6;

type Props = { posts: CommunityCard[]; reacted: string[]; signedIn: boolean };

function Stat({ label, value, tone }: { label: string; value: number; tone?: string }) {
    return (
        <div className="flex flex-1 flex-col gap-1 px-6 py-5">
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className={`font-heading text-4xl font-medium tabular-nums ${tone ?? "text-foreground"}`}>
                <CountUp to={value} />
            </dd>
        </div>
    );
}

export function CommunityFeed({ posts, reacted, signedIn }: Props) {
    const [filter, setFilter] = useState("semua");
    const [query, setQuery] = useState("");
    const [limit, setLimit] = useState(PAGE);
    const [openId, setOpenId] = useState<string | null>(null);
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [marks, setMarks] = useOptimistic(
        new Set(reacted),
        (current, change: { id: string; on: boolean }) => {
            const next = new Set(current);
            if (change.on) next.add(change.id);
            else next.delete(change.id);
            return next;
        },
    );
    const [, startTransition] = useTransition();

    const options = useMemo(
        () => [
            { value: "semua", label: "Semua" },
            { value: "peringatan", label: "Peringatan" },
            { value: "pengalaman", label: "Pengalaman" },
            { value: "tips", label: "Tips" },
        ],
        [],
    );

    const visible = useMemo(() => {
        const needle = query.trim().toLowerCase();
        return posts.filter((post) => {
            if (filter !== "semua" && post.kind !== filter) return false;
            if (!needle) return true;
            return `${post.title} ${stripMarkdown(post.body)} ${post.category?.name ?? ""}`.toLowerCase().includes(needle);
        });
    }, [posts, filter, query]);

    const shown = visible.slice(0, limit);
    const open = posts.find((post) => post.id === openId) ?? null;

    const toggle = (id: string) => {
        if (!signedIn) {
            toast.info("Masuk dulu untuk memberi tanda membantu.", {
                action: { label: "Masuk", onClick: () => window.location.assign("/sign-in?next=/komunitas") },
            });
            return;
        }
        const on = !marks.has(id);
        startTransition(async () => {
            setMarks({ id, on });
            const result = await toggleHelpfulAction(id, on);
            if (result.status === "error") toast.error(result.message);
            else if (result.data) setCounts((current) => ({ ...current, [id]: result.data!.count }));
        });
    };

    const countOf = (post: CommunityCard) => counts[post.id] ?? post.helpful_count;

    return (
        <div className="flex flex-col gap-8">
            <SpotlightCard className="rounded-3xl border border-border bg-card">
                <dl className="flex flex-col divide-y divide-border sm:flex-row sm:divide-x sm:divide-y-0">
                    <Stat label="Cerita terbit" value={posts.length} />
                    <Stat label="Tanda membantu" value={posts.reduce((sum, post) => sum + post.helpful_count, 0)} tone="text-primary" />
                    <Stat label="Peringatan aktif" value={posts.filter((post) => post.kind === "peringatan").length} />
                </dl>
            </SpotlightCard>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <FilterPills
                    id="komunitas"
                    options={options}
                    value={filter}
                    onChange={(value) => {
                        setFilter(value);
                        setLimit(PAGE);
                    }}
                />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative">
                        <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={query}
                            onChange={(event) => {
                                setQuery(event.target.value);
                                setLimit(PAGE);
                            }}
                            placeholder="Cari cerita"
                            aria-label="Cari cerita"
                            className="h-10 w-full rounded-full pl-10 sm:w-56"
                        />
                    </div>
                    <StarBorder as={Link} href="/komunitas/baru" radius={999} duration={5} theme="light" className="w-fit">
                        <span className="flex items-center gap-2 px-1 text-sm">
                            <PlusIcon className="size-4" />
                            Bagikan cerita
                        </span>
                    </StarBorder>
                </div>
            </div>

            {shown.length ? (
                <>
                    <AnimatedContent key={`${filter}-${query}`} distance={28} duration={0.6} stagger={0.07} trigger="mount" threshold={0.05} className="columns-1 gap-5 md:columns-2 lg:columns-3">
                        {shown.map((post) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                on={marks.has(post.id)}
                                count={countOf(post)}
                                onToggle={() => toggle(post.id)}
                                onOpen={() => setOpenId(post.id)}
                            />
                        ))}
                    </AnimatedContent>
                    {visible.length > shown.length ? (
                        <div className="flex justify-center">
                            <Button type="button" variant="outline" onClick={() => setLimit((value) => value + PAGE)} className="h-10 rounded-full px-6 font-normal">
                                Tampilkan lebih banyak ({visible.length - shown.length})
                            </Button>
                        </div>
                    ) : null}
                </>
            ) : (
                <EmptyState
                    icon={<MessagesSquareIcon />}
                    title={query ? "Tidak ada cerita yang cocok" : "Belum ada kiriman"}
                    description={query ? "Coba kata kunci lain atau ganti jenis cerita." : "Jadilah yang pertama membagikan cerita di kategori ini."}
                />
            )}

            <PostDialog
                post={open}
                on={open ? marks.has(open.id) : false}
                count={open ? countOf(open) : 0}
                signedIn={signedIn}
                onToggle={() => open && toggle(open.id)}
                onClose={() => setOpenId(null)}
            />
        </div>
    );
}
