"use client";

import Link from "next/link";

import Stack from "@/components/Stack";
import { kindOf } from "@/components/komunitas/kind";
import { useLiteMode } from "@/hooks/use-lite-mode";
import type { CommunityCard } from "@/lib/data/content";
import { formatDate, stripMarkdown } from "@/lib/format";

export function KomunitasStack({ posts }: { posts: CommunityCard[] }) {
    const lite = useLiteMode();
    const cards = posts.map((post) => {
        const kind = kindOf(post.kind);
        return (
            <Link
                key={post.id}
                href="/komunitas"
                draggable={false}
                className="flex h-full w-full flex-col justify-between gap-4 bg-card p-6 text-left"
            >
                <div className="flex flex-col gap-3">
                    <span className="flex w-fit items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs text-foreground">
                        <span className={`size-1.5 rounded-full ${kind.dot}`} aria-hidden="true" />
                        {kind.label}
                    </span>
                    <h3 className="font-heading text-xl leading-snug font-medium tracking-tight text-foreground text-balance">{post.title}</h3>
                    <p className="line-clamp-4 text-sm text-muted-foreground">{stripMarkdown(post.body)}</p>
                </div>
                <span className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{post.author}</span>
                    <span>{formatDate(post.created_at)}</span>
                </span>
            </Link>
        );
    });

    return (
        <div className="mx-auto h-[26rem] w-full max-w-sm">
            <Stack cards={cards} layout="fan" visible={4} radius={28} frame={6} frameColor="#ffffff" sendToBackOnClick={false} autoplay={!lite} autoplayDelay={5000} pauseOnHover />
        </div>
    );
}
