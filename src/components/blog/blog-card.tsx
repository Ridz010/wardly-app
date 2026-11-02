import Link from "next/link";

import GlareHover from "@/components/GlareHover";
import { formatDate } from "@/lib/format";
import type { BlogCard as BlogCardData } from "@/lib/data/content";

export function CoverFallback({ title }: { title: string }) {
    return (
        <div
            aria-hidden="true"
            className="relative flex h-full w-full items-end overflow-hidden bg-[radial-gradient(120%_90%_at_20%_110%,#2fb6c9_0%,#158ab0_38%,#0b4a5c_78%)] p-5"
        >
            <span className="absolute -top-6 -right-2 font-heading text-[9rem] leading-none font-bold text-white/10 select-none">
                {title.charAt(0).toUpperCase()}
            </span>
            <span className="relative font-heading text-lg font-medium text-white/90">Ward-Ly</span>
        </div>
    );
}

export function BlogCard({ post }: { post: BlogCardData }) {
    const tag = post.tags?.[0];
    const meta = [tag, formatDate(post.published_at), `${post.minutes} menit baca`].filter(Boolean);

    return (
        <Link
            href={`/blog/${post.slug}`}
            className="group flex h-full flex-col gap-4 rounded-3xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
            <GlareHover
                width="100%"
                height="auto"
                borderRadius="1.25rem"
                glareColor="#ffffff"
                glareOpacity={0.45}
                variant="sheen"
                className="w-full"
            >
                <div className="aspect-4/3 w-full overflow-hidden bg-muted">
                    {post.cover_url ? (
                        <img
                            src={post.cover_url}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                    ) : (
                        <CoverFallback title={post.title} />
                    )}
                </div>
            </GlareHover>

            <div className="flex flex-col gap-2 px-1">
                <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                    {meta.map((item, index) => (
                        <span key={item} className="flex items-center gap-2">
                            {index > 0 ? <span aria-hidden="true" className="size-1 rounded-full bg-border" /> : null}
                            {item}
                        </span>
                    ))}
                </p>
                <h2 className="font-heading text-xl font-medium leading-snug tracking-tight text-foreground text-balance transition-colors duration-300 group-hover:text-primary">
                    {post.title}
                </h2>
                {post.excerpt ? <p className="line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p> : null}
            </div>
        </Link>
    );
}
