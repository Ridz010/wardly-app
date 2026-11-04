import "server-only";
import { cacheLife, cacheTag } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import type { Tables } from "@/lib/supabase/types";

export const TAGS = {
    categories: "categories",
    scenarios: "scenarios",
    guides: "guides",
    blog: "blog",
    community: "community",
    rules: "rules",
    badges: "badges",
    leaderboard: "leaderboard",
} as const;

export type Category = Pick<
    Tables<"scam_categories">,
    "id" | "slug" | "name" | "description" | "icon" | "sort_order"
>;

const CATEGORY_COLUMNS = "id,slug,name,description,icon,sort_order";

export async function getCategories(): Promise<Category[]> {
    "use cache";
    cacheLife("hours");
    cacheTag(TAGS.categories);

    const { data } = await createAdminClient()
        .from("scam_categories")
        .select(CATEGORY_COLUMNS)
        .order("sort_order", { ascending: true });
    return data ?? [];
}

export type ScenarioCard = Pick<
    Tables<"scenarios">,
    "id" | "slug" | "title" | "summary" | "difficulty" | "xp_reward"
> & { category: { name: string; slug: string } | null };

export async function getScenarios(): Promise<ScenarioCard[]> {
    "use cache";
    cacheLife("hours");
    cacheTag(TAGS.scenarios);

    const { data } = await createAdminClient()
        .from("scenarios")
        .select(
            "id,slug,title,summary,difficulty,xp_reward,category:scam_categories(name,slug)",
        )
        .eq("status", "published")
        .order("created_at", { ascending: false });
    return (data as unknown as ScenarioCard[]) ?? [];
}

export type ScenarioChoice = Pick<
    Tables<"scenario_choices">,
    "id" | "label" | "next_step_id" | "sort_order"
>;

export type ScenarioStep = Pick<
    Tables<"scenario_steps">,
    "id" | "channel" | "narrative" | "sender_name" | "step_order"
> & { choices: ScenarioChoice[] };

export type ScenarioDetail = ScenarioCard & { steps: ScenarioStep[] };

