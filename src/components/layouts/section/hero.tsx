import Link from "next/link";
import type { CSSProperties } from "react";
import { FiArrowUpRight } from "react-icons/fi";

import HeroEffects from "@/components/layouts/section/hero-effects";
import HeroMascot from "@/components/layouts/section/hero-mascot";
import { cn } from "cn";

import "./landing.css";

// Server-rendered on purpose: the copy and CTA paint from HTML + CSS alone,
// while the WebGL backdrop and cursor load later as a client island.

const SECTION_CLASS = `
    relative isolate flex w-full items-center overflow-hidden
    min-h-[85svh] sm:min-h-115 lg:min-h-125
    bg-[#06141B]
    bg-[radial-gradient(120%_70%_at_50%_110%,#158AB0_0%,#0B4A5C_35%,#06141B_70%)]
`;

const HEADING_CLASS =
    "font-heading text-3xl font-light leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl";

const MASCOT_CLASS = `
    h-3/5 w-auto max-w-full translate-y-6 select-none object-contain object-bottom
    opacity-30 sm:h-4/5 sm:translate-y-8 sm:opacity-100 lg:h-full lg:translate-y-10
`;

const BUTTON_CLASS = `
    cursor-target group relative inline-flex h-11 w-full items-center justify-center gap-2.5 overflow-hidden rounded-full
    bg-brand-aqua px-6 text-sm font-semibold text-white outline-none
    shadow-[0_0_28px_-4px_#5df2e7]
    transition-[background-color,box-shadow,transform] duration-300
    hover:-translate-y-0.5 hover:bg-brand-mint hover:shadow-[0_0_44px_-2px_#5df2e7]
    focus-visible:ring-3 focus-visible:ring-white/60 active:scale-[0.97]
    sm:w-auto
`;

const SHINE_CLASS = `
    pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12
    bg-white/60 blur-md transition-transform duration-700 ease-out
    group-hover:translate-x-[420%] motion-reduce:hidden
`;

function Words({ text, offset = 0, accent = false }: { text: string; offset?: number; accent?: boolean }) {
    return text.split(" ").map((word, index) => (
        <span
            key={`${word}-${index}`}
            className={cn("hero-word", accent && "hero-word--accent")}
            style={{ "--i": offset + index } as CSSProperties}
        >
            {word}
        </span>
    ));
}

export default function Hero() {
    return (
        <section className={SECTION_CLASS}>
            <HeroEffects />

            <div
                className="pointer-events-none absolute inset-0 -z-10 mx-auto w-full max-w-6xl px-4 sm:px-6"
                aria-hidden="true"
            >
                <div className="flex h-full items-end justify-end pt-24 sm:pt-28">
                    <HeroMascot className={MASCOT_CLASS} />
                </div>
            </div>

            <div className="relative mx-auto w-full max-w-6xl px-4 pb-12 pt-28 sm:px-6 sm:pt-32 lg:pt-36">
                <div className="max-w-xl">
                    <h1 className={cn(HEADING_CLASS, "flex flex-wrap gap-x-[0.25em] text-white")}>
                        <Words text="Ragu sama" />
                        <Words text="pesan ini?" offset={2} accent />
                    </h1>

                    <p className="hero-lead mt-4 max-w-sm text-sm leading-relaxed text-white sm:max-w-md sm:text-base">
                        Jangan buru-buru membalas. Kami bantu kamu berhenti sejenak, melihat tandanya,
                        lalu memilih langkah yang lebih tepat dan tenang.
                    </p>

                    <div className="hero-cta mt-6 block sm:inline-block">
                        <Link href="/bedah" data-cursor-label="Periksa" className={BUTTON_CLASS}>
                            <span aria-hidden="true" className={SHINE_CLASS} />
                            <span className="relative">Periksa Sekarang</span>
                            <FiArrowUpRight
                                aria-hidden="true"
                                className="relative size-4.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                            />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
