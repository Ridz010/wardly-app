import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ScenarioPlayer } from "@/components/latih/scenario-player";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { PageLoader } from "@/components/shared/page-loader";
import { PageShell } from "@/components/shared/page-shell";
import { getUser } from "@/lib/auth/session";
import { getScenario } from "@/lib/data/content";

export async function generateMetadata({
  params,
}: PageProps<"/latih/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const scenario = await getScenario(slug);
  return scenario
    ? { title: scenario.title, description: scenario.summary ?? undefined }
    : { title: "Skenario tidak ditemukan" };
}

async function Player({ slug }: { slug: string }) {
  const [scenario, user] = await Promise.all([getScenario(slug), getUser()]);
  if (!scenario || !scenario.steps.length) notFound();

  return (
    <>
      <PageHeader
        title={scenario.title}
        description={scenario.summary ?? undefined}
        meta={
          <>
            <Badge variant="secondary" className="rounded-full font-normal capitalize">{scenario.difficulty}</Badge>
            <Badge variant="outline" className="rounded-full font-normal">+{scenario.xp_reward} XP</Badge>
          </>
        }
      />
      <ScenarioPlayer scenario={scenario} signedIn={Boolean(user)} />
    </>
  );
}

export default function ScenarioPage({ params }: PageProps<"/latih/[slug]">) {
  return (
    <PageShell narrow>
      <Suspense fallback={<PageLoader />}>
        <ParamsGate params={params} />
      </Suspense>
    </PageShell>
  );
}

async function ParamsGate({ params }: { params: PageProps<"/latih/[slug]">["params"] }) {
  const { slug } = await params;
  return <Player slug={slug} />;
}
