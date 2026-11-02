"use client";

import { useState } from "react";
import { CheckIcon, Link2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function CopyLink({ label = "Salin tautan" }: { label?: string }) {
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            toast.success("Tautan disalin.");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Tautan belum bisa disalin.");
        }
    };

    return (
        <Button type="button" variant="outline" onClick={copy} className="h-9 gap-2 rounded-full px-4 font-normal">
            {copied ? <CheckIcon /> : <Link2Icon />}
            {copied ? "Tersalin" : label}
        </Button>
    );
}
