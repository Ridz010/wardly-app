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
