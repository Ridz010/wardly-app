export type IconKey =
    | "overview"
    | "history"
    | "badge"
    | "settings"
    | "rules"
    | "categories"
    | "scenarios"
    | "guides"
    | "blog"
    | "moderation"
    | "users"
    | "site"
    | "admin";

export type NavItem = {
    title: string;
    href: string;
    icon: IconKey;
    exact?: boolean;
};

export type NavGroup = {
    label: string;
    items: NavItem[];
};

export const USER_NAV: NavGroup[] = [
    {
        label: "Akun",
        items: [
            { title: "Ringkasan", href: "/dashboard", icon: "overview", exact: true },
            { title: "Riwayat", href: "/dashboard/riwayat", icon: "history" },
            { title: "Lencana", href: "/dashboard/lencana", icon: "badge" },
            { title: "Pengaturan", href: "/dashboard/pengaturan", icon: "settings" },
        ],
    },
];

export const ADMIN_NAV: NavGroup[] = [
    {
        label: "Pantau",
        items: [
            { title: "Ringkasan", href: "/admin", icon: "overview", exact: true },
            { title: "Moderasi", href: "/admin/moderasi", icon: "moderation" },
        ],
    },
    {
        label: "Konten",
        items: [
            { title: "Aturan deteksi", href: "/admin/aturan", icon: "rules" },
            { title: "Kategori modus", href: "/admin/kategori", icon: "categories" },
            { title: "Skenario", href: "/admin/skenario", icon: "scenarios" },
            { title: "Panduan", href: "/admin/panduan", icon: "guides" },
            { title: "Blog", href: "/admin/blog", icon: "blog" },
        ],
    },
    {
        label: "Sistem",
        items: [{ title: "Pengguna", href: "/admin/pengguna", icon: "users" }],
    },
];

export const MODERATOR_PATHS = ["/admin", "/admin/moderasi"];
