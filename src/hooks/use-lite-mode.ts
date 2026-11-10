"use client";

import { useSyncExternalStore } from "react";

type NavigatorHints = Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
};

const subscribe = () => () => {};

let cached: boolean | undefined;

function detect() {
    const hints = navigator as NavigatorHints;
    return (
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        // Phones: skip WebGL/physics layers; they cost battery and hurt interactivity most there.
        window.matchMedia("(max-width: 767px)").matches ||
        hints.connection?.saveData === true ||
        (hints.hardwareConcurrency ?? 8) <= 4 ||
        (hints.deviceMemory ?? 8) <= 4
    );
}

/**
 * True when decorative WebGL and physics effects should be skipped (reduced
 * motion, data saver, low-end hardware, or a phone-sized viewport). The server
 * snapshot is also true, so those effects only mount after hydration.
 */
export function useLiteMode() {
    return useSyncExternalStore(subscribe, () => (cached ??= detect()), () => true);
}
