"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  UsersIcon,
  ImageIcon,
  SparklesIcon,
  SettingsIcon,
  BarChart3Icon,
} from "lucide-react";

const items = [
  { label: "Início", icon: HomeIcon, href: "/" },
  { label: "Usuários", icon: UsersIcon, href: "/usuarios" },
  { label: "Galeria", icon: ImageIcon, href: "/gallery/recent" },
  { label: "Personagens", icon: SparklesIcon, href: "/raridades" },
  { label: "Eventos", icon: BarChart3Icon, href: "/eventos" },
  { label: "Setup", icon: SettingsIcon, href: "/setup/info" },
];

export function FloatingDock() {
  const pathname = usePathname();

  if (pathname.startsWith("/login")) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-1 rounded-2xl border border-border/50 bg-background/80 px-2 py-1.5 shadow-lg backdrop-blur-xl">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex size-10 items-center justify-center rounded-xl transition-colors ${
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              }`}
            >
              <item.icon className="size-4" />
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-md border bg-popover px-2 py-1 text-xs text-popover-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100 whitespace-nowrap">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
