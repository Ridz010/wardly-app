// Aturan permainan Latih. Harus selaras dengan finish_scenario di
// supabase/migrations/20261104000000_latih_gamification.sql.

export const XP_PER_LEVEL = 100;
export const MAX_HEARTS = 3;

const TITLES = ["Pemula", "Waspada", "Penyelidik", "Penjaga", "Pakar", "Legenda Ward-Ly"];

export function levelInfo(xp: number) {
    const safe = Math.max(0, Math.floor(xp));
    const level = 1 + Math.floor(safe / XP_PER_LEVEL);
    const current = safe % XP_PER_LEVEL;
    return {
        level,
        title: TITLES[Math.min(level - 1, TITLES.length - 1)],
        current,
        needed: XP_PER_LEVEL,
        progress: Math.round((current / XP_PER_LEVEL) * 100),
    };
}

/** 0 bila belum pernah dicoba, 1–3 sesuai rasio skor. */
export function starsFor(score: number, max: number) {
    if (max <= 0) return 0;
    const ratio = score / max;
    if (ratio >= 0.9) return 3;
    if (ratio >= 0.6) return 2;
    return 1;
}

export const DIFFICULTY = {
    mudah: { label: "Mudah", tone: "bg-brand-mint/20 text-brand-deep" },
    sedang: { label: "Sedang", tone: "bg-amber-400/20 text-amber-700" },
    sulit: { label: "Sulit", tone: "bg-destructive/10 text-destructive" },
} as const;

export const difficultyOf = (value: string) =>
    DIFFICULTY[value as keyof typeof DIFFICULTY] ?? DIFFICULTY.mudah;
