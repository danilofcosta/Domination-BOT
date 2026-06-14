"use client";

import * as React from "react";
import { DownloadIcon, Loader2Icon, SearchIcon, CopyIcon, CheckIcon, RefreshCwIcon } from "lucide-react";

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

export function SessionLogs() {
  const [sessions, setSessions] = React.useState<Session[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

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

  const exportToJson = () => {
    const dataStr = JSON.stringify(filteredSessions, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const exportFileName = `session_logs_${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
  };

  const copyToClipboard = (id: string, data: unknown) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleString("pt-BR");
  };
  console.log(sessions);

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
            onClick={() => { fetchData(); }}
            variant="outline"
            className="border-primary/20 hover:bg-primary/10"
            disabled={isRefreshing}
          >
            <RefreshCwIcon className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button
            onClick={exportToJson}
            variant="outline"
            className="border-primary/20 hover:bg-primary/10"
            disabled={filteredSessions.length === 0}
          >
            <DownloadIcon className="h-4 w-4 mr-2" />
            Exportar JSON
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {filteredSessions.length} sessão(ões) encontrada(s)
        </p>
      </div>

      <div className="rounded-2xl border border-primary/10 bg-card/20 backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="border-primary/5 hover:bg-transparent">
                <TableHead className="w-32">Session Key</TableHead>
                <TableHead>Gênero</TableHead>
                <TableHead>Gen ID</TableHead>
                <TableHead>Grupo Cont</TableHead>
                <TableHead>Grupo Title</TableHead>
                <TableHead>Grupo Gen ID</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="hidden md:table-cell">Admin Setup</TableHead>
                <TableHead>Confirm Leave</TableHead>
                <TableHead>Leave Action</TableHead>
                <TableHead className="w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={11} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-muted-foreground text-sm">Carregando...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredSessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="h-32 text-center">
                    <p className="text-muted-foreground">
                      Nenhuma sessão encontrada
                      {search && ` para "${search}"`}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSessions.map((session) => (
                  <TableRow
                    key={session.key}
                    className="border-primary/5 hover:bg-primary/5 transition"
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground break-all max-w-[150px]">
                      {session.key}
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
                      {session.value?.settings?.confirmLeave ? (
                        <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded">
                          Sim
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>

                    <TableCell>
                      {session.value?.leaveAction?.action === "sair_grupo" ? (
                        <span className="text-xs bg-red-500/20 text-red-500 px-2 py-1 rounded">
                          {session.value.leaveAction.confirm ? "Confirmado" : "Pendente"}
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>

                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(session.key, session.value)}
                        className="h-8 w-8 p-0"
                      >
                        {copiedId === session.key ? (
                          <CheckIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <CopyIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
      </div>
    </div>
  );
}