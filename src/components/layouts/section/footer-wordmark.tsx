"use client";

import dynamic from "next/dynamic";

import { DeferUntilVisible } from "@/components/shared/defer-until-visible";
import { useLiteMode } from "@/hooks/use-lite-mode";

const TextPressure = dynamic(() => import("@/components/TextPressure"), { ssr: false });

const WORDMARK = {
    fill: "#102322",
    stroke: "#258883",
};

export default function FooterWordmark() {
    const lite = useLiteMode();

    if (lite) {
        return (
            <div
                className="flex h-full w-full items-center justify-center font-heading text-[clamp(4rem,22vw,20rem)] leading-none font-bold tracking-tight select-none"
                style={{ color: WORDMARK.fill, WebkitTextStroke: `1px ${WORDMARK.stroke}` }}
            >
                WARDLY
            </div>
        );
    }

    return (
        <DeferUntilVisible className="h-full w-full">
            <TextPressure
                text="WARDLY"
                width
                weight
                italic={false}
                alpha={false}
                flex
                stroke
                scale
                textColor={WORDMARK.fill}
                strokeColor={WORDMARK.stroke}
                minFontSize={36}
            />
        </DeferUntilVisible>
    );
}
