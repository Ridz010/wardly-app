import Link from "next/link";
import { ArrowRightIcon, CheckIcon, ShieldAlertIcon } from "lucide-react";

import AnimatedContent from "@/components/AnimatedContent";
import BorderGlow from "@/components/BorderGlow";
import { ScrollIntoView } from "@/components/bedah/scroll-into-view";
import { LEVEL_META, RiskBadge } from "@/components/shared/risk-badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "cn";
import type { AnalysisResult } from "@/lib/services/analyze";

const BAR_TONE = {
  rendah: "[&_[data-slot=progress-indicator]]:bg-primary",
  waspada: "[&_[data-slot=progress-indicator]]:bg-amber-500",
  tinggi: "[&_[data-slot=progress-indicator]]:bg-destructive",
} as const;

const GLOW = {
  rendah: { color: "175 60 42", colors: ["#2fb6c9", "#78dcb8", "#5df2e7"] },
  waspada: { color: "38 92 50", colors: ["#f59e0b", "#fbbf24", "#f97316"] },
  tinggi: { color: "0 72 52", colors: ["#ef4444", "#f97316", "#dc2626"] },
} as const;

export function AnalysisReport({ result }: { result: AnalysisResult }) {
  const reasons = result.reasons.slice(0, 6);

  return (
    <AnimatedContent distance={32} duration={0.7} blur={6}>
      <ScrollIntoView />
      <BorderGlow
        backgroundColor="#ffffff"
        glowColor={GLOW[result.level].color}
        colors={[...GLOW[result.level].colors]}
        borderRadius={28}
        glowRadius={32}
        animated
      >
        <div className="flex flex-col gap-6 p-6 sm:p-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <RiskBadge level={result.level} />
              <span className="text-sm tabular-nums text-muted-foreground">
                Skor {result.score}/100
              </span>
            </div>
            <Progress
              value={result.score}
              aria-label={LEVEL_META[result.level].label}
              className={cn("gap-0", BAR_TONE[result.level])}
            />
            <p className="font-heading text-xl font-light leading-snug tracking-tight text-balance sm:text-2xl">
              {result.summary}
            </p>
          </div>

          {reasons.length ? (
            <section className="flex flex-col gap-3">
              <h2 className="flex items-center gap-2 text-sm font-normal text-foreground">
                <ShieldAlertIcon className="size-4 text-primary" />
                Tanda yang terlihat
              </h2>
              <ul className="flex flex-col gap-2">
                {reasons.map((reason) => (
                  <li key={reason} className="rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">
                    {reason}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="flex flex-col gap-3">
            <h2 className="flex items-center gap-2 text-sm font-normal text-foreground">
              <CheckIcon className="size-4 text-primary" />
              Langkah aman berikutnya
            </h2>
            <ol className="flex flex-col gap-2 text-sm text-muted-foreground">
              {result.nextSteps.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-xs text-muted-foreground">
            <span>
              {result.ai ? "Dianalisis dengan aturan dan AI." : "Dianalisis dengan aturan Ward-Ly."}
              {result.redacted.length ? ` Disamarkan: ${result.redacted.join(", ")}.` : ""}
              {result.saved ? " Tersimpan di riwayat." : ""}
              {result.quota ? ` Sisa jatah hari ini: ${result.quota.remaining} dari ${result.quota.limit}.` : ""}
            </span>
            <Link
              href="/lindungi"
              className="group inline-flex items-center gap-1.5 text-sm text-foreground"
            >
              <span className="underline underline-offset-4">Panduan perlindungan</span>
              <ArrowRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </BorderGlow>
    </AnimatedContent>
  );
}
