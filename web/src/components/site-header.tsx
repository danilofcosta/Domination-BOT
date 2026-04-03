import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function SiteHeader() {
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <h1 className="text-2xl font-bold bg-background/10 shadow border-0.5 p-1 rounded-xl ">{getGreeting()}, Admin</h1>
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm">
          Sair
        </Button>
        <SidebarTrigger variant="outline" size="sm">
          Menu
        </SidebarTrigger>
      </div>
    </header>
  );
}


function getGreeting() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return "Bom dia";
  if (hour >= 12 && hour < 18) return "Boa tarde";
  if (hour >= 18 && hour < 24) return "Boa noite";
  return "Boa madrugada";
}