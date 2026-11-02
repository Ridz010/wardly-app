export type Level = "rendah" | "waspada" | "tinggi";

export const levelFromScore = (score: number): Level =>
    score >= 50 ? "tinggi" : score >= 22 ? "waspada" : "rendah";

const ORDER: Level[] = ["rendah", "waspada", "tinggi"];

export const maxLevel = (a: Level, b?: Level | null): Level =>
    !b ? a : ORDER.indexOf(a) >= ORDER.indexOf(b) ? a : b;
