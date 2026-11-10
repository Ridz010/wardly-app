export type Level = "rendah" | "waspada" | "tinggi";

const BANDS: Record<Level, readonly [min: number, max: number]> = {
    rendah: [0, 21],
    waspada: [22, 49],
    tinggi: [50, 100],
};

export const levelFromScore = (score: number): Level =>
    score >= BANDS.tinggi[0] ? "tinggi" : score >= BANDS.waspada[0] ? "waspada" : "rendah";

const ORDER: Level[] = ["rendah", "waspada", "tinggi"];

export const maxLevel = (a: Level, b?: Level | null): Level =>
    !b ? a : ORDER.indexOf(a) >= ORDER.indexOf(b) ? a : b;

/** Turns any stored or computed value into a whole number from 0 to 100. */
export const normalizeScore = (value: unknown): number => {
    const score = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(score)) return 0;
    return Math.round(Math.min(100, Math.max(0, score)));
};

/**
 * Keeps the displayed score inside the band of the final level, so the AI can
 * never raise the level while the rule score stays behind at 0.
 */
export const scoreForLevel = (level: Level, ...candidates: unknown[]): number => {
    const [min, max] = BANDS[level];
    return Math.min(max, Math.max(min, ...candidates.map(normalizeScore)));
};

export const scoreCaption = (score: number, level: Level): string => {
    if (score === 0) {
        return "Skor 0 berarti belum ada tanda penipuan yang terdeteksi, bukan jaminan pesan ini aman.";
    }
    const [min, max] = BANDS[level];
    const meaning = {
        rendah: "hanya sedikit tanda yang terdeteksi",
        waspada: "ada beberapa tanda yang perlu dicek dulu",
        tinggi: "banyak tanda yang cocok dengan pola penipuan",
    }[level];
    return `Rentang ${min}–${max}: ${meaning}. Makin tinggi skor, makin besar risikonya.`;
};
