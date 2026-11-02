import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";

import { AppError } from "@/lib/errors";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Enums, Tables } from "@/lib/supabase/types";

export type Role = Enums<"user_role">;
export type Profile = Tables<"profiles">;

export type SessionUser = {
    id: string;
    email: string | null;
    name: string | null;
    avatarUrl: string | null;
};

export const getUser = cache(async (): Promise<SessionUser | null> => {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    const claims = data?.claims;
    if (!claims?.sub) return null;

    const meta = (claims.user_metadata ?? {}) as Record<string, unknown>;
    const text = (value: unknown) =>
        typeof value === "string" && value ? value : null;

    return {
        id: claims.sub,
        email: text(claims.email),
        name: text(meta.full_name) ?? text(meta.name),
        avatarUrl: text(meta.avatar_url) ?? text(meta.picture),
    };
});

export const getProfile = cache(async (): Promise<Profile | null> => {
    const user = await getUser();
    if (!user) return null;

    const supabase = await createClient();
    const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
    if (data) return data;

    return ensureProfile(user);
});

export async function ensureProfile(user: SessionUser): Promise<Profile | null> {
    const admin = createAdminClient();
    const displayName =
        user.name ?? user.email?.split("@")[0] ?? "Pengguna Ward-Ly";

    const { data, error } = await admin
        .from("profiles")
        .upsert(
            { id: user.id, display_name: displayName, avatar_url: user.avatarUrl },
            { onConflict: "id", ignoreDuplicates: true },
        )
        .select("*")
        .maybeSingle();
    if (error) {
        console.error("[auth] ensureProfile failed", error.message);
        return null;
    }
    if (data) return data;

    const { data: existing } = await admin
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
    return existing;
}

export async function requireUser(next?: string) {
    const user = await getUser();
    if (!user) {
        redirect(next ? `/sign-in?next=${encodeURIComponent(next)}` : "/sign-in");
    }
    return user;
}

export async function requireProfile(next?: string) {
    const user = await requireUser(next);
    const profile = await getProfile();
    if (!profile) throw new AppError("internal", "Profil tidak dapat dimuat.");
    return { user, profile };
}

const RANK: Record<Role, number> = { user: 0, moderator: 1, admin: 2 };

export const hasRole = (role: Role, minimum: Role) =>
    RANK[role] >= RANK[minimum];

export async function requireRole(minimum: Role, next?: string) {
    const { user, profile } = await requireProfile(next);
    if (!hasRole(profile.role, minimum)) redirect("/forbidden");
    return { user, profile };
}

export async function assertRole(minimum: Role) {
    const user = await getUser();
    if (!user) throw new AppError("unauthorized");
    const profile = await getProfile();
    if (!profile || !hasRole(profile.role, minimum)) {
        throw new AppError("forbidden");
    }
    return { user, profile };
}
