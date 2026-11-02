import { connection } from "next/server";
import { Suspense } from "react";

import { DashboardShell } from "@/components/dashboard/shell";
import { ADMIN_NAV, MODERATOR_PATHS, type NavGroup } from "@/components/dashboard/nav";
import { PageLoader } from "@/components/shared/page-loader";
import { requireRole } from "@/lib/auth/session";

async function Shell({ children }: { children: React.ReactNode }) {
  await connection();
  const { user, profile } = await requireRole("moderator", "/admin");

  const groups: NavGroup[] =
    profile.role === "admin"
      ? ADMIN_NAV
      : ADMIN_NAV.map((group) => ({
          ...group,
          items: group.items.filter((item) => MODERATOR_PATHS.includes(item.href)),
        })).filter((group) => group.items.length);

  return (
    <DashboardShell
      groups={groups}
      shortcuts={[
        { title: "Dashboard saya", href: "/dashboard", icon: "overview", exact: true },
        { title: "Beranda situs", href: "/", icon: "site" },
      ]}
      user={user}
      profile={profile}
      fallbackTitle="Admin"
    >
      {children}
    </DashboardShell>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<PageLoader className="min-h-svh" />}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}
