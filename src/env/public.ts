import { z } from "zod";

const schema = z.object({
    NEXT_PUBLIC_SUPABASE_URL: z.url(),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(20),
    NEXT_PUBLIC_SITE_URL: z.url(),
});

const parsed = schema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL:
        process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
});

if (!parsed.success) {
    const problems = [
        ...new Set(
            parsed.error.issues.map((issue) => {
                const name = issue.path.join(".");
                return process.env[name] ? `${name} (bukan URL/kunci yang valid)` : `${name} (kosong atau belum ada)`;
            }),
        ),
    ];
    throw new Error(
        `Env publik belum benar: ${problems.join(", ")}. Isi di .env.local (tanpa tanda kutip, tanpa spasi), simpan, lalu restart npm run dev.`,
    );
}

export const publicEnv = {
    supabaseUrl: parsed.data.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: parsed.data.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    siteUrl: parsed.data.NEXT_PUBLIC_SITE_URL.replace(/\/$/, ""),
} as const;
