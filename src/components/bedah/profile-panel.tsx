"use client";

import { useMemo, useState } from "react";

import { AnalysisReport } from "@/components/bedah/analysis-report";
import { PanelFrame } from "@/components/bedah/panel-frame";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { levelFromScore, type Level } from "@/lib/risk";
import type { AnalysisResult } from "@/lib/services/analyze";
import { cn } from "cn";

type Sign = { id: string; label: string; hint: string; weight: number };

const SIGNS: Sign[] = [
  { id: "baru", label: "Akun baru atau hampir tanpa riwayat", hint: "Baru dibuat, sedikit postingan, pengikut mendadak banyak.", weight: 12 },
  { id: "foto", label: "Foto profil terlalu sempurna atau hasil curian", hint: "Foto model, atau muncul di akun lain dengan nama berbeda.", weight: 12 },
  { id: "pindah", label: "Mengajak pindah ke aplikasi lain", hint: "Misalnya dari marketplace ke WhatsApp atau Telegram.", weight: 16 },
  { id: "uang", label: "Meminta uang atau biaya di muka", hint: "Biaya admin, deposit, ongkos kirim, atau pajak.", weight: 26 },
  { id: "desak", label: "Mendesak keputusan cepat", hint: "“Tinggal 10 menit”, “kuota habis hari ini”.", weight: 14 },
  { id: "murah", label: "Harga atau imbalan tidak masuk akal", hint: "Jauh di bawah harga pasar atau gaji yang berlebihan.", weight: 16 },
  { id: "otp", label: "Meminta kode OTP, PIN, atau data kartu", hint: "Layanan resmi tidak pernah memintanya.", weight: 40 },
  { id: "identitas", label: "Menolak video call atau verifikasi identitas", hint: "Selalu ada alasan untuk menghindar.", weight: 14 },
  { id: "rekening", label: "Rekening atas nama orang lain", hint: "Berbeda dengan nama toko atau akun yang dipakai.", weight: 18 },
];

const COPY: Record<Level, { summary: string; steps: string[] }> = {
  rendah: {
    summary: "Belum ada tanda kuat pada profil ini. Tetap lakukan transaksi lewat jalur resmi.",
    steps: ["Gunakan fitur pembayaran resmi platform.", "Simpan bukti percakapan dan transaksi."],
  },
  waspada: {
    summary: "Beberapa tanda cocok dengan pola penipuan. Tahan dulu sebelum mengirim uang atau data.",
    steps: ["Minta verifikasi lewat video call atau kanal resmi.", "Cari ulasan atau laporan tentang akun ini.", "Jangan pindah ke aplikasi lain bila belum yakin."],
  },
  tinggi: {
    summary: "Profil ini cocok dengan banyak ciri penipuan. Sebaiknya hentikan komunikasi.",
    steps: ["Berhenti membalas dan jangan kirim uang atau data apa pun.", "Laporkan akunnya ke platform tempat kamu menemukannya.", "Jika sudah terlanjur transfer, hubungi bank segera."],
  },
};

export function ProfilePanel() {
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const toggle = (id: string, on: boolean) => {
    setResult(null);
    setPicked((current) => {
      const next = new Set(current);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const selected = useMemo(() => SIGNS.filter((sign) => picked.has(sign.id)), [picked]);

  const evaluate = () => {
    const score = Math.min(100, selected.reduce((sum, sign) => sum + sign.weight, 0));
    const level = levelFromScore(score);
    setResult({
      id: null,
      level,
      score,
      hits: [],
      urls: [],
      summary: COPY[level].summary,
      reasons: selected.map((sign) => sign.label),
      nextSteps: COPY[level].steps,
      redacted: [],
      ai: false,
      saved: false,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <PanelFrame
        title="Centang tanda yang kamu lihat di profilnya"
        notice="Penilaian dihitung di perangkatmu. Tidak ada data yang dikirim."
        step={result ? 2 : 1}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {SIGNS.map((sign) => {
            const on = picked.has(sign.id);
            return (
              <div
                key={sign.id}
                className={cn(
                  "flex gap-3 rounded-2xl border border-border p-4 transition-colors duration-300",
                  on ? "border-primary bg-primary/5" : "hover:border-primary/40",
                )}
              >
                <Checkbox
                  checked={on}
                  aria-label={sign.label}
                  onCheckedChange={(value) => toggle(sign.id, Boolean(value))}
                  className="mt-1"
                />
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-normal text-foreground">{sign.label}</span>
                  <span className="text-xs text-muted-foreground">{sign.hint}</span>
                </div>
              </div>
            );
          })}
        </div>
        <Button
          type="button"
          size="lg"
          disabled={!picked.size}
          onClick={evaluate}
          className="h-11 w-fit rounded-full px-6 font-normal"
        >
          Nilai profil ({picked.size} tanda)
        </Button>
      </PanelFrame>
      {result ? <AnalysisReport result={result} /> : null}
    </div>
  );
}
