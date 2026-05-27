"use client";

import * as React from "react";
import {
  DownloadIcon,
  Loader2Icon,
  SearchIcon,
  CopyIcon,
  RefreshCwIcon,
  TrashIcon,
  LogOutIcon,
  BanIcon,
  X,
} from "lucide-react";

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
  };
  locale?: string;
  grupo?: {
    directMessagesTopicId?: number | null;
  };
  adminSetup?: {
    action: string | null;
    targetId: string | null;
  };
  rarityEdits?: Record<string, unknown>;
  eventEdits?: Record<string, unknown>;
  rarityListPage?: number;
  eventListPage?: number;
  backupState?: {
    action: string;
  };
}

interface Session {
  key: string;
  value: SessionData;
}

function parseKey(key: string) {
  const parts = key.split("_type_");
  const prefix = parts[0] || "";
  const chatType = parts[1] || "";
  const prefixParts = prefix.split("_");
  const genero = prefixParts[0] || "";
  const chatId = prefixParts.slice(1).join("_");
  return { genero, chatId, chatType };
}

async function getSessionsFromServer(): Promise<Session[]> {
  const res = await fetch("/api/admin/sessions", { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

async function resetSessionsServer(): Promise<boolean> {
  const res = await fetch("/api/admin/sessions", { method: "DELETE", cache: "no-store" });
  return res.ok;
}

async function leaveGroupServer(groupId: string): Promise<boolean> {
  const res = await fetch("/api/admin/sessions/leave", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ groupId }),
  });
  return res.ok;
}

