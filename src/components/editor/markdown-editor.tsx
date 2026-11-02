"use client";

import { useRef, useState, type ClipboardEvent, type DragEvent, type KeyboardEvent, type ReactNode } from "react";
import { motion } from "motion/react";
import {
    BoldIcon,
    Heading2Icon,
    Heading3Icon,
    ImagePlusIcon,
    ItalicIcon,
    LinkIcon,
    ListIcon,
    ListOrderedIcon,
    MinusIcon,
    QuoteIcon,
    UnderlineIcon,
} from "lucide-react";
import { toast } from "sonner";

import { useImageUpload } from "@/components/editor/use-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Markdown } from "@/lib/markdown";
import { cn } from "cn";

type Props = {
    name: string;
    id?: string;
    defaultValue?: string;
    maxLength?: number;
    rows?: number;
    placeholder?: string;
    invalid?: boolean;
    className?: string;
};

type Panel = "link" | "image" | null;

function Tool({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: ReactNode }) {
    return (
        <Tooltip>
            <TooltipTrigger
                render={
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={label}
                        disabled={disabled}
                        onClick={onClick}
                        className="rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                    />
                }
            >
                {children}
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
        </Tooltip>
    );
}

const Divider = () => <span aria-hidden="true" className="mx-1 h-5 w-px shrink-0 bg-border" />;

