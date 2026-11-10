import type { MetadataRoute } from "next";

import { publicEnv } from "@/env/public";
import { getBlogPosts, getGuides, getScenarios } from "@/lib/data/content";

const STATIC = ["", "/bedah", "/latih", "/lindungi", "/komunitas", "/blog", "/radar", "/faq", "/privacy", "/terms", "/security"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, guides, scenarios] = await Promise.all([getBlogPosts(), getGuides(), getScenarios()]);
  const base = publicEnv.siteUrl;

  return [
    ...STATIC.map((path) => ({ url: `${base}${path}` })),
    ...posts.map((item) => ({ url: `${base}/blog/${item.slug}` })),
    ...guides.map((item) => ({ url: `${base}/lindungi/${item.slug}` })),
    ...scenarios.map((item) => ({ url: `${base}/latih/${item.slug}` })),
  ];
}
