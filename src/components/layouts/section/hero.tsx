import GradientASCII from "@/components/GradientASCII";
import BlurText from "@/components/BlurText";

const WARDLY_COLORS = ["#0B4A5C", "#158AB0", "#2FB6C9", "#5DF2E7", "#D4FFF7"];

const HEADING_CLASS =
    "font-heading text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl";

export default function Hero() {
    return (
        <section
            className="
        relative isolate w-full overflow-hidden
        h-90 sm:h-100 lg:h-110
        bg-[#06141B]
        bg-[radial-gradient(120%_70%_at_50%_110%,#158AB0_0%,#0B4A5C_35%,#06141B_70%)]
      "
        >
            {/* Background ASCII */}
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
                <div className="flex h-full items-end justify-end pt-28">
                    <img
                        src="/animated_maskot.gif"
                        alt=""
                        className="h-full w-auto max-w-full translate-y-10 select-none object-contain object-bottom"
                        draggable={false}
                    />
                </div>
            </div>

            {/* Content */}
            <div className="relative mx-auto flex min-h-90 w-full max-w-6xl items-center px-4 py-12 sm:min-h-100 sm:px-6 lg:min-h-110">
                <div className="max-w-xl">
                    <div
                        role="heading"
                        aria-level={1}
                        className="mt-4 flex flex-wrap gap-x-[0.25em]"
                    >
                        <BlurText
                            text="Ragu sama"
                            trigger="load"
                            animateBy="words"
                            direction="top"
                            delay={140}
                            blur={12}
                            distance={36}
                            className={HEADING_CLASS}
                            color="#ffffff"
                        />
                        <BlurText
                            text="pesan ini?"
                            trigger="load"
                            animateBy="words"
                            direction="top"
                            delay={140}
                            blur={12}
                            distance={36}
                            className={HEADING_CLASS}
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
                        className="mt-4 max-w-md leading-relaxed text-white sm:text-sm"
                    />
                </div>
            </div>
        </section>
    );
}