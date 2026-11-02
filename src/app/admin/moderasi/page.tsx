import type { Metadata } from "next";
import { Suspense } from "react";

import { ModerationQueue, type PendingPost, type ReportItem } from "@/components/admin/moderation-queue";
import { PageHeader } from "@/components/shared/page-header";
import { PageLoader } from "@/components/shared/page-loader";
import { requireRole } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Moderasi" };

async function Queue() {
  await requireRole("moderator", "/admin/moderasi");
  const admin = createAdminClient();

  const [pending, reports] = await Promise.all([
    admin
      .from("community_posts")
      .select("id,title,body,kind,created_at,author_id")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(50),
    admin
      .from("post_reports")
      .select("id,reason,created_at,post:community_posts(id,title,status)")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const posts = pending.data ?? [];
  const ids = [...new Set(posts.map((post) => post.author_id))];
  const names = new Map<string, string>();
  if (ids.length) {
    const { data } = await admin.from("profiles").select("id,display_name").in("id", ids);
    data?.forEach((profile) => names.set(profile.id, profile.display_name));
  }

  return (
    <ModerationQueue
      posts={posts.map<PendingPost>((post) => ({
        id: post.id,
        title: post.title,
        body: post.body,
        kind: post.kind,
        createdAt: post.created_at,
        author: names.get(post.author_id) ?? "Anggota",
      }))}
      reports={((reports.data as unknown as {
        id: string;
        reason: string;
        created_at: string;
        post: { id: string; title: string; status: string } | null;
      }[]) ?? []).map<ReportItem>((report) => ({
        id: report.id,
        reason: report.reason,
        createdAt: report.created_at,
        postId: report.post?.id ?? null,
        postTitle: report.post?.title ?? "Kiriman dihapus",
        postStatus: report.post?.status ?? "—",
      }))}
    />
  );
}

export default function ModerationPage() {
  return (
    <>
      <PageHeader animate={false} title="Moderasi komunitas" description="Tinjau kiriman baru dan tindak lanjuti laporan pengguna." />
      <Suspense fallback={<PageLoader />}>
        <Queue />
      </Suspense>
    </>
  );
}
