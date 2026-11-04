"use server";

import { revalidateTag } from "next/cache";

import { getUser } from "@/lib/auth/session";
import { getClientFingerprint } from "@/lib/client-id";
import { TAGS } from "@/lib/data/content";
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
  saved: boolean;
  score: number | null;
  maxScore: number | null;
  xpEarned: number | null;
  xpTotal: number | null;
  level: number | null;
  leveledUp: boolean;
  streak: number | null;
  newBadges: { code: string; name: string }[];
};

const GUEST: FinishOutcome = {
  saved: false,
  score: null,
  maxScore: null,
  xpEarned: null,
  xpTotal: null,
  level: null,
  leveledUp: false,
  streak: null,
  newBadges: [],
};

const finishRecord = z.object({
  xp_earned: z.number().catch(0),
  score: z.number().nullable().catch(null),
  max_score: z.number().nullable().catch(null),
  xp_total: z.number().nullable().catch(null),
  level: z.number().nullable().catch(null),
  leveled_up: z.boolean().catch(false),
  streak: z.number().nullable().catch(null),
  new_badges: z.array(z.object({ code: z.string(), name: z.string() })).catch([]),
});

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
    if (!user) return { status: "success", data: GUEST };

    await enforceRateLimit(RATE_LIMITS.scenario, user.id);
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("finish_scenario", {
      p_scenario_id: parsed.data.scenarioId,
      p_choice_ids: parsed.data.choiceIds,
    });
    if (error) return fail("Hasil latihan belum bisa disimpan.");

    const record = finishRecord.parse(data ?? {});
    revalidateTag(TAGS.leaderboard, "max");
    return {
      status: "success",
      data: {
        saved: true,
        score: record.score,
        maxScore: record.max_score,
        xpEarned: record.xp_earned,
        xpTotal: record.xp_total,
        level: record.level,
        leveledUp: record.leveled_up,
        streak: record.streak,
        newBadges: record.new_badges,
      },
    };
  } catch (error) {
    return toActionError(error);
  }
}
