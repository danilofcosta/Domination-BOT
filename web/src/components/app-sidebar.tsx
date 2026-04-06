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
        title: "Dashboard",
        url: "/admin",
        icon: <LayoutDashboardIcon className="size-4 text-primary" />,
        isActive: pathname === "/admin" && !searchParams.get("tab"),
      },
      {
        title: "Repositório",
        url: "/admin?tab=characters",
        icon: <DatabaseIcon className="size-4" />,
        items: [
          {
            title: "Personagens",
            url: "/admin?tab=characters",
            icon: <SparklesIcon className="size-4" />,
            isActive: currentTab === "characters",
          },
          {
            title: "Usuários",
            url: "/admin/users",
            icon: <UsersIcon className="size-4" />,
            isActive: currentTab === "users",
          },
        ],
      },
      {
        title: "Sistema e Regras",
        url: "/admin?tab=events",
        icon: <Settings2Icon className="size-4" />,
        items: [
          {
            title: "Eventos Ativos",
            url: "/admin?tab=events",
            icon: <CalendarIcon className="size-4 text-blue-400" />,
            isActive: currentTab === "events",
          },
          {
            title: "Gestão de Raridades",
            url: "/admin?tab=rarities",
            icon: <StarIcon className="size-4 text-yellow-500" />,
            isActive: currentTab === "rarities",
          },
          {
            title: "Grupos do Telegram",
            url: "/admin?tab=groups",
            icon: <HomeIcon className="size-4 text-emerald-500" />,
            isActive: currentTab === "groups",
          },
        ],
      },
      {
        title: "Navegação",
        url: "#",
        icon: <Settings2Icon className="size-4" />,
        items: [
          { title: "Voltar ao Início", url: "/", icon: <HomeIcon className="size-4" /> },
          {
            title: "Logs do Sistema",
            url: "/admin?tab=logs",
            icon: <HistoryIcon className="size-4" />,
            isActive: currentTab === "logs",
          },
        ],
      },

 {
        title: "Inicio",
        url: "/",
        icon: <HomeIcon className="size-5 bg-amber-300/20 m-5  rounded-full" />,
      
      },



    ],
  };

  const { toggleSidebar } = useSidebar();

  return (
    <Sidebar
      collapsible="icon"
      {...props}
      className="border-r border-primary/5 bg-amber-700/20
      "
    >
   <SidebarMenuButton asChild>
  
  <button
    onClick={toggleSidebar}
    className="flex items-end gap-2 p-2 "
  >
    <CommandIcon className="size-8" />
    {/* <span className="text-lg font-bold">Administração</span> */}
    <p className="font-bold">Administração</p>
  </button>
  
</SidebarMenuButton  >



      <SidebarContent className="py-4  backdrop-blur-md">
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
