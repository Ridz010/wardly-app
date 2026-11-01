const PATTERNS: { name: string; re: RegExp; token: string }[] = [
    { name: 'email', re: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, token: '[EMAIL]' },
    { name: 'nik', re: /\b\d{16}\b/g, token: '[NIK/KARTU]' },
    { name: 'telepon', re: /(?:\+62|62|0)8[1-9][\d\s-]{7,12}\d/g, token: '[NOMOR_TELEPON]' },
    { name: 'rekening', re: /\b\d{10,15}\b/g, token: '[NOMOR_REKENING]' },
]

export function redact(input: string) {
    let clean = input
    const counts: Record<string, number> = {}
    for (const p of PATTERNS) {
        clean = clean.replace(p.re, () => {
            counts[p.name] = (counts[p.name] ?? 0) + 1
            return p.token
        })
    }
    return { clean, counts }
}