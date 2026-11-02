"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { CircleCheckIcon, TriangleAlertIcon } from "lucide-react";
import { toast } from "sonner";

import {
  finishScenarioAction,
  revealChoiceAction,
  type ChoiceOutcome,
  type FinishOutcome,
} from "@/app/(site)/latih/actions";
import AnimatedContent from "@/components/AnimatedContent";
import CountUp from "@/components/CountUp";
import ShinyText from "@/components/ShinyText";
import { Button, buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import type { ScenarioDetail, ScenarioStep } from "@/lib/data/content";
import { cn } from "cn";

type Item =
  | { kind: "in"; step: ScenarioStep }
  | { kind: "out"; label: string }
  | { kind: "dity"; outcome: ChoiceOutcome };

type Props = { scenario: ScenarioDetail; signedIn: boolean };

const TYPING_MS = 900;

const initial = (name: string | null) => (name?.trim()[0] ?? "?").toUpperCase();

function Typing() {
  return (
    <div className="flex w-fit items-center gap-1 rounded-2xl rounded-bl-md bg-muted px-4 py-3" aria-label="Sedang mengetik">
      {[0, 1, 2].map((dot) => (
        <span
          key={dot}
          className="size-1.5 animate-bounce rounded-full bg-muted-foreground/70 motion-reduce:animate-none"
          style={{ animationDelay: `${dot * 120}ms` }}
        />
      ))}
    </div>
  );
}

export function ScenarioPlayer({ scenario, signedIn }: Props) {
  const [stepId, setStepId] = useState<string | null>(scenario.steps[0]?.id ?? null);
  const [thread, setThread] = useState<Item[]>([]);
  const [typing, setTyping] = useState(false);
  const [outcome, setOutcome] = useState<ChoiceOutcome | null>(null);
  const [answers, setAnswers] = useState<{ choiceId: string; outcome: ChoiceOutcome }[]>([]);
  const [finish, setFinish] = useState<FinishOutcome | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();
  const bottom = useRef<HTMLDivElement>(null);

  const step = scenario.steps.find((item) => item.id === stepId) ?? null;
  const shown = thread.some((item) => item.kind === "in" && item.step.id === stepId);

  useEffect(() => {
    if (!step) return;
    setTyping(true);
    const timer = setTimeout(() => {
      setThread((list) =>
        list.some((item) => item.kind === "in" && item.step.id === step.id)
          ? list
          : [...list, { kind: "in", step }],
      );
      setTyping(false);
    }, TYPING_MS);
    return () => clearTimeout(timer);
  }, [step]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [thread, typing, outcome]);

  const header = [...thread].reverse().find((item) => item.kind === "in");
  const sender = header?.kind === "in" ? header.step.sender_name : scenario.steps[0]?.sender_name ?? null;
  const channel = header?.kind === "in" ? header.step.channel : scenario.steps[0]?.channel ?? null;

  const choose = (choiceId: string, label: string) => {
    if (outcome || pending) return;
    setThread((list) => [...list, { kind: "out", label }]);

    startTransition(async () => {
      const result = await revealChoiceAction(choiceId);
      if (result.status === "success" && result.data) {
        const data = result.data;
        setOutcome(data);
        setAnswers((list) => [...list, { choiceId, outcome: data }]);
        setThread((list) => [...list, { kind: "dity", outcome: data }]);
      } else {
        setThread((list) => list.slice(0, -1));
        toast.error(result.status === "error" ? result.message : "Pilihan belum bisa diproses.");
      }
    });
  };

  const next = () => {
    if (!outcome || !step) return;
    const index = scenario.steps.findIndex((item) => item.id === step.id);
    const upcoming = outcome.nextStepId ?? scenario.steps[index + 1]?.id ?? null;

    if (upcoming) {
      setOutcome(null);
      setStepId(upcoming);
      return;
    }

    startTransition(async () => {
      const result = await finishScenarioAction(
        scenario.id,
        answers.map((item) => item.choiceId),
      );
      if (result.status === "success" && result.data) setFinish(result.data);
      if (result.status === "error") toast.error(result.message);
      setDone(true);
    });
  };

  if (done) {
    const safe = answers.filter((item) => item.outcome.isSafe).length;
    const score = answers.reduce((sum, item) => sum + item.outcome.scoreDelta, 0);

    return (
      <AnimatedContent distance={28} duration={0.7}>
        <div className="flex flex-col items-center gap-6 rounded-3xl border border-border bg-card p-8 text-center">
          <Image src="/animated_maskot.gif" alt="" width={96} height={96} unoptimized className="size-24 object-contain" />
          <div className="flex flex-col gap-2">
            <h2 className="font-heading text-3xl font-light tracking-tight">Latihan selesai</h2>
            <p className="text-muted-foreground">
              {safe} dari {answers.length} responsmu aman.
            </p>
          </div>
          <dl className="grid w-full max-w-sm grid-cols-2 gap-3">
            <div className="rounded-2xl bg-muted p-4">
              <dt className="text-xs text-muted-foreground">Skor</dt>
              <dd className="font-heading text-3xl font-light tabular-nums">
                <CountUp to={Math.max(0, score)} />
              </dd>
            </div>
            <div className="rounded-2xl bg-muted p-4">
              <dt className="text-xs text-muted-foreground">XP didapat</dt>
              <dd className="font-heading text-3xl font-light tabular-nums text-primary">
                {finish?.xpEarned != null ? <CountUp to={finish.xpEarned} /> : "—"}
              </dd>
            </div>
          </dl>
          {!signedIn ? (
            <p className="text-sm text-muted-foreground">Masuk agar XP dan lencana tersimpan.</p>
          ) : null}
          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/latih" className={cn(buttonVariants({ size: "lg" }), "h-10 rounded-full px-5 font-normal")}>
              Skenario lain
            </Link>
            {!signedIn ? (
              <Link
                href="/sign-in?next=/latih"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-10 rounded-full px-5 font-normal")}
              >
                Masuk
              </Link>
            ) : null}
          </div>
        </div>
      </AnimatedContent>
    );
  }

  const progress = Math.round((answers.length / Math.max(1, scenario.steps.length)) * 100);
  const canAnswer = Boolean(step) && shown && !typing && !outcome;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm">
      <div className="flex items-center gap-3 border-b border-border bg-muted/60 px-4 py-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 font-heading text-primary">
          {initial(sender)}
        </span>
        <div className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="truncate text-sm font-normal">{sender ?? "Pengirim tak dikenal"}</span>
          <span className="text-xs text-muted-foreground">{channel ?? "Pesan"}</span>
        </div>
        <span className="text-xs tabular-nums text-muted-foreground">
          {Math.min(answers.length + 1, scenario.steps.length)}/{scenario.steps.length}
        </span>
      </div>
      <Progress value={progress} aria-label="Progres latihan" className="gap-0 [&_[data-slot=progress-track]]:h-0.5 [&_[data-slot=progress-track]]:rounded-none" />

      <div className="flex h-[26rem] flex-col gap-3 overflow-y-auto bg-background px-4 py-5" aria-live="polite">
        {thread.map((item, index) => (
          <AnimatedContent key={index} distance={14} duration={0.4} trigger="mount" className={cn("flex", item.kind === "out" && "justify-end")}>
            {item.kind === "in" ? (
              <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-muted px-4 py-2.5 text-sm leading-relaxed text-foreground">
                {item.step.narrative}
              </div>
            ) : null}
            {item.kind === "out" ? (
              <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm leading-relaxed text-primary-foreground">
                {item.label}
              </div>
            ) : null}
            {item.kind === "dity" ? (
              <div
                className={cn(
                  "flex max-w-[92%] gap-3 rounded-2xl border p-3 text-sm",
                  item.outcome.isSafe ? "border-primary/40 bg-primary/5" : "border-destructive/40 bg-destructive/5",
                )}
              >
                <Image src="/animated_maskot.gif" alt="" width={32} height={32} unoptimized className="size-8 shrink-0 object-contain" />
                <div className="flex flex-col gap-1">
                  <span className={cn("flex items-center gap-1.5 font-normal", item.outcome.isSafe ? "text-primary" : "text-destructive")}>
                    {item.outcome.isSafe ? <CircleCheckIcon className="size-4" /> : <TriangleAlertIcon className="size-4" />}
                    {item.outcome.isSafe ? "Respons aman" : "Respons berisiko"}
                  </span>
                  <span className="text-muted-foreground">{item.outcome.feedback}</span>
                </div>
              </div>
            ) : null}
          </AnimatedContent>
        ))}
        {typing ? <Typing /> : null}
        {pending && !outcome ? (
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            <Spinner className="text-primary" />
            <ShinyText text="Dity menilai pilihanmu" speed={2} />
          </span>
        ) : null}
        <div ref={bottom} />
      </div>

      <div className="flex flex-col gap-2 border-t border-border bg-card p-4">
        {outcome ? (
          <Button onClick={next} disabled={pending} className="h-10 w-full rounded-full font-normal">
            {pending ? <Spinner /> : null}
            Lanjutkan
          </Button>
        ) : canAnswer && step ? (
          <>
            <span className="text-xs text-muted-foreground">Balas dengan:</span>
            <div className="flex flex-col gap-2">
              {step.choices.map((choice) => (
                <button
                  key={choice.id}
                  type="button"
                  disabled={pending}
                  onClick={() => choose(choice.id, choice.label)}
                  className="rounded-2xl border border-border px-4 py-2.5 text-left text-sm font-light transition-colors duration-300 hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
                >
                  {choice.label}
                </button>
              ))}
            </div>
          </>
        ) : (
          <span className="py-2 text-center text-xs text-muted-foreground">Menunggu pesan…</span>
        )}
      </div>
    </div>
  );
}
