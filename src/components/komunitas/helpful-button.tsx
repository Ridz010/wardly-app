"use client";

import { HeartHandshakeIcon } from "lucide-react";

import ClickSpark from "@/components/ClickSpark";
import { Button } from "@/components/ui/button";
import { cn } from "cn";

type Props = { on: boolean; count: number; onToggle: () => void; className?: string };

export function HelpfulButton({ on, count, onToggle, className }: Props) {
    return (
        <ClickSpark
            sparkColor={["#158ab0", "#5df2e7", "#78dcb8"]}
            sparkCount={9}
            sparkRadius={26}
            sparkSize={9}
            shape="streak"
            disabled={on}
            style={{ width: "auto", height: "auto" }}
        >
            <Button
                type="button"
                variant={on ? "secondary" : "outline"}
                size="sm"
                aria-pressed={on}
                onClick={onToggle}
                className={cn("h-8 gap-1.5 rounded-full px-3 font-normal", on && "border-transparent text-primary", className)}
            >
                <HeartHandshakeIcon className={cn(on && "fill-primary/20")} />
                Membantu
                <span className="tabular-nums text-muted-foreground">{count}</span>
            </Button>
        </ClickSpark>
    );
}
