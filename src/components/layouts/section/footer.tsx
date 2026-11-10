import Image from "next/image";
import Link from "next/link";

import AnimatedContent from "@/components/AnimatedContent";
import FooterWordmark from "@/components/layouts/section/footer-wordmark";
import { menus } from "@/lib/navigation";

const LEGAL = [
    { title: "FAQ", href: "/faq" },
    { title: "Keamanan", href: "/security" },
    { title: "Syarat layanan", href: "/terms" },
    { title: "Kebijakan privasi", href: "/privacy" },
];

const LINK_CLASS =
    "text-muted-foreground transition-colors duration-300 hover:text-foreground";

export default function Footer() {
    return (
        <footer className="dark w-full overflow-hidden rounded-t-[2.5rem] bg-background text-foreground">
            <div className="mx-auto max-w-6xl px-6 pt-14 sm:px-10 lg:px-14 lg:pt-20">
                <div className="flex flex-col gap-10 font-light md:flex-row md:items-start md:justify-between">
                    <AnimatedContent distance={30} duration={0.8}>
                        <div className="max-w-xs space-y-4">
                            <Link href="/" aria-label="Ward-Ly" className="inline-block">
                                <Image
                                    src="/icon/logo.svg"
                                    alt=""
                                    width={32}
                                    height={32}
                                    className="h-7 w-auto"
                                />
                            </Link>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                Teman yang tenang saat kamu ragu sama sebuah pesan.
                                Cek dulu, baru putuskan.
                            </p>
                        </div>
                    </AnimatedContent>

                    <AnimatedContent distance={30} duration={0.8} delay={0.1}>
                        <nav aria-label="Footer">
                            <ul className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
                                {menus.map((menu) => (
                                    <li key={menu.title}>
                                        <Link href={menu.href} className={LINK_CLASS}>
                                            {menu.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </AnimatedContent>
                </div>

                <div className="mt-14 flex flex-col gap-3 border-t border-border/50 pt-5 text-xs font-light sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-muted-foreground">
                        © 2026 Ward-Ly. Semua hak dilindungi.
                    </p>
                    <ul className="flex flex-wrap gap-x-6 gap-y-2">
                        {LEGAL.map((item) => (
                            <li key={item.title}>
                                <Link href={item.href} className={LINK_CLASS}>
                                    {item.title}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <AnimatedContent distance={80} duration={1.2} threshold={0.05}>
                <div
                    aria-hidden="true"
                    className="mx-auto mt-6 h-28 w-full max-w-384 px-4 sm:h-44 lg:h-64"
                >
                    <FooterWordmark />
                </div>
            </AnimatedContent>
        </footer>
    );
}