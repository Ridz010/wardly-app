export type NavigationItem = {
    title: string;
    href: string;
    description: string;
};

export const menus: NavigationItem[] = [
    {
        title: "Bedah",
        href: "/bedah",
        description: "Tempel pesan mencurigakan dan lihat tanda bahayanya.",
    },
    {
        title: "Radar",
        href: "/radar",
        description: "Pola penipuan yang sedang sering muncul dan cek cepat.",
    },
    {
        title: "Latih",
        href: "/latih",
        description: "Skenario singkat untuk melatih naluri waspada.",
    },
    {
        title: "Lindungi",
        href: "/lindungi",
        description: "Panduan sebelum dan sesudah terkena penipuan.",
    },
    {
        title: "Komunitas",
        href: "/komunitas",
        description: "Cerita dan peringatan dari sesama pengguna.",
    },
    {
        title: "Blog",
        href: "/blog",
        description: "Tips dan cerita seputar keamanan pesan.",
    },
];

export type NavigationGroup = {
    label: string;
    description: string;
    hrefs: string[];
};

/** Feature pages grouped by the Recognize → Learn → Act journey. */
export const navGroups: NavigationGroup[] = [
    { label: "Periksa", description: "Cek pesan mencurigakan dan pantau pola yang sedang ramai.", hrefs: ["/bedah", "/radar"] },
    { label: "Belajar", description: "Latihan lewat simulasi dan panduan perlindungan.", hrefs: ["/latih", "/lindungi"] },
    { label: "Bersama", description: "Cerita dari komunitas dan catatan keamanan terbaru.", hrefs: ["/komunitas", "/blog"] },
];

/** Single links shown beside the dropdown groups on desktop. */
export const navLinks = {
    before: [{ title: "Cara Kerja", href: "/#cara-kerja" }],
    after: [
        { title: "FAQ", href: "/faq" },
        { title: "Privasi", href: "/privacy" },
    ],
};

export function menusFor(hrefs: string[]) {
    return hrefs.flatMap((href) => menus.find((item) => item.href === href) ?? []);
}
