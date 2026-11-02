import AnimatedContent from "@/components/AnimatedContent";
import BlurText from "@/components/BlurText";
import GradientText from "@/components/GradientText";
import { cn } from "cn";

type Props = {
    title: string;
    highlight?: string;
    description?: string;
    meta?: React.ReactNode;
    actions?: React.ReactNode;
    className?: string;
    animate?: boolean;
};

const TITLE_CLASS = "font-heading text-3xl font-medium leading-[1.1] tracking-tight sm:text-5xl";
const GRADIENT = ["#0B4A5C", "#158AB0", "#2FB6C9", "#158AB0"];

export function PageHeader({
    title,
    highlight,
    description,
    meta,
    actions,
    className,
    animate = true,
}: Props) {
    return (
        <div
            className={cn(
                "flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between",
                className,
            )}
        >
            <div className="flex max-w-2xl flex-col gap-3">
                {meta ? <div className="flex flex-wrap items-center gap-2">{meta}</div> : null}

                {animate ? (
                    <div role="heading" aria-level={1} className="flex flex-wrap items-baseline gap-x-[0.25em]">
                        <BlurText
                            text={title}
                            trigger="load"
                            animateBy="words"
                            direction="top"
                            delay={70}
                            blur={10}
                            distance={26}
                            className={cn(TITLE_CLASS, "text-foreground")}
                        />
                        {highlight ? (
                            <GradientText colors={GRADIENT} animationSpeed={7} className={TITLE_CLASS}>
                                {highlight}
                            </GradientText>
                        ) : null}
                    </div>
                ) : (
                    <h1 className="font-heading text-3xl font-medium tracking-tight text-foreground">{title}</h1>
                )}

                {description ? (
                    animate ? (
                        <AnimatedContent distance={16} duration={0.6} delay={0.25}>
                            <p className="text-balance text-base text-muted-foreground sm:text-lg">{description}</p>
                        </AnimatedContent>
                    ) : (
                        <p className="text-balance text-muted-foreground">{description}</p>
                    )
                ) : null}
            </div>
            {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
    );
}
