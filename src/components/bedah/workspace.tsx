"use client";

import { useState } from "react";
import { FiCheckSquare, FiImage, FiLink, FiType } from "react-icons/fi";

import AnimatedContent from "@/components/AnimatedContent";
import GlassIcons from "@/components/GlassIcons";
import { DityTips } from "@/components/bedah/dity-tips";
import { ImagePanel } from "@/components/bedah/image-panel";
import { LinkPanel } from "@/components/bedah/link-panel";
import { ProfilePanel } from "@/components/bedah/profile-panel";
import { ScanProvider } from "@/components/bedah/scan-context";
import { TextPanel } from "@/components/bedah/text-panel";
import type { QuotaInfo } from "@/lib/services/scan-guard";
import { cn } from "cn";

const MODES = [
  { id: "teks", label: "Teks", hint: "Pesan SMS, WA, email", icon: <FiType size={20} />, color: "linear-gradient(135deg, #78dcb8, #258883)" },
  { id: "tautan", label: "Tautan", hint: "Link yang dikirim", icon: <FiLink size={20} />, color: "linear-gradient(135deg, #2fb6c9, #0b4a5c)" },
  { id: "screenshot", label: "Screenshot", hint: "Gambar percakapan", icon: <FiImage size={20} />, color: "linear-gradient(135deg, #5df2e7, #158ab0)" },
  { id: "profil", label: "Profil", hint: "Cek tanda akun palsu", icon: <FiCheckSquare size={20} />, color: "linear-gradient(135deg, #7fd6c8, #0b4a5c)" },
] as const;

type Mode = (typeof MODES)[number]["id"];

export function Workspace({ signedIn, quota }: { signedIn: boolean; quota: QuotaInfo | null }) {
  const [mode, setMode] = useState<Mode>("teks");

  return (
    <ScanProvider signedIn={signedIn} initialQuota={quota}>
    <div className="flex flex-col gap-8">
      <div role="tablist" aria-label="Jenis input" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {MODES.map((item) => {
          const active = mode === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setMode(item.id)}
              className={cn(
                "flex items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                active ? "border-primary bg-primary/5 shadow-sm" : "hover:border-primary/40",
              )}
            >
              <GlassIcons
                items={[{ icon: item.icon, label: item.label, color: item.color }]}
                size={44}
                gap={0}
                columns={1}
                plate="tilt"
                tilt={18}
                spread={0.4}
                hover="press"
                labels="none"
                iconColor="#ffffff"
                theme="light"
                intro={false}
              />
              <span className="flex min-w-0 flex-col">
                <span className={cn("text-sm", active ? "font-normal text-foreground" : "text-foreground/80")}>{item.label}</span>
                <span className="truncate text-xs text-muted-foreground">{item.hint}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <AnimatedContent key={mode} distance={20} duration={0.5} trigger="mount">
          {mode === "teks" ? <TextPanel /> : null}
          {mode === "tautan" ? <LinkPanel /> : null}
          {mode === "screenshot" ? <ImagePanel /> : null}
          {mode === "profil" ? <ProfilePanel /> : null}
        </AnimatedContent>
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <DityTips mode={mode} />
        </aside>
      </div>
    </div>
    </ScanProvider>
  );
}
