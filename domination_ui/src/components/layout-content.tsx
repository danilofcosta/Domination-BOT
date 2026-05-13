"use client"

import { useSidebar } from "@/components/sidebar-provider"
import { cn } from "@/lib/utils"

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar()

  return (
    <main className={cn(
      "min-h-screen transition-all duration-300 ease-in-out",
      collapsed ? "lg:ml-16" : "lg:ml-60"
    )}>
      {children}
    </main>
  )
}
