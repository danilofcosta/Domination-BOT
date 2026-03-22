"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  Heart, 
  UserCircle, 
  Settings, 
  ChevronRight,
  Sparkles,
  Calendar,
  Gem
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Waifus", href: "/admin/waifus", icon: Heart },
  { name: "Husbandos", href: "/admin/husbandos", icon: UserCircle },
  { name: "Eventos", href: "/admin/events", icon: Calendar },
  { name: "Raridades", href: "/admin/rarities", icon: Gem },
  { name: "Usuários", href: "/admin/users", icon: Users },
  { name: "Configurações", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-900 h-screen sticky top-0 flex flex-col p-6 shadow-2xl">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40">
           <Sparkles className="text-white w-6 h-6" />
        </div>
        <div>
           <h2 className="text-lg font-bold text-zinc-100 tracking-tight">Admin</h2>
           <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Domination Bot</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-zinc-900 text-white shadow-inner" 
                  : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/50"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive ? "text-blue-500" : "text-zinc-600")} />
                <span className="font-medium text-sm">{item.name}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 text-blue-500/50" />}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-zinc-900">
         <Link href="/" className="flex items-center gap-2 px-4 py-2 text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
            &larr; Voltar para o Site
         </Link>
      </div>
    </aside>
  );
}
