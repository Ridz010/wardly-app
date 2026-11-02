import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

import { AppError } from "@/lib/errors";
import { createAdminClient } from "@/lib/supabase/admin";

export type RateLimitRule = {
    bucket: string;
    limit: number;
    windowSeconds: number;
};

export const RATE_LIMITS = {
    signIn: { bucket: "sign-in", limit: 8, windowSeconds: 600 },
    signUp: { bucket: "sign-up", limit: 5, windowSeconds: 3600 },
    analyze: { bucket: "analyze", limit: 12, windowSeconds: 600 },
    reaction: { bucket: "reaction", limit: 60, windowSeconds: 600 },
    communityWrite: { bucket: "community-write", limit: 5, windowSeconds: 3600 },
    report: { bucket: "report", limit: 10, windowSeconds: 3600 },
    scenario: { bucket: "scenario", limit: 40, windowSeconds: 600 },
    chat: { bucket: "chat", limit: 24, windowSeconds: 600 },
    chatGuest: { bucket: "chat-guest", limit: 4, windowSeconds: 3600 },
    screenshot: { bucket: "screenshot", limit: 5, windowSeconds: 600 },
    quick: { bucket: "quick-check", limit: 30, windowSeconds: 600 },
    admin: { bucket: "admin-write", limit: 120, windowSeconds: 600 },
    upload: { bucket: "upload", limit: 20, windowSeconds: 3600 },
} as const satisfies Record<string, RateLimitRule>;

type Verdict = { allowed: boolean; remaining: number; resetAt: Date };

type RpcRow = { allowed: boolean; remaining: number; reset_at: string };

const memory = new Map<string, { hits: number; resetAt: number }>();
let warned = false;

function consumeInMemory(rule: RateLimitRule, key: string): Verdict {
    const now = Date.now();
    const id = `${rule.bucket}:${key}`;
    const current = memory.get(id);

    if (!current || current.resetAt <= now) {
        const resetAt = now + rule.windowSeconds * 1000;
        memory.set(id, { hits: 1, resetAt });
        return {
            allowed: true,
            remaining: rule.limit - 1,
            resetAt: new Date(resetAt),
        };
    }

    current.hits += 1;
    return {
        allowed: current.hits <= rule.limit,
        remaining: Math.max(rule.limit - current.hits, 0),
        resetAt: new Date(current.resetAt),
    };
}

async function consumeInDatabase(
    rule: RateLimitRule,
    key: string,
): Promise<Verdict | null> {
    const admin = createAdminClient() as unknown as SupabaseClient;
    const { data, error } = await admin.rpc("consume_rate_limit", {
        p_bucket: rule.bucket,
        p_key: key,
        p_limit: rule.limit,
        p_window_seconds: rule.windowSeconds,
    });

    if (error || !Array.isArray(data) || data.length === 0) {
        if (!warned) {
            warned = true;
            console.warn(
                "[rate-limit] consume_rate_limit tidak tersedia, memakai penghitung memori. Jalankan supabase/migrations/20261102000000_rate_limit.sql.",
                error?.message,
            );
        }
        return null;
    }

    const row = data[0] as RpcRow;
    return {
        allowed: row.allowed,
        remaining: row.remaining,
        resetAt: new Date(row.reset_at),
    };
}

export async function checkRateLimit(
    rule: RateLimitRule,
    key: string,
): Promise<Verdict> {
    const fromDatabase = await consumeInDatabase(rule, key);
    return fromDatabase ?? consumeInMemory(rule, key);
}

export async function enforceRateLimit(
    rule: RateLimitRule,
    key: string,
): Promise<void> {
    const verdict = await checkRateLimit(rule, key);
    if (verdict.allowed) return;

    const retryAfter = Math.max(
        1,
        Math.ceil((verdict.resetAt.getTime() - Date.now()) / 1000),
    );
    const minutes = Math.ceil(retryAfter / 60);
    throw new AppError(
        "rate_limited",
        `Terlalu banyak percobaan. Coba lagi sekitar ${minutes} menit lagi.`,
        retryAfter,
    );
}


export const DAILY_LIMITS = { guest: 3, user: 20 } as const;

export type DailyQuota = {
    limit: number;
    used: number;
    remaining: number;
    resetAt: Date;
};

const JAKARTA_OFFSET = 7 * 3600 * 1000;
const DAY = 86_400_000;
const dailyMemory = new Map<string, number>();

function jakartaDay(now = Date.now()) {
    const start = Math.floor((now + JAKARTA_OFFSET) / DAY) * DAY - JAKARTA_OFFSET;
    return { start, resetAt: new Date(start + DAY) };
}

function toQuota(hits: number, limit: number, resetAt: Date): DailyQuota {
    return {
        limit,
        used: Math.min(hits, limit),
        remaining: Math.max(limit - hits, 0),
        resetAt,
    };
}

async function dailyRpc(
    fn: "consume_daily_quota" | "peek_daily_quota",
    key: string,
    limit: number,
) {
    const admin = createAdminClient() as unknown as SupabaseClient;
    const { data, error } = await admin.rpc(fn, { p_key: key, p_limit: limit });
    if (error || !Array.isArray(data) || data.length === 0) {
        if (!warned) {
            warned = true;
            console.warn(
                "[rate-limit] fungsi kuota harian tidak tersedia, memakai penghitung memori. Jalankan supabase/migrations/20261103000000_daily_quota_and_storage.sql.",
                error?.message,
            );
        }
        return null;
    }
    const row = data[0] as RpcRow;
    return toQuota(limit - row.remaining, limit, new Date(row.reset_at));
}

export async function peekDailyQuota(key: string, limit: number): Promise<DailyQuota> {
    const fromDatabase = await dailyRpc("peek_daily_quota", key, limit);
    if (fromDatabase) return fromDatabase;
    const { start, resetAt } = jakartaDay();
    return toQuota(dailyMemory.get(`${key}:${start}`) ?? 0, limit, resetAt);
}

export async function consumeDailyQuota(key: string, limit: number): Promise<DailyQuota> {
    const fromDatabase = await dailyRpc("consume_daily_quota", key, limit);
    if (fromDatabase) return fromDatabase;
    const { start, resetAt } = jakartaDay();
    const id = `${key}:${start}`;
    const hits = (dailyMemory.get(id) ?? 0) + 1;
    dailyMemory.set(id, hits);
    return toQuota(hits, limit, resetAt);
}
