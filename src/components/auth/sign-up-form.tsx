"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signUpAction } from "@/app/(auth)/actions";
import { FormFeedback, fieldError } from "@/components/shared/form-feedback";
import { SubmitButton } from "@/components/shared/submit-button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { idle } from "@/lib/result";

const FIELDS = [
  { name: "name", label: "Nama", type: "text", autoComplete: "name", placeholder: "Nama panggilan" },
  { name: "email", label: "Email", type: "email", autoComplete: "email", placeholder: "nama@email.com" },
  { name: "password", label: "Kata sandi", type: "password", autoComplete: "new-password", hint: "Minimal 8 karakter, memuat huruf dan angka." },
  { name: "confirm", label: "Ulangi kata sandi", type: "password", autoComplete: "new-password" },
] as const;

export function SignUpForm({ next }: { next: string }) {
  const [state, action] = useActionState(signUpAction, idle);

  return (
    <form action={action} noValidate>
      <input type="hidden" name="next" value={next} />
      <FieldGroup>
        <FormFeedback state={state} />

        {FIELDS.map((item) => {
          const error = fieldError(state, item.name);
          return (
            <Field key={item.name} data-invalid={Boolean(error)}>
              <FieldLabel htmlFor={item.name}>{item.label}</FieldLabel>
              <Input
                id={item.name}
                name={item.name}
                type={item.type}
                autoComplete={item.autoComplete}
                placeholder={"placeholder" in item ? item.placeholder : undefined}
                aria-invalid={Boolean(error)}
                required
              />
              {error ? (
                <FieldError>{error}</FieldError>
              ) : "hint" in item ? (
                <FieldDescription>{item.hint}</FieldDescription>
              ) : null}
            </Field>
          );
        })}

        <SubmitButton size="lg" pendingLabel="Membuat akun" className="h-10 w-full">
          Daftar
        </SubmitButton>

        <p className="text-center text-sm text-muted-foreground">
          Sudah punya akun?{" "}
          <Link href={`/sign-in?next=${encodeURIComponent(next)}`} className="text-foreground underline underline-offset-4">
            Masuk
          </Link>
        </p>
      </FieldGroup>
    </form>
  );
}
