import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { PageShell } from "@/components/shared/page-shell";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";

export const metadata: Metadata = {
    title: "FAQ",
    description:
        "Jawaban atas pertanyaan umum tentang Ward-Ly: cara kerja pemeriksaan, privasi data, latihan, dan langkah saat sudah terlanjur.",
};

type Faq = { q: string; a: React.ReactNode; plain: string };
type Group = { id: string; title: string; caption: string; items: Faq[] };

const LINK = "font-normal text-primary underline underline-offset-4";

const GROUPS: Group[] = [
    {
        id: "umum",
        title: "Umum",
        caption: "Kenalan dulu dengan Ward-Ly.",
        items: [
            {
                q: "Apa itu Ward-Ly?",
                plain: "Ward-Ly adalah aplikasi web yang membantu kamu mengenali pesan, tautan, dan profil mencurigakan, berlatih lewat skenario fiktif, dan tahu langkah aman berikutnya.",
                a: (
                    <p>
                        Ward-Ly adalah teman cek fakta untuk interaksi digital yang terasa janggal. Kamu bisa{" "}
                        <strong className="font-medium">mengenali</strong> tanda bahaya di sebuah pesan,{" "}
                        <strong className="font-medium">belajar</strong> lewat simulasi chat penipu, lalu{" "}
                        <strong className="font-medium">bertindak</strong> dengan panduan langkah demi langkah.
                    </p>
                ),
            },
            {
                q: "Apakah harus daftar akun?",
                plain: "Tidak. Bedah, Radar, Latih, dan Lindungi bisa dipakai tanpa akun. Akun hanya dibutuhkan untuk menyimpan riwayat, progres XP dan lencana, serta menulis di Komunitas.",
                a: (
                    <p>
                        Tidak. Bedah, Radar, Latih, dan Lindungi bisa langsung dipakai tanpa akun. Akun hanya perlu
                        kalau kamu ingin menyimpan riwayat pemeriksaan, progres XP dan lencana, atau menulis cerita di
                        Komunitas.
                    </p>
                ),
            },
            {
                q: "Ward-Ly ditujukan untuk siapa?",
                plain: "Untuk anak muda Indonesia seperti pelajar, mahasiswa, dan pencari kerja, juga siapa saja yang ingin membantu keluarganya tetap waspada.",
                a: (
                    <p>
                        Terutama untuk anak muda Indonesia (pelajar, mahasiswa, pencari kerja) yang setiap hari menerima
                        tawaran kerja, giveaway, atau tautan yang meragukan. Bahasanya sengaja dibuat sederhana supaya
                        mudah dibagikan ke orang tua dan keluarga.
                    </p>
                ),
            },
        ],
    },
    {
        id: "periksa",
        title: "Cara pemeriksaan",
        caption: "Bagaimana Ward-Ly menilai sebuah pesan.",
        items: [
            {
                q: "Bagaimana Ward-Ly menilai sebuah pesan?",
                plain: "Ward-Ly mencocokkan teks dengan daftar aturan tanda bahaya, memeriksa struktur tautan, lalu bila aktif meminta AI menjelaskan konteksnya. Hasilnya berupa skor 0 sampai 100, level risiko, alasan, dan langkah lanjut.",
                a: (
                    <>
                        <p>Ada tiga lapis pemeriksaan:</p>
                        <ol className="ml-5 list-decimal space-y-1">
                            <li>
                                <strong className="font-medium">Aturan tanda bahaya</strong>: pola seperti desakan
                                waktu, permintaan OTP, atau biaya di muka.
                            </li>
                            <li>
                                <strong className="font-medium">Cek tautan</strong>: alamat IP, domain tiruan merek,
                                karakter menyerupai (punycode), penyingkat tautan, dan tautan tanpa HTTPS.
                            </li>
                            <li>
                                <strong className="font-medium">Analisis AI (opsional)</strong>: menjelaskan konteks
                                dengan bahasa sehari-hari.
                            </li>
                        </ol>
                        <p>
                            Hasilnya berupa skor 0 sampai 100 dengan level <em>rendah</em>, <em>waspada</em>, atau{" "}
                            <em>tinggi</em>, disertai alasan dan langkah berikutnya.
                        </p>
                    </>
                ),
            },
            {
                q: "Apa saja yang bisa diperiksa?",
                plain: "Teks pesan, tautan, screenshot percakapan, dan profil akun lewat daftar periksa tanda akun palsu.",
                a: (
                    <p>
                        Di halaman{" "}
                        <Link href="/bedah" className={LINK}>
                            Bedah
                        </Link>{" "}
                        kamu bisa memeriksa teks pesan (SMS, WhatsApp, email), tautan, screenshot percakapan, dan
                        profil akun lewat daftar periksa tanda akun palsu. Untuk cek kilat tanpa AI, pakai Cek Cepat
                        di{" "}
                        <Link href="/radar" className={LINK}>
                            Radar
                        </Link>
                        .
                    </p>
                ),
            },
            {
                q: "Skor rendah berarti pesannya pasti aman?",
                plain: "Tidak. Skor rendah hanya berarti tidak ada pola yang cocok. Tetap verifikasi lewat kanal resmi.",
                a: (
                    <p>
                        Tidak. Skor rendah hanya berarti Ward-Ly tidak menemukan pola yang cocok, bukan bukti pesan itu
                        aman. Penipu terus mengganti cara. Tetap verifikasi lewat nomor atau aplikasi resmi sebelum
                        mengirim uang atau data.
                    </p>
                ),
            },
        ],
    },
    {
        id: "privasi",
        title: "Privasi & data",
        caption: "Apa yang terjadi pada teks yang kamu tempel.",
        items: [
            {
                q: "Apakah pesan saya dikirim ke pihak lain?",
                plain: "Nomor telepon, email, NIK atau nomor kartu, dan rekening disamarkan otomatis. Bila AI aktif, teks yang sudah disamarkan dikirim ke layanan AI pihak ketiga (OpenRouter). Screenshot juga dibaca oleh layanan AI tersebut.",
                a: (
                    <>
                        <p>
                            Sebelum dianalisis, nomor telepon, email, NIK atau nomor kartu, dan nomor rekening
                            disamarkan otomatis. Bila fitur AI aktif, teks yang sudah disamarkan dikirim ke layanan AI
                            pihak ketiga (OpenRouter) untuk analisis tambahan. Chat dengan Dity juga diproses layanan
                            yang sama.
                        </p>
                        <p>
                            Screenshot dibaca oleh layanan AI untuk diambil teksnya, jadi tutup nama dan nomor yang
                            tidak perlu sebelum mengunggah.
                        </p>
                    </>
                ),
            },
            {
                q: "Apakah Ward-Ly menyimpan pesan yang saya periksa?",
                plain: "Tidak untuk tamu. Riwayat hanya disimpan untuk pengguna yang masuk dan mengaktifkan penyimpanan riwayat, dalam bentuk potongan teks yang sudah disamarkan.",
                a: (
                    <p>
                        Untuk tamu, tidak. Riwayat hanya disimpan bila kamu masuk dan mengaktifkan penyimpanan riwayat
                        di pengaturan, berupa potongan teks yang sudah disamarkan beserta hasilnya. Detailnya ada di{" "}
                        <Link href="/privacy" className={LINK}>
                            Kebijakan privasi
                        </Link>
                        .
                    </p>
                ),
            },
            {
                q: "Perlukah saya menempel data asli?",
                plain: "Tidak perlu. Ganti nama, nomor, dan data pribadi dengan contoh. Pola kalimat dan tautannya sudah cukup untuk dinilai.",
                a: (
                    <p>
                        Tidak perlu. Ganti nama, nomor, dan data pribadi dengan contoh. Yang dinilai adalah pola kalimat
                        dan tautannya, jadi hasilnya tetap berguna tanpa data sensitif.
                    </p>
                ),
            },
        ],
    },
    {
        id: "bertindak",
        title: "Belajar & bertindak",
        caption: "Berlatih sebelum kejadian, tahu langkah sesudahnya.",
        items: [
            {
                q: "Apa itu Latih?",
                plain: "Latih berisi skenario chat fiktif bergaya game. Kamu memilih balasan, mendapat umpan balik langsung, menjaga tiga nyawa, dan mengumpulkan XP serta bintang.",
                a: (
                    <p>
                        <Link href="/latih" className={LINK}>
                            Latih
                        </Link>{" "}
                        berisi skenario chat fiktif bergaya game: lowongan kerja palsu, giveaway, akun menyamar, dan
                        lainnya. Setiap pilihanmu mendapat umpan balik langsung. Jaga tiga nyawa, bangun combo jawaban
                        aman, dan kumpulkan XP, bintang, serta lencana. Semua contoh fiktif dan aman.
                    </p>
                ),
            },
            {
                q: "Saya sudah terlanjur klik tautan atau transfer. Lalu apa?",
                plain: "Tetap tenang. Hubungi bank lewat nomor resmi untuk memblokir transaksi, ganti kata sandi dan aktifkan verifikasi dua langkah, simpan bukti, lalu laporkan. Panduan lengkap ada di halaman Lindungi.",
                a: (
                    <>
                        <p>Tetap tenang, lalu lakukan yang paling mendesak dulu:</p>
                        <ol className="ml-5 list-decimal space-y-1">
                            <li>Hubungi bank atau e-wallet lewat nomor resmi untuk memblokir kartu atau transaksi.</li>
                            <li>Ganti kata sandi akun yang terdampak dan aktifkan verifikasi dua langkah.</li>
                            <li>Simpan bukti: screenshot chat, nomor pengirim, dan bukti transfer.</li>
                            <li>Laporkan ke platform terkait dan kanal pengaduan resmi.</li>
                        </ol>
                        <p>
                            Panduan langkah demi langkah dengan daftar centang ada di{" "}
                            <Link href="/lindungi" className={LINK}>
                                Lindungi
                            </Link>
                            .
                        </p>
                    </>
                ),
            },
            {
                q: "Bagaimana cara membantu teman atau keluarga?",
                plain: "Bagikan panduan dari halaman Lindungi, ceritakan pengalamanmu di Komunitas, atau ajak mereka mencoba skenario Latih.",
                a: (
                    <p>
                        Bagikan panduan dari Lindungi, tulis pengalamanmu di{" "}
                        <Link href="/komunitas" className={LINK}>
                            Komunitas
                        </Link>{" "}
                        supaya orang lain bisa mengenali modus yang sama, atau ajak mereka mencoba satu skenario Latih.
                    </p>
                ),
            },
        ],
    },
    {
        id: "batasan",
        title: "Keterbatasan",
        caption: "Kami jujur soal apa yang bisa dan tidak bisa dilakukan.",
        items: [
            {
                q: "Apakah hasil Ward-Ly selalu benar?",
                plain: "Tidak. Ward-Ly adalah alat bantu berbasis aturan dan AI, bukan pendeteksi penipuan yang pasti. Hasilnya bisa keliru, jadi keputusan akhir tetap di tanganmu.",
                a: (
                    <p>
                        Tidak. Ward-Ly adalah alat bantu berbasis aturan yang bisa dijelaskan, ditambah AI bila aktif.
                        Hasilnya bisa keliru dua arah: pesan aman bisa tampak berisiko, dan penipuan baru bisa lolos.
                        Gunakan sebagai bahan pertimbangan, bukan vonis.
                    </p>
                ),
            },
            {
                q: "Bagaimana kalau fitur AI sedang tidak aktif?",
                plain: "Pemeriksaan teks dan tautan tetap berjalan dengan aturan Ward-Ly. Pembacaan screenshot dan chat Dity membutuhkan AI, dan akan memberi tahu bila belum tersedia.",
                a: (
                    <p>
                        Pemeriksaan teks dan tautan tetap berjalan dengan aturan Ward-Ly. Pembacaan screenshot dan chat
                        Dity membutuhkan AI, dan akan menampilkan pemberitahuan bila belum tersedia. Laporan hasil selalu
                        menyebut apakah AI ikut menganalisis.
                    </p>
                ),
            },
        ],
    },
];

