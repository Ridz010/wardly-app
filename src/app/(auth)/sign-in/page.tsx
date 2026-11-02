import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { GoogleButton } from "@/components/auth/google-button";
import { SignInForm } from "@/components/auth/sign-in-form";
import { PageLoader } from "@/components/shared/page-loader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FieldSeparator } from "@/components/ui/field";
import { safeNext } from "@/lib/auth/safe-redirect";

export const metadata: Metadata = { title: "Masuk" };

const ERRORS: Record<string, string> = {
  auth: "Tautan masuk tidak valid atau sudah kedaluwarsa.",
  oauth: "Masuk dengan Google belum berhasil. Coba lagi.",
};

async function SignInContent({ searchParams }: { searchParams: PageProps<"/sign-in">["searchParams"] }) {
  const params = await searchParams;
  const next = safeNext(typeof params.next === "string" ? params.next : null);
  const error = typeof params.error === "string" ? ERRORS[params.error] : undefined;

  return (
    <AuthShell title="Selamat datang" description="Masuk ke akun Ward-Ly untuk menyimpan riwayat dan progres belajarmu.">
      <div className="flex flex-col gap-4">
        {error ? (
          <Alert variant="destructive">
            <AlertDescription className="text-destructive">{error}</AlertDescription>
          </Alert>
        ) : null}
        <SignInForm next={next} />
        <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
          Atau lanjut dengan
        </FieldSeparator>
        <GoogleButton next={next} label="Masuk dengan Google" />
        <p className="text-center text-sm text-muted-foreground">
          Masih ingin lihat-lihat dulu?{" "}
          <Link href="/" className="text-foreground underline underline-offset-4">
            Kembali ke beranda
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}

export default function SignInPage(props: PageProps<"/sign-in">) {
  return (
    <Suspense fallback={<PageLoader />}>
      <SignInContent searchParams={props.searchParams} />
    </Suspense>
  );
}
