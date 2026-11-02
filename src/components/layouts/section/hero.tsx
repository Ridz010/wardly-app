"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { FiArrowUpRight } from "react-icons/fi";

import { Button } from "@/components/ui/button";
import GradientASCII from "@/components/GradientASCII";
import BlurText from "@/components/BlurText";
import TargetCursor from "@/components/TargetCursor";

const WARDLY_COLORS = ["#0B4A5C", "#158AB0", "#2FB6C9", "#5DF2E7", "#D4FFF7"];

const SECTION_CLASS = `
    relative isolate flex w-full items-center overflow-hidden
    min-h-105 sm:min-h-115 lg:min-h-125
    bg-[#06141B]
    bg-[radial-gradient(120%_70%_at_50%_110%,#158AB0_0%,#0B4A5C_35%,#06141B_70%)]
`;

const HEADING_CLASS =
    "font-heading text-xl font-light leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl";

const HEADING_PROPS = {
    trigger: "load",
    animateBy: "words",
    direction: "top",
    delay: 140,
    blur: 12,
    distance: 36,
    className: HEADING_CLASS,
} as const;

const MASCOT_CLASS = `
    h-3/5 w-auto max-w-full translate-y-6 select-none object-contain object-bottom
    opacity-30 sm:h-4/5 sm:translate-y-8 sm:opacity-100 lg:h-full lg:translate-y-10
`;

const BUTTON_CLASS = `
    cursor-target group relative h-11 w-full gap-2.5 overflow-hidden rounded-full
    bg-brand-aqua px-6 text-sm font-semibold text-white
    shadow-[0_0_28px_-4px_#5df2e7]
    transition-[background-color,box-shadow] duration-300
    hover:bg-brand-mint hover:shadow-[0_0_44px_-2px_#5df2e7]
    sm:w-auto
`;

const SHINE_CLASS = `
    pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12
    bg-white/60 blur-md transition-transform duration-700 ease-out
    group-hover:translate-x-[420%] motion-reduce:hidden
`;

export default function Hero() {
    return (
        <section className={SECTION_CLASS}>
            <TargetCursor targetSelector=".cursor-target" />

            <div className="absolute inset-0 -z-20">
                <GradientASCII
                    className="h-full w-full [&_canvas]:block [&_canvas]:h-full [&_canvas]:w-full"
                    shape="rise"
                    colors={WARDLY_COLORS}
                    characters=" .:=+xX0S8#@"
                    cellSize={14}
                    density={0.85}
                    glyphOpacity={0.9}
                    glow={0.35}
                    softness={0.6}
                    flow={0.6}
                    speed={0.8}
                    gradientOpacity={0.55}
                    grain={0.06}
                    scrambleRadius={0.12}
                    clickEffect="wave"
                    intro
                />
            </div>

            <div
                className="pointer-events-none absolute inset-0 -z-10 mx-auto w-full max-w-6xl px-4 sm:px-6"
                aria-hidden="true"
            >
                <div className="flex h-full items-end justify-end pt-24 sm:pt-28">
                    <img
                        src="/animated_maskot.gif"
                        alt=""
                        className={MASCOT_CLASS}
                        draggable={false}
                    />
                </div>
            </div>

            <div className="relative mx-auto w-full max-w-6xl px-4 pb-12 pt-28 sm:px-6 sm:pt-32 lg:pt-36">
                <div className="max-w-xl">
                    <div
                        role="heading"
                        aria-level={1}
                        className="flex flex-wrap gap-x-[0.25em]"
                    >
                        <BlurText
                            {...HEADING_PROPS}
                            text="Ragu sama"
                            color="#ffffff"
                        />
                        <BlurText
                            {...HEADING_PROPS}
                            text="pesan ini?"
                            fromColor="#ffffff"
                            color="#5DF2E7"
                        />
                    </div>

                    <BlurText
                        text="Jangan buru-buru membalas. Kami bantu kamu berhenti sejenak, melihat tandanya, lalu memilih langkah yang lebih tepat dan tenang."
                        trigger="load"
                        animateBy="words"
                        direction="bottom"
                        delay={45}
                        blur={8}
                        distance={14}
                        className="mt-4 max-w-sm text-sm leading-relaxed text-white sm:max-w-md sm:text-base"
                    />

                    <motion.div
                        className="mt-6 block sm:inline-block"
                        initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{
                            delay: 1.5,
                            duration: 0.6,
                            ease: [0.33, 1, 0.68, 1],
                        }}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.97 }}
                    >
                        <Button
                            size="lg"
                            data-cursor-label="Periksa"
                            className={BUTTON_CLASS}
                            nativeButton={false}
                            render={<Link href="/bedah" />}
                        >
                            <span aria-hidden="true" className={SHINE_CLASS} />
                            <span className="relative">Periksa Sekarang</span>
                            <FiArrowUpRight
                                aria-hidden="true"
                                className="relative size-4.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                            />
                        </Button>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}