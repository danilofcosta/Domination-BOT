"use client";

import { useSidebar } from "../ui/sidebar";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";

export function SidebarHeaderLogo() {
  const { toggleSidebar } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          tooltip="Dominations"
          onClick={toggleSidebar}
          className="h-12"
        >
          <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground group-data-[collapsible=icon]:size-4 group-data-[collapsible=icon]:rounded">
            <span className="text-xs font-bold group-data-[collapsible=icon]:text-[9px]">DM</span>
          </div>
          <span className="whitespace-nowrap text-lg font-semibold group-data-[collapsible=icon]:hidden">
            𝕯𝖔𝖒𝖎𝖓𝖆𝖙𝖎𝖔𝖓𝖘
          </span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
