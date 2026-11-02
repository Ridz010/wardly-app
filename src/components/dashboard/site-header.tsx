"use client";

import { usePathname } from "next/navigation";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { NavGroup } from "./nav";

export function SiteHeader({ groups, fallback }: { groups: NavGroup[]; fallback: string }) {
    const pathname = usePathname();
    const items = groups.flatMap((group) => group.items);
    const current =
        [...items]
            .sort((a, b) => b.href.length - a.href.length)
            .find((item) => (item.exact ? pathname === item.href : pathname.startsWith(item.href))) ?? null;

    return (
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border">
            <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mx-2 h-4 data-vertical:self-auto" />
                <h1 className="text-base font-light">{current?.title ?? fallback}</h1>
            </div>
        </header>
    );
}
