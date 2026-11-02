import type { Metadata } from "next";
import { HistoryIcon } from "lucide-react";
import { Suspense } from "react";

import { DeleteHistoryButton } from "@/components/dashboard/delete-history-button";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { PageLoader } from "@/components/shared/page-loader";
import { RiskBadge } from "@/components/shared/risk-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Riwayat" };

async function History() {
  const user = await requireUser("/dashboard/riwayat");
  const supabase = await createClient();
  const { data } = await supabase
    .from("analyses")
    .select("id,risk_level,risk_score,input_excerpt,category_slug,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (!data?.length) {
    return (
      <EmptyState
        icon={<HistoryIcon />}
        title="Riwayat masih kosong"
        description="Pemeriksaan disimpan jika kamu mengaktifkannya di pengaturan."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cuplikan</TableHead>
            <TableHead>Tingkat</TableHead>
            <TableHead className="text-right">Skor</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="max-w-xs truncate text-muted-foreground">{row.input_excerpt ?? "—"}</TableCell>
              <TableCell><RiskBadge level={row.risk_level} /></TableCell>
              <TableCell className="text-right tabular-nums">{row.risk_score}</TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {new Date(row.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
              </TableCell>
              <TableCell><DeleteHistoryButton id={row.id} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function HistoryPage() {
  return (
    <>
      <PageHeader animate={false} title="Riwayat pemeriksaan" description="Cuplikan sudah disamarkan dari data pribadi." />
      <Suspense fallback={<PageLoader />}>
        <History />
      </Suspense>
    </>
  );
}
