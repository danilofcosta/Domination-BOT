"use client";

import * as React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboardIcon,
  UsersIcon,
  Settings2Icon,
  DatabaseIcon,
  CommandIcon,
  StarIcon,
  CalendarIcon,
  HomeIcon,
  SparklesIcon,
  HistoryIcon,
} from "lucide-react";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "characters";

  const data = {
    user: {
      name: "Administrador",
      email: "admin@bot.domination",
      avatar:
        "https://i.pinimg.com/avif/736x/c5/7c/53/c57c5390f708fa5bb180414b3e38eb3f.avf",
    },
    navMain: [
      {
        title: "Painel de Controle",
        url: "/admin",
        icon: <LayoutDashboardIcon className="size-4 text-primary" />,
        isActive: pathname === "/admin" && !searchParams.get("tab"),
      },
      {
        title: "Repositório",
        url: "#",
        icon: <DatabaseIcon className="size-4" />,
        isActive: true,
        items: [
          {
            title: "Personagens",
            url: "/admin?tab=characters",
            icon: <SparklesIcon className="size-4" />,
            isActive: currentTab === "characters",
          },
          {
            title: "Usuários",
            url: "/admin?tab=users",
            icon: <UsersIcon className="size-4" />,
            isActive: currentTab === "users",
          },
        ],
      },
      {
        title: "Sistema e Regras",
        url: "#",
        icon: <Settings2Icon className="size-4" />,
        items: [
          {
            title: "Eventos Ativos",
            url: "/admin?tab=events",
            icon: <CalendarIcon className="size-4" />,
            isActive: currentTab === "events",
          },
          {
            title: "Gestão de Raridades",
            url: "/admin?tab=rarities",
            icon: <StarIcon className="size-4 text-yellow-500" />,
            isActive: currentTab === "rarities",
          },
        ],
      },
      {
        title: "Navegação Geral",
        url: "#",
        icon: <HomeIcon className="size-4" />,
        items: [
          { title: "Ir para Início", url: "/" },
          {
            title: "Logs do Sistema",
            url: "/admin?tab=logs",
            icon: <HistoryIcon className="size-4" />,
          },
        ],
      },
    ],
  };

  const { toggleSidebar } = useSidebar();

  return (
    <Sidebar
      collapsible="icon"
      {...props}
      className="border-r border-primary/5 "
    >
   <SidebarMenuButton asChild>
  <button
    onClick={toggleSidebar}
    className="flex items-center gap-2 w-full"
  >
    <CommandIcon className="size-8" />
    <span className="text-lg font-bold">Administração</span>
  </button>
</SidebarMenuButton>

      <SidebarContent className="py-4">
        <NavMain items={data.navMain} />
      </SidebarContent>

      <SidebarFooter className="border-t border-primary/5 p-4 flex flex-col gap-4">
        <ThemeToggle />
      </SidebarFooter>
      <SidebarFooter className="border-t border-primary/5 p-4 flex flex-col gap-4">
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
