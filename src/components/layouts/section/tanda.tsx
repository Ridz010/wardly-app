"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

import AnimatedContent from "@/components/AnimatedContent";
import BlurText from "@/components/BlurText";
import { buttonVariants } from "@/components/ui/button";
import { useLiteMode } from "@/hooks/use-lite-mode";
import { cn } from "@/lib/utils";

const FallingText = dynamic(() => import("@/components/FallingText"), { ssr: false });

const CLOSING_TEXT =
    "Tarik napas dulu. Jangan buru-buru. Cek dulu pesannya. Baru balas.";

const CLOSING_HIGHLIGHT = ["napas", "Cek", "balas"];

export default function Tanda() {
    const areaRef = useRef<HTMLDivElement>(null);
    const [fallen, setFallen] = useState(false);
    const lite = useLiteMode();

    useEffect(() => {
        const area = areaRef.current;
        if (!area) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;
                setFallen(true);
                observer.disconnect();
            },
            { threshold: 0.7, rootMargin: "0px 0px -10% 0px" },
        );

        observer.observe(area);
        return () => observer.disconnect();
    }, []);

    return (
        <section
            id="tanda-tanda"
            className="w-full bg-background px-4 py-16 sm:px-6 lg:py-24"
        >
            <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center font-light text-foreground">
                <div role="heading" aria-level={2}>
                    <BlurText
                        text="Tenang, kamu tidak sendirian."
                        trigger="view"
                        animateBy="words"
                        direction="top"
                        delay={90}
                        blur={10}
                        distance={30}
                        className="max-w-xl justify-center text-center font-heading text-3xl leading-[1.1] font-light tracking-tight sm:text-4xl lg:text-5xl"
                    />
                </div>

                <AnimatedContent distance={30} duration={0.8} delay={0.2}>
                    <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
                        Ragu sama pesan yang masuk itu wajar. Cek dulu bareng
                        kami sebelum kamu membalas.
                    </p>
                </AnimatedContent>

                <div
                    ref={areaRef}
                    data-cursor-label="Seret"
                    className="cursor-target relative mt-4 h-72 w-full border-b border-border sm:h-80"
                >
                    {lite ? (
                        <p className="flex h-full items-center justify-center text-2xl leading-relaxed text-balance sm:text-3xl">
                            {CLOSING_TEXT}
                        </p>
                    ) : fallen && (
                        <FallingText
                            text={CLOSING_TEXT}
                            highlightWords={CLOSING_HIGHLIGHT}
                            trigger="auto"
                            backgroundColor="transparent"
                            wireframes={false}
                            gravity={0.56}
                            mouseConstraintStiffness={0.9}
                            fontSize="1.75rem"
                        />
                    )}
                </div>

                <AnimatedContent distance={30} duration={0.8} delay={0.3}>
                    <Link
                        href="/bedah"
                        data-cursor-label="Periksa"
                        className={cn(
                            buttonVariants({ size: "lg" }),
                            "cursor-target group mt-2 h-11 gap-2 rounded-full px-6 font-normal",
                        )}
                    >
                        Periksa Sekarang
                        <FiArrowRight
                            aria-hidden="true"
                            className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                        />
                    </Link>
                </AnimatedContent>
            </div>
        </section>
    );
}