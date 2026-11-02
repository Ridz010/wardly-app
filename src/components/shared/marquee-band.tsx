"use client";

import ScrollVelocity from "@/components/ScrollVelocity";

export function MarqueeBand({ items }: { items: string[] }) {
    if (!items.length) return null;

    return (
        <div aria-hidden="true" className="-mx-6 overflow-hidden border-y border-border py-4">
            <ScrollVelocity
                texts={[items.join("  ·  ")]}
                velocity={40}
                numCopies={4}
                className="font-heading text-2xl font-light tracking-tight text-muted-foreground/60"
            />
        </div>
    );
}
