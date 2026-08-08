"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  Send,
  User,
  UserPlus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CardImage } from "../card-image";

type Step = "token" | "form";

function SignForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get("token");

  const [step, setStep] = useState<Step>(tokenParam ? "form" : "token");
  const [token, setToken] = useState(tokenParam ?? "");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(
    null
  );

  const telegramUrl = `https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME}?start=myacontweb`;

  async function handleVerifyToken() {
    if (!token.trim()) {
      setMessage({ text: "Digite o token do Telegram.", error: true });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/verify-telegram-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim() }),
      });

      const data = await res.json();

      if (data.valid) {
        setStep("form");
        setMessage({ text: "Token verificado com sucesso!", error: false });
      } else {
        setMessage({ text: data.error || "Token inválido.", error: true });
      }
    } catch {
      setMessage({ text: "Erro ao verificar token.", error: true });
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateAccount(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password !== confirm) {
      setMessage({ text: "As senhas não coincidem.", error: true });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/create-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim(), username, password }),
      });

      const data = await res.json();

      if (data.success) {
        router.push("/home");
        return;
      }
      setMessage({ text: data.error || "Erro ao criar conta.", error: true });
    } catch {
      setMessage({ text: "Erro de conexão.", error: true });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10 font-sans nordic-grain">
      <Card className="w-full max-w-sm overflow-hidden pt-0 animate-rise">
        <CardImage />
        <CardHeader>
          <CardTitle>
            {step === "token" ? "Criar conta" : "Defina seus dados"}
          </CardTitle>
          <CardDescription>
            {step === "token"
              ? "Use o token do Telegram para verificar sua identidade."
              : "Escolha um usuário e senha para sua conta."}
          </CardDescription>
        </CardHeader>

        {step === "token" ? (
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
              <p className="mb-2">
                1. Abra o Telegram pelo botão abaixo. O bot vai gerar um token
                exclusivo para você.
              </p>
              <p>2. Copie o token recebido e cole abaixo.</p>
            </div>

            <a href={telegramUrl} target="_blank" rel="noopener noreferrer">
              <Button type="button" variant="outline" className="w-full">
                <Send data-icon="inline-start" />
                Abrir Telegram
              </Button>
            </a>

            <div className="space-y-1.5 p-2">
              <label
                htmlFor="token"
                className="text-sm font-medium text-foreground p-1"
              >
                Token do Telegram
              </label>
              <div className="relative">
                <KeyRound
                  data-icon="inline-start"
                  className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="token"
                  value={token}
                  onChange={(event) => setToken(event.target.value)}
                  placeholder="Cole o token aqui"
                  autoComplete="off"
                  className="pl-8 font-mono tracking-wider"
                />
              </div>
            </div>

            <Button
              type="button"
              onClick={handleVerifyToken}
              disabled={loading || !token.trim()}
              className="w-full"
            >
              {loading ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <KeyRound data-icon="inline-start" />
              )}
              {loading ? "Verificando..." : "Verificar Token"}
            </Button>

            {message && (
              <p
                role="status"
                className={cn(
                  "text-center text-sm",
                  message.error
                    ? "text-destructive"
                    : "text-emerald-600 dark:text-emerald-400"
                )}
              >
                {message.text}
              </p>
            )}
          </CardContent>
        ) : (
          <form onSubmit={handleCreateAccount} noValidate>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="username"
                  className="text-sm font-medium text-foreground"
                >
                  Usuário
                </label>
                <div className="relative">
                  <User
                    data-icon="inline-start"
                    className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="Escolha um nome de usuário"
                    autoComplete="username"
                    className="pl-8"
                    required
                    minLength={3}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-foreground"
                >
                  Senha
                </label>
                <div className="relative">
                  <LockKeyhole
                    data-icon="inline-start"
                    className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Mínimo 6 caracteres"
                    className="pr-8 pl-8"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute top-1/2 right-2 -translate-y-1/2 rounded text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-foreground"
                >
                  Confirmar senha
                </label>
                <div className="relative">
                  <LockKeyhole
                    data-icon="inline-start"
                    className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="confirmPassword"
                    value={confirm}
                    onChange={(event) => setConfirm(event.target.value)}
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Repita a senha"
                    className="pr-8 pl-8"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    aria-label={
                      showConfirm ? "Ocultar senha" : "Mostrar senha"
                    }
                    aria-pressed={showConfirm}
                    onClick={() => setShowConfirm((value) => !value)}
                    className="absolute top-1/2 right-2 -translate-y-1/2 rounded text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
                  >
                    {showConfirm ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  <UserPlus data-icon="inline-start" />
                )}
                {loading ? "Criando conta..." : "Criar conta"}
              </Button>
              {message && (
                <p
                  role="status"
                  className={cn(
                    "text-center text-sm",
                    message.error
                      ? "text-destructive"
                      : "text-emerald-600 dark:text-emerald-400"
                  )}
                >
                  {message.text}
                </p>
              )}
            </CardFooter>
          </form>
        )}
      </Card>
      <p className="mt-6 text-sm text-muted-foreground">
        {step === "token" ? "Já tem uma conta? " : "Token errado? "}
        {step === "token" ? (
          <Link
            href="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Entrar
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => {
              setStep("token");
              setMessage(null);
            }}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Voltar ao token
          </button>
        )}
      </p>
    </div>
  );
}

export default function SignPage() {
  return (
    <Suspense fallback={null}>
      <SignForm />
    </Suspense>
  );
}
