"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { NavUser } from "@/components/nav-user";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboardIcon,
  UsersIcon,
  Settings2Icon,
  CommandIcon,
  StarIcon,
  CalendarIcon,
  HomeIcon,
  SparklesIcon,
  FileJsonIcon,
} from "lucide-react";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  sessionUser?: {
    name: string;
    role: string;
    avatar: string;
  };
}

const navItems = [
  {
    title: "Principal",
    items: [
      { title: "Dashboard", url: "/admin", icon: LayoutDashboardIcon },
    ],
  },
  {
    title: "Repositório",
    items: [
      { title: "Personagens", url: "/admin?tab=characters", icon: SparklesIcon },
      { title: "Usuários", url: "/admin?tab=users", icon: UsersIcon },
    ],
  },
  {
    title: "Sistema",
    items: [
      { title: "Eventos", url: "/admin?tab=events", icon: CalendarIcon },
      { title: "Raridades", url: "/admin?tab=rarities", icon: StarIcon },
      { title: "Grupos Telegram", url: "/admin?tab=groups", icon: Settings2Icon },
      { title: "Logs de Sessão", url: "/admin?tab=session_logs", icon: FileJsonIcon },
    ],
  },
  {
    title: "Geral",
    items: [
      { title: "Voltar ao Site", url: "/", icon: HomeIcon },
    ],
  },
];

export function AppSidebar({ sessionUser, ...props }: AppSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toggleSidebar } = useSidebar();

  const isActive = React.useCallback((url: string) => {
    if (url === "/admin") return pathname === "/admin" && !searchParams.has("tab");
    if (url === "/admin/users") return pathname === "/admin/users";
    const tab = url.split("?")[1]?.split("=")[1];
    return tab ? searchParams.get("tab") === tab : false;
  }, [pathname, searchParams]);

  return (
    <Sidebar collapsible="icon" {...props} className="border-r border-primary/10 bg-gradient-to-b from-amber-900/30 to-background">
      <SidebarContent className="py-2">
        <SidebarMenuButton asChild className="mb-2 mx-2">
          <button
            onClick={toggleSidebar}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/10 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center">
              <CommandIcon className="size-5 text-primary" />
            </div>
            <div className="flex flex-col items-start">
              <span className="font-bold text-sm">Administração</span>
              <span className="text-xs text-muted-foreground">Domination Bot</span>
            </div>
          </button>
        </SidebarMenuButton>

        {navItems.map((group) => (
          <SidebarGroup key={group.title} className="px-2">
            <SidebarGroupLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60 px-3 mb-1">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.url);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        className={`rounded-lg transition-all ${active ? "bg-primary/15 text-primary font-semibold" : "hover:bg-primary/5"}`}
                      >
                        <Link href={item.url} className="flex items-center gap-3 px-3 py-2">
                          <Icon className={`size-4 ${active ? "text-primary" : ""}`} />
                          <span className="text-sm">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-primary/10 p-3 space-y-3">
        <div className="flex items-center justify-center">
          <ThemeToggle />
        </div>
        <div className="pt-2 border-t border-primary/10">
          <NavUser
            user={sessionUser ? {
              name: sessionUser.name,
              email: sessionUser.role,
              avatar: sessionUser.avatar,
            } : {
              name: "Admin",
              email: "Sistema",
              avatar: "",
            }}
          />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
