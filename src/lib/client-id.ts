import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";

export async function getClientIp(): Promise<string> {
    const list = await headers();
    const forwarded = list.get("x-forwarded-for")?.split(",")[0]?.trim();
    return forwarded || list.get("x-real-ip") || "unknown";
}

export async function getClientFingerprint(): Promise<string> {
    const ip = await getClientIp();
    return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}
