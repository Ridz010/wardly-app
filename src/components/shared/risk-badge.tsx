import { Badge } from "@/components/ui/badge";
import type { Level } from "@/lib/rules";
import { cn } from "cn";

export const LEVEL_META: Record<Level, { label: string; tone: string }> = {
    rendah: {
        label: "Risiko rendah",
        tone: "bg-primary/10 text-primary",
    },
    waspada: {
        label: "Perlu waspada",
        tone: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    },
    tinggi: {
        label: "Risiko tinggi",
        tone: "bg-destructive/10 text-destructive",
    },
};

export function InconclusiveBadge() {
    return (
        <Badge variant="secondary" className="rounded-full bg-muted font-normal text-muted-foreground">
            Belum bisa dinilai
        </Badge>
    );
}

export function RiskBadge({ level, className }: { level: Level; className?: string }) {
    const meta = LEVEL_META[level];
    return (
        <Badge variant="secondary" className={cn("rounded-full font-normal", meta.tone, className)}>
            {meta.label}
        </Badge>
    );
}
