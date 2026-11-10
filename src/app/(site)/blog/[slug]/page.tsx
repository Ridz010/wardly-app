import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, CalendarIcon, ClockIcon } from "lucide-react";
import { Suspense } from "react";

import AnimatedContent from "@/components/AnimatedContent";
import { BlogCard, CoverFallback } from "@/components/blog/blog-card";
import { CopyLink } from "@/components/blog/copy-link";
import { ReadingProgress } from "@/components/blog/reading-progress";
import { PageLoader } from "@/components/shared/page-loader";
import { PageShell } from "@/components/shared/page-shell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getBlogPost, getBlogPosts } from "@/lib/data/content";
import { formatDate, initials } from "@/lib/format";
import { Markdown } from "@/lib/markdown";

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return { title: "Artikel tidak ditemukan" };
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: post.cover_url ? { images: [post.cover_url] } : undefined,
  };
}

async function Related({ current }: { current: string }) {
  const posts = (await getBlogPosts()).filter((post) => post.slug !== current).slice(0, 3);
  if (!posts.length) return null;

  return (
    <section className="flex flex-col gap-6 border-t border-border pt-10">
      <h2 className="font-heading text-2xl font-medium tracking-tight">Baca juga</h2>
      <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}

async function Article({ params }: { params: PageProps<"/blog/[slug]">["params"] }) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();

  return (
    <article className="flex flex-col gap-10">
      <ReadingProgress />

      <header className="mx-auto flex w-full max-w-3xl flex-col gap-5">
        <AnimatedContent distance={24} duration={0.6}>
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-1.5">
              {post.tags?.map((tag) => (
                <Badge key={tag} variant="secondary" className="rounded-full font-normal">{tag}</Badge>
              ))}
            </div>
            <h1 className="font-heading text-4xl font-medium leading-[1.08] tracking-tight text-balance sm:text-5xl">{post.title}</h1>
            {post.excerpt ? <p className="text-lg text-muted-foreground text-balance">{post.excerpt}</p> : null}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-2.5">
                <Avatar className="size-9">
                  <AvatarFallback className="bg-primary/10 text-xs text-primary">{initials(post.author)}</AvatarFallback>
                </Avatar>
                <span className="flex flex-col leading-tight">
                  <span className="text-foreground">{post.author}</span>
                  <span className="text-xs">Penulis</span>
                </span>
              </span>
              {post.published_at ? (
                <span className="flex items-center gap-1.5"><CalendarIcon className="size-4" />{formatDate(post.published_at, "long")}</span>
              ) : null}
              <span className="flex items-center gap-1.5"><ClockIcon className="size-4" />{post.minutes} menit baca</span>
            </div>
          </div>
        </AnimatedContent>
      </header>

      <AnimatedContent distance={32} duration={0.8}>
        <div className="aspect-21/9 w-full overflow-hidden rounded-3xl border border-border bg-muted">
          {post.cover_url ? (
            <img src={post.cover_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <CoverFallback title={post.title} />
          )}
        </div>
      </AnimatedContent>

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-10">
        <Markdown source={post.content_md} className="flex flex-col gap-5 text-lg leading-relaxed text-foreground/80" />

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
          <Link href="/blog" className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeftIcon className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
            Semua artikel
          </Link>
          <CopyLink />
        </div>
      </div>

      <Suspense fallback={null}>
        <Related current={post.slug} />
      </Suspense>
    </article>
  );
}

export default function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  return (
    <PageShell>
      <Suspense fallback={<PageLoader />}>
        <Article params={params} />
      </Suspense>
    </PageShell>
  );
}
