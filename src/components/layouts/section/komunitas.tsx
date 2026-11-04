import Link from "next/link";
import { MessagesSquareIcon } from "lucide-react";

import AnimatedContent from "@/components/AnimatedContent";
import BlurText from "@/components/BlurText";
import CountUp from "@/components/CountUp";
import StarBorder from "@/components/StarBorder";
import { KomunitasStack } from "@/components/layouts/section/komunitas-stack";
import { buttonVariants } from "@/components/ui/button";
import { getCommunityPosts } from "@/lib/data/content";
import { cn } from "cn";

export default async function Komunitas() {
    const posts = await getCommunityPosts();
    const helpful = posts.reduce((sum, post) => sum + post.helpful_count, 0);

    return (
        <section className="relative w-full overflow-hidden bg-muted/40">
            <div className="mx-auto grid w-full max-w-6xl items-center gap-14 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-24">
                <div className="flex flex-col items-start gap-6">
                    <BlurText
                        text="Belajar dari cerita orang lain."
                        animateBy="words"
                        direction="top"
                        delay={80}
                        blur={10}
                        distance={24}
                        className="font-heading text-4xl leading-[1.08] font-medium tracking-tight text-balance sm:text-5xl"
                    />
                    <AnimatedContent distance={24} duration={0.7} delay={0.15}>
                        <p className="max-w-md text-lg text-muted-foreground">
                            Penipuan terus berganti wajah. Di komunitas, pengguna Ward-Ly berbagi peringatan dan pengalaman nyata, sudah ditinjau moderator sebelum tampil.
                        </p>
                    </AnimatedContent>

                    {posts.length ? (
                        <AnimatedContent distance={20} duration={0.7} delay={0.25}>
                            <dl className="flex gap-10">
                                <div className="flex flex-col gap-1">
                                    <dt className="text-sm text-muted-foreground">Cerita terbit</dt>
                                    <dd className="font-heading text-4xl font-medium tabular-nums"><CountUp to={posts.length} /></dd>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <dt className="text-sm text-muted-foreground">Tanda membantu</dt>
                                    <dd className="font-heading text-4xl font-medium text-primary tabular-nums"><CountUp to={helpful} /></dd>
                                </div>
                            </dl>
                        </AnimatedContent>
                    ) : null}

                    <AnimatedContent distance={20} duration={0.7} delay={0.35}>
                        <div className="flex flex-wrap items-center gap-3">
                            <StarBorder as="a" href="/komunitas" radius={999} duration={5} theme="light">
                                <span className="px-2 text-sm">Buka komunitas</span>
                            </StarBorder>
                            <Link href="/komunitas/baru" className={cn(buttonVariants({ variant: "outline" }), "h-10 rounded-full px-5 font-normal")}>
                                Bagikan cerita
                            </Link>
                        </div>
                    </AnimatedContent>
                </div>

                <AnimatedContent distance={40} duration={0.9} blur={8}>
                    {posts.length ? (
                        <KomunitasStack posts={posts.slice(0, 5)} />
                    ) : (
                        <div className="mx-auto flex max-w-sm flex-col items-center gap-4 rounded-3xl border border-dashed border-border bg-card px-8 py-14 text-center">
                            <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <MessagesSquareIcon className="size-6" />
                            </span>
                            <p className="font-heading text-xl font-medium">Belum ada cerita</p>
                            <p className="text-sm text-muted-foreground">Jadilah yang pertama membagikan peringatan untuk orang lain.</p>
                        </div>
                    )}
                </AnimatedContent>
            </div>
        </section>
    );
}
