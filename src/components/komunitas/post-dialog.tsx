"use client";

import { useActionState, useEffect, useState } from "react";
import { FlagIcon } from "lucide-react";
import { toast } from "sonner";

import { reportPostAction } from "@/app/(site)/komunitas/actions";
import { HelpfulButton } from "@/components/komunitas/helpful-button";
import { kindOf } from "@/components/komunitas/kind";
import { FormFeedback, fieldError } from "@/components/shared/form-feedback";
import { SubmitButton } from "@/components/shared/submit-button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { CommunityCard } from "@/lib/data/content";
import { formatDate, initials } from "@/lib/format";
import { Markdown } from "@/lib/markdown";
import { idle } from "@/lib/result";

type Props = {
    post: CommunityCard | null;
    on: boolean;
    count: number;
    signedIn: boolean;
    onToggle: () => void;
    onClose: () => void;
};

function ReportForm({ postId, onDone }: { postId: string; onDone: () => void }) {
    const [state, action] = useActionState(reportPostAction, idle);
    const reason = fieldError(state, "reason");

    useEffect(() => {
        if (state.status === "success") {
            toast.success(state.message ?? "Laporan terkirim.");
            onDone();
        }
    }, [state, onDone]);

    return (
        <form action={action} className="flex flex-col gap-3 rounded-2xl bg-muted p-4" noValidate>
            <input type="hidden" name="post_id" value={postId} />
            <label htmlFor="report-reason" className="text-sm text-foreground">Kenapa kiriman ini bermasalah?</label>
            <Textarea id="report-reason" name="reason" rows={3} maxLength={400} placeholder="Contoh: memuat nomor rekening atau data pribadi" aria-invalid={Boolean(reason)} className="rounded-xl bg-background font-light" required />
            {reason ? <p className="text-sm text-destructive">{reason}</p> : null}
            {state.status === "error" && !reason ? <FormFeedback state={state} /> : null}
            <SubmitButton pendingLabel="Mengirim" className="h-9 w-fit rounded-full px-5">Kirim laporan</SubmitButton>
        </form>
    );
}

export function PostDialog({ post, on, count, signedIn, onToggle, onClose }: Props) {
    const [reporting, setReporting] = useState(false);
    const kind = post ? kindOf(post.kind) : null;

    return (
        <Dialog
            open={Boolean(post)}
            onOpenChange={(open) => {
                if (!open) {
                    setReporting(false);
                    onClose();
                }
            }}
        >
            <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
                {post && kind ? (
                    <>
                        <DialogHeader className="gap-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="secondary" className="gap-1.5 rounded-full font-normal">
                                    <span className={`size-1.5 rounded-full ${kind.dot}`} aria-hidden="true" />
                                    {kind.label}
                                </Badge>
                                {post.category ? <Badge variant="outline" className="rounded-full font-normal">{post.category.name}</Badge> : null}
                            </div>
                            <DialogTitle className="font-heading text-2xl leading-tight font-medium tracking-tight text-balance">{post.title}</DialogTitle>
                            <DialogDescription className="flex items-center gap-2.5">
                                <Avatar className="size-7">
                                    <AvatarFallback className="bg-primary/10 text-[0.65rem] text-primary">{initials(post.author)}</AvatarFallback>
                                </Avatar>
                                {post.author} · {formatDate(post.created_at, "long")}
                            </DialogDescription>
                        </DialogHeader>

                        <Markdown source={post.body} className="flex flex-col gap-4 text-base leading-relaxed text-foreground/80" />

                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                            <HelpfulButton on={on} count={count} onToggle={onToggle} />
                            {signedIn ? (
                                <Button type="button" variant="ghost" size="sm" onClick={() => setReporting((value) => !value)} className="gap-1.5 rounded-full font-normal text-muted-foreground">
                                    <FlagIcon />
                                    Laporkan
                                </Button>
                            ) : null}
                        </div>

                        {reporting ? <ReportForm postId={post.id} onDone={() => setReporting(false)} /> : null}
                    </>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}
