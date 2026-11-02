import type { Metadata } from "next";
import { Suspense } from "react";

import { RoleSelect } from "@/components/admin/role-select";
import { PageHeader } from "@/components/shared/page-header";
import { PageLoader } from "@/components/shared/page-loader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireRole } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Pengguna" };

async function Users() {
  const { user } = await requireRole("admin", "/admin/pengguna");
  const { data } = await createAdminClient()
    .from("profiles")
    .select("id,display_name,role,xp,level,streak_count,created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama</TableHead>
            <TableHead className="text-right">XP</TableHead>
            <TableHead className="text-right">Level</TableHead>
            <TableHead>Bergabung</TableHead>
            <TableHead className="w-48">Peran</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((profile) => (
            <TableRow key={profile.id}>
              <TableCell>{profile.display_name}</TableCell>
              <TableCell className="text-right tabular-nums">{profile.xp}</TableCell>
              <TableCell className="text-right tabular-nums">{profile.level}</TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {new Date(profile.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
              </TableCell>
              <TableCell>
                <RoleSelect id={profile.id} role={profile.role} self={profile.id === user.id} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function UsersPage() {
  return (
    <>
      <PageHeader animate={false} title="Pengguna" description="Atur peran akses. Peranmu sendiri tidak bisa diubah dari sini." />
      <Suspense fallback={<PageLoader />}>
        <Users />
      </Suspense>
    </>
  );
}
