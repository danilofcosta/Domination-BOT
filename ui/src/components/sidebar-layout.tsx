"use client";

import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FloatingDock } from "@/components/floating-dock";

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideSidebar = pathname.startsWith("/login");

  if (hideSidebar) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <TooltipProvider>
        <Sidebar variant="floating" collapsible="icon">
          <AppSidebar />
        </Sidebar>
        {/* <SidebarTrigger /> */}
        <SidebarInset>
          <main className="pb-24 lg:pb-28">{children}</main>
          <FloatingDock />
        </SidebarInset>
      </TooltipProvider>
    </SidebarProvider>
  );
}
