import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { Enums } from "@/lib/supabase/types";
import type { Hit } from "./url-check";

import { levelFromScore, maxLevel, normalizeScore, type Level } from "@/lib/risk";

export { levelFromScore, maxLevel, type Level };

type Rule = {
    code: string;
    label: string;
    explanation: string;
    pattern: string;
    weight: number;
    applies_to: Enums<"input_kind">[];
    category: { slug: string } | null;
};

const TTL = 5 * 60_000;
const MAX_INPUT = 6000;
let cache: { at: number; rules: Rule[] } | null = null;

export const invalidateRulesCache = () => {
    cache = null;
};

/** A failed or empty load is never cached, so it cannot zero out scans for the whole TTL. */
async function loadRules(): Promise<Rule[]> {
    if (cache && Date.now() - cache.at < TTL) return cache.rules;
    const { data, error } = await createAdminClient()
        .from("red_flag_rules")
        .select(
            "code,label,explanation,pattern,weight,applies_to,category:scam_categories(slug)",
        )
        .eq("is_active", true);
    if (error || !data?.length) return cache?.rules ?? [];
    cache = { at: Date.now(), rules: data as unknown as Rule[] };
    return cache.rules;
}

export async function analyzeRules(text: string) {
    const rules = await loadRules();
    const input = text.slice(0, MAX_INPUT);
    const hits: Hit[] = [];

    for (const rule of rules) {
        try {
            if (new RegExp(rule.pattern, "i").test(input)) {
                hits.push({
                    code: rule.code,
                    label: rule.label,
                    explanation: rule.explanation,
                    weight: normalizeScore(rule.weight),
                    category: rule.category?.slug,
                });
            }
        } catch {
            continue;
        }
    }

    const score = normalizeScore(hits.reduce((sum, hit) => sum + hit.weight, 0));
    return { hits, score, available: rules.length > 0 };
}

export function topCategory(hits: Hit[]) {
    return (
        [...hits]
            .filter((hit) => hit.category)
            .sort((a, b) => b.weight - a.weight)[0]?.category ?? null
    );
}
