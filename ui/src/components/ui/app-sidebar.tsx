"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CalendarDaysIcon,
  ChevronRightIcon,
  CrownIcon,
  GemIcon,
  HeartIcon,
  ImageIcon,
  SettingsIcon,
  ShieldCheckIcon,
  ShieldIcon,
  SwordsIcon,
  UserIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { SidebarHeaderLogo } from "../theme/SidebarHeaderLogo";
import { UserNav } from "../user-nav";

interface UserData {
  id: string;
  name: string;
  email: string;
  username: string | null;
  image?: string | null;
  telegramUser?: {
    profileType: string;
  } | null;
  permissions?: string[];
}

type SidebarItem = {
  href: string;
  label: string;
  permission?: string;
  icon: LucideIcon;
};

const sidebarSections: {
  label: string;
  items: SidebarItem[];
  collapsible?: { href: string; label: string; icon: LucideIcon; children: SidebarItem[] };
}[] = [
  {
    label: "Manutenção de Personagem",
    collapsible: {
      href: "/characters",
      label: "Personagems",
      icon: SwordsIcon,
      children: [
        { href: "/characters/waifu", label: "Waifu", icon: HeartIcon },
        { href: "/characters/husbando", label: "Husbando", icon: CrownIcon },
      ],
    },
    items: [
      { href: "/characters/raridades", label: "Raridades", permission: "manage_rarities", icon: GemIcon },
      { href: "/characters/eventos", label: "Eventos", permission: "manage_events", icon: CalendarDaysIcon },
    ],
  },
  {
    label: "Gerenciamento de Usuários",
    items: [
      { href: "/usuarios", label: "Usuários", permission: "manage_users", icon: UsersIcon },
    ],
  },
  {
    label: "Galeria",
    items: [
      { href: "/gallery/recent", label: "Recentes", icon: ImageIcon },
    ],
  },
  {
    label: "Bot setup",
    items: [
      { href: "/setup", label: "Configurações", permission: "manage_config", icon: SettingsIcon },
      { href: "/setup/admins", label: "Permissões", permission: "manage_admins", icon: ShieldCheckIcon },
      { href: "/setup/limites", label: "Limites e Bloqueios", permission: "manage_limits", icon: ShieldIcon },
    ],
  },
];

function hasSidebarPermission(
  permissions: string[] | undefined,
  isSupreme: boolean,
  permission?: string,
): boolean {
  if (!permission) return true;
  if (isSupreme) return true;
  return permissions?.includes(permission) ?? false;
}

export function AppSidebar() {
  const [user, setUser] = useState<UserData | null>(null);
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const profileType = user?.telegramUser?.profileType ?? null;
  const isSupreme = profileType === "SUPREME";

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  async function handleLogout() {
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch {}
    setUser(null);
    window.location.href = "/login";
  }

  const visibleSections = sidebarSections
    .map((section) => {
      const visibleItems = section.items.filter((item) =>
        hasSidebarPermission(user?.permissions, isSupreme, item.permission),
      );
      const collapsibleVisible =
        !section.collapsible ||
        hasSidebarPermission(user?.permissions, isSupreme, "manage_characters");

      return {
        ...section,
        items: visibleItems,
        collapsibleVisible,
      };
    })
    .filter(
      (section) =>
        section.items.length > 0 || section.collapsibleVisible,
    );

  return (
    <>
      <SidebarHeader className="border-b">
        <SidebarHeaderLogo />
      </SidebarHeader>

      <SidebarContent>
        {visibleSections.map((section) => (
          <SidebarGroup className="border" key={section.label}>
            <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.collapsible && section.collapsibleVisible && (
                  <Collapsible asChild defaultOpen>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip={section.collapsible.label}>
                        <Link href={section.collapsible.href}>
                          <section.collapsible.icon />
                          <span>{section.collapsible.label}</span>
                        </Link>
                      </SidebarMenuButton>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuAction className="data-[state=open]:rotate-90">
                          <ChevronRightIcon />
                          <span className="sr-only">Toggle</span>
                        </SidebarMenuAction>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {section.collapsible.children.map((child) => (
                            <SidebarMenuSubItem key={child.href}>
                              <SidebarMenuSubButton asChild>
                                <Link href={child.href}>{child.label}</Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                )}

                {section.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild tooltip={item.label}>
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t p-2">
        {user ? (
          <UserNav user={user} onLogout={handleLogout} />
        ) : (
          <Link href="/login">
            <button className="flex w-full items-center gap-2 rounded-md p-1.5 text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
              <UserIcon className="size-4 shrink-0" />
              {!collapsed && <span>Fazer login</span>}
            </button>
          </Link>
        )}
      </SidebarFooter>
    </>
  );
}
