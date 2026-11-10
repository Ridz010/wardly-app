"use client";

import { useActionState } from "react";
import { RadarIcon } from "lucide-react";

import { quickCheckAction } from "@/app/(site)/radar/actions";
import AnimatedContent from "@/components/AnimatedContent";
import { PendingNote } from "@/components/bedah/pending-note";
import { QuotaMeter, ScanGate, ScanProvider, useScan, useSyncQuota } from "@/components/bedah/scan-context";
import { FormFeedback, fieldError } from "@/components/shared/form-feedback";
import { InconclusiveBadge, RiskBadge } from "@/components/shared/risk-badge";
import { SubmitButton } from "@/components/shared/submit-button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { idle } from "@/lib/result";
import type { QuotaInfo } from "@/lib/services/scan-guard";

export function QuickCheck({ signedIn, quota }: { signedIn: boolean; quota: QuotaInfo | null }) {
  return (
    <ScanProvider signedIn={signedIn} initialQuota={quota}>
      <div className="flex flex-col gap-4">
        <QuotaMeter />
        <QuickCheckBody />
      </div>
    </ScanProvider>
  );
}

function QuickCheckBody() {
  const { locked } = useScan();
  const [state, action] = useActionState(quickCheckAction, idle);
  const error = fieldError(state, "text");
  useSyncQuota(state);

  if (locked) {
    return (
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <ScanGate what="memakai cek cepat" next="/radar" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 rounded-3xl border border-border bg-card p-6 sm:p-8 lg:grid-cols-2">
      <form action={action} noValidate className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <RadarIcon className="size-5" />
          </span>
          <div>
            <h2 className="font-heading text-xl font-light tracking-tight">Cek cepat</h2>
            <p className="text-xs text-muted-foreground">Cocokkan potongan pesan dengan pola di bawah. Tanpa AI, tanpa disimpan.</p>
          </div>
        </div>
        <Field data-invalid={Boolean(error)}>
          <FieldLabel htmlFor="quick-text" className="sr-only">Potongan pesan</FieldLabel>
          <Textarea
            id="quick-text"
            name="text"
            rows={4}
            maxLength={1200}
            placeholder="Tempel satu-dua kalimat yang mencurigakan…"
            aria-invalid={Boolean(error)}
            className="rounded-2xl"
            required
          />
          {error ? <FieldError>{error}</FieldError> : null}
        </Field>
        <div className="flex flex-wrap items-center gap-4">
          <SubmitButton size="lg" pendingLabel="Memindai" className="h-10 px-5">Pindai</SubmitButton>
          <PendingNote label="Memindai pola" />
        </div>
        {state.status === "error" && !error ? <FormFeedback state={state} /> : null}
      </form>

      <div className="flex min-h-40 flex-col justify-center gap-3 rounded-2xl bg-muted p-5">
        {state.status === "success" && state.data ? (
          <AnimatedContent key={state.data.score + state.data.hits.length} distance={16} duration={0.45} trigger="mount">
            <div className="flex flex-col gap-3">
              {state.data.inconclusive ? (
                <InconclusiveBadge />
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <RiskBadge level={state.data.level} />
                  <span className="text-sm tabular-nums text-muted-foreground">Skor risiko {state.data.score}/100</span>
                </div>
              )}
              {state.data.inconclusive ? (
                <p className="text-sm text-muted-foreground">Daftar pola sedang tidak bisa dimuat, jadi hasil ini bukan berarti pesannya aman. Coba lagi beberapa saat lagi.</p>
              ) : state.data.hits.length ? (
                <ul className="flex flex-col gap-2 text-sm">
                  {state.data.hits.slice(0, 5).map((hit) => (
                    <li key={hit.code} className="flex flex-col">
                      <span className="font-normal text-foreground">{hit.label}</span>
                      <span className="text-xs text-muted-foreground">{hit.explanation}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Skor 0 berarti tidak ada pola yang cocok, bukan jaminan pesan ini aman. Untuk analisis lebih dalam, pakai halaman Bedah.</p>
              )}
            </div>
          </AnimatedContent>
        ) : (
          <p className="text-sm text-muted-foreground">Hasil pemindaian akan muncul di sini.</p>
        )}
      </div>
    </div>
  );
}
