"use client";

import { useState, startTransition } from "react";
import { SearchIcon } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type UserInfo = {
  id: number;
  telegramId: string;
  name: string;
  username: string;
  profileType: string;
  language: string;
  coins: number;
  waifuCount: number;
  husbandoCount: number;
  dailyCaptures: number | null;
  blocked: boolean;
};

type Props = {
  defaultTelegramId?: string;
};

export function UserInfoDialog({ defaultTelegramId }: Props) {
  const [open, setOpen] = useState(false);
  const [telegramId, setTelegramId] = useState(defaultTelegramId || "");
  const [data, setData] = useState<UserInfo | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  function search(id?: string) {
    const target = (id || telegramId).trim();
    if (!target) return;
    setTelegramId(target);
    setPending(true);
    setData(null);
    setError("");
    startTransition(async () => {
      const { lookupUser } = await import("@/actions/users");
      const result: any = await lookupUser(target);
      if (result.error) {
        setError(result.error);
      } else {
        setData(result);
      }
      setPending(false);
    });
  }

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen);
    if (isOpen && defaultTelegramId) {
      search(defaultTelegramId);
    }
  }

  const PROFILE_LABELS: Record<string, string> = {
    SUPREME: "Supremo",
    SUPER_ADMIN: "Super Admin",
    ADMIN: "Admin",
    MODERATOR: "Moderador",
    USER: "Usuário",
    BANNED: "Banido",
  };

  const PROFILE_COLORS: Record<string, string> = {
    SUPREME: "text-yellow-400",
    SUPER_ADMIN: "text-red-400",
    ADMIN: "text-orange-400",
    MODERATOR: "text-blue-400",
    USER: "text-muted-foreground",
    BANNED: "text-red-600",
  };

  const searchedTelegramId = defaultTelegramId || "";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {defaultTelegramId ? (
          <button
            type="button"
            className="rounded-lg border border-border/70 bg-card/60 px-2 py-1 text-xs backdrop-blur-md transition-colors hover:bg-card"
          >
            Detalhes
          </button>
        ) : (
          <button
            type="button"
            className="rounded-lg border border-border/70 bg-card/60 px-4 py-2 text-sm backdrop-blur-md transition-colors hover:bg-card"
          >
            <SearchIcon className="mr-2 inline h-4 w-4" />
            Buscar por Telegram ID
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Buscar Usuário</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <input
            value={telegramId}
            onChange={(e) => setTelegramId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="Telegram ID do usuário..."
            className="flex-1 rounded-lg border border-border/70 bg-card/60 px-3 py-2 text-sm backdrop-blur-md placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-border"
          />
          <button
            type="button"
            onClick={() => search()}
            disabled={pending || !telegramId.trim()}
            className="rounded-lg border border-border/70 bg-card/80 px-3 py-2 text-sm backdrop-blur-md transition-colors hover:bg-card disabled:opacity-50"
          >
            {pending ? "..." : "Buscar"}
          </button>
        </div>

        {pending && <p className="text-muted-foreground py-4 text-center text-sm">Buscando...</p>}

        {error && (
          <p className="rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
        )}

        {data && (
          <div className="space-y-3 pt-2">
            <Row label="ID" value={String(data.id)} />
            <Row label="Telegram ID" value={data.telegramId} />
            <Row label="Nome" value={data.name} isLong />
            <Row label="Username" value={data.username ? `@${data.username}` : "—"} />
            <div className="flex items-center justify-between rounded-lg border border-border/30 bg-border/10 px-4 py-2.5">
              <span className="text-xs text-muted-foreground">Tipo</span>
              <span className={`text-xs font-semibold ${PROFILE_COLORS[data.profileType]}`}>
                {PROFILE_LABELS[data.profileType] || data.profileType}
              </span>
            </div>
            <Row label="Idioma" value={data.language} />
            <Row label="Moedas" value={String(data.coins)} />
            <Row label="Waifus" value={String(data.waifuCount)} />
            <Row label="Husbandos" value={String(data.husbandoCount)} />
            <Row label="Capturas hoje" value={data.dailyCaptures !== null ? String(data.dailyCaptures) : "—"} />
            <div className="flex items-center justify-between rounded-lg border border-border/30 bg-border/10 px-4 py-2.5">
              <span className="text-xs text-muted-foreground">Status</span>
              <span className={`text-xs font-semibold ${data.blocked ? "text-red-400" : "text-emerald-400"}`}>
                {data.blocked ? "Bloqueado (rate limit)" : "Normal"}
              </span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value, isLong }: { label: string; value: string; isLong?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/30 bg-border/10 px-4 py-2.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-right text-xs font-medium ${isLong ? "max-w-[160px] truncate" : ""}`}>{value}</span>
    </div>
  );
}
