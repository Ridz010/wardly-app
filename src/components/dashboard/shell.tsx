import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { Profile, SessionUser } from "@/lib/auth/session";
import { AppSidebar } from "./app-sidebar";
import type { NavGroup, NavItem } from "./nav";
import { SiteHeader } from "./site-header";

const ROLE_LABEL = { user: "Anggota", moderator: "Moderator", admin: "Admin" } as const;

type Props = {
    groups: NavGroup[];
    shortcuts: NavItem[];
    user: SessionUser;
    profile: Profile;
    fallbackTitle: string;
    children: React.ReactNode;
};

export function DashboardShell({ groups, shortcuts, user, profile, fallbackTitle, children }: Props) {
    return (
        <SidebarProvider>
            <AppSidebar
                groups={groups}
                shortcuts={shortcuts}
                user={{
                    name: profile.display_name,
                    email: user.email,
                    avatarUrl: profile.avatar_url ?? user.avatarUrl,
                    roleLabel: ROLE_LABEL[profile.role],
                }}
            />
            <SidebarInset>
                <SiteHeader groups={groups} fallback={fallbackTitle} />
                <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 p-4 py-8 lg:p-8">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