async function toggleBanUserServer(userId: string, banned: boolean): Promise<boolean> {
  const res = await fetch("/api/admin/sessions/ban", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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

  const [filterChatType, setFilterChatType] = React.useState<string>("all");
  const [filterLocale, setFilterLocale] = React.useState<string>("all");
  const [filterGenero, setFilterGenero] = React.useState<string>("all");
  const [filterAdminSetup, setFilterAdminSetup] = React.useState<string>("all");
  const [filterBackup, setFilterBackup] = React.useState<string>("all");

  const debouncedSearchRef = React.useRef(debouncedSearch);
  debouncedSearchRef.current = debouncedSearch;

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

  const uniqueLocales = React.useMemo(() => {
    const set = new Set<string>();
    sessions.forEach((s) => {
      if (s.value?.locale) set.add(s.value.locale);
    });
    return Array.from(set).sort();
  }, [sessions]);

  const uniqueChatTypes = React.useMemo(() => {
    const set = new Set<string>();
    sessions.forEach((s) => {
      const { chatType } = parseKey(s.key);
      if (chatType) set.add(chatType);
    });
    return Array.from(set).sort();
  }, [sessions]);

  const filteredSessions = React.useMemo(() => {
    const searchLower = debouncedSearch.toLowerCase();
    return sessions.filter((s) => {
      if (filterChatType !== "all") {
        const { chatType } = parseKey(s.key);
        if (chatType !== filterChatType) return false;
      }
      if (filterLocale !== "all") {
        if ((s.value?.locale || "") !== filterLocale) return false;
      }
      if (filterGenero !== "all") {
        if ((s.value?.settings?.genero || "") !== filterGenero) return false;
      }
      if (filterAdminSetup !== "all") {
        const hasSetup = !!s.value?.adminSetup?.action;
        if (filterAdminSetup === "yes" && !hasSetup) return false;
        if (filterAdminSetup === "no" && hasSetup) return false;
      }
      if (filterBackup !== "all") {
        const hasBackup = !!s.value?.backupState?.action;
        if (filterBackup === "yes" && !hasBackup) return false;
        if (filterBackup === "no" && hasBackup) return false;
      }
      if (!searchLower) return true;
      return (
        s.key.toLowerCase().includes(searchLower) ||
        JSON.stringify(s.value).toLowerCase().includes(searchLower)
      );
    });
  }, [sessions, debouncedSearch, filterChatType, filterLocale, filterGenero, filterAdminSetup, filterBackup]);

  const hasFilters = filterChatType !== "all" || filterLocale !== "all" || filterGenero !== "all" || filterAdminSetup !== "all" || filterBackup !== "all";

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
    } catch {
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
    } catch {
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
    } catch {
      toast.error(`Erro ao ${action} usuário`);
    } finally {
      setActionLoading(null);
    }
  };

  const clearFilters = () => {
    setFilterChatType("all");
    setFilterLocale("all");
    setFilterGenero("all");
    setFilterAdminSetup("all");
    setFilterBackup("all");
  };

  function Select({
    value,
    onChange,
    options,
    label,
  }: {
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
    label: string;
  }) {
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 px-3 rounded-xl text-xs font-medium border border-border/40 bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        <option value="all">{label}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div className="space-y-4 px-4 lg:px-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-64 md:w-80">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar sessões..."
              className="pl-9 bg-card/50 border-primary/10 rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            value={filterChatType}
            onChange={setFilterChatType}
            options={uniqueChatTypes.map((t) => ({ value: t, label: t }))}
            label="Tipo de Chat"
          />
          <Select
            value={filterLocale}
            onChange={setFilterLocale}
            options={uniqueLocales.map((l) => ({ value: l, label: l.toUpperCase() }))}
            label="Idioma"
          />
          <Select
            value={filterGenero}
            onChange={setFilterGenero}
            options={[
              { value: "waifu", label: "Waifu" },
              { value: "husbando", label: "Husbando" },
            ]}
            label="Gênero"
          />
          <Select
            value={filterAdminSetup}
            onChange={setFilterAdminSetup}
            options={[
              { value: "yes", label: "Com Setup" },
              { value: "no", label: "Sem Setup" },
            ]}
            label="Admin Setup"
          />
          <Select
            value={filterBackup}
            onChange={setFilterBackup}
            options={[
              { value: "yes", label: "Com Backup" },
              { value: "no", label: "Sem Backup" },
            ]}
            label="Backup"
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {filteredSessions.length} sessão(ões) encontrada(s)
            </span>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="size-3" />
                Limpar filtros
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => fetchData()}
              variant="outline"
              className="border-primary/20 hover:bg-primary/10"
              disabled={isRefreshing}
            >
              <RefreshCwIcon className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
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
                const exportFileName = `session_logs_${new Date().toISOString().split("T")[0]}.json`;
                const linkElement = document.createElement("a");
                linkElement.setAttribute("href", dataUri);
                linkElement.setAttribute("download", exportFileName);
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
      </div>

      <div className="rounded-2xl border border-primary/10 bg-card/20 backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="border-primary/5 hover:bg-transparent">
                <TableHead className="w-32">Session Key</TableHead>
                <TableHead>Tipo Chat</TableHead>
                <TableHead>Chat ID</TableHead>
                <TableHead>Gênero</TableHead>
                <TableHead>Idioma</TableHead>
                <TableHead>Topic ID</TableHead>
                <TableHead>Admin Setup</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Rarity Page</TableHead>
                <TableHead>Event Page</TableHead>
                <TableHead>Backup</TableHead>
                <TableHead className="w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={12} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-muted-foreground text-sm">Carregando...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredSessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="h-32 text-center">
                    <p className="text-muted-foreground">
                      Nenhuma sessão encontrada
                      {search && ` para "${search}"`}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSessions.map((session) => {
                  const { genero, chatId, chatType } = parseKey(session.key);
                  const v = session.value || ({} as SessionData);
                  const isPrivate = chatType === "private";
                  const isGroup = chatType === "group" || chatType === "supergroup";

                  return (
                    <TableRow
                      key={session.key}
                      className="border-primary/5 hover:bg-primary/5 transition"
                    >
                      <TableCell className="font-mono text-xs text-muted-foreground break-all max-w-[120px]">
                        {session.key}
                      </TableCell>

                      <TableCell>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            isPrivate
                              ? "bg-green-500/20 text-green-500"
                              : isGroup
                                ? "bg-blue-500/20 text-blue-500"
                                : "bg-gray-500/20 text-gray-500"
                          }`}
                        >
                          {chatType || "-"}
                        </span>
                      </TableCell>

                      <TableCell className="font-mono text-xs">
                        {chatId || "-"}
                      </TableCell>

                      <TableCell>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            genero === "waifu"
                              ? "bg-pink-500/20 text-pink-500"
                              : genero === "husbando"
                                ? "bg-cyan-500/20 text-cyan-500"
                                : "bg-gray-500/20 text-gray-500"
                          }`}
                        >
                          {genero || "-"}
                        </span>
                      </TableCell>

                      <TableCell className="font-mono text-xs">
                        {v.locale ? (
                          <span className="uppercase">{v.locale}</span>
                        ) : (
                          "-"
                        )}
                      </TableCell>

                      <TableCell className="font-mono text-xs">
                        {v.grupo?.directMessagesTopicId ?? "-"}
                      </TableCell>

                      <TableCell className="text-xs">
                        {v.adminSetup?.action ? (
                          <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                            {v.adminSetup.action}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>

                      <TableCell className="font-mono text-xs">
                        {v.adminSetup?.targetId || "-"}
                      </TableCell>

                      <TableCell className="font-mono text-xs">
                        {v.rarityListPage ?? "-"}
                      </TableCell>

                      <TableCell className="font-mono text-xs">
                        {v.eventListPage ?? "-"}
                      </TableCell>

                      <TableCell className="text-xs">
                        {v.backupState?.action ? (
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              v.backupState.action === "create"
                                ? "bg-emerald-500/20 text-emerald-500"
                                : v.backupState.action === "restore"
                                  ? "bg-amber-500/20 text-amber-500"
                                  : "bg-blue-500/20 text-blue-500"
                            }`}
                          >
                            {v.backupState.action}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="flex gap-1">
                          {isGroup && (
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
                          {isPrivate && (
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
