"use client";

import * as React from "react";
import { SearchIcon, Loader2Icon, UserIcon } from "lucide-react";

import {
  UserDetailsDialog,
} from "./user-details-dialog";
import { SessionPayload } from "@/lib/auth";

async function getUsersFromServer() {
  const res = await fetch('/api/admin/users', { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const PROFILE_TYPE_LOCAL = {
  SUPREME: 'SUPREME',
  ADMIN: 'ADMIN',
  MODERATOR: 'MODERATOR',
  USER: 'USER',
} as const;

type User = {
  id: number;
  telegramId: string;
  telegramData: any;
  profileType: string;
  coins: number;
  avatarUrl?: string;
  language: string;
};

interface UserManagementTable_pageProps {
  currentUser?: SessionPayload | null;
}

export function UserManagementTable_page({ currentUser }: UserManagementTable_pageProps) {
  const [users, setUsers] = React.useState<User[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const fetchData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getUsersFromServer();
      setUsers((data as any) || []);
    } catch (err) {
      console.error("Erro ao buscar usuários:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredUsers = React.useMemo(() => {
    const searchLower = debouncedSearch.toLowerCase();
    return users.filter((u) => {
      return (
        (u.telegramId ?? "").includes(debouncedSearch) ||
        u.telegramData?.first_name?.toLowerCase().includes(searchLower) ||
        u.telegramData?.username?.toLowerCase().includes(searchLower)
      );
    });
  }, [users, debouncedSearch]);

  const getProfileBadgeVariant = (type: string) => {
    switch (type) {
      case PROFILE_TYPE_LOCAL.SUPREME: return "default";
      case PROFILE_TYPE_LOCAL.ADMIN: return "secondary";
      case PROFILE_TYPE_LOCAL.USER: return "outline";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-4 px-4 lg:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64 md:w-80">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar..."
            className="pl-9 bg-card/50 border-primary/10 rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {filteredUsers.length} usuário(s) encontrado(s)
        </p>
      </div>

      <div className="rounded-2xl border border-primary/10 bg-card/20 backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="border-primary/5 hover:bg-transparent">
                <TableHead className="w-12">#</TableHead>
                <TableHead className="w-12">Avatar</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden sm:table-cell">Tipo</TableHead>
                <TableHead className="hidden md:table-cell">Moedas</TableHead>
                <TableHead className="w-12">Ações</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-muted-foreground text-sm">Carregando...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <p className="text-muted-foreground">
                      Nenhum usuário encontrado
                      {search && ` para "${search}"`}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    className="border-primary/5 hover:bg-primary/5 transition"
                  >
                    <TableCell className="font-mono text-muted-foreground text-xs">
                      {user.id}
                    </TableCell>

                    <TableCell>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                        {user.telegramData?.photo_url ? (
                          <img
                            src={user.telegramData.photo_url}
                            alt={user.telegramData?.first_name || "User"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <UserIcon className="text-primary h-4 w-4 sm:h-5 sm:w-5" />
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="font-bold">
                      <div className="flex flex-col">
                        <span className="text-sm">{user.telegramData?.first_name || "Desconhecido"}</span>
                        {user.telegramData?.username && (
                          <span className="text-xs text-muted-foreground">@{user.telegramData.username}</span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="hidden sm:table-cell">
                      <Badge
                        variant={getProfileBadgeVariant(user.profileType)}
                        className="font-bold uppercase tracking-tight text-xs"
                      >
                        {user.profileType}
                      </Badge>
                    </TableCell>

                    <TableCell className="hidden md:table-cell font-bold text-yellow-500 text-sm">
                      💰 {user.coins.toLocaleString()}
                    </TableCell>

                    <TableCell>
                      <UserDetailsDialog user={user as any} currentUser={currentUser} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
        </div>
      
      </div>
      <div className="h-16">

      </div>
    </div>
  );
}
