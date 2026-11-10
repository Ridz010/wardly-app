import Image from "next/image";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

import AnimatedContent from "@/components/AnimatedContent";
import BlurText from "@/components/BlurText";
import MagicBento, { type MagicBentoItem } from "@/components/MagicBento";

import "./landing.css";

const STEPS = [
    {
        no: "01",
        tone: "aurora",
        title: "Tempel pesannya",
        desc: "Salin chat, tautan, atau screenshot yang bikin ragu. Tidak perlu daftar dulu.",
        href: "/bedah",
    },
    {
        no: "02",
        tone: "dusk",
        title: "Lihat tanda bahayanya",
        desc: "Ward-Ly menyorot pola mencurigakan dan menjelaskan alasannya dengan bahasa sederhana.",
        href: "/radar",
    },
    {
        no: "03",
        tone: "mist",
        title: "Latih nalurimu",
        desc: "Hadapi chat penipu dalam skenario bergaya game. Kumpulkan XP, bintang, dan lencana.",
        href: "/latih",
    },
    {
        no: "04",
        tone: "meadow",
        title: "Ambil langkah aman",
        desc: "Ikuti panduan sebelum dan sesudah kejadian, lalu bagikan ke keluarga.",
        href: "/lindungi",
    },
] as const;

function StepCard({ no, tone, title, desc }: (typeof STEPS)[number]) {
    return (
        <div className="flex h-full flex-col gap-5">
            <div className="aurora-pill flex h-24 w-full items-center justify-center sm:h-28" data-tone={tone}>
                <span className="relative z-10 rounded-full bg-white/85 px-3 py-1 text-[0.7rem] text-foreground shadow-sm">
                    Langkah {no}
                </span>
            </div>
            <div className="mt-auto flex flex-col gap-1.5">
                <h3 className="font-heading text-xl font-medium tracking-tight text-foreground sm:text-2xl">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
            </div>
        </div>
    );
}

function CtaCard() {
    return (
        <div className="relative -m-[var(--mb-pad)] flex-1 overflow-hidden bg-linear-to-br from-[#1e40af] via-[#1d4ed8] to-[#158ab0]">
            <svg aria-hidden="true" viewBox="0 0 600 200" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-1/2 w-full opacity-40">
                <path d="M0 140 C 120 80, 240 200, 360 130 S 560 60, 600 110 L600 200 L0 200 Z" fill="#5df2e7" fillOpacity="0.35" />
                <path d="M0 170 C 150 120, 260 210, 400 160 S 560 120, 600 150 L600 200 L0 200 Z" fill="#78dcb8" fillOpacity="0.35" />
            </svg>
            <div className="relative flex h-full flex-col items-center gap-6 p-6 sm:flex-row sm:p-8">
                <Image
                    src="/mascot/melambaikan-tangan.png"
                    alt=""
                    width={192}
                    height={192}
                    className="size-32 shrink-0 object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,0.25)] sm:size-48"
                />
                <div className="flex flex-col items-start gap-5 text-white">
                    <p className="font-heading text-2xl leading-snug font-light tracking-tight text-balance sm:text-3xl">
                        Periksa pesan dalam hitungan detik dan{" "}
                        <span className="text-brand-aqua">tetap tenang di setiap langkah</span> setelahnya.
                    </p>
                    <Link
                        href="/bedah"
                        className="group inline-flex h-11 items-center gap-2 rounded-full bg-brand-aqua px-6 text-sm text-brand-deep shadow-[0_0_28px_-6px_#5df2e7] transition-colors duration-300 hover:bg-brand-mint"
                    >
                        Mulai periksa
                        <FiArrowRight aria-hidden="true" className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

const ITEMS: MagicBentoItem[] = [
    ...STEPS.map((step) => ({ id: step.no, title: step.title, href: step.href, content: <StepCard {...step} /> })),
    { id: "cta", colSpan: 2, content: <CtaCard /> },
];

export default function FiturBento() {
    return (
        <section id="cara-kerja" className="w-full bg-linear-to-b from-background via-accent/40 to-background">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-16 sm:px-6 lg:py-24">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div role="heading" aria-level={2} className="max-w-xl">
                        <BlurText
                            text="Empat langkah kecil, satu keputusan yang lebih aman."
                            trigger="view"
                            animateBy="words"
                            direction="top"
                            delay={80}
                            blur={10}
                            distance={24}
                            className="font-heading text-3xl leading-[1.1] font-light tracking-tight text-foreground sm:text-4xl lg:text-5xl"
                        />
                    </div>
                    <AnimatedContent distance={20} duration={0.7} delay={0.2}>
                        <p className="max-w-sm text-sm text-muted-foreground sm:text-base">
                            Tidak perlu hafal semua modus. Mulai dari langkah yang paling kamu butuhkan sekarang.
                        </p>
                    </AnimatedContent>
                </div>

                <MagicBento
                    items={ITEMS}
                    columns={3}
                    rowHeight={320}
                    gap={16}
                    radius={28}
                    theme="light"
                    glowColor="#2fb6c9"
                    enableBorderGlow
                    enableSpotlight
                    spotlightRadius={320}
                    enableStars={false}
                    enableTilt={false}
                    enableMagnetism={false}
                    clickEffect
                    intro
                />
            </div>
        </section>
    );
}
