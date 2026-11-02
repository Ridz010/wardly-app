import type { Metadata } from "next";
import { Suspense } from "react";

import { PatternBoard, type RadarEntry } from "@/components/radar/pattern-board";
import { QuickCheck } from "@/components/radar/quick-check";
import { MarqueeBand } from "@/components/shared/marquee-band";
import { PageHeader } from "@/components/shared/page-header";
import { PageLoader } from "@/components/shared/page-loader";
import { PageShell } from "@/components/shared/page-shell";
import { getUser } from "@/lib/auth/session";
import { getScanQuota } from "@/lib/services/scan-guard";
import { getCategories, getRadarPatterns, getTrendingCategories } from "@/lib/data/content";

export const metadata: Metadata = {
  title: "Radar",
  description: "Pola penipuan yang paling sering muncul bulan ini, lengkap dengan cek cepat.",
};

async function Board() {
  const [categories, trending, patterns] = await Promise.all([
    getCategories(),
    getTrendingCategories(30),
    getRadarPatterns(),
  ]);
  const totals = new Map(trending.map((row) => [row.category_slug, row.total]));

  const entries: RadarEntry[] = categories
    .map((category) => ({
      slug: category.slug,
      name: category.name,
      description: category.description,
      total: totals.get(category.slug) ?? 0,
      patterns: patterns[category.slug] ?? [],
    }))
    .sort((a, b) => b.total - a.total);

  return (
    <>
      <MarqueeBand items={entries.map((entry) => entry.name)} />
      <PatternBoard entries={entries} />
    </>
  );
}

async function Checker() {
  const [user, quota] = await Promise.all([getUser(), getScanQuota()]);
  return <QuickCheck signedIn={Boolean(user)} quota={quota} />;
}

export default function RadarPage() {
  return (
    <PageShell>
      <PageHeader
        title="Apa yang sedang"
        highlight="sering dipakai penipu?"
        description="Diurutkan dari pola yang paling banyak diperiksa pengguna sebulan terakhir."
      />
      <Suspense fallback={<PageLoader className="min-h-48" />}>
        <Checker />
      </Suspense>
      <Suspense fallback={<PageLoader />}>
        <Board />
      </Suspense>
    </PageShell>
  );
}
