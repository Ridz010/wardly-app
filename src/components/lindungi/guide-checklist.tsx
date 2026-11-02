"use client";

import Link from "next/link";
import { useOptimistic, useTransition } from "react";
import { ExternalLinkIcon } from "lucide-react";
import { toast } from "sonner";

import { toggleStepAction } from "@/app/(site)/lindungi/actions";
import AnimatedContent from "@/components/AnimatedContent";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import type { GuideStep } from "@/lib/data/content";
import { cn } from "cn";

type Props = {
  steps: GuideStep[];
  initialDone: string[];
  slug: string;
  signedIn: boolean;
};

export function GuideChecklist({ steps, initialDone, slug, signedIn }: Props) {
  const [done, setDone] = useOptimistic(
    new Set(initialDone),
    (current, change: { id: string; value: boolean }) => {
      const next = new Set(current);
      if (change.value) next.add(change.id);
      else next.delete(change.id);
      return next;
    },
  );
  const [, startTransition] = useTransition();

  const toggle = (id: string, value: boolean) => {
    if (!signedIn) {
      toast.info("Masuk untuk menyimpan progres checklist.", {
        action: { label: "Masuk", onClick: () => (window.location.href = `/sign-in?next=/lindungi/${slug}`) },
      });
      return;
    }
    startTransition(async () => {
      setDone({ id, value });
      const result = await toggleStepAction(id, value);
      if (result.status === "error") toast.error(result.message);
    });
  };

  const percent = steps.length ? Math.round((done.size / steps.length) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Progress value={percent} aria-label="Progres checklist" className="flex-1 gap-0" />
        <span className="text-xs tabular-nums text-muted-foreground">{done.size}/{steps.length}</span>
      </div>

      <AnimatedContent distance={20} duration={0.5} stagger={0.07} className="flex flex-col gap-3">
        {steps.map((step) => {
          const checked = done.has(step.id);
          return (
            <div
              key={step.id}
              className={cn(
                "flex gap-4 rounded-2xl border border-border bg-card p-5 transition-colors duration-300 hover:border-primary/40",
                checked && "bg-muted/60",
              )}
            >
              <Checkbox
                aria-label={step.title}
                checked={checked}
                onCheckedChange={(value) => toggle(step.id, Boolean(value))}
                className="mt-1"
              />
              <div className="flex min-w-0 flex-col gap-1.5">
                <span className={cn("font-normal text-foreground", checked && "text-muted-foreground line-through")}>
                  {step.title}
                </span>
                <span className="text-sm text-muted-foreground">{step.detail}</span>
                {step.link_url && /^https?:\/\//.test(step.link_url) ? (
                  <Link
                    href={step.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(event) => event.stopPropagation()}
                    className="mt-1 inline-flex w-fit items-center gap-1.5 text-sm text-primary underline-offset-4 hover:underline"
                  >
                    {step.link_label ?? "Buka tautan"}
                    <ExternalLinkIcon className="size-3.5" />
                  </Link>
                ) : null}
              </div>
            </div>
          );
        })}
      </AnimatedContent>
    </div>
  );
}
