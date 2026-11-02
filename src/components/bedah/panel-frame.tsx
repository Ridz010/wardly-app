import { ShieldCheckIcon } from "lucide-react";

import { QuotaMeter } from "@/components/bedah/scan-context";

type Props = {
  title: string;
  notice: string;
  step: 1 | 2;
  children: React.ReactNode;
};

const STEPS = ["Isi", "Baca hasil"];

export function PanelFrame({ title, notice, step, children }: Props) {
  return (
    <div className="flex flex-col gap-6 rounded-3xl border border-border bg-card p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ol className="flex items-center gap-2 text-sm" aria-label="Langkah">
          {STEPS.map((label, index) => {
            const number = index + 1;
            const active = number === step;
            return (
              <li key={label} className="flex items-center gap-2">
                {index > 0 ? <span aria-hidden="true" className="h-px w-5 bg-border" /> : null}
                <span
                  aria-current={active ? "step" : undefined}
                  className={
                    active
                      ? "flex items-center gap-2 text-foreground"
                      : "flex items-center gap-2 text-muted-foreground"
                  }
                >
                  <span
                    className={
                      active
                        ? "flex size-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground"
                        : "flex size-6 items-center justify-center rounded-full bg-muted text-xs"
                    }
                  >
                    {number}
                  </span>
                  {label}
                </span>
              </li>
            );
          })}
        </ol>
        <QuotaMeter />
      </div>
      <h2 className="font-heading text-3xl font-medium tracking-tight text-balance sm:text-4xl">{title}</h2>
      <p className="flex items-start gap-3 rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
        <ShieldCheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
        <span>{notice}</span>
      </p>
      {children}
    </div>
  );
}
