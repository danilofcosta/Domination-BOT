"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { LogOutIcon } from "lucide-react";

interface UserData {
  id: string;
  name: string;
  email: string;
  username: string | null;
  image?: string | null;
}

interface UserDropdownContentProps {
  user: UserData;
  onLogout: () => void;
}

export function UserDropdownContent({ user, onLogout }: UserDropdownContentProps) {
  const initials = user.name
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenuContent align="end" className="w-72">
      <Button variant="ghost" className="w-full justify-start gap-2 px-2" asChild>
        <Link href="/profile">
          <Avatar className="size-8">
            <AvatarImage src={user.image || ""} />
            <AvatarFallback>{initials || "?"}</AvatarFallback>
          </Avatar>

          <div className="flex flex-col items-start text-left">
            <span className="text-sm font-medium">
              {user.name}
            </span>

            <span className="text-xs text-muted-foreground">
              {user.email}
            </span>
          </div>
        </Link>
      </Button>

      <Card className="mx-2 mb-2 mt-1 border-destructive/20">
        <CardContent className="p-1">
          <DropdownMenuItem
            onClick={onLogout}
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <LogOutIcon className="mr-2 size-4" />
            Sair
          </DropdownMenuItem>
        </CardContent>
      </Card>
    </DropdownMenuContent>
  );
}
