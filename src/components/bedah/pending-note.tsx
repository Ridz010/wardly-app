"use client";

import { useFormStatus } from "react-dom";

import ShinyText from "@/components/ShinyText";
import { Spinner } from "@/components/ui/spinner";

export function PendingNote({ label }: { label: string }) {
  const { pending } = useFormStatus();
  if (!pending) return null;

  return (
    <p className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
      <Spinner className="text-primary" />
      <ShinyText text={label} speed={2.4} />
    </p>
  );
}
