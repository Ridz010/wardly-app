"use client";

import BorderGlow from "@/components/BorderGlow";
import { HelpfulButton } from "@/components/komunitas/helpful-button";
import { kindOf } from "@/components/komunitas/kind";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { CommunityCard } from "@/lib/data/content";
import { firstImage, formatDate, initials, stripMarkdown } from "@/lib/format";

type Props = {
    post: CommunityCard;
    on: boolean;
    count: number;
    onToggle: () => void;
    onOpen: () => void;
};

const GLOW = ["#2fb6c9", "#158ab0", "#5df2e7"];

export function PostCard({ post, on, count, onToggle, onOpen }: Props) {
    const kind = kindOf(post.kind);
    const cover = firstImage(post.body);
    const excerpt = stripMarkdown(post.body);

    return (
        <BorderGlow
            backgroundColor="#ffffff"
            glowColor="193 78 48"
            colors={GLOW}
            borderRadius={24}
            glowRadius={28}
            glowIntensity={0.9}
            className="mb-5 break-inside-avoid"
        >
            <article className="flex flex-col gap-4 p-5">
                {cover ? (
                    <button
                        type="button"
                        onClick={onOpen}
                        aria-label={`Baca ${post.title}`}
                        className="overflow-hidden rounded-2xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                        <img src={cover} alt="" loading="lazy" decoding="async" className="aspect-video w-full object-cover transition-transform duration-700 hover:scale-105" />
                    </button>
                ) : null}

                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="gap-1.5 rounded-full font-normal">
                        <span className={`size-1.5 rounded-full ${kind.dot}`} aria-hidden="true" />
                        {kind.label}
                    </Badge>
                    {post.category ? (
                        <Badge variant="outline" className="rounded-full font-normal">{post.category.name}</Badge>
                    ) : null}
                </div>

                <button
                    type="button"
                    onClick={onOpen}
                    className="flex flex-col gap-2 rounded-lg text-left focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                    <h2 className="font-heading text-lg leading-snug font-medium tracking-tight text-foreground text-balance">{post.title}</h2>
                    <p className="line-clamp-4 text-sm text-muted-foreground">{excerpt}</p>
                    <span className="text-sm text-primary">Baca selengkapnya</span>
                </button>

                <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
                    <span className="flex min-w-0 items-center gap-2.5">
                        <Avatar className="size-8">
                            <AvatarFallback className="bg-primary/10 text-xs text-primary">{initials(post.author)}</AvatarFallback>
                        </Avatar>
                        <span className="flex min-w-0 flex-col leading-tight">
                            <span className="truncate text-sm text-foreground">{post.author}</span>
                            <span className="text-xs text-muted-foreground">{formatDate(post.created_at)}</span>
                        </span>
                    </span>
                    <HelpfulButton on={on} count={count} onToggle={onToggle} />
                </div>
            </article>
        </BorderGlow>
    );
}
