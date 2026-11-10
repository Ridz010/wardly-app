"use client";

import { useActionState, useState } from "react";
import { ShieldCheckIcon } from "lucide-react";

import { analyzeAction } from "@/app/(site)/bedah/actions";
import ShinyText from "@/components/ShinyText";
import { AnalysisReport } from "@/components/bedah/analysis-report";
import { FormFeedback, fieldError } from "@/components/shared/form-feedback";
import { SubmitButton } from "@/components/shared/submit-button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { idle } from "@/lib/result";
import { useFormStatus } from "react-dom";

const LIMIT = 4000;

function PendingNote() {
  const { pending } = useFormStatus();
  if (!pending) return null;
  return (
    <p className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
      <Spinner className="text-primary" />
      <ShinyText text="Membedah pesan, mohon tunggu" speed={2.4} />
    </p>
  );
}

export function AnalyzeForm({ signedIn }: { signedIn: boolean }) {
  const [state, action] = useActionState(analyzeAction, idle);
  const [length, setLength] = useState(0);
  const textError = fieldError(state, "text");

  return (
    <div className="flex flex-col gap-8">
      <form action={action} noValidate className="flex flex-col gap-4">
        <Field data-invalid={Boolean(textError)}>
          <FieldLabel htmlFor="text">Pesan yang mencurigakan</FieldLabel>
          <Textarea
            id="text"
            name="text"
            rows={8}
            maxLength={LIMIT}
            onChange={(event) => setLength(event.target.value.length)}
            placeholder="Tempel isi pesan, tautan, atau chat di sini…"
            aria-invalid={Boolean(textError)}
            className="min-h-48 resize-y rounded-xl font-light"
            required
          />
          {textError ? (
            <FieldError>{textError}</FieldError>
          ) : (
            <FieldDescription className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5">
                <ShieldCheckIcon className="size-3.5 text-primary" />
                Nomor, email, dan rekening disamarkan dulu, lalu teks dikirim ke layanan AI pihak ketiga (OpenRouter) untuk analisis tambahan.
              </span>
              <span className="tabular-nums">{length}/{LIMIT}</span>
            </FieldDescription>
          )}
        </Field>

        <div className="flex flex-wrap items-center gap-4">
          <SubmitButton size="lg" pendingLabel="Memeriksa" className="h-11 px-6">
            Periksa pesan
          </SubmitButton>
          <PendingNote />
        </div>

        {state.status === "error" && !textError ? <FormFeedback state={state} /> : null}
        {!signedIn ? (
          <p className="text-sm text-muted-foreground">
            Masuk untuk menyimpan riwayat pemeriksaan di dashboard kamu.
          </p>
        ) : null}
      </form>

      {state.status === "success" && state.data ? (
        <AnalysisReport result={state.data} />
      ) : null}
    </div>
  );
}
