import GradientASCII from "@/components/GradientASCII";

const WARDLY_COLORS = ["#0B4A5C", "#158AB0", "#2FB6C9", "#5DF2E7", "#D4FFF7"];

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
            {/* Background*/}
            <div className="absolute inset-0 -z-20" aria-hidden="true">
                <GradientASCII
                    colors={["#06b6d4", "#f6f8ff", "#a5d8ff", "#38bdf8"]}
                    shape="horizon"
                    characters=" =+xX0S8#@"
                    cellSize={18}
                    density={0.8}
                    glyphOpacity={0.85}
                    glow={0.2}
                    depthOfField={0}
                    flicker={0.2}
                    softness={0.5}
                    scale={1}
                    flow={0.5}
                    speed={1}
                    gradientOpacity={0.9}
                    grain={0.08}
                    variation={0}
                    mouseInteraction
                    scrambleRadius={0.1}
                    clickEffect="wave"
                    intro
                    lightMode={false}
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
            <div className=""></div>
        </section>
    );
}