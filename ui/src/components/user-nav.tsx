"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/components/ui/sidebar";
import { UserDropdownContent } from "./user-dropdown-content";

interface UserData {
  id: string;
  name: string;
  email: string;
  username: string | null;
  image?: string | null;
}

interface UserNavProps {
  user: UserData;
  onLogout: () => void;
}

export function UserNav({ user, onLogout }: UserNavProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const initials = user.name
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex w-full items-center gap-2 rounded-md p-1.5 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors data-[state=open]:bg-sidebar-accent">
          <Avatar className="size-7 shrink-0">
            <AvatarImage src={user.image || ""} />
            <AvatarFallback className="text-xs bg-sidebar-primary text-sidebar-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex min-w-0 flex-1 flex-col items-start text-left">
              <span className="truncate font-medium text-sidebar-foreground">
                {user.name}
              </span>
              <span className="truncate text-[11px] text-sidebar-foreground/60">
                {user.email}
              </span>
            </div>
          )}
        </button>
      </DropdownMenuTrigger>

      <UserDropdownContent user={user} onLogout={onLogout} />
    </DropdownMenu>
  );
}
