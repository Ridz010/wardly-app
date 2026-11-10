import type { Metadata } from "next";
import Image from "next/image";
import { CircleCheckIcon } from "lucide-react";
import { Suspense } from "react";

import { CommunityFeed } from "@/components/komunitas/feed";
import { MyPosts, type MyPost } from "@/components/komunitas/my-posts";
import { PageHeader } from "@/components/shared/page-header";
import { PageLoader } from "@/components/shared/page-loader";
import { PageShell } from "@/components/shared/page-shell";
import { getUser } from "@/lib/auth/session";
import { getCommunityPosts } from "@/lib/data/content";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Komunitas",
  description: "Peringatan, pengalaman, dan tips dari pengguna Ward-Ly yang sudah ditinjau moderator.",
};

async function Feed({ searchParams }: { searchParams: PageProps<"/komunitas">["searchParams"] }) {
  const [posts, user, params] = await Promise.all([getCommunityPosts(), getUser(), searchParams]);

  let reacted: string[] = [];
  let mine: MyPost[] = [];

  if (user) {
    const admin = createAdminClient();
    const [reactions, own] = await Promise.all([
      admin.from("post_reactions").select("post_id").eq("user_id", user.id),
      admin
        .from("community_posts")
        .select("id,title,kind,status,created_at,moderation_note")
        .eq("author_id", user.id)
        .neq("status", "published")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);
    reacted = (reactions.data ?? []).map((row) => row.post_id);
    mine = own.data ?? [];
  }

  return (
    <div className="flex flex-col gap-8">
      {params.dikirim ? (
        <div role="status" className="flex items-start gap-3 rounded-3xl border border-primary/30 bg-primary/5 p-5 text-sm">
          <CircleCheckIcon className="mt-0.5 size-5 shrink-0 text-primary" />
          <div className="flex flex-col gap-1">
            <span className="font-normal text-foreground">Ceritamu terkirim, terima kasih!</span>
            <span className="text-muted-foreground">Moderator akan meninjaunya dulu. Setelah disetujui, ceritamu tampil di feed ini.</span>
          </div>
        </div>
      ) : null}
      <MyPosts posts={mine} />
      <CommunityFeed posts={posts} reacted={reacted} signedIn={Boolean(user)} />
    </div>
  );
}

export default function KomunitasPage({ searchParams }: PageProps<"/komunitas">) {
  return (
    <PageShell>
      <PageHeader
        title="Suara komunitas:"
        highlight="belajar dari cerita nyata."
        description="Baca peringatan dan pengalaman pengguna lain sebelum kamu jadi korban berikutnya. Semua cerita ditinjau moderator sebelum tampil."
        actions={
          <Image
            src="/mascot/membaca-buku.png"
            alt=""
            width={160}
            height={160}
            priority
            className="hidden size-36 object-contain sm:block lg:size-40"
          />
        }
      />
      <Suspense fallback={<PageLoader />}>
        <Feed searchParams={searchParams} />
      </Suspense>
    </PageShell>
  );
}
