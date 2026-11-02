"use client";

import { useActionState, useEffect, useTransition } from "react";
import { toast } from "sonner";

import { clearHistoryAction, updateSettingsAction } from "@/app/dashboard/actions";
import { FormFeedback, fieldError } from "@/components/shared/form-feedback";
import { SubmitButton } from "@/components/shared/submit-button";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { idle } from "@/lib/result";

type Props = { displayName: string; saveHistory: boolean; email: string | null };

export function SettingsForm({ displayName, saveHistory, email }: Props) {
  const [state, action] = useActionState(updateSettingsAction, idle);
  const [clearing, startClearing] = useTransition();
  const nameError = fieldError(state, "display_name");

  useEffect(() => {
    if (state.status === "success" && state.message) toast.success(state.message);
  }, [state]);

  return (
    <div className="flex max-w-xl flex-col gap-10">
      <form action={action} noValidate>
        <FieldGroup>
          {state.status === "error" ? <FormFeedback state={state} /> : null}

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" value={email ?? ""} disabled readOnly />
          </Field>

          <Field data-invalid={Boolean(nameError)}>
            <FieldLabel htmlFor="display_name">Nama tampilan</FieldLabel>
            <Input id="display_name" name="display_name" defaultValue={displayName} maxLength={60} aria-invalid={Boolean(nameError)} required />
            {nameError ? <FieldError>{nameError}</FieldError> : null}
          </Field>

          <Field orientation="horizontal" className="items-start justify-between gap-6">
            <div className="flex flex-col gap-1">
              <FieldLabel htmlFor="save_history">Simpan riwayat pemeriksaan</FieldLabel>
              <FieldDescription>Hanya cuplikan yang sudah disamarkan. Bisa dimatikan kapan saja.</FieldDescription>
            </div>
            <Switch id="save_history" name="save_history" defaultChecked={saveHistory} />
          </Field>

          <SubmitButton pendingLabel="Menyimpan" size="lg" className="h-10 w-fit px-5">
            Simpan perubahan
          </SubmitButton>
        </FieldGroup>
      </form>

      <div className="flex flex-col gap-3 border-t border-border pt-6">
        <h2 className="font-normal">Hapus riwayat</h2>
        <p className="text-sm text-muted-foreground">Menghapus seluruh riwayat pemeriksaan milikmu secara permanen.</p>
        <Button
          type="button"
          variant="destructive"
          disabled={clearing}
          className="h-10 w-fit rounded-full px-5 font-normal"
          onClick={() =>
            startClearing(async () => {
              const result = await clearHistoryAction();
              if (result.status === "error") toast.error(result.message);
              else toast.success(result.message ?? "Riwayat dihapus.");
            })
          }
        >
          {clearing ? <Spinner /> : null}
          Hapus semua riwayat
        </Button>
      </div>
    </div>
  );
}
