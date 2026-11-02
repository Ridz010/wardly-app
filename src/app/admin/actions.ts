"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";

import { assertRole } from "@/lib/auth/session";
import { RESOURCES, isResourceKey, type Resource } from "@/lib/admin/resources";
import { TAGS } from "@/lib/data/content";
import { AppError, toActionError } from "@/lib/errors";
import { enforceRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { invalidateRulesCache } from "@/lib/rules";
import { fail, ok, type ActionState } from "@/lib/result";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  formToObject,
  moderationSchema,
  roleSchema,
  toFieldErrors,
} from "@/lib/validation";

const uuid = z.string().uuid();

function afterWrite(resource: Resource) {
  if (resource.tag) revalidateTag(resource.tag, "max");
  if (resource.key === "aturan") invalidateRulesCache();
  revalidatePath(`/admin/${resource.key}`);
}

export async function saveResourceAction(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  const key = String(form.get("resource") ?? "");
  if (!isResourceKey(key)) return fail("Sumber data tidak dikenal.");
  const resource = RESOURCES[key];

  const idRaw = String(form.get("id") ?? "");
  const parentId = String(form.get("parent") ?? "");

  const parsed = resource.schema.safeParse(formToObject(form));
  if (!parsed.success) {
    return fail("Periksa kembali isian kamu.", toFieldErrors(parsed.error));
  }

  try {
    const { user } = await assertRole("admin");
    await enforceRateLimit(RATE_LIMITS.admin, user.id);
    const admin = createAdminClient();
    const table = admin.from(resource.table as "scam_categories");

    let existing: Record<string, unknown> | null = null;
    if (idRaw) {
      if (!uuid.safeParse(idRaw).success) throw new AppError("validation");
      const { data } = await table.select("*").eq("id", idRaw).maybeSingle();
      existing = (data as Record<string, unknown> | null) ?? null;
      if (!existing) throw new AppError("not_found");
    }

    let row = parsed.data as Record<string, unknown>;
    if (resource.toRow) row = resource.toRow(row, existing);

    if (idRaw) {
      const { error } = await table.update(row as never).eq("id", idRaw);
      if (error) throw mapDbError(error.code);
    } else {
      const insert: Record<string, unknown> = { ...resource.defaults, ...row };
      if (resource.parent) {
        if (!uuid.safeParse(parentId).success) throw new AppError("validation", "Induk data tidak valid.");
        insert[resource.parent.fk] = parentId;
      }
      if (resource.authorColumn) insert[resource.authorColumn] = user.id;
      const { error } = await table.insert(insert as never);
      if (error) throw mapDbError(error.code);
    }

    afterWrite(resource);
    return ok(idRaw ? "Perubahan disimpan." : "Data ditambahkan.");
  } catch (error) {
    return toActionError(error);
  }
}

export async function deleteResourceAction(
  key: string,
  id: string,
): Promise<ActionState> {
  try {
    if (!isResourceKey(key) || !uuid.safeParse(id).success) throw new AppError("validation");
    const resource = RESOURCES[key];
    const { user } = await assertRole("admin");
    await enforceRateLimit(RATE_LIMITS.admin, user.id);

    const { error } = await createAdminClient()
      .from(resource.table as "scam_categories")
      .delete()
      .eq("id", id);
    if (error) {
      throw error.code === "23503"
        ? new AppError("conflict", "Data ini masih dipakai data lain. Hapus yang terkait dulu.")
        : new AppError("internal");
    }

    afterWrite(resource);
    return ok("Data dihapus.");
  } catch (error) {
    return toActionError(error);
  }
}

export async function moderateAction(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  const parsed = moderationSchema.safeParse(formToObject(form));
  if (!parsed.success) return fail("Data moderasi tidak valid.", toFieldErrors(parsed.error));

  try {
    const { user } = await assertRole("moderator");
    await enforceRateLimit(RATE_LIMITS.admin, user.id);
    const { id, status, note } = parsed.data;
    const { error } = await createAdminClient()
      .from("community_posts")
      .update({ status, moderation_note: note })
      .eq("id", id);
    if (error) throw new AppError("internal");

    revalidateTag(TAGS.community, "max");
    revalidatePath("/admin/moderasi");
    return ok(status === "published" ? "Kiriman diterbitkan." : "Kiriman ditolak.");
  } catch (error) {
    return toActionError(error);
  }
}

export async function dismissReportAction(id: string): Promise<ActionState> {
  try {
    if (!uuid.safeParse(id).success) throw new AppError("validation");
    const { user } = await assertRole("moderator");
    await enforceRateLimit(RATE_LIMITS.admin, user.id);
    const { error } = await createAdminClient().from("post_reports").delete().eq("id", id);
    if (error) throw new AppError("internal");
    revalidatePath("/admin/moderasi");
    return ok("Laporan ditutup.");
  } catch (error) {
    return toActionError(error);
  }
}

export async function setRoleAction(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  const parsed = roleSchema.safeParse(formToObject(form));
  if (!parsed.success) return fail("Peran tidak valid.");

  try {
    const { user } = await assertRole("admin");
    await enforceRateLimit(RATE_LIMITS.admin, user.id);
    if (parsed.data.id === user.id) {
      throw new AppError("forbidden", "Kamu tidak bisa mengubah peranmu sendiri.");
    }
    const { error } = await createAdminClient()
      .from("profiles")
      .update({ role: parsed.data.role })
      .eq("id", parsed.data.id);
    if (error) throw new AppError("internal");
    revalidatePath("/admin/pengguna");
    return ok("Peran diperbarui.");
  } catch (error) {
    return toActionError(error);
  }
}

function mapDbError(code?: string) {
  if (code === "23505") return new AppError("conflict");
  if (code === "23503") return new AppError("validation", "Referensi data tidak ditemukan.");
  return new AppError("internal");
}
