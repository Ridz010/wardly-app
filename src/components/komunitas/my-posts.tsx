import { CheckCircle2Icon, ClockIcon, XCircleIcon } from "lucide-react";

import AnimatedContent from "@/components/AnimatedContent";
import { kindOf } from "@/components/komunitas/kind";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";

export type MyPost = {
    id: string;
    title: string;
    kind: string;
    status: "draft" | "pending" | "published" | "rejected";
    created_at: string;
    moderation_note: string | null;
};

const STATUS = {
    pending: { label: "Menunggu tinjauan", icon: ClockIcon, tone: "bg-amber-500/15 text-amber-700" },
    rejected: { label: "Ditolak", icon: XCircleIcon, tone: "bg-destructive/10 text-destructive" },
    draft: { label: "Draf", icon: ClockIcon, tone: "bg-muted text-muted-foreground" },
    published: { label: "Terbit", icon: CheckCircle2Icon, tone: "bg-primary/10 text-primary" },
} as const;

export function MyPosts({ posts }: { posts: MyPost[] }) {
    if (!posts.length) return null;

    return (
        <AnimatedContent distance={20} duration={0.6}>
            <section className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6" aria-labelledby="my-posts">
                <div className="flex flex-col gap-1">
                    <h2 id="my-posts" className="font-heading text-xl font-medium tracking-tight">Kiriman kamu</h2>
                    <p className="text-sm text-muted-foreground">
                        Cerita yang belum terbit tampil di sini. Setelah disetujui moderator, ceritamu muncul di feed untuk semua orang.
                    </p>
                </div>
                <ul className="flex flex-col divide-y divide-border">
                    {posts.map((post) => {
                        const status = STATUS[post.status];
                        const Icon = status.icon;
                        return (
                            <li key={post.id} className="flex flex-col gap-1.5 py-3 first:pt-0 last:pb-0">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="text-foreground">{post.title}</span>
                                    <Badge variant="secondary" className={`gap-1.5 rounded-full font-normal ${status.tone}`}>
                                        <Icon className="size-3.5" />
                                        {status.label}
                                    </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {kindOf(post.kind).label} · dikirim {formatDate(post.created_at)}
                                </p>
                                {post.status === "rejected" && post.moderation_note ? (
                                    <p className="rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground">Catatan moderator: {post.moderation_note}</p>
                                ) : null}
                            </li>
                        );
                    })}
                </ul>
            </section>
        </AnimatedContent>
    );
}
