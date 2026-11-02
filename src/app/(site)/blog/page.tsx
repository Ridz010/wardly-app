import type { Metadata } from "next";
import { NewspaperIcon } from "lucide-react";
import { Suspense } from "react";

import { BlogGrid } from "@/components/blog/blog-grid";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { PageLoader } from "@/components/shared/page-loader";
import { PageShell } from "@/components/shared/page-shell";
import { getBlogPosts } from "@/lib/data/content";

export const metadata: Metadata = {
  title: "Blog",
  description: "Tips dan cerita seputar keamanan pesan dan penipuan digital.",
};

async function PostList() {
  const posts = await getBlogPosts();

  if (!posts.length) {
    return <EmptyState icon={<NewspaperIcon />} title="Belum ada artikel" description="Artikel pertama akan segera terbit." />;
  }

  return <BlogGrid posts={posts} />;
}

export default function BlogPage() {
  return (
    <PageShell>
      <PageHeader
        title="Catatan soal"
        highlight="keamanan pesan."
        description="Penjelasan ringkas, tanpa menakut-nakuti. Dari cara kerja penipuan sampai langkah aman setelahnya."
      />
      <Suspense fallback={<PageLoader />}>
        <PostList />
      </Suspense>
    </PageShell>
  );
}
