import Link from "next/link";
import { ArrowUpRightIcon, NewspaperIcon } from "lucide-react";

import AnimatedContent from "@/components/AnimatedContent";
import BlurText from "@/components/BlurText";
import { BlogCard } from "@/components/blog/blog-card";
import { buttonVariants } from "@/components/ui/button";
import { getBlogPosts } from "@/lib/data/content";
import { cn } from "cn";

export default async function Blog() {
    const posts = (await getBlogPosts()).slice(0, 3);

    return (
        <section className="w-full">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6 lg:py-24">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex max-w-xl flex-col gap-3">
                        <BlurText
                            text="Catatan terbaru soal keamanan pesan."
                            animateBy="words"
                            direction="top"
                            delay={80}
                            blur={10}
                            distance={24}
                            className="font-heading text-4xl leading-[1.08] font-medium tracking-tight text-balance sm:text-5xl"
                        />
                        <AnimatedContent distance={20} duration={0.7} delay={0.15}>
                            <p className="text-lg text-muted-foreground">Penjelasan ringkas tentang cara kerja penipuan dan langkah aman setelahnya.</p>
                        </AnimatedContent>
                    </div>
                    <AnimatedContent distance={20} duration={0.7} delay={0.25}>
                        <Link href="/blog" className={cn(buttonVariants({ variant: "outline" }), "group h-10 gap-2 rounded-full px-5 font-normal")}>
                            Semua artikel
                            <ArrowUpRightIcon className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </Link>
                    </AnimatedContent>
                </div>

                {posts.length ? (
                    <AnimatedContent distance={32} duration={0.7} stagger={0.1} threshold={0.05} className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 [&>*]:min-w-0">
                        {posts.map((post) => (
                            <BlogCard key={post.id} post={post} />
                        ))}
                    </AnimatedContent>
                ) : (
                    <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border px-6 py-14 text-center">
                        <span className="flex size-11 items-center justify-center rounded-full bg-muted text-primary">
                            <NewspaperIcon className="size-5" />
                        </span>
                        <p className="font-medium">Artikel pertama akan segera terbit.</p>
                    </div>
                )}
            </div>
        </section>
    );
}
