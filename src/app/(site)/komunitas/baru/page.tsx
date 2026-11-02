import type { Metadata } from "next";
import { Suspense } from "react";

import { PostForm } from "@/components/komunitas/post-form";
import { PageHeader } from "@/components/shared/page-header";
import { PageLoader } from "@/components/shared/page-loader";
import { PageShell } from "@/components/shared/page-shell";
import { requireUser } from "@/lib/auth/session";
import { getCategories } from "@/lib/data/content";

export const metadata: Metadata = { title: "Bagikan cerita" };

async function Form() {
  await requireUser("/komunitas/baru");
  const categories = await getCategories();
  return <PostForm categories={categories.map((item) => ({ value: item.id, label: item.name }))} />;
}

export default function NewPostPage() {
  return (
    <PageShell narrow>
      <PageHeader
        title="Bagikan cerita atau"
        highlight="peringatan."
        description="Satu cerita singkat bisa menyelamatkan orang lain dari jebakan yang sama."
      />
      <Suspense fallback={<PageLoader />}>
        <Form />
      </Suspense>
    </PageShell>
  );
}
