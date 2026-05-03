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
  TrophyIcon,
  X,
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
      { title: "Sessões Bots", url: "/admin?tab=session_logs_bots", icon: FileJsonIcon },
      { title: "Top Coleções", url: "/admin?tab=collections", icon: TrophyIcon },
    ],
  },
  {
    title: "Geral",
    items: [
      { title: "Voltar ao Site", url: "/", icon: HomeIcon },
    ],
  },
];

function SidebarHeader({ onClose }: { onClose?: () => void }) {
  const { toggleSidebar, isMobile } = useSidebar();

  return (
    <div className="px-3 py-4 flex items-center justify-between border-b border-primary/10">
      <button
        onClick={toggleSidebar}
        className="flex items-center gap-3 p-2 rounded-xl hover:bg-primary/10 transition-all duration-200 active:scale-95"
      >
        <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
          <CommandIcon className="size-5 text-primary" />
        </div>
        <div className="hidden md:flex flex-col items-start">
          <span className="font-bold text-sm">Administração</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Domination Bot</span>
        </div>
      </button>
      {isMobile && onClose && (
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-primary/10 transition-colors md:hidden"
          aria-label="Fechar menu"
        >
          <X className="size-5" />
        </button>
      )}
    </div>
  );
}

export function AppSidebar({ sessionUser, ...props }: AppSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toggleSidebar, isMobile } = useSidebar();

  const isActive = React.useCallback((url: string) => {
    if (url === "/admin") return pathname === "/admin" && !searchParams.has("tab");
    if (url === "/admin/users") return pathname === "/admin/users";
    const tab = url.split("?")[1]?.split("=")[1];
    return tab ? searchParams.get("tab") === tab : false;
  }, [pathname, searchParams]);

  const handleNavClick = React.useCallback(() => {
    if (isMobile) {
      toggleSidebar();
    }
  }, [isMobile, toggleSidebar]);

  return (
    <Sidebar
      collapsible="icon"
      {...props}
      className="border-r border-primary/10 bg-gradient-to-b from-amber-900/20 via-background to-background"
    >
      <SidebarHeader onClose={isMobile ? toggleSidebar : undefined} />
      
      <SidebarContent className="py-2 px-1">
        {navItems.map((group) => (
          <SidebarGroup key={group.title} className="px-1 py-2">
            <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 px-3 mb-2">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.url);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        className={`rounded-xl transition-all duration-200 group ${
                          active
                            ? "bg-primary/15 text-primary font-semibold shadow-sm"
                            : "hover:bg-primary/5 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Link
                          href={item.url}
                          onClick={handleNavClick}
                          className="flex items-center gap-3 px-3 py-2.5"
                        >
                          <Icon
                            className={`size-4 shrink-0 transition-colors duration-200 ${
                              active
                                ? "text-primary"
                                : "text-muted-foreground/70 group-hover:text-foreground"
                            }`}
                          />
                          <span className="text-sm font-medium truncate">{item.title}</span>
                          {active && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          )}
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

      <SidebarFooter className="border-t border-primary/10 p-3 space-y-2">
        <div className="flex items-center justify-center py-1">
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
