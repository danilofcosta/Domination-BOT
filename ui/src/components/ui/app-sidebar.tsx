"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRightIcon, UserIcon } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { SidebarHeaderLogo } from "../theme/SidebarHeaderLogo";
import { UserNav } from "../user-nav";

interface UserData {
  id: string;
  name: string;
  email: string;
  username: string | null;
  image?: string | null;
}

export function AppSidebar() {
  const [user, setUser] = useState<UserData | null>(null);
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  async function handleLogout() {
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch {}
    setUser(null);
    window.location.href = "/login";
  }

  return (
    <>
      <SidebarHeader className="border-b" >
        <SidebarHeaderLogo />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className=" border" title="Gerenciamento">
          <SidebarGroupLabel>Manutenção de Personagem</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible asChild defaultOpen>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Personagems">
                    <Link href="/characters">
                      <span>Personagems</span>
                    </Link>
                  </SidebarMenuButton>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction className="data-[state=open]:rotate-90">
                      <ChevronRightIcon />
                      <span className="sr-only">Toggle</span>
                    </SidebarMenuAction>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link href="/characters/waifu">Waifu</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link href="/characters/husbando">Husbando</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Raridades">
                  <Link href="/raridades">
                    <span>Raridades</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Eventos">
                  <Link href="/eventos">
                    <span>Eventos</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="border" title="Usuários">
          <SidebarGroupLabel>Gerenciamento de Usuários</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Usuários">
                  <Link href="/usuarios">
                    <span>Usuários</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="border" title="Galeria">
          <SidebarGroupLabel>Galeria</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Recentes">
                  <Link href="/gallery/recent">
                    <span>Recentes</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="border" title="Grupos">
          <SidebarGroupLabel>Bot setup </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Grupos Cadastrados">
                  <Link href="/setup/grupos">
                    <span>Grupos Cadastrados</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Info">
                  <Link href="/setup/info">
                    <span>Info</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Constantes">
                  <Link href="/setup/config">
                    <span>Constantes</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Limites e Bloqueios">
                  <Link href="/setup/limites">
                    <span>Limites e Bloqueios</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Dropar Personagem">
                  <Link href="/setup/drop">
                    <span>Dropar Personagem</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-2">
        {user ? (
          <UserNav user={user} onLogout={handleLogout} />
        ) : (
          <Link href="/login">
            <button className="flex w-full items-center gap-2 rounded-md p-1.5 text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
              <UserIcon className="size-4 shrink-0" />
              {!collapsed && <span>Fazer login</span>}
            </button>
          </Link>
        )}
      </SidebarFooter>
    </>
  );
}
