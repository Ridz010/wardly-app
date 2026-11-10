"use client";

import { useEffect, useState } from "react";

import { useFirstInteraction } from "@/hooks/use-first-interaction";

const POSTER = "/mascot/dity-poster.webp";
const ANIMATED = "/mascot/dity.webp";

/**
 * Paints a ~20 KB still frame first and swaps in the ~500 KB animated mascot on
 * the visitor's first interaction. Swapping earlier would register the big file
 * as the page's Largest Contentful Paint. Reduced-motion and data-saver users
 * keep the still.
 */
export default function HeroMascot({ className }: { className?: string }) {
    const [src, setSrc] = useState(POSTER);

    const ready = useFirstInteraction();

    useEffect(() => {
        if (!ready) return;
        const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || nav.connection?.saveData) return;

        let cancelled = false;
        const image = new Image();
        image.src = ANIMATED;
        image
            .decode()
            .then(() => {
                if (!cancelled) setSrc(ANIMATED);
            })
            .catch(() => {});

        return () => {
            cancelled = true;
        };
    }, [ready]);

    return (
        // eslint-disable-next-line @next/next/no-img-element -- animated WebP must bypass the optimizer
        <img
            src={src}
            width={320}
            height={360}
            alt=""
            fetchPriority="high"
            draggable={false}
            className={className}
        />
    );
}
