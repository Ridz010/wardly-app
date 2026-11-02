"use client";

import { useActionState, useEffect, useTransition } from "react";
import { CheckIcon, FlagIcon, InboxIcon, XIcon } from "lucide-react";
import { toast } from "sonner";

import { dismissReportAction, moderateAction } from "@/app/admin/actions";
import { EmptyState } from "@/components/shared/empty-state";
import { SubmitButton } from "@/components/shared/submit-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { idle } from "@/lib/result";

export type PendingPost = { id: string; title: string; body: string; kind: string; createdAt: string; author: string };
export type ReportItem = { id: string; reason: string; createdAt: string; postId: string | null; postTitle: string; postStatus: string };

const date = (value: string) =>
  new Date(value).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

function Decision({ id, status, label, tone }: { id: string; status: "published" | "rejected"; label: string; tone?: "destructive" }) {
  const [state, action] = useActionState(moderateAction, idle);

  useEffect(() => {
    if (state.status === "success") toast.success(state.message ?? "Selesai.");
    if (state.status === "error") toast.error(state.message);
  }, [state]);

  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      {status === "rejected" ? <Input name="note" placeholder="Catatan (opsional)" maxLength={300} className="h-9 w-48" aria-label="Catatan moderasi" /> : null}
      <SubmitButton variant={tone === "destructive" ? "destructive" : "default"} size="sm" className="h-9 gap-1.5 px-4">
        {status === "published" ? <CheckIcon /> : <XIcon />}
        {label}
      </SubmitButton>
    </form>
  );
}

function DismissButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      className="h-8 rounded-full font-light"
      onClick={() =>
        startTransition(async () => {
          const result = await dismissReportAction(id);
          if (result.status === "error") toast.error(result.message);
          else toast.success(result.message ?? "Laporan ditutup.");
        })
      }
    >
      {pending ? <Spinner /> : null}
      Tutup laporan
    </Button>
  );
}

export function ModerationQueue({ posts, reports }: { posts: PendingPost[]; reports: ReportItem[] }) {
  return (
    <Tabs defaultValue="kiriman">
      <TabsList>
        <TabsTrigger value="kiriman">Kiriman · {posts.length}</TabsTrigger>
        <TabsTrigger value="laporan">Laporan · {reports.length}</TabsTrigger>
      </TabsList>

      <TabsContent value="kiriman" className="flex flex-col gap-4 pt-4">
        {posts.length ? (
          posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="flex flex-col gap-4 p-5">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary" className="rounded-full font-normal capitalize">{post.kind}</Badge>
                  <span>{post.author}</span>
                  <span>·</span>
                  <span>{date(post.createdAt)}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <h2 className="font-heading text-lg font-light">{post.title}</h2>
                  <p className="whitespace-pre-line text-sm text-muted-foreground">{post.body}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Decision id={post.id} status="published" label="Terbitkan" />
                  <Decision id={post.id} status="rejected" label="Tolak" tone="destructive" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <EmptyState icon={<InboxIcon />} title="Antrean kosong" description="Tidak ada kiriman yang menunggu tinjauan." />
        )}
      </TabsContent>

      <TabsContent value="laporan" className="flex flex-col gap-3 pt-4">
        {reports.length ? (
          reports.map((report) => (
            <Card key={report.id}>
              <CardContent className="flex flex-wrap items-start justify-between gap-4 p-5">
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="flex items-center gap-2 text-sm font-normal">
                    <FlagIcon className="size-4 text-destructive" />
                    {report.postTitle}
                  </span>
                  <p className="text-sm text-muted-foreground">{report.reason}</p>
                  <span className="text-xs text-muted-foreground">
                    {date(report.createdAt)} · status kiriman: {report.postStatus}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {report.postId && report.postStatus === "published" ? (
                    <Decision id={report.postId} status="rejected" label="Turunkan" tone="destructive" />
                  ) : null}
                  <DismissButton id={report.id} />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <EmptyState icon={<InboxIcon />} title="Tidak ada laporan" description="Semua laporan sudah ditangani." />
        )}
      </TabsContent>
    </Tabs>
  );
}
