"use client";

import Link from "next/link";
import Image from "next/image";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { motion } from "motion/react";

import StarBorder from "@/components/StarBorder";
import { buttonVariants } from "@/components/ui/button";
import type { QuotaInfo } from "@/lib/services/scan-guard";
import type { ActionState } from "@/lib/result";
import { cn } from "cn";

type ScanState = {
    signedIn: boolean;
    quota: QuotaInfo | null;
    locked: boolean;
    setQuota: (quota: QuotaInfo) => void;
};

const ScanContext = createContext<ScanState>({ signedIn: false, quota: null, locked: false, setQuota: () => {} });

export const useScan = () => useContext(ScanContext);

export function ScanProvider({
    signedIn,
    initialQuota,
    children,
}: {
    signedIn: boolean;
    initialQuota: QuotaInfo | null;
    children: ReactNode;
}) {
    const [quota, setQuota] = useState(initialQuota);
    const locked = !signedIn && quota !== null && quota.remaining <= 0;
    const value = useMemo(() => ({ signedIn, quota, locked, setQuota }), [signedIn, quota, locked]);
    return <ScanContext.Provider value={value}>{children}</ScanContext.Provider>;
}

export function useSyncQuota(state: ActionState<{ quota?: QuotaInfo }>) {
    const { setQuota } = useScan();
    useEffect(() => {
        if (state.status === "success" && state.data?.quota) setQuota(state.data.quota);
    }, [state, setQuota]);
}

export function QuotaMeter({ className }: { className?: string }) {
    const { signedIn, quota } = useScan();
    if (!quota) return null;

    const label = signedIn
        ? `Sisa ${quota.remaining} dari ${quota.limit} pemeriksaan hari ini`
        : `Sisa ${quota.remaining} dari ${quota.limit} pemeriksaan gratis hari ini`;

    return (
        <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm", className)}>
            <div className="flex items-center gap-3" role="status" aria-label={label}>
                <span className="flex items-center gap-1" aria-hidden="true">
                    {Array.from({ length: Math.min(quota.limit, 10) }, (_, index) => {
                        const filled = index < quota.remaining;
                        return (
                            <motion.span
                                key={index}
                                initial={false}
                                animate={{ scale: filled ? 1 : 0.8, opacity: filled ? 1 : 0.35 }}
                                transition={{ type: "spring", stiffness: 380, damping: 24 }}
                                className={cn("h-2 w-5 rounded-full", filled ? "bg-primary" : "bg-border")}
                            />
                        );
                    })}
                </span>
                <span className="text-muted-foreground">
                    Sisa <span className="tabular-nums text-foreground">{quota.remaining}</span> dari {quota.limit}
                    {signedIn ? " hari ini" : " gratis hari ini"}
                </span>
            </div>
            {!signedIn ? (
                <Link href="/sign-in?next=/bedah" className="text-primary underline-offset-4 hover:underline">
                    Masuk untuk jatah lebih banyak
                </Link>
            ) : null}
        </div>
    );
}

export function ScanGate({ what = "memeriksa", next = "/bedah" }: { what?: string; next?: string }) {
    return (
        <div className="flex flex-col items-center gap-5 rounded-2xl border border-dashed border-border bg-muted/40 px-6 py-10 text-center">
            <Image src="/animated_maskot.gif" alt="" width={72} height={72} unoptimized className="size-[72px] rounded-full bg-background object-contain" />
            <div className="flex max-w-md flex-col gap-2">
                <h3 className="font-heading text-2xl font-medium tracking-tight">Jatah gratis hari ini habis</h3>
                <p className="text-sm text-muted-foreground">
                    Masuk atau buat akun untuk lanjut {what}. Gratis, dengan jatah lebih banyak setiap hari dan riwayat yang bisa kamu simpan.
                </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
                <StarBorder as={Link} href={`/sign-in?next=${next}`} radius={999} duration={5} theme="light">
                    <span className="px-2 text-sm">Masuk</span>
                </StarBorder>
                <Link href={`/sign-up?next=${next}`} className={cn(buttonVariants({ variant: "outline" }), "h-10 rounded-full px-5 font-normal")}>
                    Buat akun
                </Link>
            </div>
        </div>
    );
}
