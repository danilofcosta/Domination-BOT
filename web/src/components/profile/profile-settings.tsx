"use client";

import { useState } from "react";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Save,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
} from "lucide-react";

export function ProfileSettings({ currentUser }: { currentUser: { firstName: string; profileType: string; telegramId: string } }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newLogin, setNewLogin] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    if (!currentPassword) {
      setStatus("error");
      setErrorMsg("Senha atual é obrigatória.");
      return;
    }

    if (!newPassword && !newLogin) {
      setStatus("error");
      setErrorMsg("Informe uma nova senha ou novo login.");
      return;
    }

    try {
      const res = await fetch("/api/auth/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword: newPassword || undefined,
          newLogin: newLogin || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data.error || "Erro ao atualizar perfil.");
        return;
      }

      setStatus("success");
      setCurrentPassword("");
      setNewPassword("");
      setNewLogin("");

      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
      setErrorMsg("Erro de conexão. Tente novamente.");
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex flex-col mb-8">
        <h2 className="text-xl sm:text-2xl font-black uppercase italic tracking-tighter">
          Configurações do Perfil
        </h2>
        <div className="h-1 w-12 bg-primary rounded-full mt-1" />
      </div>

      <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-6">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Usuário:</span> {currentUser.firstName}
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Tipo:</span> {currentUser.profileType}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Senha atual"
              className="w-full pl-10 pr-12 py-3 bg-muted/30 border border-border/40 rounded-xl text-sm font-medium placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>

          <div className="border-t border-border/30 pt-5 space-y-5">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Alterações
            </p>

            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                value={newLogin}
                onChange={(e) => setNewLogin(e.target.value)}
                placeholder="Novo login (deixe vazio para manter)"
                className="w-full pl-10 pr-4 py-3 bg-muted/30 border border-border/40 rounded-xl text-sm font-medium placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nova senha (deixe vazio para manter)"
                className="w-full pl-10 pr-12 py-3 bg-muted/30 border border-border/40 rounded-xl text-sm font-medium placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {status === "error" && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="size-5 text-destructive shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-destructive">Erro</p>
                <p className="text-xs text-destructive/80">{errorMsg}</p>
              </div>
            </div>
          )}

          {status === "success" && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-3">
              <CheckCircle2 className="size-5 text-emerald-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-emerald-500">Sucesso</p>
                <p className="text-xs text-emerald-500/80">Perfil atualizado com sucesso.</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full py-3 px-4 bg-primary hover:bg-primary/90 disabled:opacity-50 border border-primary rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer text-primary-foreground flex items-center justify-center gap-2"
          >
            {status === "loading" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {status === "loading" ? "Salvando..." : "Salvar Alterações"}
          </button>
        </form>
      </div>
    </div>
  );
}
