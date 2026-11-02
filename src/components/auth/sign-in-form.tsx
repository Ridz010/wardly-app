"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signInAction } from "@/app/(auth)/actions";
import { FormFeedback, fieldError } from "@/components/shared/form-feedback";
import { SubmitButton } from "@/components/shared/submit-button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { idle } from "@/lib/result";

export function SignInForm({ next }: { next: string }) {
  const [state, action] = useActionState(signInAction, idle);
  const emailError = fieldError(state, "email");
  const passwordError = fieldError(state, "password");

  return (
    <form action={action} noValidate>
      <input type="hidden" name="next" value={next} />
      <FieldGroup>
        <FormFeedback state={state} />

        <Field data-invalid={Boolean(emailError)}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="nama@email.com"
            autoComplete="email"
            aria-invalid={Boolean(emailError)}
            required
          />
          {emailError ? <FieldError>{emailError}</FieldError> : null}
        </Field>

        <Field data-invalid={Boolean(passwordError)}>
          <FieldLabel htmlFor="password">Kata sandi</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(passwordError)}
            required
          />
          {passwordError ? <FieldError>{passwordError}</FieldError> : null}
        </Field>

        <SubmitButton size="lg" pendingLabel="Memeriksa" className="h-10 w-full">
          Masuk
        </SubmitButton>

        <p className="text-center text-sm text-muted-foreground">
          Belum punya akun?{" "}
          <Link href={`/sign-up?next=${encodeURIComponent(next)}`} className="text-foreground underline underline-offset-4">
            Daftar
          </Link>
        </p>
      </FieldGroup>
    </form>
  );
}
