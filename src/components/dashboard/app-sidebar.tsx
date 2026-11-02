"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    BadgeCheckIcon,
    BookOpenCheckIcon,
    FileTextIcon,
    FlagIcon,
    GlobeIcon,
    HistoryIcon,
    LayoutDashboardIcon,
    ListChecksIcon,
    ScrollTextIcon,
    SettingsIcon,
    ShieldCheckIcon,
    SwordsIcon,
    TagsIcon,
    UsersIcon,
} from "lucide-react";

import { signOutAction } from "@/app/(auth)/actions";
import { SubmitButton } from "@/components/shared/submit-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar";
import type { IconKey, NavGroup, NavItem } from "./nav";

const ICONS: Record<IconKey, React.ComponentType<{ className?: string }>> = {
    overview: LayoutDashboardIcon,
    history: HistoryIcon,
    badge: BadgeCheckIcon,
    settings: SettingsIcon,
    rules: ListChecksIcon,
    categories: TagsIcon,
    scenarios: SwordsIcon,
    guides: BookOpenCheckIcon,
    blog: FileTextIcon,
    moderation: FlagIcon,
    users: UsersIcon,
    site: GlobeIcon,
    admin: ShieldCheckIcon,
};

type Props = {
    groups: NavGroup[];
    shortcuts: NavItem[];
    user: { name: string; email: string | null; avatarUrl: string | null; roleLabel: string };
};

const isActive = (pathname: string, item: NavItem) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);

const initials = (name: string) =>
    name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("");

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
    const Icon = ICONS[item.icon];
    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                isActive={isActive(pathname, item)}
                tooltip={item.title}
                render={<Link href={item.href} />}
            >
                <Icon />
                <span className="font-light">{item.title}</span>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}

export function AppSidebar({ groups, shortcuts, user }: Props) {
    const pathname = usePathname();

    return (
        <Sidebar variant="inset" collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" render={<Link href="/" />}>
                            <Image src="/icon/logo.svg" alt="" width={28} height={28} />
                            <span className="font-heading text-base font-normal tracking-tight">Ward-Ly</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {groups.map((group) => (
                    <SidebarGroup key={group.label}>
                        <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((item) => (
                                    <NavLink key={item.href} item={item} pathname={pathname} />
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}

                {shortcuts.length ? (
                    <SidebarGroup className="mt-auto">
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {shortcuts.map((item) => (
                                    <NavLink key={item.href} item={item} pathname={pathname} />
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ) : null}
            </SidebarContent>

            <SidebarFooter>
                <div className="flex items-center gap-3 rounded-lg p-2 group-data-[collapsible=icon]:justify-center">
                    <Avatar>
                        {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt="" /> : null}
                        <AvatarFallback>{initials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                        <span className="truncate font-normal">{user.name}</span>
                        <span className="truncate text-xs text-muted-foreground">{user.roleLabel}</span>
                    </div>
                </div>
                <form action={signOutAction} className="group-data-[collapsible=icon]:hidden">
                    <SubmitButton variant="outline" size="sm" pendingLabel="Keluar" className="w-full font-light">
                        Keluar
                    </SubmitButton>
                </form>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
