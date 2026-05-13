"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

interface SidebarContextType {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  toggle: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)

  // Persist state
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed")
    if (saved) setCollapsed(saved === "true")
  }, [])

  const toggle = () => {
    const newValue = !collapsed
    setCollapsed(newValue)
    localStorage.setItem("sidebar-collapsed", String(newValue))
  }

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed, toggle }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}
