import { connection } from "next/server";
import { Suspense } from "react";

import { DashboardShell } from "@/components/dashboard/shell";
import { ADMIN_NAV, USER_NAV, type NavItem } from "@/components/dashboard/nav";
import { PageLoader } from "@/components/shared/page-loader";
import { hasRole, requireProfile } from "@/lib/auth/session";

async function Shell({ children }: { children: React.ReactNode }) {
  await connection();
  const { user, profile } = await requireProfile("/dashboard");
  const shortcuts: NavItem[] = [{ title: "Beranda situs", href: "/", icon: "site" }];
  if (hasRole(profile.role, "moderator")) {
    shortcuts.unshift({ title: "Panel admin", href: ADMIN_NAV[0].items[0].href, icon: "admin", exact: true });
  }

  return (
    <DashboardShell groups={USER_NAV} shortcuts={shortcuts} user={user} profile={profile} fallbackTitle="Dashboard">
      {children}
    </DashboardShell>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<PageLoader className="min-h-svh" />}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}
