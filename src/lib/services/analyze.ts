import "server-only";

import { enforceRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { askLlm, type LlmVerdict } from "@/lib/llm";
import { redact } from "@/lib/redact";
import { normalizeScore, scoreForLevel } from "@/lib/risk";
import {
    analyzeRules,
    levelFromScore,
    maxLevel,
    topCategory,
    type Level,
} from "@/lib/rules";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/types";
import { analyzeUrls, type Hit } from "@/lib/url-check";
import type { QuotaInfo } from "@/lib/services/scan-guard";

export type AnalysisResult = {
    id: string | null;
    level: Level;
    score: number;
    hits: Hit[];
    urls: string[];
    summary: string;
    reasons: string[];
    nextSteps: string[];
    redacted: string[];
    ai: boolean;
    saved: boolean;
    extracted?: string;
    quota?: QuotaInfo;
    /** No check could actually run, so the 0 score says nothing about the message. */
    inconclusive?: boolean;
};

const INCONCLUSIVE = {
    summary:
        "Pemeriksaan otomatis sedang tidak tersedia, jadi pesan ini belum bisa dinilai. Hasil ini bukan berarti pesannya aman.",
    steps: [
        "Coba periksa lagi beberapa saat lagi.",
        "Sementara itu, jangan klik tautan atau kirim data apa pun.",
        "Verifikasi ke pihak terkait lewat kontak resmi, bukan kontak di pesan.",
    ],
};

const FALLBACK: Record<Level, { summary: string; steps: string[] }> = {
    rendah: {
        summary:
            "Kami tidak menemukan tanda penipuan yang kuat. Tetap cek pengirim lewat kanal resmi sebelum bertindak.",
        steps: [
            "Hubungi pengirim lewat nomor atau aplikasi resmi bila ragu.",
            "Jangan bagikan kode OTP atau PIN ke siapa pun.",
        ],
    },
    waspada: {
        summary:
            "Ada beberapa tanda yang perlu diwaspadai. Jangan tergesa membalas atau membuka tautan di pesan ini.",
        steps: [
            "Jangan klik tautan sebelum memastikan domainnya resmi.",
            "Verifikasi ke pihak terkait lewat kontak resmi, bukan kontak di pesan.",
            "Simpan tangkapan layar bila perlu dilaporkan.",
        ],
    },
    tinggi: {
        summary:
            "Pesan ini punya banyak ciri penipuan. Sebaiknya jangan dibalas, jangan klik tautan, dan jangan kirim data apa pun.",
        steps: [
            "Berhenti membalas dan blokir pengirim.",
            "Jangan kirim OTP, PIN, atau data kartu.",
            "Jika sudah terlanjur, hubungi bank atau penyedia layanan secepatnya.",
        ],
    },
};

type Input = {
    text: string;
    userId: string | null;
    rateKey: string;
    saveHistory: boolean;
    kind?: "text" | "url" | "image";
};

export async function analyzeMessage({
    text,
    userId,
    rateKey,
    saveHistory,
    kind = "text",
}: Input): Promise<AnalysisResult> {
    await enforceRateLimit(RATE_LIMITS.analyze, rateKey);

    const { clean, counts } = redact(text);
    const rules = await analyzeRules(clean);
    const urls = analyzeUrls(clean);

    const hits = [...rules.hits, ...urls.hits];
    const ruleScore = normalizeScore(rules.score + urls.score);

    const verdict: LlmVerdict | null = await askLlm(clean);
    const level = maxLevel(levelFromScore(ruleScore), verdict?.level);
    const score = scoreForLevel(level, ruleScore, verdict?.score);
    const inconclusive = !rules.available && !verdict && !hits.length;

    const fallback = inconclusive ? INCONCLUSIVE : FALLBACK[level];
    const reasons =
        verdict?.reasons.length ? verdict.reasons : hits.map((hit) => hit.explanation);
    const nextSteps = verdict?.next_steps.length ? verdict.next_steps : fallback.steps;
    const summary = verdict?.summary ?? fallback.summary;

    let id: string | null = null;
    if (saveHistory && userId && !inconclusive) {
        const { data } = await createAdminClient()
            .from("analyses")
            .insert({
                user_id: userId,
                input_kind: kind === "text" && urls.urls.length ? "mixed" : kind,
                input_excerpt: clean.slice(0, 280),
                risk_level: level,
                risk_score: score,
                category_slug: topCategory(hits),
                rule_hits: hits as unknown as Json,
                ai_result: verdict as unknown as Json,
                model: verdict ? "openrouter" : null,
            })
            .select("id")
            .single();
        id = data?.id ?? null;
    }

    return {
        id,
        level,
        score,
        hits,
        urls: urls.urls,
        summary,
        reasons,
        nextSteps,
        redacted: Object.keys(counts),
        ai: Boolean(verdict),
        saved: Boolean(id),
        inconclusive,
    };
}

export type QuickResult = {
    level: Level;
    score: number;
    hits: Pick<Hit, "code" | "label" | "explanation">[];
    inconclusive: boolean;
};

export async function quickCheck(text: string, rateKey: string): Promise<QuickResult> {
    await enforceRateLimit(RATE_LIMITS.quick, rateKey);

    const clean = redact(text).clean;
    const rules = await analyzeRules(clean);
    const urls = analyzeUrls(clean);
    const score = normalizeScore(rules.score + urls.score);
    const hits = [...rules.hits, ...urls.hits];

    return {
        level: levelFromScore(score),
        score,
        hits: hits.map(({ code, label, explanation }) => ({
            code,
            label,
            explanation,
        })),
        inconclusive: !rules.available && !hits.length,
    };
}
