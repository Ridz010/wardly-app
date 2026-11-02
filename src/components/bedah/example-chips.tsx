"use client";

import { SparklesIcon } from "lucide-react";

export type Example = { label: string; value: string };

export function ExampleChips({ examples, onPick }: { examples: Example[]; onPick: (value: string) => void }) {
    return (
        <div className="flex flex-wrap items-center gap-2" aria-label="Contoh">
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <SparklesIcon className="size-4 text-primary" />
                Coba contoh:
            </span>
            {examples.map((example) => (
                <button
                    key={example.label}
                    type="button"
                    onClick={() => onPick(example.value)}
                    className="rounded-full border border-border bg-background px-3.5 py-1 text-sm text-muted-foreground transition-colors duration-300 hover:border-primary/50 hover:bg-primary/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                    {example.label}
                </button>
            ))}
        </div>
    );
}
