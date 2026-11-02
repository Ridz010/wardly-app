"use client";

import { useState } from "react";
import { toast } from "sonner";

export function useImageUpload() {
    const [uploading, setUploading] = useState(false);

    const upload = async (file: File): Promise<string | null> => {
        if (!file.type.startsWith("image/")) {
            toast.error("Berkas harus berupa gambar.");
            return null;
        }
        setUploading(true);
        try {
            const body = new FormData();
            body.append("file", file);
            const response = await fetch("/api/upload", { method: "POST", body });
            const json = (await response.json().catch(() => null)) as { url?: string; error?: string } | null;
            if (!response.ok || !json?.url) {
                throw new Error(json?.error ?? "Gambar belum bisa diunggah.");
            }
            return json.url;
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Gambar belum bisa diunggah.");
            return null;
        } finally {
            setUploading(false);
        }
    };

    return { upload, uploading };
}
