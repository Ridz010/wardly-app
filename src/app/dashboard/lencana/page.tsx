import type { Metadata } from "next";
import { AwardIcon, LockIcon } from "lucide-react";
import { Suspense } from "react";

import AnimatedContent from "@/components/AnimatedContent";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { PageLoader } from "@/components/shared/page-loader";
import { requireUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { cn } from "cn";

export const metadata: Metadata = { title: "Lencana" };

async function Badges() {
  const user = await requireUser("/dashboard/lencana");
  const supabase = await createClient();
  const [all, earned] = await Promise.all([
    createAdminClient().from("badges").select("id,code,name,description").order("name"),
    supabase.from("user_badges").select("badge_id,earned_at").eq("user_id", user.id),
  ]);

  const owned = new Map(earned.data?.map((row) => [row.badge_id, row.earned_at]));
  const badges = all.data ?? [];

  if (!badges.length) {
    return <EmptyState icon={<AwardIcon />} title="Belum ada lencana" description="Lencana akan muncul di sini." />;
  }

  return (
    <AnimatedContent distance={24} duration={0.55} stagger={0.06} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 [&>*]:min-w-0">
      {badges.map((badge) => {
        const date = owned.get(badge.id);
        return (
          <div
            key={badge.id}
            className={cn(
              "flex items-start gap-4 rounded-2xl border border-border p-5",
              date ? "bg-card" : "bg-muted/40 text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-full",
                date ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
              )}
            >
              {date ? <AwardIcon className="size-5" /> : <LockIcon className="size-4" />}
            </span>
            <div className="flex min-w-0 flex-col gap-1">
              <span className="font-normal text-foreground">{badge.name}</span>
              <span className="text-sm">{badge.description}</span>
              {date ? (
                <span className="text-xs text-primary">
                  Diraih {new Date(date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </span>
              ) : null}
            </div>
          </div>
        );
      })}
    </AnimatedContent>
  );
}

export default function BadgesPage() {
  return (
    <>
      <PageHeader animate={false} title="Lencana" description="Kumpulkan lencana dari latihan dan kontribusimu." />
      <Suspense fallback={<PageLoader />}>
        <Badges />
      </Suspense>
    </>
  );
}
