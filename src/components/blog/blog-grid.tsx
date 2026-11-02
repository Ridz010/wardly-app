"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { BlogCard } from "@/components/blog/blog-card";
import { EmptyState } from "@/components/shared/empty-state";
import type { BlogCard as BlogCardData } from "@/lib/data/content";
import { cn } from "cn";

export function FilterPills({
    options,
    value,
    onChange,
    id,
}: {
    options: { value: string; label: string; count?: number }[];
    value: string;
    onChange: (value: string) => void;
    id: string;
}) {
    return (
        <div role="tablist" className="flex flex-wrap gap-2">
            {options.map((option) => {
                const active = option.value === value;
                return (
                    <button
                        key={option.value}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => onChange(option.value)}
                        className={cn(
                            "relative rounded-full border px-4 py-1.5 text-sm transition-colors duration-300 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                            active
                                ? "border-transparent text-primary-foreground"
                                : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground",
                        )}
                    >
                        {active ? (
                            <motion.span
                                layoutId={`pill-${id}`}
                                className="absolute inset-0 rounded-full bg-primary"
                                transition={{ type: "spring", stiffness: 420, damping: 34 }}
                            />
                        ) : null}
                        <span className="relative">{option.label}</span>
                    </button>
                );
            })}
        </div>
    );
}

export function BlogGrid({ posts }: { posts: BlogCardData[] }) {
    const [tag, setTag] = useState("semua");

    const options = useMemo(() => {
        const tags = [...new Set(posts.flatMap((post) => post.tags ?? []))];
        return [{ value: "semua", label: "Semua" }, ...tags.map((item) => ({ value: item, label: item }))];
    }, [posts]);

    const visible = tag === "semua" ? posts : posts.filter((post) => post.tags?.includes(tag));

    return (
        <div className="flex flex-col gap-8">
            {options.length > 1 ? <FilterPills id="blog" options={options} value={tag} onChange={setTag} /> : null}

            {visible.length ? (
                <motion.div layout className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                    <AnimatePresence mode="popLayout" initial={false}>
                        {visible.map((post, index) => (
                            <motion.div
                                key={post.id}
                                layout
                                initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
                                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                exit={{ opacity: 0, scale: 0.96 }}
                                transition={{ duration: 0.45, delay: Math.min(index, 6) * 0.05, ease: [0.33, 1, 0.68, 1] }}
                            >
                                <BlogCard post={post} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            ) : (
                <EmptyState title="Belum ada artikel di topik ini" description="Coba pilih topik lain." />
            )}
        </div>
    );
}
