import Image from "next/image";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

import AnimatedContent from "@/components/AnimatedContent";
import CountUp from "@/components/CountUp";
import { getSiteStats } from "@/lib/data/content";
import { cn } from "cn";

import "./landing.css";

type Stat = { value: number; suffix?: string; label: string; tag: string; tone: string };

const NUMBER_CLASS = "font-heading text-5xl font-light tracking-tight text-foreground tabular-nums sm:text-6xl lg:text-7xl";

function StatFigure({ stat, delay }: { stat: Stat; delay: number }) {
    return (
        <AnimatedContent distance={30} duration={0.7} delay={delay} className="flex flex-col gap-2">
            <div className="relative w-fit">
                <span className={NUMBER_CLASS}>
                    <CountUp to={stat.value} duration={1.6} />
                    {stat.suffix}
                </span>
                <span
                    className={cn(
                        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-6 rounded-full px-2.5 py-0.5 text-[0.65rem] whitespace-nowrap shadow-sm",
                        stat.tone,
                    )}
                >
                    {stat.tag}
                </span>
            </div>
            <span className="max-w-[14rem] text-sm text-muted-foreground">{stat.label}</span>
        </AnimatedContent>
    );
}

export default async function Stats() {
    const data = await getSiteStats();

    const stats: Stat[] = [
        {
            value: Math.max(data.analyses, 1),
            label: "Pesan, tautan, dan screenshot yang sudah dibedah bersama Ward-Ly.",
            tag: "pesan diperiksa",
            tone: "bg-brand-aqua/80 text-brand-deep",
        },
        {
            value: data.categories,
            label: "Pola penipuan yang sudah dipetakan lengkap dengan tanda bahayanya.",
            tag: "modus dipetakan",
            tone: "bg-brand-mint/80 text-brand-deep",
        },
        {
            value: data.scenarios,
            label: "Skenario latihan interaktif dengan XP, nyawa, dan bintang.",
            tag: "misi latihan",
            tone: "bg-violet-200 text-violet-900",
        },
        {
            value: 24,
            suffix: "/7",
            label: "Dity siap menemani kamu bertanya kapan saja.",
            tag: "selalu siaga",
            tone: "bg-pink-200 text-pink-900",
        },
    ];

    return (
        <section id="angka" className="w-full bg-background">
            <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
                <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,18rem)_1fr] lg:gap-16">
                    <AnimatedContent distance={40} duration={0.9} blur={8} className="flex justify-center lg:justify-start">
                        <div className="relative">
                            <div aria-hidden="true" className="absolute inset-6 rounded-full bg-brand-aqua/30 blur-3xl" />
                            <Image
                                src="/animated_maskot.gif"
                                alt="Dity, maskot Ward-Ly"
                                width={288}
                                height={288}
                                unoptimized
                                className="relative size-48 object-contain sm:size-64"
                            />
                        </div>
                    </AnimatedContent>

                    <div className="grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2">
                        {stats.map((stat, index) => (
                            <StatFigure key={stat.tag} stat={stat} delay={0.1 + index * 0.1} />
                        ))}
                    </div>
                </div>

                <AnimatedContent distance={30} duration={0.8} delay={0.2} className="mt-16 flex flex-wrap items-center justify-center gap-3 sm:mt-20 sm:gap-4">
                    <span className="flex h-16 items-center rounded-full bg-muted px-8 font-heading text-xl text-brand-blue sm:h-20 sm:px-10 sm:text-2xl">
                        Ragu
                    </span>
                    <span className="flex size-16 items-center justify-center rounded-full bg-brand-mint text-brand-deep sm:size-20">
                        <FiArrowRight className="size-7" aria-hidden="true" />
                    </span>
                    <Link
                        href="/bedah"
                        className="flex h-16 items-center rounded-full bg-[#0f1f24] px-8 font-heading text-xl text-white transition-transform duration-300 hover:-translate-y-0.5 sm:h-20 sm:px-10 sm:text-2xl"
                    >
                        Ward-Ly
                    </Link>
                    <span className="flex h-16 items-center rounded-full bg-brand-blue px-8 font-heading text-xl text-brand-aqua sm:h-20 sm:px-10 sm:text-2xl">
                        Yakin
                    </span>
                </AnimatedContent>
            </div>
        </section>
    );
}
