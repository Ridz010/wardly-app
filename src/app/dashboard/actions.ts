"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/lib/auth/session";
import { AppError, toActionError } from "@/lib/errors";
import { enforceRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { fail, ok, type ActionState } from "@/lib/result";
import { createClient } from "@/lib/supabase/server";
import { formToObject, settingsSchema, toFieldErrors } from "@/lib/validation";

export async function deleteAnalysisAction(id: string): Promise<ActionState> {
  try {
    const parsed = z.string().uuid().safeParse(id);
    if (!parsed.success) throw new AppError("validation");
    const user = await requireUser();
    await enforceRateLimit(RATE_LIMITS.reaction, user.id);

    const supabase = await createClient();
    const { error } = await supabase
      .from("analyses")
      .delete()
      .eq("id", parsed.data)
      .eq("user_id", user.id);
    if (error) throw new AppError("internal");

    revalidatePath("/dashboard", "layout");
    return ok();
  } catch (error) {
    return toActionError(error);
  }
}

export async function clearHistoryAction(): Promise<ActionState> {
  try {
    const user = await requireUser();
    await enforceRateLimit(RATE_LIMITS.report, user.id);
    const supabase = await createClient();
    const { error } = await supabase.from("analyses").delete().eq("user_id", user.id);
    if (error) throw new AppError("internal");
    revalidatePath("/dashboard", "layout");
    return ok("Seluruh riwayat dihapus.");
  } catch (error) {
    return toActionError(error);
  }
}

export async function updateSettingsAction(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  const parsed = settingsSchema.safeParse(formToObject(form));
  if (!parsed.success) {
    return fail("Periksa kembali isian kamu.", toFieldErrors(parsed.error));
  }

  try {
    const user = await requireUser();
    await enforceRateLimit(RATE_LIMITS.report, user.id);
    const supabase = await createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: parsed.data.display_name,
        save_history: parsed.data.save_history,
      })
      .eq("id", user.id);
    if (error) throw new AppError("internal");
    revalidatePath("/dashboard", "layout");
    return ok("Pengaturan disimpan.");
  } catch (error) {
    return toActionError(error);
  }
}
