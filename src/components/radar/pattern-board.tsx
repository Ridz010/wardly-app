"use client";

import AnimatedContent from "@/components/AnimatedContent";
import CountUp from "@/components/CountUp";
import SpotlightCard from "@/components/SpotlightCard";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";

export type RadarEntry = {
  slug: string;
  name: string;
  description: string | null;
  total: number;
  patterns: { label: string; explanation: string }[];
};

export function PatternBoard({ entries }: { entries: RadarEntry[] }) {
  const max = Math.max(1, ...entries.map((entry) => entry.total));

  return (
    <AnimatedContent
      distance={28}
      duration={0.6}
      stagger={0.08}
      threshold={0.05}
      className="grid gap-4 md:grid-cols-2 [&>*]:min-w-0"
    >
      {entries.map((entry, index) => (
        <SpotlightCard key={entry.slug} className="rounded-3xl border border-border bg-card p-6">
          <div className="flex flex-col gap-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 flex-col gap-1.5">
                <span className="text-sm text-primary">#{index + 1}</span>
                <h2 className="font-heading text-xl font-light leading-snug tracking-tight">{entry.name}</h2>
              </div>
              <div className="flex shrink-0 flex-col items-end">
                <span className="font-heading text-3xl font-light tabular-nums">
                  <CountUp to={entry.total} />
                </span>
                <span className="text-xs text-muted-foreground">pemeriksaan / 30 hari</span>
              </div>
            </div>
            {entry.description ? <p className="text-sm text-muted-foreground">{entry.description}</p> : null}
            <Progress value={(entry.total / max) * 100} aria-label={`Frekuensi ${entry.name}`} className="gap-0" />
            {entry.patterns.length ? (
              <Accordion>
                <AccordionItem value="tanda">
                  <AccordionTrigger className="font-light">Tanda khas ({entry.patterns.length})</AccordionTrigger>
                  <AccordionContent>
                    <ul className="flex flex-col gap-3">
                      {entry.patterns.slice(0, 6).map((pattern) => (
                        <li key={pattern.label} className="flex flex-col">
                          <span className="text-sm font-normal text-foreground">{pattern.label}</span>
                          <span className="text-xs text-muted-foreground">{pattern.explanation}</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ) : null}
          </div>
        </SpotlightCard>
      ))}
    </AnimatedContent>
  );
}
