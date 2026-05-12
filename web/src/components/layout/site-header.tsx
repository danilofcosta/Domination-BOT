import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { SessionPayload } from "@/lib/auth/auth";

interface SiteHeaderProps {
  user?: SessionPayload | null;
}

export function SiteHeader({ user }: SiteHeaderProps) {
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-3">
        {user?.photoUrl && (
          <img
            src={user.photoUrl}
            alt={user.firstName}
            className="w-10 h-10 rounded-full border-2 border-primary"
          />
        )}
        <div>
          <h1 className="text-2xl font-bold bg-background/10 shadow border-0.5 p-1 rounded-xl">
            {getGreeting()}, {user?.firstName || "Admin"}
          </h1>
          {user?.profileType && (
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              {user.profileType}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <form action="/api/auth/logout" method="POST">
          <Button variant="outline" size="sm" type="submit">
            Sair
          </Button>
        </form>
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
