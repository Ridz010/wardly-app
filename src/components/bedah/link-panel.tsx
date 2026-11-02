"use client";

import { useActionState, useState } from "react";
import { LinkIcon } from "lucide-react";

import { analyzeLinkAction } from "@/app/(site)/bedah/actions";
import { AnalysisReport } from "@/components/bedah/analysis-report";
import { ExampleChips } from "@/components/bedah/example-chips";
import { PanelFrame } from "@/components/bedah/panel-frame";
import { PendingNote } from "@/components/bedah/pending-note";
import { ScanGate, useScan, useSyncQuota } from "@/components/bedah/scan-context";
import { FormFeedback, fieldError } from "@/components/shared/form-feedback";
import { SubmitButton } from "@/components/shared/submit-button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { idle } from "@/lib/result";

const EXAMPLES = [
  { label: "Login bank palsu", value: "https://bca-klaim-hadiah.xyz/login" },
  { label: "Tautan pendek", value: "https://bit.ly/paket-anda-tertahan" },
  { label: "Info pajak", value: "http://info-pajak-djp.top/cek-tagihan" },
];

export function LinkPanel() {
  const { locked } = useScan();
  const [state, action] = useActionState(analyzeLinkAction, idle);
  const [url, setUrl] = useState("");
  const error = fieldError(state, "url");
  const done = state.status === "success" && state.data;
  useSyncQuota(state);

  return (
    <div className="flex flex-col gap-6">
      <PanelFrame
        title="Tempel tautan sebelum kamu klik"
        notice="Kami tidak membuka tautannya. Yang diperiksa hanya bentuk domain dan pola alamatnya, jadi aman."
        step={done ? 2 : 1}
      >
        {!locked ? (
          <form action={action} noValidate className="flex flex-col gap-4">
            <ExampleChips examples={EXAMPLES} onPick={setUrl} />
            <Field data-invalid={Boolean(error)}>
              <FieldLabel htmlFor="url" className="sr-only">Tautan</FieldLabel>
              <div className="relative">
                <LinkIcon className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="url"
                  name="url"
                  inputMode="url"
                  autoComplete="off"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://contoh-tautan.com/..."
                  aria-invalid={Boolean(error)}
                  className="h-12 rounded-2xl pl-11"
                  required
                />
              </div>
              {error ? <FieldError>{error}</FieldError> : <FieldDescription>Boleh tanpa https://, kami lengkapi sendiri.</FieldDescription>}
            </Field>
            <div className="flex flex-wrap items-center gap-4">
              <SubmitButton size="lg" pendingLabel="Memeriksa" className="h-11 px-6" disabled={!url.trim()}>Periksa tautan</SubmitButton>
              <PendingNote label="Memeriksa pola domain" />
            </div>
            {state.status === "error" && !error ? <FormFeedback state={state} /> : null}
          </form>
        ) : (
          <ScanGate what="memeriksa tautan" />
        )}
      </PanelFrame>
      {state.status === "success" && state.data ? <AnalysisReport result={state.data} /> : null}
    </div>
  );
}
