"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useSidebar } from "./sidebar-provider"
import {
  LayoutDashboard,
  Users,
  Gem,
  Calendar,
  Menu,
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Library,
  UserCircle,
} from "lucide-react"

const navItems = [
  { href: "/home", label: "Início", icon: Sparkles },
  { href: "/dashboard", label: "Painel", icon: LayoutDashboard },
  { href: "/dashboard/characters", label: "Personagens", icon: Users },
  { href: "/dashboard/rarities", label: "Raridades", icon: Gem },
  { href: "/dashboard/events", label: "Eventos", icon: Calendar },
  { href: "/dashboard/collections", label: "Coleções", icon: Library },
  { href: "/dashboard/users", label: "Usuários", icon: UserCircle },
]

export function Sidebar() {
  const [open, setOpen] = useState(false)
  const { collapsed, toggle } = useSidebar()
  const pathname = usePathname()

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 flex h-full flex-col border-r bg-background transition-all duration-300 ease-in-out lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
          collapsed ? "w-16" : "w-60"
        )}
      >
        <div className={cn(
          "flex h-14 items-center border-b px-4 transition-all duration-300",
          collapsed ? "justify-center" : "justify-between"
        )}>
          {!collapsed && (
            <h2 className="font-heading text-lg font-semibold tracking-tight truncate">Domination</h2>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className="hidden lg:flex size-8 rounded-full"
            onClick={toggle}
          >
            {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </Button>
        </div>
        
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  collapsed ? "justify-center px-0" : "",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className={cn("size-4 shrink-0", collapsed ? "size-5" : "")} />
                {!collapsed && (
                  <span className="truncate transition-opacity duration-300 opacity-100">
                    {item.label}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
