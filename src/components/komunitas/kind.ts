export const KINDS = {
    peringatan: { label: "Peringatan", dot: "bg-amber-500" },
    pengalaman: { label: "Pengalaman", dot: "bg-brand-blue" },
    tips: { label: "Tips", dot: "bg-brand-mint" },
} as const;

export type Kind = keyof typeof KINDS;

export const kindOf = (value: string) => KINDS[value as Kind] ?? KINDS.pengalaman;
