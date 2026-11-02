import type { Metadata } from "next";
import { Suspense } from "react";

import { SettingsForm } from "@/components/dashboard/settings-form";
import { PageHeader } from "@/components/shared/page-header";
import { PageLoader } from "@/components/shared/page-loader";
import { requireProfile } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Pengaturan" };

async function Settings() {
  const { user, profile } = await requireProfile("/dashboard/pengaturan");
  return <SettingsForm displayName={profile.display_name} saveHistory={profile.save_history} email={user.email} />;
}

export default function SettingsPage() {
  return (
    <>
      <PageHeader animate={false} title="Pengaturan" description="Atur profil dan cara Ward-Ly menyimpan datamu." />
      <Suspense fallback={<PageLoader />}>
        <Settings />
      </Suspense>
    </>
  );
}