export async function getScenario(slug: string): Promise<ScenarioDetail | null> {
    "use cache";
    cacheLife("hours");
    cacheTag(TAGS.scenarios);

    const admin = createAdminClient();
    const { data: scenario } = await admin
        .from("scenarios")
        .select(
            "id,slug,title,summary,difficulty,xp_reward,category:scam_categories(name,slug)",
        )
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
    if (!scenario) return null;

    const { data: steps, error } = await admin
        .from("scenario_steps")
        .select(
            "id,channel,narrative,sender_name,step_order,choices:scenario_choices!scenario_choices_step_id_fkey(id,label,next_step_id,sort_order)",
        )
        .eq("scenario_id", scenario.id)
        .order("step_order", { ascending: true });
    if (error) console.error("[latih] gagal memuat langkah skenario", error.message);

    const ordered = ((steps as unknown as ScenarioStep[]) ?? []).map((step) => ({
        ...step,
        choices: [...step.choices].sort(
            (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
        ),
    }));

    return { ...(scenario as unknown as ScenarioCard), steps: ordered };
}

export type GuideCard = Pick<
    Tables<"action_guides">,
    "id" | "slug" | "title" | "summary" | "phase" | "urgency"
> & { category: { name: string; slug: string } | null };

export async function getGuides(): Promise<GuideCard[]> {
    "use cache";
    cacheLife("hours");
    cacheTag(TAGS.guides);

    const { data } = await createAdminClient()
        .from("action_guides")
        .select(
            "id,slug,title,summary,phase,urgency,category:scam_categories(name,slug)",
        )
        .eq("status", "published")
        .order("urgency", { ascending: false });
    return (data as unknown as GuideCard[]) ?? [];
}

export type GuideStep = Pick<
    Tables<"action_guide_steps">,
    "id" | "title" | "detail" | "step_order" | "link_label" | "link_url"
>;

export type GuideDetail = GuideCard & { steps: GuideStep[] };

export async function getGuide(slug: string): Promise<GuideDetail | null> {
    "use cache";
    cacheLife("hours");
    cacheTag(TAGS.guides);

    const admin = createAdminClient();
    const { data: guide } = await admin
        .from("action_guides")
        .select(
            "id,slug,title,summary,phase,urgency,category:scam_categories(name,slug)",
        )
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
    if (!guide) return null;

    const { data: steps } = await admin
        .from("action_guide_steps")
        .select("id,title,detail,step_order,link_label,link_url")
        .eq("guide_id", guide.id)
        .order("step_order", { ascending: true });

    return { ...(guide as unknown as GuideCard), steps: steps ?? [] };
}

export type BlogCard = Pick<
    Tables<"blog_posts">,
    "id" | "slug" | "title" | "excerpt" | "cover_url" | "tags" | "published_at"
> & { minutes: number };

export const readingMinutes = (text: string) =>
    Math.max(1, Math.round(text.trim().split(/\s+/).length / 200));

export async function getBlogPosts(): Promise<BlogCard[]> {
    "use cache";
    cacheLife("hours");
    cacheTag(TAGS.blog);

    const { data } = await createAdminClient()
        .from("blog_posts")
        .select("id,slug,title,excerpt,cover_url,tags,published_at,content_md")
        .eq("status", "published")
        .order("published_at", { ascending: false });

    return (data ?? []).map(({ content_md, ...post }) => ({
        ...post,
        minutes: readingMinutes(content_md),
    }));
}

export type BlogDetail = BlogCard & { content_md: string; author: string };

export async function getBlogPost(slug: string): Promise<BlogDetail | null> {
    "use cache";
    cacheLife("hours");
    cacheTag(TAGS.blog);

    const admin = createAdminClient();
    const { data } = await admin
        .from("blog_posts")
        .select("id,slug,title,excerpt,cover_url,tags,published_at,content_md,author_id")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
    if (!data) return null;

    let author = "Tim Ward-Ly";
    if (data.author_id) {
        const { data: profile } = await admin
            .from("profiles")
            .select("display_name")
            .eq("id", data.author_id)
            .maybeSingle();
        if (profile?.display_name) author = profile.display_name;
    }

    const { author_id: _authorId, ...post } = data;
    return { ...post, author, minutes: readingMinutes(post.content_md) };
}

export type CommunityCard = Pick<
    Tables<"community_posts">,
    "id" | "title" | "body" | "kind" | "helpful_count" | "created_at" | "author_id"
> & {
    author: string;
    category: { name: string; slug: string } | null;
};

export async function getCommunityPosts(): Promise<CommunityCard[]> {
    "use cache";
    cacheLife("minutes");
    cacheTag(TAGS.community);

    const admin = createAdminClient();
    const { data } = await admin
        .from("community_posts")
        .select(
            "id,title,body,kind,helpful_count,created_at,author_id,category:scam_categories(name,slug)",
        )
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(60);

    const rows = (data as unknown as Omit<CommunityCard, "author">[]) ?? [];
    const ids = [...new Set(rows.map((row) => row.author_id))];
    const names = new Map<string, string>();

    if (ids.length) {
        const { data: profiles } = await admin
            .from("profiles")
            .select("id,display_name")
            .in("id", ids);
        profiles?.forEach((profile) => names.set(profile.id, profile.display_name));
    }

    return rows.map((row) => ({
        ...row,
        author: names.get(row.author_id) ?? "Anggota Ward-Ly",
    }));
}

export async function getTrendingCategories(days = 30) {
    "use cache";
    cacheLife("hours");
    cacheTag(TAGS.categories);

    const { data } = await createAdminClient().rpc("trending_categories", {
        p_days: days,
    });
    return data ?? [];
}

export type RadarPattern = { label: string; explanation: string; weight: number };

export async function getRadarPatterns(): Promise<Record<string, RadarPattern[]>> {
    "use cache";
    cacheLife("hours");
    cacheTag(TAGS.rules);

    const { data } = await createAdminClient()
        .from("red_flag_rules")
        .select("label,explanation,weight,category:scam_categories(slug)")
        .eq("is_active", true)
        .order("weight", { ascending: false });

    const grouped: Record<string, RadarPattern[]> = {};
    (data as unknown as (RadarPattern & { category: { slug: string } | null })[] | null)?.forEach((row) => {
        const slug = row.category?.slug;
        if (!slug) return;
        (grouped[slug] ??= []).push({ label: row.label, explanation: row.explanation, weight: row.weight });
    });
    return grouped;
}

export type BadgeItem = Pick<Tables<"badges">, "id" | "code" | "name" | "description" | "icon">;

export async function getBadges(): Promise<BadgeItem[]> {
    "use cache";
    cacheLife("hours");
    cacheTag(TAGS.badges);

    const { data } = await createAdminClient()
        .from("badges")
        .select("id,code,name,description,icon")
        .order("name");
    return data ?? [];
}

export type LeaderboardRow = { id: string; name: string; xp: number; level: number };

export async function getLeaderboard(limit = 10): Promise<LeaderboardRow[]> {
    "use cache";
    cacheLife("minutes");
    cacheTag(TAGS.leaderboard);

    const { data } = await createAdminClient()
        .from("public_profiles")
        .select("id,display_name,xp,level")
        .gt("xp", 0)
        .order("xp", { ascending: false })
        .limit(limit);

    return (data ?? []).flatMap((row) =>
        row.id
            ? [{ id: row.id, name: row.display_name || "Anggota Ward-Ly", xp: row.xp ?? 0, level: row.level ?? 1 }]
            : [],
    );
}

export type SiteStats = { analyses: number; scenarios: number; categories: number; stories: number };

export async function getSiteStats(): Promise<SiteStats> {
    "use cache";
    cacheLife("hours");
    cacheTag(TAGS.scenarios, TAGS.community, TAGS.categories);

    const admin = createAdminClient();
    const count = { count: "exact", head: true } as const;
    const [analyses, scenarios, categories, stories] = await Promise.all([
        admin.from("analyses").select("id", count),
        admin.from("scenarios").select("id", count).eq("status", "published"),
        admin.from("scam_categories").select("id", count),
        admin.from("community_posts").select("id", count).eq("status", "published"),
    ]);

    return {
        analyses: analyses.count ?? 0,
        scenarios: scenarios.count ?? 0,
        categories: categories.count ?? 0,
        stories: stories.count ?? 0,
    };
}