export function MarkdownEditor({
    name,
    id,
    defaultValue = "",
    maxLength = 40000,
    rows = 12,
    placeholder = "Mulai menulis. Pakai tombol di atas untuk judul, tebal, daftar, tautan, atau gambar.",
    invalid,
    className,
}: Props) {
    const [value, setValue] = useState(defaultValue);
    const [mode, setMode] = useState<"tulis" | "pratinjau">("tulis");
    const [panel, setPanel] = useState<Panel>(null);
    const [linkText, setLinkText] = useState("");
    const [linkUrl, setLinkUrl] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [imageAlt, setImageAlt] = useState("");
    const area = useRef<HTMLTextAreaElement>(null);
    const picker = useRef<HTMLInputElement>(null);
    const { upload, uploading } = useImageUpload();

    const read = () => {
        const el = area.current;
        const text = el?.value ?? value;
        return { text, start: el?.selectionStart ?? text.length, end: el?.selectionEnd ?? text.length };
    };

    const commit = (next: string, from: number, to: number) => {
        setValue(next.slice(0, maxLength));
        requestAnimationFrame(() => {
            const el = area.current;
            if (!el) return;
            el.focus();
            el.setSelectionRange(from, to);
        });
    };

    const wrap = (before: string, after: string, fallback: string) => {
        const { text, start, end } = read();
        const chosen = text.slice(start, end) || fallback;
        commit(text.slice(0, start) + before + chosen + after + text.slice(end), start + before.length, start + before.length + chosen.length);
    };

    const prefixLines = (prefix: (index: number) => string, strip: RegExp) => {
        const { text, start, end } = read();
        const lineStart = text.lastIndexOf("\n", start - 1) + 1;
        const nextBreak = text.indexOf("\n", end);
        const lineEnd = nextBreak === -1 ? text.length : nextBreak;
        const block = text.slice(lineStart, lineEnd) || "Teks";
        const joined = block
            .split("\n")
            .map((line, index) => prefix(index) + line.replace(strip, ""))
            .join("\n");
        commit(text.slice(0, lineStart) + joined + text.slice(lineEnd), lineStart, lineStart + joined.length);
    };

    const insertBlock = (snippet: string) => {
        const { text, start, end } = read();
        const before = text.slice(0, start).replace(/\n*$/, "");
        const after = text.slice(end).replace(/^\n*/, "");
        const lead = before ? "\n\n" : "";
        const tail = after ? "\n\n" : "\n";
        const next = before + lead + snippet + tail + after;
        const cursor = (before + lead + snippet + tail).length;
        commit(next, cursor, cursor);
    };

    const insertImage = (url: string, alt: string) => insertBlock(`![${alt.replace(/[\[\]]/g, "")}](${url})`);

    const send = async (file: File | undefined) => {
        if (!file) return;
        const url = await upload(file);
        if (url) {
            insertImage(url, file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
            toast.success("Gambar ditambahkan.");
            setPanel(null);
        }
    };

    const addLink = () => {
        if (!/^https?:\/\/\S+$/i.test(linkUrl.trim())) {
            toast.error("Tautan harus diawali http:// atau https://.");
            return;
        }
        const { text, start, end } = read();
        const label = linkText.trim() || text.slice(start, end) || linkUrl.trim();
        const snippet = `[${label}](${linkUrl.trim()})`;
        commit(text.slice(0, start) + snippet + text.slice(end), start + snippet.length, start + snippet.length);
        setLinkText("");
        setLinkUrl("");
        setPanel(null);
    };

    const addImageUrl = () => {
        if (!/^https:\/\/\S+$/i.test(imageUrl.trim())) {
            toast.error("URL gambar harus diawali https://.");
            return;
        }
        insertImage(imageUrl.trim(), imageAlt.trim() || "gambar");
        setImageUrl("");
        setImageAlt("");
        setPanel(null);
    };

    const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (!(event.ctrlKey || event.metaKey)) return;
        const key = event.key.toLowerCase();
        if (key === "b") {
            event.preventDefault();
            wrap("**", "**", "teks tebal");
        } else if (key === "i") {
            event.preventDefault();
            wrap("*", "*", "teks miring");
        } else if (key === "u") {
            event.preventDefault();
            wrap("__", "__", "teks bergaris bawah");
        } else if (key === "k") {
            event.preventDefault();
            setPanel("link");
        }
    };

    const onPaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
        const file = Array.from(event.clipboardData.files).find((item) => item.type.startsWith("image/"));
        if (!file) return;
        event.preventDefault();
        void send(file);
    };

    const onDrop = (event: DragEvent<HTMLTextAreaElement>) => {
        const file = Array.from(event.dataTransfer.files).find((item) => item.type.startsWith("image/"));
        if (!file) return;
        event.preventDefault();
        void send(file);
    };

    return (
        <TooltipProvider>
            <div
                className={cn(
                    "flex flex-col overflow-hidden rounded-2xl border border-input bg-card transition-[border-color,box-shadow] duration-300 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30",
                    invalid && "border-destructive focus-within:ring-destructive/20",
                    className,
                )}
            >
                <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/40 px-2 py-1.5">
                    <div role="toolbar" aria-label="Format teks" className="flex min-w-0 items-center gap-0.5 overflow-x-auto">
                        <Tool label="Judul (H2)" onClick={() => prefixLines(() => "## ", /^#{1,3}\s+/)}><Heading2Icon /></Tool>
                        <Tool label="Subjudul (H3)" onClick={() => prefixLines(() => "### ", /^#{1,3}\s+/)}><Heading3Icon /></Tool>
                        <Divider />
                        <Tool label="Tebal (Ctrl+B)" onClick={() => wrap("**", "**", "teks tebal")}><BoldIcon /></Tool>
                        <Tool label="Miring (Ctrl+I)" onClick={() => wrap("*", "*", "teks miring")}><ItalicIcon /></Tool>
                        <Tool label="Garis bawah (Ctrl+U)" onClick={() => wrap("__", "__", "teks bergaris bawah")}><UnderlineIcon /></Tool>
                        <Divider />
                        <Tool label="Daftar poin" onClick={() => prefixLines(() => "- ", /^([-*]|\d+\.)\s+/)}><ListIcon /></Tool>
                        <Tool label="Daftar bernomor" onClick={() => prefixLines((i) => `${i + 1}. `, /^([-*]|\d+\.)\s+/)}><ListOrderedIcon /></Tool>
                        <Tool label="Kutipan" onClick={() => prefixLines(() => "> ", /^>\s?/)}><QuoteIcon /></Tool>
                        <Tool label="Garis pemisah" onClick={() => insertBlock("---")}><MinusIcon /></Tool>
                        <Divider />
                        <Tool label="Tautan (Ctrl+K)" onClick={() => setPanel(panel === "link" ? null : "link")}><LinkIcon /></Tool>
                        <Tool label="Gambar" onClick={() => setPanel(panel === "image" ? null : "image")} disabled={uploading}>
                            {uploading ? <Spinner /> : <ImagePlusIcon />}
                        </Tool>
                    </div>

                    <div role="tablist" aria-label="Mode editor" className="relative flex shrink-0 rounded-full bg-muted p-0.5 text-xs">
                        {(["tulis", "pratinjau"] as const).map((item) => (
                            <button
                                key={item}
                                type="button"
                                role="tab"
                                aria-selected={mode === item}
                                onClick={() => setMode(item)}
                                className={cn(
                                    "relative rounded-full px-3 py-1 capitalize transition-colors duration-200",
                                    mode === item ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                                )}
                            >
                                {mode === item ? (
                                    <motion.span
                                        layoutId={`editor-mode-${name}`}
                                        className="absolute inset-0 rounded-full bg-primary"
                                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                                    />
                                ) : null}
                                <span className="relative">{item}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {panel === "link" ? (
                    <div className="flex flex-col gap-2 border-b border-border bg-primary/5 p-3 sm:flex-row sm:items-center">
                        <Input value={linkText} onChange={(event) => setLinkText(event.target.value)} placeholder="Teks tautan (opsional)" aria-label="Teks tautan" className="h-9 rounded-full sm:max-w-48" />
                        <Input value={linkUrl} onChange={(event) => setLinkUrl(event.target.value)} placeholder="https://contoh.co.id" aria-label="Alamat tautan" inputMode="url" className="h-9 rounded-full" />
                        <div className="flex gap-2">
                            <Button type="button" size="sm" className="h-9 rounded-full px-4" onClick={addLink}>Sisipkan</Button>
                            <Button type="button" size="sm" variant="ghost" className="h-9 rounded-full px-3" onClick={() => setPanel(null)}>Batal</Button>
                        </div>
                    </div>
                ) : null}

                {panel === "image" ? (
                    <div className="flex flex-col gap-3 border-b border-border bg-primary/5 p-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <Button type="button" size="sm" className="h-9 gap-2 rounded-full px-4" disabled={uploading} onClick={() => picker.current?.click()}>
                                {uploading ? <Spinner /> : <ImagePlusIcon />}
                                Unggah dari perangkat
                            </Button>
                            <span className="text-xs text-muted-foreground">PNG, JPG, WebP, GIF. Maks. 4 MB. Bisa juga tempel atau seret gambar ke kolom tulis.</span>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <Input value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="Atau tempel URL gambar (https://…)" aria-label="URL gambar" inputMode="url" className="h-9 rounded-full" />
                            <Input value={imageAlt} onChange={(event) => setImageAlt(event.target.value)} placeholder="Keterangan gambar" aria-label="Keterangan gambar" className="h-9 rounded-full sm:max-w-52" />
                            <div className="flex gap-2">
                                <Button type="button" size="sm" variant="outline" className="h-9 rounded-full px-4" onClick={addImageUrl}>Sisipkan</Button>
                                <Button type="button" size="sm" variant="ghost" className="h-9 rounded-full px-3" onClick={() => setPanel(null)}>Tutup</Button>
                            </div>
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
                ) : null}

                <textarea
                    ref={area}
                    id={id}
                    name={name}
                    value={value}
                    rows={rows}
                    maxLength={maxLength}
                    placeholder={placeholder}
                    aria-invalid={invalid}
                    onChange={(event) => setValue(event.target.value)}
                    onKeyDown={onKeyDown}
                    onPaste={onPaste}
                    onDrop={onDrop}
                    onDragOver={(event) => event.preventDefault()}
                    className={cn(
                        "min-h-56 w-full resize-y bg-transparent px-4 py-3 text-base leading-relaxed outline-none placeholder:text-muted-foreground md:text-sm",
                        mode === "pratinjau" && "hidden",
                    )}
                />

                {mode === "pratinjau" ? (
                    <div className="min-h-56 px-4 py-4">
                        {value.trim() ? (
                            <Markdown source={value} />
                        ) : (
                            <p className="text-sm text-muted-foreground">Belum ada isi untuk dipratinjau.</p>
                        )}
                    </div>
                ) : null}

                <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/30 px-4 py-1.5 text-xs text-muted-foreground">
                    <span>Teks tebal, judul, daftar, tautan, dan gambar didukung.</span>
                    <span className="tabular-nums">{value.length}/{maxLength}</span>
                </div>
            </div>
        </TooltipProvider>
    );
}
