import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";

import BorderGlow from "@/components/BorderGlow";
import { Badge } from "@/components/ui/badge";
import { cn } from "cn";

type Props = {
    href: string;
    title: string;
    description?: string | null;
    badges?: string[];
    meta?: string;
    className?: string;
};

const GLOW = ["#2fb6c9", "#158ab0", "#5df2e7"];

export function ContentCard({ href, title, description, badges, meta, className }: Props) {
    return (
        <BorderGlow
            backgroundColor="#ffffff"
            glowColor="193 78 48"
            colors={GLOW}
            borderRadius={24}
            glowRadius={26}
            glowIntensity={0.9}
            className={cn("h-full", className)}
        >
            <Link
                href={href}
                className="group flex h-full flex-col justify-between gap-8 rounded-3xl p-6 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
                <div className="flex flex-col gap-3">
                    {badges?.length ? (
                        <div className="flex flex-wrap gap-1.5">
                            {badges.map((badge) => (
                                <Badge key={badge} variant="secondary" className="rounded-full font-normal capitalize">
                                    {badge}
                                </Badge>
                            ))}
                        </div>
                    ) : null}
                    <h2 className="font-heading text-xl leading-snug font-medium tracking-tight text-foreground text-balance">
                        {title}
                    </h2>
                    {description ? <p className="line-clamp-3 text-sm text-muted-foreground">{description}</p> : null}
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{meta}</span>
                    <span className="flex size-9 items-center justify-center rounded-full border border-border text-foreground transition-all duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
                        <ArrowUpRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                </div>
            </Link>
        </BorderGlow>
    );
}
