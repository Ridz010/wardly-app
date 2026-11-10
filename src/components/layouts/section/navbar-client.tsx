"use client";

import Link from "next/link";
import type { CSSProperties } from "react";

import CardNav from "@/components/CardNav";
import NavbarDesktop from "@/components/layouts/section/navbar-desktop";
import { menusFor, navGroups, navLinks } from "@/lib/navigation";

const toLink = ({ title, href }: { title: string; href: string }) => ({
    label: title,
    href,
    ariaLabel: `Buka halaman ${title}`,
});

const NAV_ITEMS = [
    ...navGroups.map(({ label, description, hrefs }) => ({
        label,
        description,
        links: menusFor(hrefs).map(toLink),
    })),
    {
        label: "Info",
        description: "Cara kerja, pertanyaan umum, dan komitmen privasi.",
        links: [...navLinks.before, ...navLinks.after].map(toLink),
    },
];

const NAV_THEME = {
    "--cn-panel": "var(--background)",
    "--cn-solid": "var(--background)",
    "--cn-edge": "var(--border)",
    "--cn-highlight": "transparent",
    "--cn-shadow":
        "0 20px 40px -24px color-mix(in oklab, var(--foreground) 35%, transparent)",
    "--cn-text": "var(--foreground)",
    "--cn-muted": "var(--muted-foreground)",
    "--cn-hover": "var(--muted)",
    "--cn-ring": "var(--ring)",
    "--cn-tile": "var(--card)",
    "--cn-tile-rim": "inset 0 0 0 1px var(--border)",
    "--cn-cta": "var(--primary)",
    "--cn-cta-ink": "var(--primary-foreground)",
    "--cn-cta-shadow": "none",
    "--cn-cta-hover": "brightness(0.92)",
} as CSSProperties;

export default function NavbarClient({ signedIn }: { signedIn: boolean }) {
    return (
        <header className="fixed inset-x-0 top-3 z-50 px-4 sm:px-6">
            {/* Desktop: spread-out menu with dropdowns. Below lg: the compact card menu. */}
            <NavbarDesktop signedIn={signedIn} />
            <div className="lg:hidden">
                <CardNav
                    logo="/icon/logo.svg"
                    logoAlt="Ward-Ly"
                    logoHref="/"
                    items={NAV_ITEMS}
                    cta={signedIn ? { label: "Dashboard", href: "/dashboard" } : { label: "Coba Sekarang", href: "/bedah" }}
                    theme="light"
                    surface="solid"
                    cardEffect="rise"
                    maxWidth={1152}
                    linkComponent={Link}
                    ariaLabel="Navigasi utama"
                    className="[&_.card-nav__cta]:rounded-full"
                    style={NAV_THEME}
                />
            </div>
        </header>
    );
}