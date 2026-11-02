"use client";

import { useActionState, useRef, useState } from "react";
import { ImageUpIcon, XIcon } from "lucide-react";

import { analyzeImageAction } from "@/app/(site)/bedah/actions";
import { AnalysisReport } from "@/components/bedah/analysis-report";
import { PanelFrame } from "@/components/bedah/panel-frame";
import { PendingNote } from "@/components/bedah/pending-note";
import { ScanGate, useScan, useSyncQuota } from "@/components/bedah/scan-context";
import { FormFeedback, fieldError } from "@/components/shared/form-feedback";
import { SubmitButton } from "@/components/shared/submit-button";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { idle } from "@/lib/result";
import { cn } from "cn";

export function ImagePanel() {
  const { locked } = useScan();
  const [state, action] = useActionState(analyzeImageAction, idle);
  const [name, setName] = useState<string | null>(null);
  const [over, setOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const error = fieldError(state, "image");
  const done = state.status === "success" && state.data;
  useSyncQuota(state);

  const choose = (files: FileList | null) => setName(files?.[0]?.name ?? null);

  return (
    <div className="flex flex-col gap-6">
      <PanelFrame
        title="Unggah tangkapan layar chat"
        notice="Teks dibaca dari gambar oleh AI, lalu disamarkan sebelum dianalisis. Tutup nama dan nomor yang tidak perlu sebelum mengunggah."
        step={done ? 2 : 1}
      >
        {!locked ? (
        <form action={action} noValidate className="flex flex-col gap-4">
          <Field data-invalid={Boolean(error)}>
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setOver(true);
              }}
              onDragLeave={() => setOver(false)}
              onDrop={(event) => {
                event.preventDefault();
                setOver(false);
                if (input.current && event.dataTransfer.files.length) {
                  input.current.files = event.dataTransfer.files;
                  choose(event.dataTransfer.files);
                }
              }}
              className={cn(
                "flex min-h-44 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border px-6 py-8 text-center transition-colors duration-300",
                over && "border-primary bg-primary/5",
              )}
            >
              <span className="flex size-11 items-center justify-center rounded-full bg-muted text-primary">
                <ImageUpIcon className="size-5" />
              </span>
              {name ? (
                <p className="flex items-center gap-2 text-sm">
                  {name}
                  <button
                    type="button"
                    aria-label="Hapus pilihan"
                    onClick={() => {
                      if (input.current) input.current.value = "";
                      setName(null);
                    }}
                    className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <XIcon className="size-3.5" />
                  </button>
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">Seret gambar ke sini, atau pilih dari perangkat. PNG, JPG, WebP — maks. 4 MB.</p>
              )}
              <input
                ref={input}
                id="image"
                name="image"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(event) => choose(event.target.files)}
              />
              <Button type="button" variant="outline" className="rounded-full font-light" onClick={() => input.current?.click()}>
                Pilih gambar
              </Button>
            </div>
            {error ? <FieldError>{error}</FieldError> : null}
          </Field>
          <div className="flex flex-wrap items-center gap-4">
            <SubmitButton size="lg" pendingLabel="Membaca gambar" className="h-11 px-6">Baca &amp; periksa</SubmitButton>
            <PendingNote label="Membaca teks dari gambar" />
          </div>
          {state.status === "error" && !error ? <FormFeedback state={state} /> : null}
        </form>
        ) : (
          <ScanGate what="memeriksa screenshot" />
        )}
      </PanelFrame>
      {state.status === "success" && state.data ? (
        <>
          {state.data.extracted ? (
            <div className="rounded-2xl border border-border p-5 text-sm">
              <p className="mb-2 text-sm text-foreground">Teks yang terbaca</p>
              <p className="whitespace-pre-line text-muted-foreground">{state.data.extracted}</p>
            </div>
          ) : null}
          <AnalysisReport result={state.data} />
        </>
      ) : null}
    </div>
  );
}
