"use client";

import * as React from "react";
import { DownloadIcon, Loader2Icon, SearchIcon, CopyIcon, RefreshCwIcon, TrashIcon, LogOutIcon, BanIcon } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SessionData {
  settings: {
    genero: string;
    genero_id?: string;
    confirmLeave?: boolean;
  };
  grupo: {
    cont: number;
    dropId: number | null;
    data: Date | null;
    character: unknown | null;
    title: string | null | undefined;
    genero_id?: string;
  };
  adminSetup?: {
    action: "edit_nome" | "edit_anime" | null;
    targetId: string | null;
  };
  leaveAction?: {
    action: "sair_grupo";
    confirm: boolean;
  } | null;
}

interface Session {
  key: string;
  value: SessionData;
}

async function getSessionsFromServer(): Promise<Session[]> {
  const res = await fetch('/api/admin/sessions', { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

async function resetSessionsServer(): Promise<boolean> {
  const res = await fetch('/api/admin/sessions', { method: 'DELETE', cache: 'no-store' });
  return res.ok;
}

async function leaveGroupServer(groupId: string): Promise<boolean> {
  const res = await fetch('/api/admin/sessions/leave', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ groupId }),
  });
  return res.ok;
}

async function toggleBanUserServer(userId: string, banned: boolean): Promise<boolean> {
  const res = await fetch('/api/admin/sessions/ban', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, banned }),
  });
  return res.ok;
}

