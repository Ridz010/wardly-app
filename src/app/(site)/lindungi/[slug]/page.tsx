import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { GuideChecklist } from "@/components/lindungi/guide-checklist";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { PageLoader } from "@/components/shared/page-loader";
import { PageShell } from "@/components/shared/page-shell";
import { getUser } from "@/lib/auth/session";
import { getGuide } from "@/lib/data/content";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({
  params,
}: PageProps<"/lindungi/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuide(slug);
  return guide
    ? { title: guide.title, description: guide.summary ?? undefined }
    : { title: "Panduan tidak ditemukan" };
}

async function GuideContent({ params }: { params: PageProps<"/lindungi/[slug]">["params"] }) {
  const { slug } = await params;
  const [guide, user] = await Promise.all([getGuide(slug), getUser()]);
  if (!guide) notFound();

  let done: string[] = [];
  if (user && guide.steps.length) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("user_checklist_progress")
      .select("step_id")
      .eq("user_id", user.id)
      .in("step_id", guide.steps.map((step) => step.id));
    done = data?.map((row) => row.step_id) ?? [];
  }

  return (
    <>
      <PageHeader
        title={guide.title}
        description={guide.summary ?? undefined}
        meta={
          <Badge variant="secondary" className="rounded-full font-normal">
            {guide.phase === "sebelum" ? "Pencegahan" : "Setelah kejadian"}
          </Badge>
        }
      />
      <GuideChecklist
        steps={guide.steps}
        initialDone={done}
        slug={guide.slug}
        signedIn={Boolean(user)}
      />
    </>
  );
}

export default function GuidePage({ params }: PageProps<"/lindungi/[slug]">) {
  return (
    <PageShell narrow>
      <Suspense fallback={<PageLoader />}>
        <GuideContent params={params} />
      </Suspense>
    </PageShell>
  );
}
