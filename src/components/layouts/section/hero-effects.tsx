"use client";

import dynamic from "next/dynamic";

import { useFirstInteraction } from "@/hooks/use-first-interaction";
import { useLiteMode } from "@/hooks/use-lite-mode";

const GradientASCII = dynamic(() => import("@/components/GradientASCII"), { ssr: false });
const TargetCursor = dynamic(() => import("@/components/TargetCursor"), { ssr: false });

const WARDLY_COLORS = ["#0B4A5C", "#158AB0", "#2FB6C9", "#5DF2E7", "#D4FFF7"];

/** Decorative hero layers. They mount on first interaction so they never delay the first paint. */
export default function HeroEffects() {
    const lite = useLiteMode();
    const ready = useFirstInteraction();

    if (lite || !ready) return null;

    return (
        <>
            <TargetCursor targetSelector=".cursor-target" spinDuration={0} />

            <div className="absolute inset-0 -z-20" aria-hidden="true">
                <GradientASCII
                    className="h-full w-full [&_canvas]:block [&_canvas]:h-full [&_canvas]:w-full"
                    shape="rise"
                    colors={WARDLY_COLORS}
                    characters=" .:=+xX0S8#@"
                    cellSize={14}
                    density={0.85}
                    glyphOpacity={0.9}
                    glow={0}
                    softness={0.6}
                    flow={0.6}
                    speed={0.8}
                    gradientOpacity={0.55}
                    grain={0}
                    scrambleRadius={0.12}
                    clickEffect="wave"
                    intro
                    dpr={1}
                    maxFps={30}
                />
            </div>
        </>
    );
}
