import "server-only";
import { z } from "zod";

const schema = z.object({
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
    OPEN_ROUTER_API_KEY: z.string().min(1).optional(),
    OPEN_ROUTER_MODEL: z.string().min(1).default("openai/gpt-4o-mini"),
});

const parsed = schema.safeParse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    OPEN_ROUTER_API_KEY: process.env.OPEN_ROUTER_API_KEY || undefined,
    OPEN_ROUTER_MODEL: process.env.OPEN_ROUTER_MODEL || undefined,
});

if (!parsed.success) {
    const fields = parsed.error.issues.map((issue) => issue.path.join("."));
    throw new Error(
        `Variabel environment server tidak valid: ${[...new Set(fields)].join(", ")}`,
    );
}

export const serverEnv = {
    serviceRoleKey: parsed.data.SUPABASE_SERVICE_ROLE_KEY,
    openRouterKey: parsed.data.OPEN_ROUTER_API_KEY,
    openRouterModel: parsed.data.OPEN_ROUTER_MODEL,
} as const;
