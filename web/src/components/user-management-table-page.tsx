"use client";

import * as React from "react";
import { getUsers } from "@/app/admin/actions";

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
import { Button } from "@/components/ui/button";

import { SearchIcon, Loader2Icon, UserIcon } from "lucide-react";

import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import {
  UserDetailsDialog,
  UserDetailsDialogProps,
} from "./user/user-details-dialog";

// ✅ Type safety
type User = {
  id: number;
  telegramId: string;
  telegramData: any;
  profileType: string;
  coins: number;
  avatarUrl?: string;
  favoriteWaifuId: number | null;
  favoriteHusbandoId: number | null;
  waifuConfig: any;
  husbandoConfig: any;
  language: string;
};

export function UserManagementTable_page() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  // ✅ Debounce
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  // ✅ Fetch
  const fetchData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getUsers();
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

  // ✅ Optimized filter
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

  return (
    <div className="space-y-4 px-4 lg:px-6">
      {/* 🔍 Search */}
      <div className="flex justify-between items-center bg-background/50 rounded-full mt-5">
        <div className="relative w-full md:w-80">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por ID, nome ou username..."
            className="pl-9 bg-card/50 border-primary/10 rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* 📊 Table */}
      <div className="rounded-2xl border border-primary/10 bg-card/20 backdrop-blur-md overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="border-primary/5 hover:bg-transparent">
              <TableHead>ID</TableHead>
              <TableHead>Avatar</TableHead>
              <TableHead>Telegram ID</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Moedas</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {/* ⏳ Loading */}
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-64 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">
                      Carregando usuários...
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              /* ❌ Empty */
              <TableRow>
                <TableCell colSpan={7} className="h-64 text-center">
                  <p className="text-muted-foreground">
                    Nenhum usuário encontrado
                    {search && ` para "${search}"`}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              /* ✅ Data */
              filteredUsers.map((user) => (
                <TableRow
                  key={user.id}
                  className="border-primary/5 hover:bg-primary/5 transition cursor-pointer"
                >
                  <TableCell className="font-medium text-muted-foreground">
                    {user.id}
                  </TableCell>

                  {/* 🖼 Avatar */}
                  <TableCell>
                    <div className="relative w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.telegramData?.first_name || "User"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserIcon className="text-primary h-5 w-5" />
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="font-mono font-bold">
                    {user.telegramId}
                  </TableCell>

                  <TableCell className="font-bold">
                    {user.telegramData?.first_name || "Desconhecido"}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className="font-black uppercase tracking-tight border-primary/20"
                    >
                      {user.profileType}
                    </Badge>
                  </TableCell>

                  <TableCell className="font-bold text-yellow-500">
                    💰 {user.coins.toLocaleString()}
                  </TableCell>

                  <TableCell>
                    <UserDetailsDialog user={user as any} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
