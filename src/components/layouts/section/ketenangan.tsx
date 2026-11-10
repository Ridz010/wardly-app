import Image from "next/image";
import Link from "next/link";
import { FiPlay } from "react-icons/fi";

import AnimatedContent from "@/components/AnimatedContent";
import BlurText from "@/components/BlurText";

import "./landing.css";

const CLOUDS = [
    { className: "top-[12%] left-[6%] h-8 w-28", delay: "0s" },
    { className: "top-[22%] right-[10%] h-10 w-36", delay: "-6s" },
    { className: "top-[48%] left-[18%] hidden h-6 w-20 sm:block", delay: "-11s" },
    { className: "top-[8%] right-[38%] hidden h-6 w-24 md:block", delay: "-3s" },
];

export default function Ketenangan() {
    return (
        <section id="ketenangan" className="w-full px-4 py-10 sm:px-6">
            <div className="relative mx-auto min-h-[34rem] max-w-6xl overflow-hidden rounded-[2.5rem] bg-linear-to-b from-[#bdeefa] via-[#d8f6f8] to-[#eafbf3] sm:min-h-[38rem]">
                {CLOUDS.map((cloud) => (
                    <span
                        key={cloud.className}
                        aria-hidden="true"
                        className={`sky-cloud ${cloud.className}`}
                        style={{ animationDelay: cloud.delay }}
                    />
                ))}

                <svg
                    aria-hidden="true"
                    viewBox="0 0 1200 300"
                    preserveAspectRatio="none"
                    className="absolute inset-x-0 bottom-0 h-44 w-full sm:h-56"
                >
                    <defs>
                        <linearGradient id="hill-back" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#9be3c4" />
                            <stop offset="100%" stopColor="#5fc9a0" />
                        </linearGradient>
                        <linearGradient id="hill-mid" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#8fd3f4" />
                            <stop offset="100%" stopColor="#5aa9e6" />
                        </linearGradient>
                        <linearGradient id="hill-front" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#7ed9a8" />
                            <stop offset="100%" stopColor="#3fae7c" />
                        </linearGradient>
                    </defs>
                    <path d="M0 170 C 200 90, 380 110, 560 160 S 900 90, 1200 140 L1200 300 L0 300 Z" fill="url(#hill-back)" />
                    <path d="M300 230 C 480 150, 760 150, 940 230 L 940 300 L 300 300 Z" fill="url(#hill-mid)" />
                    <path d="M0 220 C 160 170, 300 200, 420 250 L 420 300 L 0 300 Z" fill="url(#hill-front)" />
                    <path d="M820 250 C 950 190, 1100 190, 1200 220 L1200 300 L820 300 Z" fill="url(#hill-front)" />
                </svg>

                <div className="relative z-10 flex flex-col items-center px-6 pt-16 text-center sm:pt-20">
                    <div role="heading" aria-level={2} className="flex flex-col items-center">
                        <BlurText
                            text="Pesan aneh datang tiba-tiba."
                            trigger="view"
                            animateBy="words"
                            direction="top"
                            delay={80}
                            blur={10}
                            distance={24}
                            className="justify-center font-heading text-3xl leading-[1.1] font-light tracking-tight text-[#0f2a33] sm:text-5xl"
                        />
                        <BlurText
                            text="Kamu tetap tenang."
                            trigger="view"
                            animateBy="words"
                            direction="top"
                            delay={120}
                            blur={10}
                            distance={24}
                            className="justify-center font-heading text-3xl leading-[1.1] font-light tracking-tight text-brand-blue sm:text-5xl"
                        />
                    </div>

                    <AnimatedContent distance={20} duration={0.7} delay={0.25}>
                        <p className="mt-4 max-w-sm text-sm text-[#36545c] sm:text-base">
                            Penipu mengandalkan rasa panik. Ward-Ly memastikan kepanikan itu tidak mengambil alih keputusanmu.
                        </p>
                    </AnimatedContent>

                    <AnimatedContent distance={24} duration={0.8} delay={0.35} scale={0.94}>
                        <Link
                            href="/latih"
                            className="aurora-pill group mt-10 flex h-28 w-72 items-center justify-center sm:h-32 sm:w-96"
                            data-tone="ocean"
                        >
                            <span className="relative z-10 flex items-center gap-2 rounded-full bg-white/90 px-4 py-1.5 text-sm text-foreground shadow-sm transition-transform duration-300 group-hover:scale-105">
                                <span className="flex size-5 items-center justify-center rounded-full bg-brand-blue text-white">
                                    <FiPlay className="size-2.5 translate-x-px" aria-hidden="true" />
                                </span>
                                Mulai latihan
                            </span>
                        </Link>
                    </AnimatedContent>
                </div>

                <Image
                    src="/mascot/berjalan.png"
                    alt=""
                    width={160}
                    height={160}
                    className="absolute bottom-16 left-[6%] z-10 size-28 object-contain sm:bottom-24 sm:size-40"
                />

                <div aria-hidden="true" className="absolute right-[6%] bottom-20 z-10 hidden flex-col items-start gap-2 sm:flex">
                    <span className="sign-post -rotate-3 text-sm text-brand-blue">Lebih tenang</span>
                    <span className="sign-post rotate-2 text-sm text-brand-teal">Lebih waspada</span>
                    <span className="ml-6 h-16 w-2 rounded-full bg-linear-to-b from-[#d6b48a] to-[#a97d4f]" />
                </div>
            </div>
        </section>
    );
}
