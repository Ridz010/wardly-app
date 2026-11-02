import "server-only";

import { getClientFingerprint } from "@/lib/client-id";
import { getProfile, getUser } from "@/lib/auth/session";
import { AppError } from "@/lib/errors";
import { consumeDailyQuota, DAILY_LIMITS, peekDailyQuota } from "@/lib/rate-limit";

export type QuotaInfo = { limit: number; remaining: number; guest: boolean };

export const GUEST_LIMIT_MESSAGE = `Jatah ${DAILY_LIMITS.guest} pemeriksaan gratis hari ini sudah habis. Masuk atau buat akun untuk lanjut memeriksa, gratis.`;
export const USER_LIMIT_MESSAGE = `Jatah ${DAILY_LIMITS.user} pemeriksaan hari ini sudah habis. Jatah baru tersedia besok pukul 00.00 WIB.`;

async function resolveActor() {
    const user = await getUser();
    if (user) {
        return { key: user.id, userId: user.id, guest: false, limit: DAILY_LIMITS.user };
    }
    const fingerprint = await getClientFingerprint();
    return { key: `guest:${fingerprint}`, userId: null, guest: true, limit: DAILY_LIMITS.guest };
}

export async function startScan() {
    const actor = await resolveActor();
    const quota = await peekDailyQuota(actor.key, actor.limit);
    if (quota.remaining <= 0) {
        throw new AppError(
            actor.guest ? "unauthorized" : "rate_limited",
            actor.guest ? GUEST_LIMIT_MESSAGE : USER_LIMIT_MESSAGE,
        );
    }
    const profile = actor.userId ? await getProfile() : null;
    return {
        userId: actor.userId,
        rateKey: actor.key,
        saveHistory: profile?.save_history ?? false,
        charge: async (): Promise<QuotaInfo> => {
            const next = await consumeDailyQuota(actor.key, actor.limit);
            return { limit: next.limit, remaining: next.remaining, guest: actor.guest };
        },
    };
}

export async function getScanQuota(): Promise<QuotaInfo> {
    const actor = await resolveActor();
    const quota = await peekDailyQuota(actor.key, actor.limit);
    return { limit: quota.limit, remaining: quota.remaining, guest: actor.guest };
}
