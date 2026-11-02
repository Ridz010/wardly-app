"use client";

import { useTransition } from "react";
import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { deleteAnalysisAction } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function DeleteHistoryButton({ id }: { id: string }) {
    const [pending, startTransition] = useTransition();

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Hapus dari riwayat"
            disabled={pending}
            onClick={() =>
                startTransition(async () => {
                    const result = await deleteAnalysisAction(id);
                    if (result.status === "error") toast.error(result.message);
                    else toast.success("Dihapus dari riwayat.");
                })
            }
        >
            {pending ? <Spinner /> : <Trash2Icon />}
        </Button>
    );
}
