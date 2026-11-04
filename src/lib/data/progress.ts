import "server-only";

import { starsFor } from "@/lib/gamification";
import { createAdminClient } from "@/lib/supabase/admin";

export type ScenarioProgress = { stars: number; bestScore: number; maxScore: number; plays: number };

export type LatihProgress = {
    xp: number;
    level: number;
    streak: number;
    activeToday: boolean;
    badgeIds: string[];
    scenarios: Record<string, ScenarioProgress>;
};

const jakartaDate = (date: Date) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(date);

/** Progres latihan satu pengguna. Tidak di-cache karena bersifat pribadi. */
export async function getLatihProgress(userId: string): Promise<LatihProgress> {
    const admin = createAdminClient();
    const [profile, attempts, badges] = await Promise.all([
        admin.from("profiles").select("xp,level,streak_count,last_active_date").eq("id", userId).maybeSingle(),
        admin.from("scenario_attempts").select("scenario_id,score,max_score").eq("user_id", userId),
        admin.from("user_badges").select("badge_id").eq("user_id", userId),
    ]);

    const scenarios: Record<string, ScenarioProgress> = {};
    for (const row of attempts.data ?? []) {
        const entry = (scenarios[row.scenario_id] ??= { stars: 0, bestScore: 0, maxScore: row.max_score, plays: 0 });
        entry.plays += 1;
        const stars = starsFor(row.score, row.max_score);
        if (stars > entry.stars || (stars === entry.stars && row.score > entry.bestScore)) {
            entry.stars = stars;
            entry.bestScore = row.score;
            entry.maxScore = row.max_score;
        }
    }

    const last = profile.data?.last_active_date ?? null;
    const now = Date.now();
    const activeToday = last === jakartaDate(new Date(now));
    const stillAlive = activeToday || last === jakartaDate(new Date(now - 86_400_000));

    return {
        xp: profile.data?.xp ?? 0,
        level: profile.data?.level ?? 1,
        streak: stillAlive ? (profile.data?.streak_count ?? 0) : 0,
        activeToday,
        badgeIds: (badges.data ?? []).map((row) => row.badge_id),
        scenarios,
    };
}
