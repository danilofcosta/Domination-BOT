"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoginLayout } from "@/components/login-layout";

export default function LoginPage() {
  const router = useRouter();
  const [showTelegram, setShowTelegram] = useState(false);
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const telegramUrl = `https://t.me/${
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME
  }?start=myacontweb`;

  async function handleVerifyToken() {
    if (!token.trim()) {
      setError("Digite o token do Telegram");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/verify-telegram-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim() }),
      });

      const data = await res.json();

      if (data.valid) {
        router.push(`/login/sign?token=${encodeURIComponent(token.trim())}`);
      } else {
        setError(data.error || "Token inválido");
      }
    } catch {
      setError("Erro ao verificar token");
    } finally {
      setLoading(false);
    }
  }

  return (
    <LoginLayout title="Admin Panel" subtitle="Acesse o sistema de gerenciamento">
      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive mb-4">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <Link href="/login/auth" className="block">
          <Button className="w-full text-base py-5">Entrar</Button>
        </Link>

        <Link href="/login/sign" className="block">
          <Button variant="outline" className="w-full text-base py-5">
            Criar Conta
          </Button>
        </Link>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">ou</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setShowTelegram(!showTelegram);
            setError("");
          }}
          className="w-full text-base py-5"
        >
          {showTelegram ? "— Fechar" : "Login com Telegram"}
        </Button>

        {showTelegram && (
          <div className="space-y-3 pt-1 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground leading-relaxed">
             <p> gere o token no telegram em abrir telegram e cole o token abaixo</p>
              <p> se tiver duvidas ficara com elas :) </p>
            </div>

            <div className="space-y-2">
              <Label>Token</Label>
              <Input
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Cole o token aqui"
                autoComplete="off"
                className="font-mono text-center tracking-wider"
              />
            </div>

            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                type="button"
                variant="outline"
                className="w-full text-sm"
              >
                Abrir Telegram
              </Button>
            </a>

            <Button
              type="button"
              onClick={handleVerifyToken}
              disabled={loading || !token.trim()}
              className="w-full text-sm"
            >
              {loading ? "Verificando..." : "Verificar Token"}
            </Button>
          </div>
        )}
      </div>
    </LoginLayout>
  );
}
