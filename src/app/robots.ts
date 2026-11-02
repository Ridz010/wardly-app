import type { MetadataRoute } from "next";

import { publicEnv } from "@/env/public";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/dashboard", "/auth"] },
    sitemap: `${publicEnv.siteUrl}/sitemap.xml`,
  };
}
