"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Users,
  Gem,
  Calendar,
  Menu,
  X,
} from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Painel", icon: LayoutDashboard },
  { href: "/dashboard/characters", label: "Personagens", icon: Users },
  { href: "/dashboard/rarities", label: "Raridades", icon: Gem },
  { href: "/dashboard/events", label: "Eventos", icon: Calendar },
]

export function Sidebar() {
  const [open, setOpen] = useState(false)
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
          "fixed top-0 left-0 z-50 flex h-full w-60 flex-col border-r bg-background transition-transform duration-200 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center border-b px-4">
          <h2 className="font-heading text-lg font-semibold tracking-tight">Domination</h2>
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
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
