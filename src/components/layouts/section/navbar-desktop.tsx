"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    ArrowUpRightIcon,
    Gamepad2Icon,
    NewspaperIcon,
    RadarIcon,
    ScanSearchIcon,
    ShieldCheckIcon,
    UsersIcon,
    type LucideIcon,
} from "lucide-react";

import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { buttonVariants } from "@/components/ui/button";
import { menusFor, navGroups, navLinks } from "@/lib/navigation";
import { cn } from "cn";

const ICONS: Record<string, LucideIcon> = {
    "/bedah": ScanSearchIcon,
    "/radar": RadarIcon,
    "/latih": Gamepad2Icon,
    "/lindungi": ShieldCheckIcon,
    "/komunitas": UsersIcon,
    "/blog": NewspaperIcon,
};

const ITEM_CLASS = cn(
    navigationMenuTriggerStyle(),
    "h-10 rounded-full bg-transparent px-4 font-normal text-foreground/75",
    "hover:bg-background hover:text-foreground focus:bg-background",
    "data-popup-open:bg-background data-popup-open:text-foreground data-popup-open:shadow-sm",
    "data-active:bg-background data-active:text-foreground data-active:shadow-sm",
);

const isActive = (pathname: string, href: string) =>
    !href.includes("#") && (pathname === href || pathname.startsWith(`${href}/`));

export default function NavbarDesktop({ signedIn }: { signedIn: boolean }) {
    const pathname = usePathname();

    const plainLink = ({ title, href }: { title: string; href: string }) => (
        <NavigationMenuItem key={href}>
            <NavigationMenuLink
                active={isActive(pathname, href)}
                className={ITEM_CLASS}
                render={<Link href={href} />}
            >
                {title}
            </NavigationMenuLink>
        </NavigationMenuItem>
    );

    return (
        <div
            className={cn(
                "mx-auto hidden h-16 w-full max-w-6xl items-center gap-4 rounded-full border border-border",
                "bg-background/95 pr-2 pl-5 lg:flex",
                "shadow-[0_20px_40px_-24px_color-mix(in_oklab,var(--foreground)_35%,transparent)]",
                "animate-in fade-in slide-in-from-top-3 duration-700",
            )}
        >
            <Link href="/" aria-label="Ward-Ly, ke beranda" className="flex shrink-0 items-center gap-2 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                <Image src="/icon/logo.svg" alt="" width={28} height={28} className="size-7" />
                <span className="font-heading text-lg font-medium tracking-tight text-foreground">Ward-Ly</span>
            </Link>

            <NavigationMenu className="mx-auto" aria-label="Navigasi utama">
                <NavigationMenuList className="gap-0.5 rounded-full bg-muted/80 p-1 ring-1 ring-border/60">
                    {navLinks.before.map(plainLink)}

                    {navGroups.map((group) => {
                        const items = menusFor(group.hrefs);
                        const groupActive = group.hrefs.some((href) => isActive(pathname, href));
                        return (
                            <NavigationMenuItem key={group.label}>
                                <NavigationMenuTrigger
                                    className={cn(ITEM_CLASS, groupActive && "bg-background text-foreground shadow-sm")}
                                >
                                    {group.label}
                                </NavigationMenuTrigger>
                                <NavigationMenuContent className="w-[26rem] p-2">
                                    <ul className="grid gap-1">
                                        {items.map((item) => {
                                            const Icon = ICONS[item.href] ?? ArrowUpRightIcon;
                                            return (
                                                <li key={item.href}>
                                                    <NavigationMenuLink
                                                        active={isActive(pathname, item.href)}
                                                        render={<Link href={item.href} />}
                                                        className="group/link items-start gap-3 rounded-xl p-3"
                                                    >
                                                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground transition-colors group-hover/link:bg-primary group-hover/link:text-primary-foreground">
                                                            <Icon className="size-5" aria-hidden="true" />
                                                        </span>
                                                        <span className="flex flex-col gap-0.5">
                                                            <span className="flex items-center gap-1 font-medium text-foreground">
                                                                {item.title}
                                                                <ArrowUpRightIcon
                                                                    aria-hidden="true"
                                                                    className="size-3.5 opacity-0 transition-opacity group-hover/link:opacity-100"
                                                                />
                                                            </span>
                                                            <span className="text-xs leading-relaxed font-light text-muted-foreground">
                                                                {item.description}
                                                            </span>
                                                        </span>
                                                    </NavigationMenuLink>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                    <p className="mt-1 rounded-xl bg-muted px-3 py-2.5 text-xs font-light text-muted-foreground">
                                        {group.description}
                                    </p>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                        );
                    })}

                    {navLinks.after.map(plainLink)}
                </NavigationMenuList>
            </NavigationMenu>

            <div className="flex shrink-0 items-center gap-1.5">
                {signedIn ? (
                    <Link href="/dashboard" className={cn(buttonVariants({ size: "lg" }), "h-11 px-5")}>
                        Dashboard
                    </Link>
                ) : (
                    <>
                        <Link
                            href="/sign-in"
                            className={cn(buttonVariants({ variant: "ghost", size: "lg" }), "h-11 px-4 font-normal")}
                        >
                            Masuk
                        </Link>
                        <Link href="/bedah" className={cn(buttonVariants({ size: "lg" }), "h-11 px-5")}>
                            Coba Sekarang
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
