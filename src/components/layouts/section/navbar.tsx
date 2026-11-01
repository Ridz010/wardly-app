import Image from "next/image";
import Link from "next/link";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { RiArrowRightUpLine } from "react-icons/ri";
import { menus } from "@/lib/navigation";
import { Button } from "../../ui/button";

export default function Navbar() {
    return (
        <header className="fixed inset-x-0 top-3 z-50 px-4 sm:px-6">
            <div className="mx-auto flex h-14 max-w-6xl items-center justify-between rounded-full border border-border bg-background/95 px-4">
                {/* Logo */}
                <Link
                    href="/"
                    className="flex shrink-0 items-center"
                >
                    <Image
                        src="/icon/logo.svg"
                        alt="Ward-Ly"
                        width={32}
                        height={32}
                        priority
                        className="h-8 w-auto"
                    />
                </Link>

                {/* Navigation Links */}
                <NavigationMenu className="hidden md:flex">
                    <NavigationMenuList className="gap-1">
                        {menus.map((menu) => (
                            <NavigationMenuItem key={menu.title}>
                                <NavigationMenuLink
                                    render={<Link href={menu.href} />}
                                    className="px-4 text-sm font-medium text-muted-foreground"
                                >
                                    {menu.title}
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        ))}
                    </NavigationMenuList>
                </NavigationMenu>

                {/* Auth Buttons */}
                <div className="flex shrink-0 items-center gap-3">
                    <Button
                        className="h-9 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                    >
                        <Link href="/sign-in">
                            Coba Sekarang
                        </Link>
                        <RiArrowRightUpLine className="ml-1 size-4" />
                    </Button>

                    {/* <Link
                        href="/sign-up"
                        className="hidden items-center text-sm font-medium text-foreground  sm:flex"
                    >
                        Daftar
                    </Link> */}
                </div>
            </div>
        </header>
    );
}