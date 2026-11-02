import Link from "next/link";
import { FiArrowRight, FiPlay, FiTarget, FiUsers } from "react-icons/fi";

import AnimatedContent from "@/components/AnimatedContent";
import CardSwap, { Card } from "@/components/CardSwap";
import GlassIcons from "@/components/GlassIcons";

const ICON_COLOR = "linear-gradient(135deg, #78dcb8, #258883)";

const STEPS = [
    {
        no: "01",
        title: "Cek",
        desc: "Lihat sinyal dalam pesan tanpa vonis.",
        href: "/bedah",
        icon: <FiTarget />,
    },
    {
        no: "02",
        title: "Latih",
        desc: "Coba skenario singkat, belajar dari pilihan.",
        href: "/latih",
        icon: <FiPlay />,
    },
    {
        no: "03",
        title: "Lindungi",
        desc: "Bagikan panduan sederhana ke keluarga.",
        href: "/lindungi",
        icon: <FiUsers />,
    },
];

const CARD_CLASS =
    "flex! flex-col! justify-between! border! border-border! bg-card! p-7! text-card-foreground! shadow-sm!";

export default function CaraKerja() {
    return (
        <section
            id="cara-kerja"
            className="relative w-full overflow-x-clip bg-background"
        >
            <div className="mx-auto grid w-full max-w-6xl items-center gap-16 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:py-24">
                <div className="flex flex-col items-start gap-5">

                    <AnimatedContent distance={40} duration={0.7} delay={0.1}>
                        <h2 className="font-heading text-3xl font-light tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                            Satu jeda bisa mengubah keputusan.
                        </h2>
                    </AnimatedContent>

                    <AnimatedContent distance={40} duration={0.7} delay={0.2}>
                        <p className="max-w-md text-base text-muted-foreground">
                            Tidak perlu hafal semua modus. Pilih satu langkah
                            yang paling kamu butuhkan.
                        </p>
                    </AnimatedContent>
                </div>

                <AnimatedContent
                    direction="horizontal"
                    reverse
                    distance={80}
                    duration={0.9}
                    delay={0.2}
                >
                    <div className="relative h-96 w-full sm:h-110 lg:h-120">
                        <CardSwap
                            width={420}
                            height={300}
                            cardDistance={60}
                            verticalDistance={70}
                            skewAmount={6}
                            cardRadius={18}
                            delay={4000}
                            pauseOnHover
                            theme="light"
                        >
                            {STEPS.map(({ no, title, desc, href, icon }) => (
                                <Card key={no} className={CARD_CLASS}>
                                    <div className="flex items-start justify-between">
                                        <GlassIcons
                                            items={[
                                                {
                                                    icon,
                                                    label: title,
                                                    color: ICON_COLOR,
                                                    href,
                                                },
                                            ]}
                                            size={56}
                                            gap={0}
                                            columns={1}
                                            plate="tilt"
                                            tilt={20}
                                            spread={0.4}
                                            hover="press"
                                            labels="none"
                                            iconColor="#ffffff"
                                            theme="light"
                                            intro={false}
                                        />
                                        <span className="text-sm font-semibold tracking-widest text-muted-foreground">
                                            {no}
                                        </span>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <h3 className="font-heading text-2xl font-semibold">
                                            {title}
                                        </h3>
                                        <p className="max-w-xs text-sm text-muted-foreground">
                                            {desc}
                                        </p>
                                        <Link
                                            href={href}
                                            className="group mt-3 inline-flex w-fit items-center gap-2 text-sm font-semibold text-foreground"
                                        >
                                            <span className="underline underline-offset-4">
                                                Buka
                                            </span>
                                            <FiArrowRight
                                                aria-hidden="true"
                                                className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                                            />
                                        </Link>
                                    </div>
                                </Card>
                            ))}
                        </CardSwap>
                    </div>
                </AnimatedContent>
            </div>
        </section>
    );
}