export type Hit = { code: string; label: string; explanation: string; weight: number; category?: string }

const SHORTENERS = ['bit.ly', 'tinyurl.com', 'cutt.ly', 's.id', 'rebrand.ly', 't.co', 'shorturl.at', 'is.gd']
const RISKY_TLDS = ['xyz', 'top', 'click', 'icu', 'cfd', 'sbs', 'work', 'live', 'buzz', 'rest']
const OFFICIAL: Record<string, string[]> = {
  bca: ['bca.co.id', 'klikbca.com'], bri: ['bri.co.id'], mandiri: ['bankmandiri.co.id'],
  bni: ['bni.co.id'], gopay: ['gopay.co.id', 'gojek.com'], ovo: ['ovo.id'], dana: ['dana.id'],
  shopee: ['shopee.co.id'], tokopedia: ['tokopedia.com'], ojk: ['ojk.go.id'],
  bpjs: ['bpjsketenagakerjaan.go.id', 'bpjs-kesehatan.go.id'], jne: ['jne.co.id'],
  pertamina: ['pertamina.com'], telkomsel: ['telkomsel.com'],
}

function registrable(host: string) {
  const p = host.split('.')
  const sld = ['co', 'go', 'or', 'ac', 'web', 'sch', 'my']
  return p.length >= 3 && sld.includes(p[p.length - 2]) ? p.slice(-3).join('.') : p.slice(-2).join('.')
}

export function extractUrls(text: string) {
  return Array.from(text.matchAll(/\bhttps?:\/\/[^\s<>"')]+|\b(?:www\.)[^\s<>"')]+/gi)).map((m) => m[0])
}

export function analyzeUrls(text: string) {
  const hits: Hit[] = []
  const urls = extractUrls(text)
  for (const raw of urls) {
    let u: URL
    try { u = new URL(raw.startsWith('http') ? raw : `https://${raw}`) } catch { continue }
    const host = u.hostname.toLowerCase()
    const reg = registrable(host)
    const add = (h: Hit) => hits.push({ ...h, label: `${h.label} (${host})` })

    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host))
      add({ code: 'URL_IP_HOST', label: 'Tautan memakai alamat IP', weight: 25,
        explanation: 'Layanan resmi memakai nama domain, bukan angka IP.' })
    if (host.includes('xn--'))
      add({ code: 'URL_PUNYCODE', label: 'Domain memakai karakter menyerupai (punycode)', weight: 30,
        explanation: 'Karakter asing bisa dipakai meniru huruf biasa agar domain tampak mirip situs resmi.' })
    if (SHORTENERS.includes(reg))
      add({ code: 'URL_SHORTENER', label: 'Tautan dipersingkat', weight: 12,
        explanation: 'Tautan pendek menyembunyikan tujuan sebenarnya. Pratinjau dulu sebelum membuka.' })
    if (RISKY_TLDS.includes(host.split('.').pop()!))
      add({ code: 'URL_TLD', label: 'Ekstensi domain sering disalahgunakan', weight: 12,
        explanation: 'Ekstensi murah ini sering dipakai situs sekali pakai. Bukan bukti, tetapi perlu waspada.' })
    if ((host.match(/-/g) ?? []).length >= 3 || host.split('.').length >= 5)
      add({ code: 'URL_STRUCTURE', label: 'Struktur domain janggal', weight: 10,
        explanation: 'Terlalu banyak tanda hubung/subdomain biasa dipakai untuk menyamarkan domain palsu.' })
    for (const [brand, domains] of Object.entries(OFFICIAL)) {
      if (host.includes(brand) && !domains.includes(reg))
        add({ code: 'URL_BRAND_LOOKALIKE', label: `Menyebut "${brand}" tetapi bukan domain resminya`, weight: 35,
          explanation: `Nama merek muncul di domain yang bukan milik pihak resmi. Domain resmi yang kami kenal: ${domains.join(', ')}.` })
    }
    if (u.protocol === 'http:')
      add({ code: 'URL_HTTP', label: 'Tidak memakai HTTPS', weight: 8,
        explanation: 'Koneksi tidak terenkripsi. Jangan memasukkan data apa pun.' })
  }
  const score = Math.min(60, hits.reduce((s, h) => s + h.weight, 0))
  return { urls, hits, score }
}