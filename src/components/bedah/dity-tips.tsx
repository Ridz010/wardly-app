"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import BlurText from "@/components/BlurText";
import SpotlightCard from "@/components/SpotlightCard";

const TIPS: Record<string, string[]> = {
  teks: [
    "Kamu tidak perlu membalas pengirim untuk melakukan pemeriksaan ini.",
    "Pesan yang menekan waktu hampir selalu disengaja. Tarik napas dulu.",
    "Layanan resmi tidak pernah meminta OTP atau PIN lewat chat.",
  ],
  tautan: [
    "Perhatikan huruf di domain: bca-klaim.xyz bukan milik BCA.",
    "Tautan pendek menyembunyikan tujuan. Pratinjau dulu sebelum membuka.",
    "Gembok HTTPS tidak menjamin situs itu aman, hanya terenkripsi.",
  ],
  screenshot: [
    "Tutup nama dan nomor yang tidak perlu sebelum mengunggah.",
    "Tangkapan layar yang jelas dan tidak terpotong memberi hasil lebih baik.",
  ],
  profil: [
    "Satu tanda belum tentu penipuan. Beberapa tanda sekaligus yang perlu diwaspadai.",
    "Minta video call singkat. Penipu biasanya menghindar.",
  ],
};

export function DityTips({ mode }: { mode: string }) {
  const tips = TIPS[mode] ?? TIPS.teks;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
    const timer = setInterval(() => setIndex((current) => (current + 1) % tips.length), 7000);
    return () => clearInterval(timer);
  }, [mode, tips.length]);

  return (
    <SpotlightCard className="rounded-3xl border border-border bg-card p-5">
      <div className="flex items-start gap-4">
        <Image
          src="/mascot/bersama-teman.png"
          alt=""
          width={80}
          height={80}
          className="size-20 shrink-0 object-contain"
        />
        <div className="flex min-w-0 flex-col gap-2">
          <span className="text-sm font-normal text-foreground">Dity mengingatkan</span>
          <BlurText
            key={`${mode}-${index}`}
            text={tips[index]}
            animateBy="words"
            direction="top"
            delay={60}
            className="text-xs leading-relaxed text-muted-foreground"
          />
        </div>
      </div>
    </SpotlightCard>
  );
}
