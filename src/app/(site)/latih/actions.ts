"use server";

import { getUser } from "@/lib/auth/session";
import { getClientFingerprint } from "@/lib/client-id";
import { AppError, toActionError } from "@/lib/errors";
import { enforceRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { fail, type ActionState } from "@/lib/result";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const uuid = z.string().uuid();

export type ChoiceOutcome = {
  feedback: string;
  isSafe: boolean;
  scoreDelta: number;
  nextStepId: string | null;
};

export type FinishOutcome = {
  xpEarned: number | null;
  saved: boolean;
};

async function limitKey() {
  const user = await getUser();
  return user?.id ?? (await getClientFingerprint());
}

export async function revealChoiceAction(
  choiceId: string,
): Promise<ActionState<ChoiceOutcome>> {
  try {
    const id = uuid.safeParse(choiceId);
    if (!id.success) throw new AppError("validation");
    await enforceRateLimit(RATE_LIMITS.scenario, await limitKey());

    const { data, error } = await createAdminClient().rpc("get_choice_feedback", {
      p_choice_id: id.data,
    });
    const row = data?.[0];
    if (error || !row) throw new AppError("not_found");

    return {
      status: "success",
      data: {
        feedback: row.feedback,
        isSafe: row.is_safe,
        scoreDelta: row.score_delta,
        nextStepId: row.next_step_id,
      },
    };
  } catch (error) {
    return toActionError(error);
  }
}

export async function finishScenarioAction(
  scenarioId: string,
  choiceIds: string[],
): Promise<ActionState<FinishOutcome>> {
  try {
    const parsed = z
      .object({ scenarioId: uuid, choiceIds: z.array(uuid).min(1).max(40) })
      .safeParse({ scenarioId, choiceIds });
    if (!parsed.success) throw new AppError("validation");

    const user = await getUser();
    if (!user) return { status: "success", data: { xpEarned: null, saved: false } };

    await enforceRateLimit(RATE_LIMITS.scenario, user.id);
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("finish_scenario", {
      p_scenario_id: parsed.data.scenarioId,
      p_choice_ids: parsed.data.choiceIds,
    });
    if (error) return fail("Hasil latihan belum bisa disimpan.");

    const record = (data ?? {}) as Record<string, unknown>;
    const xp = record.xp_earned ?? record.xp;
    return {
      status: "success",
      data: { xpEarned: typeof xp === "number" ? xp : null, saved: true },
    };
  } catch (error) {
    return toActionError(error);
  }
}
