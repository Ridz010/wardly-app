"use client";

import { useActionState } from "react";

import { MarkdownEditor } from "@/components/editor/markdown-editor";
import { createPostAction } from "@/app/(site)/komunitas/actions";
import { FormFeedback, fieldError } from "@/components/shared/form-feedback";
import { FormSelect, type SelectOption } from "@/components/shared/form-select";
import { SubmitButton } from "@/components/shared/submit-button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { idle } from "@/lib/result";

const KINDS: SelectOption[] = [
  { value: "peringatan", label: "Peringatan" },
  { value: "pengalaman", label: "Pengalaman" },
  { value: "tips", label: "Tips" },
];

export function PostForm({ categories }: { categories: SelectOption[] }) {
  const [state, action] = useActionState(createPostAction, idle);
  const title = fieldError(state, "title");
  const body = fieldError(state, "body");
  const kind = fieldError(state, "kind");

  return (
    <form action={action} noValidate>
      <FieldGroup>
        <FormFeedback state={state} />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={Boolean(kind)}>
            <FieldLabel htmlFor="kind">Jenis</FieldLabel>
            <FormSelect id="kind" name="kind" options={KINDS} defaultValue="peringatan" invalid={Boolean(kind)} />
            {kind ? <FieldError>{kind}</FieldError> : null}
          </Field>
          <Field>
            <FieldLabel htmlFor="category_id">Kategori</FieldLabel>
            <FormSelect id="category_id" name="category_id" options={[{ value: "", label: "Tanpa kategori" }, ...categories]} defaultValue="" />
          </Field>
        </div>

        <Field data-invalid={Boolean(title)}>
          <FieldLabel htmlFor="title">Judul</FieldLabel>
          <Input id="title" name="title" maxLength={120} placeholder="Ringkas dan jelas" aria-invalid={Boolean(title)} required />
          {title ? <FieldError>{title}</FieldError> : null}
        </Field>

        <Field data-invalid={Boolean(body)}>
          <FieldLabel htmlFor="body">Cerita</FieldLabel>
          <MarkdownEditor id="body" name="body" rows={10} maxLength={8000} placeholder="Apa yang terjadi, tandanya apa, dan bagaimana kamu menanganinya?" invalid={Boolean(body)} />
          {body ? (
            <FieldError>{body}</FieldError>
          ) : (
            <FieldDescription>Jangan cantumkan nomor, rekening, atau data pribadi. Kiriman ditinjau moderator sebelum tampil.</FieldDescription>
          )}
        </Field>

        <SubmitButton size="lg" pendingLabel="Mengirim" className="h-11 w-fit px-6">
          Kirim untuk ditinjau
        </SubmitButton>
      </FieldGroup>
    </form>
  );
}
