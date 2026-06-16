"use client";

import { Avatar, AvatarFallback } from "../ui/avatar";
import { useSidebar } from "../ui/sidebar";

export function SidebarHeaderLogo() {
  const { toggleSidebar } = useSidebar();

  return (
    <button
  type="button"
  onClick={toggleSidebar}
  className="flex items-center gap-2 px-2 py-2 w-full group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-auto"
>
  <Avatar className="size-8 shrink-0">
    <AvatarFallback className="text-xs font-bold">
      DM
    </AvatarFallback>
  </Avatar>

  <span className="whitespace-nowrap text-lg font-semibold group-data-[collapsible=icon]:hidden">
    𝕯𝖔𝖒𝖎𝖓𝖆𝖙𝖎𝖔𝖓𝖘
  </span>
</button>
  );
}