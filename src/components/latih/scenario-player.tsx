"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion, useAnimationControls } from "motion/react";
import {
  AwardIcon,
  CircleCheckIcon,
  FlameIcon,
  HeartIcon,
  RotateCcwIcon,
  SparklesIcon,
  StarIcon,
  TriangleAlertIcon,
  ZapIcon,
} from "lucide-react";
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
import { Confetti } from "@/components/latih/confetti";
import { Button, buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import type { ScenarioDetail, ScenarioStep } from "@/lib/data/content";
import { levelInfo, MAX_HEARTS, starsFor } from "@/lib/gamification";
import { cn } from "cn";

type Item =
  | { kind: "in"; step: ScenarioStep }
  | { kind: "out"; label: string }
  | { kind: "dity"; outcome: ChoiceOutcome };

type Answer = { choiceId: string; outcome: ChoiceOutcome };

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

function Hearts({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-1" aria-label={`${value} dari ${MAX_HEARTS} nyawa tersisa`}>
      {Array.from({ length: MAX_HEARTS }, (_, index) => {
        const alive = index < value;
        return (
          <motion.span
            key={index}
            animate={alive ? { scale: 1, opacity: 1 } : { scale: [1.4, 0.8, 1], opacity: 0.35 }}
            transition={{ duration: 0.45 }}
          >
            <HeartIcon className={cn("size-5", alive ? "fill-rose-500 text-rose-500" : "text-muted-foreground")} />
          </motion.span>
        );
      })}
    </span>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-end gap-2" aria-label={`${value} dari 3 bintang`}>
      {[0, 1, 2].map((index) => {
        const lit = index < value;
        return (
          <motion.span
            key={index}
            initial={{ scale: 0, rotate: -40, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ delay: 0.3 + index * 0.22, type: "spring", stiffness: 260, damping: 14 }}
            className={index === 1 ? "-translate-y-3" : undefined}
          >
            <StarIcon
              className={cn(
                index === 1 ? "size-14" : "size-11",
                lit ? "fill-amber-400 text-amber-400 drop-shadow-[0_4px_10px_rgba(251,191,36,0.45)]" : "fill-muted text-border",
              )}
            />
          </motion.span>
        );
      })}
    </div>
  );
}

export function ScenarioPlayer(props: Props) {
  const [run, setRun] = useState(0);
  return <Game key={run} {...props} onRetry={() => setRun((value) => value + 1)} />;
}

function Game({ scenario, signedIn, onRetry }: Props & { onRetry: () => void }) {
  const [stepId, setStepId] = useState<string | null>(scenario.steps[0]?.id ?? null);
  const [thread, setThread] = useState<Item[]>([]);
  const [outcome, setOutcome] = useState<ChoiceOutcome | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [pop, setPop] = useState<{ id: number; text: string; good: boolean } | null>(null);
  const [finish, setFinish] = useState<FinishOutcome | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();
  const bottom = useRef<HTMLDivElement>(null);
  const frame = useAnimationControls();

  const step = scenario.steps.find((item) => item.id === stepId) ?? null;
  const shown = thread.some((item) => item.kind === "in" && item.step.id === stepId);
  const typing = Boolean(step) && !shown;
  const score = answers.reduce((sum, item) => sum + item.outcome.scoreDelta, 0);
  const gameOver = hearts <= 0;

  useEffect(() => {
    if (!step) return;
    const timer = setTimeout(() => {
      setThread((list) =>
        list.some((item) => item.kind === "in" && item.step.id === step.id)
          ? list
          : [...list, { kind: "in", step }],
      );
    }, TYPING_MS);
    return () => clearTimeout(timer);
  }, [step]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [thread, typing, outcome]);

  useEffect(() => {
    if (!pop) return;
    const timer = setTimeout(() => setPop(null), 1100);
    return () => clearTimeout(timer);
  }, [pop]);

  const header = [...thread].reverse().find((item) => item.kind === "in");
  const sender = header?.kind === "in" ? header.step.sender_name : scenario.steps[0]?.sender_name ?? null;
  const channel = header?.kind === "in" ? header.step.channel : scenario.steps[0]?.channel ?? null;

  const complete = (list: Answer[]) => {
    startTransition(async () => {
      const result = await finishScenarioAction(
        scenario.id,
        list.map((item) => item.choiceId),
      );
      if (result.status === "success" && result.data) setFinish(result.data);
      if (result.status === "error") toast.error(result.message);
      setDone(true);
    });
  };

  const choose = (choiceId: string, label: string) => {
    if (outcome || pending) return;
    setThread((list) => [...list, { kind: "out", label }]);

    startTransition(async () => {
      const result = await revealChoiceAction(choiceId);
      if (result.status === "success" && result.data) {
        const data = result.data;
        const nextCombo = data.isSafe ? combo + 1 : 0;
        setOutcome(data);
        setAnswers((list) => [...list, { choiceId, outcome: data }]);
        setThread((list) => [...list, { kind: "dity", outcome: data }]);
        setCombo(nextCombo);
        setBestCombo((value) => Math.max(value, nextCombo));
        setPop({
          id: Date.now(),
          text: data.isSafe ? `+${data.scoreDelta}${nextCombo >= 2 ? ` · Combo x${nextCombo}` : ""}` : "-1 nyawa",
          good: data.isSafe,
        });
        if (!data.isSafe) {
          setHearts((value) => value - 1);
          frame.start({ x: [0, -10, 10, -6, 6, 0], transition: { duration: 0.45 } });
        }
      } else {
        setThread((list) => list.slice(0, -1));
        toast.error(result.status === "error" ? result.message : "Pilihan belum bisa diproses.");
      }
    });
  };

  const next = () => {
    if (!outcome || !step) return;
    if (gameOver) {
      complete(answers);
      return;
    }
    const index = scenario.steps.findIndex((item) => item.id === step.id);
    const upcoming = outcome.nextStepId ?? scenario.steps[index + 1]?.id ?? null;

    if (upcoming) {
      setOutcome(null);
      setStepId(upcoming);
      return;
    }
    complete(answers);
  };

  if (done) {
    const safe = answers.filter((item) => item.outcome.isSafe).length;
    const stars = gameOver
      ? 0
      : finish?.score != null && finish.maxScore
        ? starsFor(finish.score, finish.maxScore)
        : starsFor(safe, scenario.steps.length);
    const level = finish?.xpTotal != null ? levelInfo(finish.xpTotal) : null;
    const headline = gameOver
      ? "Kesempatan habis"
      : stars === 3
        ? "Sempurna! Naluri tajam."
        : stars === 2
          ? "Bagus, hampir sempurna"
          : "Latihan selesai";

    return (
      <div className="relative">
        {stars >= 2 ? <Confetti /> : null}
        <AnimatedContent distance={28} duration={0.7}>
          <div className="flex flex-col items-center gap-6 overflow-hidden rounded-[2rem] border border-border bg-card p-8 text-center shadow-sm">
            <Image src="/mascot/dity-small.webp" alt="" width={96} height={96} unoptimized className="size-24 object-contain" />
            {gameOver ? (
              <span className="flex size-14 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
                <HeartIcon className="size-7" />
              </span>
            ) : (
              <Stars value={stars} />
            )}
            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-3xl font-light tracking-tight">{headline}</h2>
              <p className="text-muted-foreground">
                {gameOver
                  ? "Tiga respons berisiko membuat penipu menang kali ini. Coba lagi, kamu pasti bisa."
                  : `${safe} dari ${answers.length} responsmu aman.`}
              </p>
            </div>

            {finish?.leveledUp && level ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1, type: "spring" }}
                className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground"
              >
                <SparklesIcon className="size-4" />
                Naik ke Level {level.level} · {level.title}
              </motion.div>
            ) : null}

            <dl className="grid w-full max-w-md grid-cols-3 gap-3">
              <div className="rounded-2xl bg-muted p-4">
                <dt className="text-xs text-muted-foreground">Skor</dt>
                <dd className="font-heading text-3xl font-light tabular-nums">
                  <CountUp to={Math.max(0, finish?.score ?? score)} />
                </dd>
              </div>
              <div className="rounded-2xl bg-muted p-4">
                <dt className="text-xs text-muted-foreground">Combo terbaik</dt>
                <dd className="font-heading text-3xl font-light tabular-nums">x{bestCombo}</dd>
              </div>
              <div className="rounded-2xl bg-primary/10 p-4">
                <dt className="text-xs text-muted-foreground">XP didapat</dt>
                <dd className="font-heading text-3xl font-light tabular-nums text-primary">
                  {finish?.xpEarned != null ? <>+<CountUp to={finish.xpEarned} /></> : "—"}
                </dd>
              </div>
            </dl>

            {level ? (
              <div className="flex w-full max-w-md flex-col gap-2 text-left">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Level {level.level} · {level.title}
                  </span>
                  <span className="tabular-nums">
                    {level.current}/{level.needed} XP
                  </span>
                </div>
                <Progress value={level.progress} aria-label="Progres level" className="[&_[data-slot=progress-track]]:h-2" />
                {finish?.streak ? (
                  <span className="flex items-center gap-1.5 text-xs text-amber-600">
                    <FlameIcon className="size-3.5" />
                    Streak {finish.streak} hari
                  </span>
                ) : null}
              </div>
            ) : null}

            {finish?.saved && finish.xpEarned === 0 && !gameOver ? (
              <p className="max-w-sm text-xs text-muted-foreground">
                XP skenario ini sudah kamu dapat sebelumnya. Raih skor lebih tinggi untuk menambah sisanya.
              </p>
            ) : null}

            {finish?.newBadges.length ? (
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs text-muted-foreground">Lencana baru</span>
                <div className="flex flex-wrap justify-center gap-2">
                  {finish.newBadges.map((badge, index) => (
                    <motion.span
                      key={badge.code}
                      initial={{ y: 12, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 1.2 + index * 0.15 }}
                      className="flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm text-amber-800"
                    >
                      <AwardIcon className="size-4" />
                      {badge.name}
                    </motion.span>
                  ))}
                </div>
              </div>
            ) : null}

            {!signedIn ? (
              <p className="text-sm text-muted-foreground">Masuk agar XP, level, dan lencana tersimpan.</p>
            ) : null}

            <div className="flex flex-wrap justify-center gap-2">
              <Button onClick={onRetry} variant="outline" size="lg" className="h-10 gap-2 rounded-full px-5 font-normal">
                <RotateCcwIcon className="size-4" />
                Coba lagi
              </Button>
              <Link href="/latih" className={cn(buttonVariants({ size: "lg" }), "h-10 rounded-full px-5 font-normal")}>
                Skenario lain
              </Link>
              {!signedIn ? (
                <Link
                  href={`/sign-in?next=/latih/${scenario.slug}`}
                  className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-10 rounded-full px-5 font-normal")}
                >
                  Masuk
                </Link>
              ) : null}
            </div>
          </div>
        </AnimatedContent>
      </div>
    );
  }

  const progress = Math.round((answers.length / Math.max(1, scenario.steps.length)) * 100);
  const canAnswer = Boolean(step) && shown && !outcome;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-3">
      <div className="relative flex items-center justify-between rounded-full border border-border bg-card px-4 py-2 shadow-sm">
        <Hearts value={hearts} />
        <span className="flex items-center gap-3 text-sm tabular-nums">
          <AnimatePresence>
            {combo >= 2 ? (
              <motion.span
                key={combo}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.4, opacity: 0 }}
                className="flex items-center gap-1 rounded-full bg-amber-400/20 px-2 py-0.5 text-xs text-amber-700"
              >
                <FlameIcon className="size-3.5" />x{combo}
              </motion.span>
            ) : null}
          </AnimatePresence>
          <span className="flex items-center gap-1 text-primary">
            <ZapIcon className="size-4" />
            {Math.max(0, score)}
          </span>
        </span>
        <AnimatePresence>
          {pop ? (
            <motion.span
              key={pop.id}
              initial={{ y: 0, opacity: 0, scale: 0.8 }}
              animate={{ y: -30, opacity: 1, scale: 1 }}
              exit={{ y: -46, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className={cn(
                "pointer-events-none absolute top-0 right-4 rounded-full px-2.5 py-0.5 text-xs font-normal shadow-sm",
                pop.good ? "bg-primary text-primary-foreground" : "bg-rose-500 text-white",
              )}
            >
              {pop.text}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>

      <motion.div
        animate={frame}
        className="flex w-full flex-col overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm"
      >
        <div className="flex items-center gap-3 border-b border-border bg-muted/60 px-4 py-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 font-heading text-primary">
            {initial(sender)}
          </span>
          <div className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="truncate text-sm font-normal">{sender ?? "Pengirim tak dikenal"}</span>
            <span className="text-xs text-muted-foreground">{channel ?? "Pesan"}</span>
          </div>
          <span className="flex items-center gap-1" aria-label={`Langkah ${Math.min(answers.length + 1, scenario.steps.length)} dari ${scenario.steps.length}`}>
            {scenario.steps.map((item, index) => {
              const answer = answers[index];
              return (
                <span
                  key={item.id}
                  className={cn(
                    "size-2 rounded-full transition-colors duration-300",
                    answer ? (answer.outcome.isSafe ? "bg-primary" : "bg-rose-500") : index === answers.length ? "bg-foreground/40" : "bg-border",
                  )}
                />
              );
            })}
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
                  <Image src="/mascot/dity-small.webp" alt="" width={32} height={32} unoptimized className="size-8 shrink-0 object-contain" />
                  <div className="flex flex-col gap-1">
                    <span className={cn("flex items-center gap-1.5 font-normal", item.outcome.isSafe ? "text-primary" : "text-destructive")}>
                      {item.outcome.isSafe ? <CircleCheckIcon className="size-4" /> : <TriangleAlertIcon className="size-4" />}
                      {item.outcome.isSafe ? "Respons aman" : "Respons berisiko"}
                      <span className="text-xs text-muted-foreground tabular-nums">+{item.outcome.scoreDelta}</span>
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
              {gameOver ? "Lihat hasil" : "Lanjutkan"}
            </Button>
          ) : canAnswer && step ? (
            <>
              <span className="text-xs text-muted-foreground">Balas dengan:</span>
              <div className="flex flex-col gap-2">
                {step.choices.map((choice, index) => (
                  <motion.button
                    key={choice.id}
                    type="button"
                    disabled={pending}
                    onClick={() => choose(choice.id, choice.label)}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-start gap-3 rounded-2xl border border-border px-4 py-2.5 text-left text-sm font-light transition-colors duration-300 hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
                  >
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[0.65rem] text-muted-foreground">
                      {String.fromCharCode(65 + index)}
                    </span>
                    {choice.label}
                  </motion.button>
                ))}
              </div>
            </>
          ) : (
            <span className="py-2 text-center text-xs text-muted-foreground">Menunggu pesan…</span>
          )}
        </div>
      </motion.div>
    </div>
  );
}
