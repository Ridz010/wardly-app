"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { SendIcon, XIcon } from "lucide-react";

import { askDityAction } from "@/app/(site)/_chat/actions";
import Magnet from "@/components/Magnet";
import ShinyText from "@/components/ShinyText";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "cn";

// The teaser appears seconds after load; loading it lazily keeps GSAP out of every page's first bundle.
const TextType = dynamic(() => import("@/components/TextType"), { ssr: false });

type Turn = { role: "user" | "assistant"; content: string };

const GREETING: Turn = {
  role: "assistant",
  content:
    "Hai, aku Dity. Ceritakan apa yang membuatmu ragu. Pesanmu diproses oleh layanan AI pihak ketiga, jadi jangan tulis nomor, rekening, atau OTP ya.",
};

const SUGGESTIONS = [
  "Aku dapat SMS hadiah, harus bagaimana?",
  "Sudah terlanjur klik tautan, lalu apa?",
  "Cara cek penjual online aman atau tidak?",
];

const TEASERS = ["Dapat pesan hadiah yang mencurigakan?", "Sudah terlanjur klik tautan?", "Ragu sama penjual online?"];
const SEEN = "wardly:dity-teaser";

export function DityChat({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([GREETING]);
  const [draft, setDraft] = useState("");
  const [pending, startTransition] = useTransition();
  const bottom = useRef<HTMLDivElement>(null);
  const [teaser, setTeaser] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN) === "1";
    } catch {}
    if (seen) return;
    const timer = setTimeout(() => setTeaser(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  const dismissTeaser = () => {
    setTeaser(false);
    try {
      sessionStorage.setItem(SEEN, "1");
    } catch {}
  };

  useEffect(() => {
    const onOpen = () => {
      dismissTeaser();
      setOpen(true);
    };
    window.addEventListener("open-dity", onOpen);
    return () => window.removeEventListener("open-dity", onOpen);
  }, []);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns, pending]);

  const send = (text: string) => {
    const content = text.trim();
    if (!content || pending) return;

    const next = [...turns, { role: "user", content } as Turn];
    setTurns(next);
    setDraft("");

    startTransition(async () => {
      const history = next.filter((turn) => turn !== GREETING).slice(-10);
      const result = await askDityAction(history);
      const reply =
        result.status === "success" && result.data
          ? result.data.reply
          : result.status === "error"
            ? result.message
            : "Maaf, jawabannya belum sampai.";
      setTurns((current) => [...current, { role: "assistant", content: reply }]);
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <div className="fixed right-4 bottom-4 z-40 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6">
        {teaser && !open ? (
          <div
            role="status"
            className="relative max-w-[16rem] rounded-2xl rounded-br-md border border-border bg-background px-4 py-3 pr-9 text-sm shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            <TextType text={TEASERS} typingSpeed={38} pauseDuration={2200} deletingSpeed={18} loop={false} showCursor cursorCharacter="|" className="text-foreground" />
            <button
              type="button"
              onClick={dismissTeaser}
              aria-label="Tutup sapaan"
              className="absolute top-2 right-2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <XIcon className="size-3.5" />
            </button>
          </div>
        ) : null}
        <Magnet magnetStrength={4} padding={40}>
          <SheetTrigger
            onClick={dismissTeaser}
            render={
              <button
                type="button"
                className="group relative flex items-center gap-3 rounded-full bg-primary py-2 pr-6 pl-2 text-primary-foreground shadow-[0_10px_30px_-8px_rgba(21,138,176,0.6)] transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_-8px_rgba(21,138,176,0.75)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            }
          >
            <span className="relative">
              <Image src="/mascot/tertawa.png" alt="" width={96} height={76} className="size-12 rounded-full bg-white object-cover" />
              <span className="absolute -top-0.5 -right-0.5 flex size-3.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-aqua opacity-75" />
                <span className="relative inline-flex size-3.5 rounded-full border-2 border-primary bg-brand-aqua" />
              </span>
            </span>
            <span className="flex flex-col items-start leading-tight">
              <span className="text-base font-medium">Ragu? Tanya Dity</span>
              <span className="text-xs text-primary-foreground/80">Jawab cepat, tanpa ribet</span>
            </span>
          </SheetTrigger>
        </Magnet>
      </div>

      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border p-4">
          <div className="flex items-center gap-3">
            <Image src="/mascot/tertawa.png" alt="" width={96} height={76} className="size-11 rounded-full bg-white object-cover" />
            <div>
              <SheetTitle className="font-heading text-lg font-light">Dity</SheetTitle>
              <SheetDescription>Teman tenang saat kamu ragu.</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4" aria-live="polite">
          <div className="flex flex-col gap-3">
            {turns.map((turn, index) => (
              <div
                key={index}
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line",
                  turn.role === "user"
                    ? "self-end rounded-br-md bg-primary text-primary-foreground"
                    : "self-start rounded-bl-md bg-muted text-foreground",
                )}
              >
                {turn.content}
              </div>
            ))}
            {pending ? (
              <div className="flex items-center gap-2 self-start rounded-2xl rounded-bl-md bg-muted px-4 py-2.5 text-sm text-muted-foreground">
                <Spinner className="text-primary" />
                <ShinyText text="Dity sedang mengetik" speed={2} />
              </div>
            ) : null}
            <div ref={bottom} />
          </div>

          {turns.length === 1 ? (
            <div className="mt-4 flex flex-col gap-2">
              {SUGGESTIONS.map((text) => (
                <button
                  key={text}
                  type="button"
                  onClick={() => send(text)}
                  className="rounded-full border border-border px-4 py-2 text-left text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                >
                  {text}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            send(draft);
          }}
          className="flex items-center gap-2 border-t border-border p-4"
        >
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Tulis pertanyaanmu…"
            maxLength={800}
            aria-label="Pesan untuk Dity"
            className="h-10 rounded-full px-4"
          />
          <Button type="submit" size="icon-lg" disabled={pending || !draft.trim()} aria-label="Kirim" className="rounded-full">
            <SendIcon />
          </Button>
        </form>
        {!signedIn ? (
          <p className="border-t border-border bg-muted/50 px-4 py-2.5 text-center text-xs text-muted-foreground">
            Tamu bisa bertanya 4 kali per jam.{" "}
            <Link href="/sign-in" className="text-primary underline underline-offset-4">Masuk</Link> untuk lebih leluasa.
          </p>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