export function SessionLogsBots() {
  const [sessions, setSessions] = React.useState<Session[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [isResetting, setIsResetting] = React.useState(false);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const fetchData = React.useCallback(async () => {
    try {
      setIsRefreshing(true);
      setIsLoading(true);
      const data = await getSessionsFromServer();
      setSessions(data);
    } catch (err) {
      console.error("Erro ao buscar sessões:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredSessions = React.useMemo(() => {
    const searchLower = debouncedSearch.toLowerCase();
    return sessions.filter((s) => {
      return s.key.toLowerCase().includes(searchLower) ||
        JSON.stringify(s.value).toLowerCase().includes(searchLower);
    });
  }, [sessions, debouncedSearch]);

  const handleReset = async () => {
    if (!confirm("Tem certeza que deseja resetar todas as sessões? Esta ação não pode ser desfeita.")) return;

    setIsResetting(true);
    try {
      const success = await resetSessionsServer();
      if (success) {
        toast.success("Sessões resetadas com sucesso");
        fetchData();
      } else {
        toast.error("Erro ao resetar sessões");
      }
    } catch (err) {
      toast.error("Erro ao resetar sessões");
    } finally {
      setIsResetting(false);
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    if (!confirm("Tem certeza que deseja sair do grupo?")) return;

    setActionLoading(groupId);
    try {
      const success = await leaveGroupServer(groupId);
      if (success) {
        toast.success("Solicitação de saída enviada");
        fetchData();
      } else {
        toast.error("Erro ao enviar solicitação");
      }
    } catch (err) {
      toast.error("Erro ao enviar solicitação");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleBan = async (userId: string, currentBanned: boolean) => {
    const action = currentBanned ? "desbanir" : "banir";
    if (!confirm(`Tem certeza que deseja ${action} este usuário?`)) return;

    setActionLoading(userId);
    try {
      const success = await toggleBanUserServer(userId, !currentBanned);
      if (success) {
        toast.success(`Usuário ${action === "banir" ? "banido" : "desbanido"} com sucesso`);
        fetchData();
      } else {
        toast.error(`Erro ao ${action} usuário`);
      }
    } catch (err) {
      toast.error(`Erro ao ${action} usuário`);
    } finally {
      setActionLoading(null);
    }
  };

  const isGroup = (key: string) => key.startsWith("-100");
  const isUser = (key: string) => !key.startsWith("-100") && /^\d+$/.test(key);

  const formatDate = (date: Date | string | null) => {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleString("pt-BR");
  };

  return (
    <div className="space-y-4 px-4 lg:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64 md:w-80">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar sessões..."
            className="pl-9 bg-card/50 border-primary/10 rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => fetchData()}
            variant="outline"
            className="border-primary/20 hover:bg-primary/10"
            disabled={isRefreshing}
          >
            <RefreshCwIcon className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            className="border-red-500/20 hover:bg-red-500/10 text-red-500"
            disabled={isResetting}
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            {isResetting ? "Resetando..." : "Resetar Tudo"}
          </Button>
          <Button
            onClick={() => {
              const dataStr = JSON.stringify(filteredSessions, null, 2);
              const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
              const exportFileName = `session_logs_${new Date().toISOString().split('T')[0]}.json`;
              const linkElement = document.createElement('a');
              linkElement.setAttribute('href', dataUri);
              linkElement.setAttribute('download', exportFileName);
              linkElement.click();
            }}
            variant="outline"
            className="border-primary/20 hover:bg-primary/10"
            disabled={filteredSessions.length === 0}
          >
            <DownloadIcon className="h-4 w-4 mr-2" />
            Exportar JSON
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        {filteredSessions.length} sessão(ões) encontrada(s)
      </p>

      <div className="rounded-2xl border border-primary/10 bg-card/20 backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="border-primary/5 hover:bg-transparent">
                <TableHead className="w-32">Session Key</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Gênero</TableHead>
                <TableHead>Gen ID</TableHead>
                <TableHead>Grupo Cont</TableHead>
                <TableHead>Grupo Title</TableHead>
                <TableHead>Grupo Gen ID</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="hidden md:table-cell">Admin Setup</TableHead>
                <TableHead className="w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-muted-foreground text-sm">Carregando...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredSessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-32 text-center">
                    <p className="text-muted-foreground">
                      Nenhuma sessão encontrada
                      {search && ` para "${search}"`}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSessions.map((session) => {
                  const isGroupSession = isGroup(session.key);
                  const isUserSession = isUser(session.key);

                  return (
                    <TableRow
                      key={session.key}
                      className="border-primary/5 hover:bg-primary/5 transition"
                    >
                      <TableCell className="font-mono text-xs text-muted-foreground break-all max-w-[150px]">
                        {session.key}
                      </TableCell>

                      <TableCell>
                        {isGroupSession ? (
                          <span className="text-xs bg-blue-500/20 text-blue-500 px-2 py-1 rounded">
                            Grupo
                          </span>
                        ) : isUserSession ? (
                          <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded">
                            Usuário
                          </span>
                        ) : (
                          <span className="text-xs bg-gray-500/20 text-gray-500 px-2 py-1 rounded">
                            Desconhecido
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="font-medium">
                        {session.value?.settings?.genero || "-"}
                      </TableCell>

                      <TableCell className="font-mono text-xs">
                        {session.value?.settings?.genero_id || "-"}
                      </TableCell>

                      <TableCell className="font-mono">
                        {session.value?.grupo?.cont ?? "-"}
                      </TableCell>

                      <TableCell className="max-w-[200px] truncate">
                        {session.value?.grupo?.title || "-"}
                      </TableCell>

                      <TableCell className="font-mono text-xs">
                        {session.value?.grupo?.genero_id || "-"}
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(session.value?.grupo?.data)}
                      </TableCell>

                      <TableCell className="hidden md:table-cell">
                        {session.value?.adminSetup?.action ? (
                          <span className="text-xs bg-primary/10 px-2 py-1 rounded">
                            {session.value.adminSetup.action}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="flex gap-1">
                          {isGroupSession && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLeaveGroup(session.key)}
                              disabled={actionLoading === session.key}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-500 hover:bg-red-500/10"
                              title="Sair do grupo"
                            >
                              {actionLoading === session.key ? (
                                <Loader2Icon className="h-4 w-4 animate-spin" />
                              ) : (
                                <LogOutIcon className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                          {isUserSession && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleBan(session.key, false)}
                              disabled={actionLoading === session.key}
                              className="h-8 w-8 p-0 text-orange-500 hover:text-orange-500 hover:bg-orange-500/10"
                              title="Banir usuário"
                            >
                              {actionLoading === session.key ? (
                                <Loader2Icon className="h-4 w-4 animate-spin" />
                              ) : (
                                <BanIcon className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(JSON.stringify(session.value, null, 2));
                              setCopiedId(session.key);
                              setTimeout(() => setCopiedId(null), 2000);
                            }}
                            className="h-8 w-8 p-0"
                          >
                            {copiedId === session.key ? (
                              <span className="h-4 w-4 text-green-500">✓</span>
                            ) : (
                              <CopyIcon className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
