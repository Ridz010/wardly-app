"use client";

import { useEffect } from "react";

import { ErrorView } from "@/components/shared/error-view";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorView
      code="500"
      title="Ada yang tidak berjalan semestinya"
      description="Halaman ini gagal dimuat. Coba muat ulang, dan kalau masih terjadi, kabari kami."
      digest={error.digest}
    >
      <Button onClick={reset} size="lg" className="h-10 rounded-full px-5 font-normal">
        Coba lagi
      </Button>
    </ErrorView>
  );
}
