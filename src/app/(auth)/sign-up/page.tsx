import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { GoogleButton } from "@/components/auth/google-button";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { PageLoader } from "@/components/shared/page-loader";
import { FieldSeparator } from "@/components/ui/field";
import { safeNext } from "@/lib/auth/safe-redirect";

export const metadata: Metadata = { title: "Daftar" };

async function SignUpContent({ searchParams }: { searchParams: PageProps<"/sign-up">["searchParams"] }) {
  const params = await searchParams;
  const next = safeNext(typeof params.next === "string" ? params.next : null);

  return (
    <AuthShell title="Buat akun baru" description="Gratis. Dapat 5 pemeriksaan per hari, simpan riwayat, dan kumpulkan XP dari latihan skenario.">
      <div className="flex flex-col gap-4">
        <SignUpForm next={next} />
        <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
          Atau daftar dengan
        </FieldSeparator>
        <GoogleButton next={next} label="Daftar dengan Google" />
      </div>
    </AuthShell>
  );
}

export default function SignUpPage(props: PageProps<"/sign-up">) {
  return (
    <Suspense fallback={<PageLoader />}>
      <SignUpContent searchParams={props.searchParams} />
    </Suspense>
  );
}
