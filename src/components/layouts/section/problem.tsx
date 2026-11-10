import Image from "next/image";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

import AnimatedContent from "@/components/AnimatedContent";
import ScrollStack, { ScrollStackItem } from "@/components/ScrollStack";

import "./landing.css";

const CARDS = [
    { src: "/section/gambar1.png", alt: "Dapat pesan aneh" },
    { src: "/section/gambar2.png", alt: "Lagi ditelepon" },
    { src: "/section/gambar3.png", alt: "Sudah terlanjur" },
    { src: "/section/gambar4.png", alt: "Mau latihan bareng" },
];

// ScrollStack.css is unlayered, so these overrides need `!` to beat it.
// The card stays a plain surface; the colour lives on the section behind the stack.
const CARD_CLASS = `
    h-auto! overflow-hidden! p-0! bg-card!
    shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-brand-mint)_45%,transparent),0_-10px_32px_-18px_color-mix(in_oklab,var(--color-brand-teal)_35%,transparent),0_28px_56px_-24px_color-mix(in_oklab,var(--color-brand-teal)_55%,transparent)]!
`;

export default function Problem() {
    return (
        <section id="problem" className="problem-backdrop relative isolate w-full">
            <div aria-hidden="true" className="problem-backdrop__glow" />
            <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
                {/* Teks kiri, CTA kanan */}
                <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex flex-col gap-3">

                        <AnimatedContent distance={40} duration={0.7} delay={0.1}>
                            <h2 className="font-heading text-3xl font-light tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                                Apa yang sedang terjadi?
                            </h2>
                        </AnimatedContent>
                    </div>

                    <AnimatedContent distance={40} duration={0.7} delay={0.2}>
                        <Link
                            href="/bedah"
                            className="group inline-flex items-center gap-2 text-sm font-light text-foreground"
                        >
                            <span className="underline underline-offset-4">
                                Mulai Sekarang
                            </span>
                            <FiArrowRight
                                aria-hidden="true"
                                className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                            />
                        </Link>
                    </AnimatedContent>
                </div>

                {/* Scroll stack full width */}
                <div className="mt-12 w-full lg:mt-16">
                    <ScrollStack
                        useWindowScroll
                        smoothScroll={false}
                        itemDistance={80}
                        itemStackDistance={24}
                        stackPosition="25%"
                        baseScale={0.88}
                        itemScale={0.03}
                    >
                        {CARDS.map(({ src, alt }, index) => (
                            <ScrollStackItem key={src} itemClassName={CARD_CLASS}>
                                <AnimatedContent
                                    distance={60}
                                    duration={0.8}
                                    threshold={0.2}
                                    delay={index === 0 ? 0.1 : 0}
                                >
                                    <Image
                                        src={src}
                                        alt={alt}
                                        width={1280}
                                        height={720}
                                        sizes="(min-width: 1152px) 1152px, 100vw"
                                        className="h-auto w-full select-none"
                                    />
                                </AnimatedContent>
                            </ScrollStackItem>
                        ))}
                    </ScrollStack>
                </div>
            </div>
        </section>
    );
}