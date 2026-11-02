"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getUser } from "@/lib/auth/session";
import { TAGS } from "@/lib/data/content";
import { AppError, toActionError } from "@/lib/errors";
import { enforceRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { fail, ok, type ActionState } from "@/lib/result";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  communityPostSchema,
  formToObject,
  reportSchema,
  toFieldErrors,
} from "@/lib/validation";

export async function createPostAction(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  const parsed = communityPostSchema.safeParse(formToObject(form));
  if (!parsed.success) {
    return fail("Periksa kembali isian kamu.", toFieldErrors(parsed.error));
  }

  try {
    const user = await getUser();
    if (!user) throw new AppError("unauthorized");
    await enforceRateLimit(RATE_LIMITS.communityWrite, user.id);

    const supabase = await createClient();
    const { error } = await supabase.from("community_posts").insert({
      ...parsed.data,
      author_id: user.id,
      status: "pending",
    });
    if (error) throw new AppError("internal");
  } catch (error) {
    return toActionError(error);
  }

  redirect("/komunitas?dikirim=1");
}

const reactionSchema = z.object({ postId: z.string().uuid(), on: z.boolean() });

export async function toggleHelpfulAction(
  postId: string,
  on: boolean,
): Promise<ActionState<{ count: number }>> {
  try {
    const parsed = reactionSchema.safeParse({ postId, on });
    if (!parsed.success) throw new AppError("validation");

    const user = await getUser();
    if (!user) throw new AppError("unauthorized");
    await enforceRateLimit(RATE_LIMITS.reaction, user.id);

    const supabase = await createClient();
    if (parsed.data.on) {
      const { error } = await supabase
        .from("post_reactions")
        .upsert({ post_id: parsed.data.postId, user_id: user.id });
      if (error) throw new AppError("internal");
    } else {
      const { error } = await supabase
        .from("post_reactions")
        .delete()
        .eq("post_id", parsed.data.postId)
        .eq("user_id", user.id);
      if (error) throw new AppError("internal");
    }

    const admin = createAdminClient();
    const { count } = await admin
      .from("post_reactions")
      .select("post_id", { count: "exact", head: true })
      .eq("post_id", parsed.data.postId);
    const total = count ?? 0;
    await admin
      .from("community_posts")
      .update({ helpful_count: total })
      .eq("id", parsed.data.postId);

    revalidateTag(TAGS.community, "max");
    return ok(undefined, { count: total });
  } catch (error) {
    return toActionError(error);
  }
}

export async function reportPostAction(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  const parsed = reportSchema.safeParse(formToObject(form));
  if (!parsed.success) {
    return fail("Alasan laporan belum lengkap.", toFieldErrors(parsed.error));
  }

  try {
    const user = await getUser();
    if (!user) throw new AppError("unauthorized");
    await enforceRateLimit(RATE_LIMITS.report, user.id);

    const supabase = await createClient();
    const { error } = await supabase.from("post_reports").insert({
      post_id: parsed.data.post_id,
      reason: parsed.data.reason,
      reporter_id: user.id,
    });
    if (error) throw new AppError("internal");

    revalidatePath("/admin/moderasi");
    return ok("Laporan terkirim. Terima kasih sudah menjaga komunitas.");
  } catch (error) {
    return toActionError(error);
  }
}
