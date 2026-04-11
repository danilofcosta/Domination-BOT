"use client";

import { BookSearch, House, Sparkles, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function MenuFloating() {
  const pathname = usePathname();

  const menuItems = [
    { icon: House, label: "Início", href: "/", active: pathname === "/" },
    { icon: Search, label: "Explorar", href: "/characters", active: pathname === "/characters" },
    { icon: Sparkles, label: "Populares", href: "/?sort=likes", active: false },
    { icon: BookSearch, label: "Admin", href: "/admin", active: pathname.startsWith("/admin") },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-md mx-auto">
        <div className="
          relative overflow-hidden
          bg-background/0 backdrop-blur-xl border border-primary/10
          rounded-2xl shadow-2xl shadow-black/20
          h-16 flex items-center justify-around px-2
          before:absolute before:inset-0 before:bg-linear-to-r before:from-primary/5 before:via-transparent before:to-primary/5 before:pointer-events-none
        ">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-primary/5 blur-xl opacity-0 hover:opacity-100 transition-opacity duration-300" />
          
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.active;
            
            return (
              <Link 
                key={item.href}
                href={item.href}
                className={`
                  relative flex flex-col items-center justify-center
                  px-4 py-2 rounded-xl transition-all duration-300
                  ${isActive 
                    ? "text-primary bg-primary/10 scale-105" 
                    : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
                  }
                `}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full shadow-lg shadow-primary/50" />
                )}
                
                <div className={`
                  p-1.5 rounded-lg transition-all duration-300
                  ${isActive ? "bg-primary/20" : ""}
                `}>
                  <Icon className={`size-5 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
                </div>
                
                <span className={`
                  text-[10px] font-bold uppercase tracking-wider mt-1 transition-all duration-300
                  ${isActive ? "opacity-100" : "opacity-60 group-hover:opacity-100"}
                `}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
      
      {/* Safe area for mobile */}
      <div className="h-safe-area-inset-bottom" />
    </div>
  );
}
