import type { SupabaseClient } from '@supabase/supabase-js'
import type { Hit } from './url-check'

type Rule = { code: string; label: string; explanation: string; pattern: string; weight: number; category: { slug: string } | null }
let cache: { at: number; rules: Rule[] } | null = null

async function loadRules(supabase: SupabaseClient): Promise<Rule[]> {
    if (cache && Date.now() - cache.at < 5 * 60_000) return cache.rules
    const { data } = await supabase
        .from('red_flag_rules')
        .select('code,label,explanation,pattern,weight,category:scam_categories(slug)')
    cache = { at: Date.now(), rules: (data as unknown as Rule[]) ?? [] }
    return cache.rules
}

export async function analyzeRules(supabase: SupabaseClient, text: string) {
    const rules = await loadRules(supabase)
    const hits: Hit[] = []
    for (const r of rules) {
        try {
            if (new RegExp(r.pattern, 'i').test(text))
                hits.push({ code: r.code, label: r.label, explanation: r.explanation, weight: r.weight, category: r.category?.slug })
        } catch {
            
        }
    }
    const score = Math.min(100, hits.reduce((s, h) => s + h.weight, 0))
    return { hits, score }
}

export type Level = 'rendah' | 'waspada' | 'tinggi'
export const levelFromScore = (s: number): Level => (s >= 50 ? 'tinggi' : s >= 22 ? 'waspada' : 'rendah')
const ORDER: Level[] = ['rendah', 'waspada', 'tinggi']
export const maxLevel = (a: Level, b?: Level | null): Level =>
    !b ? a : ORDER.indexOf(a) >= ORDER.indexOf(b) ? a : b

export function topCategory(hits: Hit[]) {
    return [...hits].filter((h) => h.category).sort((a, b) => b.weight - a.weight)[0]?.category ?? null
}