const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: GROUPS.flatMap((group) =>
        group.items.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.plain },
        })),
    ),
};

export default function FaqPage() {
    return (
        <PageShell>
            <script
                type="application/ld+json"
                // JSON-LD from static strings above; escape "<" so it cannot close the tag.
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
            />

            <PageHeader
                title="Pertanyaan yang"
                highlight="sering muncul"
                description="Cara kerja pemeriksaan, apa yang terjadi pada datamu, dan apa yang bisa kamu lakukan saat ada yang terasa janggal."
            />

            <div className="grid gap-10 lg:grid-cols-[14rem_1fr] lg:gap-16">
                <nav aria-label="Kategori FAQ" className="lg:sticky lg:top-28 lg:self-start">
                    <ul className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-1 lg:overflow-visible">
                        {GROUPS.map((group) => (
                            <li key={group.id} className="shrink-0">
                                <a
                                    href={`#${group.id}`}
                                    className="block rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground lg:rounded-xl lg:border-transparent lg:hover:bg-muted"
                                >
                                    {group.title}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="flex flex-col gap-12">
                    {GROUPS.map((group) => (
                        <section key={group.id} id={group.id} aria-labelledby={`${group.id}-title`} className="scroll-mt-28">
                            <div className="mb-3 flex flex-col gap-1">
                                <h2 id={`${group.id}-title`} className="font-heading text-2xl font-light tracking-tight text-foreground">
                                    {group.title}
                                </h2>
                                <p className="text-sm text-muted-foreground">{group.caption}</p>
                            </div>
                            <Accordion className="rounded-2xl border border-border bg-card px-5">
                                {group.items.map((item) => (
                                    <AccordionItem key={item.q} value={item.q}>
                                        <AccordionTrigger className="py-4 text-base font-normal hover:no-underline">
                                            {item.q}
                                        </AccordionTrigger>
                                        <AccordionContent className="flex flex-col gap-3 pb-5 leading-relaxed font-light text-muted-foreground">
                                            {item.a}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </section>
                    ))}

                    <div className="flex flex-col items-start gap-4 rounded-3xl bg-linear-to-br from-accent via-secondary to-background p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
                        <div className="flex flex-col gap-1">
                            <p className="font-heading text-xl font-light text-foreground">Masih ragu sama sebuah pesan?</p>
                            <p className="text-sm text-muted-foreground">Periksa sekarang, tanpa daftar dan tanpa data sensitif.</p>
                        </div>
                        <Link href="/bedah" className={cn(buttonVariants({ size: "lg" }), "h-11 gap-2 px-6")}>
                            Periksa pesan
                            <ArrowUpRightIcon aria-hidden="true" />
                        </Link>
                    </div>
                </div>
            </div>
        </PageShell>
    );
}
