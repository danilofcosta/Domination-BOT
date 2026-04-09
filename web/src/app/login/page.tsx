"use client";

import { TelegramLoginWidget } from "./telegram/page";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { ShieldCheck, Loader2, AlertTriangle, Sparkles, Home, User, Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/admin";

  const [loginMode, setLoginMode] = useState<"telegram" | "credentials">("telegram");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleTelegramAuth(user: any) {
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data.error || "Erro ao autenticar.");
        return;
      }

      router.push(redirect);
    } catch {
      setStatus("error");
      setErrorMsg("Erro de conexão. Tente novamente.");
    }
  }

  async function handleCredentialsAuth(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data.error || "Erro ao autenticar.");
        return;
      }

      router.push(redirect);
    } catch {
      setStatus("error");
      setErrorMsg("Erro de conexão. Tente novamente.");
    }
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-background"
    >
      {/* Background gradient layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/8 rounded-full blur-3xl" />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/20 rounded-full animate-pulse" />
        <div className="absolute top-3/4 right-1/3 w-1.5 h-1.5 bg-primary/30 rounded-full animate-pulse delay-700" />
        <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-primary/25 rounded-full animate-pulse delay-1000" />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-background/60 backdrop-blur-2xl border border-border/50 rounded-3xl p-8 shadow-2xl shadow-primary/5">
          {/* Header */}
          <div className="flex flex-col items-center text-center space-y-4 mb-8">
            <div className="relative">
              <div className="w-16 h-16 bg-primary/15 rounded-2xl flex items-center justify-center border border-primary/20">
                <ShieldCheck className="size-8 text-primary" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center">
                <Sparkles className="size-3 text-primary" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-black uppercase italic tracking-tighter">
                Domination
              </h1>
              <p className="text-sm text-muted-foreground font-medium">
                Painel Administrativo
              </p>
            </div>

            <div className="w-12 h-0.5 bg-primary/30 rounded-full" />
          </div>

          {/* Login Area */}
          <div className="flex flex-col items-center space-y-6">
            {status === "idle" && (
              <>
                {/* Toggle */}
                <div className="flex bg-muted/50 rounded-xl p-1 border border-border/30">
                  <button
                    type="button"
                    onClick={() => setLoginMode("telegram")}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                      loginMode === "telegram"
                        ? "bg-primary text-primary-foreground shadow-lg"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Telegram
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginMode("credentials")}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                      loginMode === "credentials"
                        ? "bg-primary text-primary-foreground shadow-lg"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Credenciais
                  </button>
                </div>

                {loginMode === "telegram" ? (
                  <>
                    <p className="text-xs text-muted-foreground text-center uppercase tracking-widest font-bold">
                      Autentique-se com o Telegram
                    </p>
                    <TelegramLoginWidget onAuth={handleTelegramAuth} />
                  </>
                ) : (
                  <form onSubmit={handleCredentialsAuth} className="w-full space-y-4">
                    <p className="text-xs text-muted-foreground text-center uppercase tracking-widest font-bold">
                      Entre com suas credenciais
                    </p>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={login}
                        onChange={(e) => setLogin(e.target.value)}
                        placeholder="Login"
                        className="w-full pl-10 pr-4 py-3 bg-muted/30 border border-border/40 rounded-xl text-sm font-medium placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                        required
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Senha"
                        className="w-full pl-10 pr-12 py-3 bg-muted/30 border border-border/40 rounded-xl text-sm font-medium placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 px-4 bg-primary hover:bg-primary/90 border border-primary rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer text-primary-foreground"
                    >
                      Entrar
                    </button>
                  </form>
                )}
              </>
            )}

            {status === "loading" && (
              <div className="flex flex-col items-center gap-4 py-6">
                <div className="relative">
                  <Loader2 className="size-8 text-primary animate-spin" />
                  <div className="absolute inset-0 w-8 h-8 border-2 border-primary/10 rounded-full" />
                </div>
                <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest animate-pulse">
                  Verificando credenciais...
                </p>
              </div>
            )}

            {status === "error" && (
              <div className="w-full space-y-4">
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-start gap-3">
                  <AlertTriangle className="size-5 text-destructive shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-destructive">
                      Falha na Autenticação
                    </p>
                    <p className="text-xs text-destructive/80">
                      {errorMsg}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setStatus("idle");
                    setErrorMsg("");
                  }}
                  className="w-full py-3 px-4 bg-muted/50 hover:bg-muted/80 border border-border/50 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer"
                >
                  Tentar novamente
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-border/30 flex flex-col items-center gap-4">
            <p className="text-[10px] text-muted-foreground/40 text-center uppercase tracking-[0.2em] font-bold">
              Acesso restrito a administradores
            </p>
            <Link 
              href="/"
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <Home className="w-4 h-4" />
              Voltar ao início
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="size-8 text-primary animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
