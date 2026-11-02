import { fail, type ActionState } from "@/lib/result";

export type ErrorCode =
    | "unauthorized"
    | "forbidden"
    | "rate_limited"
    | "validation"
    | "not_found"
    | "conflict"
    | "upstream"
    | "internal";

const DEFAULT_MESSAGES: Record<ErrorCode, string> = {
    unauthorized: "Masuk dulu untuk melanjutkan.",
    forbidden: "Kamu tidak punya akses ke halaman atau aksi ini.",
    rate_limited: "Terlalu banyak percobaan. Coba lagi sebentar lagi.",
    validation: "Data yang dikirim belum sesuai.",
    not_found: "Data yang dicari tidak ditemukan.",
    conflict: "Data dengan nilai yang sama sudah ada.",
    upstream: "Layanan pendukung sedang bermasalah. Coba lagi nanti.",
    internal: "Terjadi kesalahan di sisi kami. Coba lagi sebentar lagi.",
};

export class AppError extends Error {
    readonly code: ErrorCode;
    readonly retryAfter?: number;

    constructor(code: ErrorCode, message?: string, retryAfter?: number) {
        super(message ?? DEFAULT_MESSAGES[code]);
        this.name = "AppError";
        this.code = code;
        this.retryAfter = retryAfter;
    }
}

export function toActionError(error: unknown): ActionState<never> {
    if (error instanceof AppError) return fail(error.message);
    console.error("[action] unexpected error", error);
    return fail(DEFAULT_MESSAGES.internal);
}
