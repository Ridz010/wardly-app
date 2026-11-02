"use client";

import { useRef, useState } from "react";
import { ImagePlusIcon, XIcon } from "lucide-react";

import { useImageUpload } from "@/components/editor/use-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "cn";

type Props = {
    name: string;
    id?: string;
    defaultValue?: string;
    invalid?: boolean;
};

export function ImageField({ name, id, defaultValue = "", invalid }: Props) {
    const [url, setUrl] = useState(defaultValue);
    const [over, setOver] = useState(false);
    const picker = useRef<HTMLInputElement>(null);
    const { upload, uploading } = useImageUpload();

    const send = async (file: File | undefined) => {
        if (!file) return;
        const next = await upload(file);
        if (next) setUrl(next);
    };

    return (
        <div className="flex flex-col gap-3">
            <div
                onDragOver={(event) => {
                    event.preventDefault();
                    setOver(true);
                }}
                onDragLeave={() => setOver(false)}
                onDrop={(event) => {
                    event.preventDefault();
                    setOver(false);
                    void send(event.dataTransfer.files[0]);
                }}
                className={cn(
                    "relative flex min-h-40 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-muted/40 transition-colors duration-300",
                    over && "border-primary bg-primary/5",
                    invalid && "border-destructive",
                )}
            >
                {url ? (
                    <>
                        <img src={url} alt="Pratinjau sampul" className="h-48 w-full object-cover" />
                        <Button
                            type="button"
                            size="icon-sm"
                            variant="secondary"
                            aria-label="Hapus gambar"
                            onClick={() => setUrl("")}
                            className="absolute right-3 top-3 rounded-full"
                        >
                            <XIcon />
                        </Button>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-2 px-6 py-8 text-center">
                        <span className="flex size-10 items-center justify-center rounded-full bg-background text-primary">
                            {uploading ? <Spinner /> : <ImagePlusIcon className="size-5" />}
                        </span>
                        <p className="text-sm text-muted-foreground">Seret gambar ke sini atau unggah dari perangkat.</p>
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
                <Button type="button" variant="outline" className="h-9 gap-2 rounded-full px-4" disabled={uploading} onClick={() => picker.current?.click()}>
                    {uploading ? <Spinner /> : <ImagePlusIcon />}
                    {url ? "Ganti gambar" : "Unggah gambar"}
                </Button>
                <Input
                    id={id}
                    name={name}
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                    placeholder="atau tempel URL gambar (https://…)"
                    inputMode="url"
                    aria-invalid={invalid}
                    className="h-9 rounded-full"
                />
            </div>
            <input
                ref={picker}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="sr-only"
                tabIndex={-1}
                onChange={(event) => {
                    void send(event.target.files?.[0]);
                    event.target.value = "";
                }}
            />
        </div>
    );
}
