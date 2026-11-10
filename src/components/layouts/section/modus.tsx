"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

import AnimatedContent from "@/components/AnimatedContent";
import BlurText from "@/components/BlurText";
import DecryptedText from "@/components/DecryptedText";
import Magnet from "@/components/Magnet";
import OptionWheel from "@/components/OptionWheel";
import ScrollVelocity from "@/components/ScrollVelocity";
import { DeferUntilVisible } from "@/components/shared/defer-until-visible";
import { buttonVariants } from "@/components/ui/button";
import { useLiteMode } from "@/hooks/use-lite-mode";
import { cn } from "@/lib/utils";

const Grainient = dynamic(() => import("@/components/Grainient"), { ssr: false });

const MODUS = [
    { title: "Paket tertahan", target: "Kurir palsu", status: "Meluas" },
    { title: "Undangan digital", target: "File aplikasi", status: "Sering muncul" },
    { title: "Tagihan pajak", target: "Otoritas palsu", status: "Perlu waspada" },
];

const WHEEL_ITEMS = MODUS.map((modus) => modus.title);

const MARQUEE_TEXT = [...WHEEL_ITEMS, ...MODUS.map((modus) => modus.target)]
    .join("  ·  ")
    .concat("  ·  ");

const COLOR = {
    text: "#a2c4bd",
    active: "#e8f7f3",
    accent: "#5df2e7",
    shine: "#ffffff",
};

const GRAIN_COLORS = ["#0b1a19", "#102322", "#14605a", "#258883", "#78dcb8"];

const GRAIN_MASK_CLASS = `
    absolute inset-x-0 bottom-0 z-0 h-3/5
    bg-linear-to-br from-[#102322] via-[#14605a] to-[#258883]
    [mask-image:linear-gradient(to_bottom,transparent,black_40%)]
    lg:inset-y-0 lg:left-auto lg:right-0 lg:h-auto lg:w-3/5
    lg:[mask-image:linear-gradient(to_right,transparent,black_45%)]
`;

const RADAR_SWEEP_CLASS = `
    absolute inset-0 rounded-full animate-spin motion-reduce:animate-none
    [animation-duration:12s]
    bg-[conic-gradient(from_0deg,transparent_0deg,color-mix(in_oklab,var(--primary)_20%,transparent)_70deg,transparent_71deg)]
`;

export default function Modus() {
    const [active, setActive] = useState(0);
    const current = MODUS[active];
    const lite = useLiteMode();

    return (
        <section id="modus" className="w-full px-4 py-10 sm:px-6">
            <div className="dark relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-background text-foreground">
                {lite ? (
                    <div aria-hidden="true" className={GRAIN_MASK_CLASS} />
                ) : (
                    <DeferUntilVisible className={GRAIN_MASK_CLASS}>
                        <Grainient
                            colors={GRAIN_COLORS}
                            angle={55}
                            flow={0.6}
                            silk={0.35}
                            grainAmount={0.06}
                            type="linear"
                            bands={1}
                            softness={1}
                            scale={1}
                            speed={0.6}
                            grainSize={1.2}
                            grainAnimated={false}
                            contrast={1}
                            saturation={0.9}
                            variation={0}
                            interactive={false}
                            clickSwirl={false}
                            intro
                            dpr={1}
                            maxFps={30}
                        />
                    </DeferUntilVisible>
                )}

                <div className="relative z-10 grid items-center gap-10 px-6 pt-12 pb-10 sm:px-10 lg:grid-cols-2 lg:gap-16 lg:px-14 lg:pt-20 lg:pb-14">
                    <div className="relative font-light">
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute top-[40%] left-0 size-80 -translate-x-1/3 -translate-y-1/2 sm:size-104"
                        >
                            <div className="absolute inset-0 rounded-full border border-border/50" />
                            <div className="absolute inset-[14%] rounded-full border border-border/40" />
                            <div className="absolute inset-[28%] rounded-full border border-border/30" />
                            <div className={RADAR_SWEEP_CLASS} />
                        </div>

                        <AnimatedContent
                            direction="horizontal"
                            reverse
                            distance={60}
                            duration={0.9}
                        >
                            <div className="relative h-72 sm:h-80 lg:h-96">
                                <OptionWheel
                                    items={WHEEL_ITEMS}
                                    defaultSelected={0}
                                    textColor={COLOR.text}
                                    activeColor={COLOR.active}
                                    side="left"
                                    fontSize={2}
                                    spacing={1.4}
                                    curve={1}
                                    tilt={6}
                                    blur={0}
                                    fade={0.25}
                                    smoothing={200}
                                    inset={16}
                                    loop={false}
                                    draggable
                                    onChange={(index) => setActive(index)}
                                />
                            </div>
                        </AnimatedContent>

                        <div
                            key={active}
                            className="relative mt-6 flex items-center gap-4 text-sm"
                        >
                            <DecryptedText
                                text={current.target}
                                animateOn="view"
                                sequential
                                speed={40}
                                maxIterations={12}
                                className="text-foreground"
                                encryptedClassName="text-muted-foreground"
                            />
                            <span aria-hidden="true" className="h-px w-8 bg-border" />
                            <DecryptedText
                                text={current.status}
                                animateOn="view"
                                sequential
                                speed={40}
                                maxIterations={12}
                                className="text-primary"
                                encryptedClassName="text-muted-foreground"
                            />
                        </div>
                    </div>

                    <div className="pointer-events-none flex flex-col items-start gap-5 font-light">
                        <div role="heading" aria-level={2}>
                            <BlurText
                                text="Kenali pola yang sedang banyak dibicarakan."
                                trigger="view"
                                animateBy="words"
                                direction="top"
                                delay={90}
                                blur={10}
                                distance={30}
                                className="max-w-md font-heading text-3xl leading-[1.1] font-light tracking-tight sm:text-4xl lg:text-5xl"
                            />
                        </div>

                        <AnimatedContent distance={30} duration={0.8} delay={0.2}>
                            <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
                                Informasi sebaran adalah laporan komunitas, bukan
                                kepastian bahwa setiap pesan serupa adalah penipuan.
                            </p>
                        </AnimatedContent>

                        <AnimatedContent distance={30} duration={0.8} delay={0.3}>
                            <Magnet padding={50} magnetStrength={4}>
                                <Link
                                    href="/radar"
                                    className={cn(
                                        buttonVariants({ size: "lg" }),
                                        "pointer-events-auto group h-11 gap-2 rounded-full px-6 font-normal",
                                    )}
                                >
                                    Lihat radar modus
                                    <FiArrowRight
                                        aria-hidden="true"
                                        className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                                    />
                                </Link>
                            </Magnet>
                        </AnimatedContent>
                    </div>
                </div>

                <div
                    aria-hidden="true"
                    className="pointer-events-none relative z-10 border-t border-border/40 py-4 font-light"
                >
                    <ScrollVelocity
                        texts={[MARQUEE_TEXT]}
                        velocity={60}
                        className="text-3xl font-light tracking-tight whitespace-pre text-foreground/15 sm:text-5xl"
                    />
                </div>
            </div>
        </section>
    );
}