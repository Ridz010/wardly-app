import AnimatedContent from "@/components/AnimatedContent";
import BlurText from "@/components/BlurText";
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
const HIGHLIGHT_CLASS = "bg-linear-to-r from-[#0B4A5C] via-[#158AB0] to-[#2FB6C9] bg-clip-text text-transparent";

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
                    // The text size here only scales the em-based gap to match the title.
                    <div role="heading" aria-level={1} className="flex flex-wrap items-baseline gap-x-[0.25em] text-3xl sm:text-5xl">
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
                            <span className={cn(TITLE_CLASS, HIGHLIGHT_CLASS)}>{highlight}</span>
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
