"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState, useTransition } from "react";
import { ChevronRightIcon, PencilIcon, PlusIcon, SearchIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { deleteResourceAction, saveResourceAction } from "@/app/admin/actions";
import { EmptyState } from "@/components/shared/empty-state";
import { FormFeedback, fieldError } from "@/components/shared/form-feedback";
import { FormSelect } from "@/components/shared/form-select";
import { SubmitButton } from "@/components/shared/submit-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ImageField } from "@/components/editor/image-field";
import { MarkdownEditor } from "@/components/editor/markdown-editor";
import { Textarea } from "@/components/ui/textarea";
import { idle } from "@/lib/result";
import { cn } from "cn";

export type ClientField = {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "select" | "switch" | "markdown" | "image";
  hint?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  nullable?: boolean;
  wide?: boolean;
};

export type ClientColumn = {
  key: string;
  label: string;
  kind: "text" | "badge" | "bool" | "number" | "date" | "mono" | "lookup";
  lookup?: Record<string, string>;
};

export type Row = Record<string, unknown> & { id: string };

type Props = {
  resource: string;
  singular: string;
  fields: ClientField[];
  columns: ClientColumn[];
  rows: Row[];
  parentId?: string;
  drilldowns: { label: string; resource: string }[];
};

const display = (value: unknown, column: ClientColumn) => {
  if (value === null || value === undefined || value === "") return <span className="text-muted-foreground">—</span>;
  switch (column.kind) {
    case "bool":
      return value ? <Badge className="rounded-full font-normal">Ya</Badge> : <Badge variant="outline" className="rounded-full font-normal">Tidak</Badge>;
    case "badge":
      return <Badge variant="secondary" className="rounded-full font-normal capitalize">{String(value)}</Badge>;
    case "date":
      return new Date(String(value)).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
    case "lookup":
      return column.lookup?.[String(value)] ?? "—";
    case "number":
      return <span className="tabular-nums">{String(value)}</span>;
    case "mono":
      return <code className="text-xs">{String(value)}</code>;
    default:
      return <span className="line-clamp-2 max-w-md">{String(value)}</span>;
  }
};

const toDefault = (value: unknown) => {
  if (Array.isArray(value)) return value.join(", ");
  if (value === null || value === undefined) return "";
  return String(value);
};

function FieldInput({ field, row, error }: { field: ClientField; row: Row | null; error?: string }) {
  const value = row?.[field.name];
  const id = `f-${field.name}`;

  return (
    <Field data-invalid={Boolean(error)} className={cn(field.wide && "sm:col-span-2")}>
      {field.type === "switch" ? (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-border px-4 py-3">
          <FieldLabel htmlFor={id}>{field.label}</FieldLabel>
          <Switch id={id} name={field.name} defaultChecked={row ? Boolean(value) : true} />
        </div>
      ) : (
        <>
          <FieldLabel htmlFor={id}>{field.label}</FieldLabel>
          {field.type === "markdown" ? (
            <MarkdownEditor id={id} name={field.name} defaultValue={toDefault(value)} maxLength={40000} invalid={Boolean(error)} />
          ) : field.type === "image" ? (
            <ImageField id={id} name={field.name} defaultValue={toDefault(value)} invalid={Boolean(error)} />
          ) : field.type === "textarea" ? (
            <Textarea id={id} name={field.name} rows={4} defaultValue={toDefault(value)} aria-invalid={Boolean(error)} className="rounded-xl font-light" />
          ) : field.type === "select" ? (
            <FormSelect
              id={id}
              name={field.name}
              options={[...(field.nullable ? [{ value: "", label: "Tidak ada" }] : []), ...(field.options ?? [])]}
              defaultValue={toDefault(value) || (field.nullable ? "" : field.options?.[0]?.value)}
              invalid={Boolean(error)}
            />
          ) : (
            <Input
              id={id}
              name={field.name}
              type={field.type === "number" ? "number" : "text"}
              defaultValue={toDefault(value) || (field.type === "number" && !row ? (field.name.endsWith("order") ? "1" : "0") : "")}
              placeholder={field.placeholder}
              aria-invalid={Boolean(error)}
            />
          )}
          {error ? <FieldError>{error}</FieldError> : field.hint ? <FieldDescription>{field.hint}</FieldDescription> : null}
        </>
      )}
    </Field>
  );
}

function EditorDialog({
  open,
  onOpenChange,
  row,
  ...props
}: Pick<Props, "resource" | "singular" | "fields" | "parentId"> & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: Row | null;
}) {
  const [state, action] = useActionState(saveResourceAction, idle);

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message ?? "Tersimpan.");
      onOpenChange(false);
    }
  }, [state, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{row ? `Ubah ${props.singular}` : `Tambah ${props.singular}`}</DialogTitle>
          <DialogDescription>Perubahan langsung berlaku di situs setelah disimpan.</DialogDescription>
        </DialogHeader>
        <form action={action} noValidate className="flex flex-col gap-4">
          <input type="hidden" name="resource" value={props.resource} />
          <input type="hidden" name="id" value={row?.id ?? ""} />
          <input type="hidden" name="parent" value={props.parentId ?? ""} />
          <FormFeedback state={state} />
          <div className="grid gap-4 sm:grid-cols-2">
            {props.fields.map((field) => (
              <FieldInput key={`${row?.id ?? "new"}-${field.name}`} field={field} row={row} error={fieldError(state, field.name)} />
            ))}
          </div>
          <DialogFooter>
            <SubmitButton pendingLabel="Menyimpan" className="h-10 px-5">Simpan</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteDialog({ resource, row, onClose }: { resource: string; row: Row | null; onClose: () => void }) {
  const [pending, startTransition] = useTransition();

  return (
    <Dialog open={Boolean(row)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hapus data ini?</DialogTitle>
          <DialogDescription>Tindakan ini tidak dapat dibatalkan.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" className="rounded-full font-light" onClick={onClose} disabled={pending}>Batal</Button>
          <Button
            variant="destructive"
            className="rounded-full font-normal"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                if (!row) return;
                const result = await deleteResourceAction(resource, row.id);
                if (result.status === "error") toast.error(result.message);
                else {
                  toast.success(result.message ?? "Dihapus.");
                  onClose();
                }
              })
            }
          >
            {pending ? <Spinner /> : null}
            Hapus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ResourceManager(props: Props) {
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Row | null>(null);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return props.rows;
    return props.rows.filter((row) =>
      props.columns.some((column) => String(row[column.key] ?? "").toLowerCase().includes(needle)),
    );
  }, [props.rows, props.columns, query]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari…" className="pl-9" aria-label="Cari data" />
        </div>
        <Button onClick={() => setCreating(true)} className="h-10 gap-2 rounded-full px-5 font-normal">
          <PlusIcon />
          Tambah {props.singular}
        </Button>
      </div>

      {rows.length ? (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                {props.columns.map((column) => (
                  <TableHead key={column.key}>{column.label}</TableHead>
                ))}
                <TableHead className="w-px text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  {props.columns.map((column) => (
                    <TableCell key={column.key}>{display(row[column.key], column)}</TableCell>
                  ))}
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {props.drilldowns.map((child) => (
                        <Link
                          key={child.label}
                          href={`/admin/${child.resource}?parent=${row.id}`}
                          className="inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-xs text-primary hover:bg-primary/10"
                        >
                          {child.label}
                          <ChevronRightIcon className="size-3" />
                        </Link>
                      ))}
                      <Button variant="ghost" size="icon-sm" aria-label="Ubah" onClick={() => setEditing(row)}>
                        <PencilIcon />
                      </Button>
                      <Button variant="ghost" size="icon-sm" aria-label="Hapus" onClick={() => setDeleting(row)}>
                        <Trash2Icon />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState
          title={query ? "Tidak ada hasil" : `Belum ada ${props.singular}`}
          description={query ? "Coba kata kunci lain." : `Tambahkan ${props.singular} pertama.`}
        />
      )}

      <EditorDialog
        open={creating}
        onOpenChange={setCreating}
        row={null}
        resource={props.resource}
        singular={props.singular}
        fields={props.fields}
        parentId={props.parentId}
      />
      <EditorDialog
        key={editing?.id ?? "none"}
        open={Boolean(editing)}
        onOpenChange={(open) => !open && setEditing(null)}
        row={editing}
        resource={props.resource}
        singular={props.singular}
        fields={props.fields}
        parentId={props.parentId}
      />
      <DeleteDialog resource={props.resource} row={deleting} onClose={() => setDeleting(null)} />
    </div>
  );
}
