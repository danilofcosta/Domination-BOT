"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoginLayout } from "@/components/login-layout";

type Step = "token" | "form";

function SignForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get("token");

  const [step, setStep] = useState<Step>("token");
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const telegramUrl = `https://t.me/${
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME
  }?start=myacontweb`;

  useEffect(() => {
    if (tokenParam) {
      setToken(tokenParam);
      verifyToken(tokenParam);
    }
  }, [tokenParam]);

  async function verifyToken(tok: string) {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/verify-telegram-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tok }),
      });

      const data = await res.json();

      if (data.valid) {
        setStep("form");
      } else {
        setError(data.error || "Token inválido");
      }
    } catch {
      setError("Erro ao verificar token");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyToken() {
    if (!token.trim()) {
      setError("Digite o token do Telegram");
      return;
    }
    router.push(`/login/sign?token=${encodeURIComponent(token.trim())}`);
  }

  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (username.length < 3) {
      setError("Usuário deve ter pelo menos 3 caracteres.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não conferem.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/create-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, username, password }),
      });

      const data = await res.json();

      if (data.success) {
        window.location.href = "/";
      } else {
        setError(data.error || "Erro ao criar conta");
      }
    } catch {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }

  return (
    <LoginLayout
      title={step === "token" ? "Criar Conta" : "Defina seus dados"}
      subtitle={
        step === "token"
          ? "Use o token do Telegram para verificar sua identidade"
          : "Escolha um usuário e senha para sua conta"
      }
    >
      {step === "token" && (
        <div className="space-y-4">
          {error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
            <p className="mb-2">
              1. Clique no botão abaixo para abrir o Telegram e iniciar uma conversa com o bot. Ele irá gerar um token exclusivo para você.
            </p>
    
            <p>2. Copie o token recebido e cole abaixo</p>
            
          </div>

          <a href={telegramUrl} target="_blank" rel="noopener noreferrer">
            <Button type="button" variant="outline" className="w-full">
              Abrir Telegram
            </Button>
          </a>

          <div className="space-y-2">
            <Label>Token do Telegram</Label>
            <Input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Cole o token aqui"
              autoComplete="off"
              className="font-mono text-center tracking-wider"
            />
          </div>

          <Button
            type="button"
            onClick={handleVerifyToken}
            disabled={loading || !token.trim()}
            className="w-full"
          >
            {loading ? "Verificando..." : "Verificar Token"}
          </Button>

          <div className="text-center">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Voltar
            </Link>
          </div>
        </div>
      )}

      {step === "form" && (
        <form onSubmit={handleCreateAccount} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="rounded-lg border border-primary/20 bg-primary/10 p-3 text-sm text-primary">
            Token verificado com sucesso!
          </div>

          <div className="space-y-2">
            <Label>Usuário</Label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Escolha um nome de usuário"
              autoComplete="username"
            />
          </div>

          <div className="space-y-2">
            <Label>Senha</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-2">
            <Label>Confirmar Senha</Label>
            <Input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repita a senha"
              autoComplete="new-password"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Criando conta..." : "Criar Conta"}
          </Button>
        </form>
      )}
    </LoginLayout>
  );
}

export default function SignPage() {
  return (
    <Suspense fallback={null}>
      <SignForm />
    </Suspense>
  );
}
