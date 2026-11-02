"use client";

import { useActionState, useRef, useState } from "react";

import { analyzeAction } from "@/app/(site)/bedah/actions";
import { AnalysisReport } from "@/components/bedah/analysis-report";
import { ExampleChips } from "@/components/bedah/example-chips";
import { PanelFrame } from "@/components/bedah/panel-frame";
import { PendingNote } from "@/components/bedah/pending-note";
import { ScanGate, useScan, useSyncQuota } from "@/components/bedah/scan-context";
import { FormFeedback, fieldError } from "@/components/shared/form-feedback";
import { SubmitButton } from "@/components/shared/submit-button";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { idle } from "@/lib/result";

const LIMIT = 4000;

const EXAMPLES = [
  {
    label: "Hadiah undian",
    value: "SELAMAT! Nomor Anda terpilih mendapat hadiah Rp25.000.000 dari program undian. Klaim dalam 10 menit lewat tautan berikut dan transfer biaya admin Rp150.000: bit.ly/klaim-hadiah",
  },
  {
    label: "Paket tertahan",
    value: "Paket Anda tertahan di gudang karena alamat kurang lengkap. Segera lengkapi data dan bayar biaya penanganan Rp18.500 di http://cek-paket-id.top/bayar atau paket dikembalikan.",
  },
  {
    label: "Minta kode OTP",
    value: "Halo, saya dari tim keamanan bank. Akun Anda terdeteksi bermasalah. Mohon sebutkan kode OTP yang baru masuk ke HP Anda agar akun tidak diblokir.",
  },
];

export function TextPanel() {
  const { locked } = useScan();
  const [state, action] = useActionState(analyzeAction, idle);
  const [text, setText] = useState("");
  const form = useRef<HTMLFormElement>(null);
  const error = fieldError(state, "text");
  const done = state.status === "success" && state.data;
  useSyncQuota(state);

  return (
    <div className="flex flex-col gap-6">
      <PanelFrame
        title="Tempel teks yang membuatmu ragu"
        notice="Sebelum lanjut, hapus nomor telepon, rekening, alamat, atau nama lengkap. Yang terdeteksi tetap kami samarkan otomatis."
        step={done ? 2 : 1}
      >
        {!locked ? (
          <form ref={form} action={action} noValidate className="flex flex-col gap-4">
            <ExampleChips examples={EXAMPLES} onPick={setText} />
            <Field data-invalid={Boolean(error)}>
              <FieldLabel htmlFor="text" className="sr-only">Pesan yang mencurigakan</FieldLabel>
              <Textarea
                id="text"
                name="text"
                rows={7}
                maxLength={LIMIT}
                value={text}
                onChange={(event) => setText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
                    event.preventDefault();
                    form.current?.requestSubmit();
                  }
                }}
                placeholder="Tempel pesan SMS, WhatsApp, atau email di sini…"
                aria-invalid={Boolean(error)}
                className="min-h-44 resize-y rounded-2xl"
                required
              />
              {error ? (
                <FieldError>{error}</FieldError>
              ) : (
                <FieldDescription className="flex items-center justify-between gap-3">
                  <span>Tekan Ctrl + Enter untuk memeriksa.</span>
                  <span className="tabular-nums">{text.length}/{LIMIT}</span>
                </FieldDescription>
              )}
            </Field>
            <div className="flex flex-wrap items-center gap-3">
              <SubmitButton size="lg" pendingLabel="Memeriksa" className="h-11 px-6" disabled={!text.trim()}>
                Periksa pesan ini
              </SubmitButton>
              {text ? (
                <Button type="button" variant="ghost" className="h-11 rounded-full px-4 font-normal text-muted-foreground" onClick={() => setText("")}>
                  Kosongkan
                </Button>
              ) : null}
              <PendingNote label="Memeriksa pesan, mohon tunggu" />
            </div>
            {state.status === "error" && !error ? <FormFeedback state={state} /> : null}
          </form>
        ) : (
          <ScanGate what="memeriksa pesan" />
        )}
      </PanelFrame>
      {state.status === "success" && state.data ? <AnalysisReport result={state.data} /> : null}
    </div>
  );
}
