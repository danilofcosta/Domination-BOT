"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  UsersIcon,
  SearchIcon,
  SettingsIcon,
  LayoutGrid,
  BotMessageSquare,
} from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

type DockItem = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  action?: "toggleSidebar";
  size?: number;
  border?: boolean;
};

const items: DockItem[] = [
  { label: "Início", icon: HomeIcon, href: "/" },
  { label: "Usuários", icon: UsersIcon, href: "/usuarios" },
  { label: "Menu", icon: LayoutGrid, action: "toggleSidebar", size: 14, border: true },
  { label: "Galeria", icon: SearchIcon, href: "/gallery/recent" },
  { label: "Bot Setup", icon: BotMessageSquare, href: "/setup/info" },
];

export function FloatingDock() {
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const check = () => setHidden(document.body.classList.contains("lightbox-open"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  if (pathname.startsWith("/login") || hidden) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 lg:bottom-8">
      <div className="grid auto-cols-auto grid-flow-col gap-2 rounded-2xl border border-border/50 bg-background/80 px-3 py-2 shadow-lg backdrop-blur-xl lg:gap-3 lg:rounded-3xl lg:px-6 lg:py-4">
        {items.map((item) => {
          const active = item.href ? pathname === item.href : false;
          const content = (
            <>
              <item.icon className="size-6 lg:size-7" />
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 rounded-md border bg-popover px-2 py-1 text-sm text-popover-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100 whitespace-nowrap lg:text-base lg:-top-12">
                {item.label}
              </span>
            </>
          );

          const className = `group relative flex items-center justify-center rounded-xl transition-colors lg:h-14 lg:w-auto lg:px-4 lg:rounded-2xl ${
            active
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
          } ${item.border ? "border-r border-border/50 pr-2 lg:pr-4" : ""}`;

          const itemStyle = item.size ? { width: item.size * 4, minWidth: item.size * 4 } : undefined;

          if (item.action === "toggleSidebar") {
            return (
              <button
                key={item.label}
                type="button"
                onClick={toggleSidebar}
                className={className}
                style={itemStyle}
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href!}
              className={className}
              style={itemStyle}
            >
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
