"use client";

import { useEffect, useState } from "react";

const EVENTS = ["pointermove", "pointerdown", "scroll", "wheel", "keydown", "touchstart"] as const;

/**
 * Becomes true on the visitor's first interaction (pointer move, scroll, key or
 * touch). Decorative work gated on it never competes with the first paint or
 * hydration, and never counts towards Largest Contentful Paint.
 */
export function useFirstInteraction() {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const start = () => {
            EVENTS.forEach((name) => window.removeEventListener(name, start));
            setReady(true);
        };
        EVENTS.forEach((name) => window.addEventListener(name, start, { once: true, passive: true }));
        return () => EVENTS.forEach((name) => window.removeEventListener(name, start));
    }, []);

    return ready;
}
