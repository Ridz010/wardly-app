"use server";

import { z } from "zod";

import { getUser } from "@/lib/auth/session";
import { AppError, toActionError } from "@/lib/errors";
import { enforceRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { ok, type ActionState } from "@/lib/result";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({ stepId: z.string().uuid(), done: z.boolean() });

export async function toggleStepAction(
  stepId: string,
  done: boolean,
): Promise<ActionState> {
  try {
    const parsed = schema.safeParse({ stepId, done });
    if (!parsed.success) throw new AppError("validation");

    const user = await getUser();
    if (!user) throw new AppError("unauthorized");
    await enforceRateLimit(RATE_LIMITS.reaction, user.id);

    const supabase = await createClient();
    if (parsed.data.done) {
      const { error } = await supabase
        .from("user_checklist_progress")
        .upsert({ user_id: user.id, step_id: parsed.data.stepId });
      if (error) throw new AppError("internal");
    } else {
      const { error } = await supabase
        .from("user_checklist_progress")
        .delete()
        .eq("user_id", user.id)
        .eq("step_id", parsed.data.stepId);
      if (error) throw new AppError("internal");
    }
    return ok();
  } catch (error) {
    return toActionError(error);
  }
}
