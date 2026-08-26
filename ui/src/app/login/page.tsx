"use client";

import { useState } from "react";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CardImage } from "./card-image";
import { LoginForm } from "./from-login";


export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(
    null
  );

  const forgotPasswordUrl = `https://t.me/${
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME
  }?start=changepassword`;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setPending(true);
    setMessage(null);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.get("username"),
          password: formData.get("password"),
        }),
      });

      if (response.ok) {
        window.location.href = "/home";
        return;
      }

      const data = await response.json().catch(() => ({}));
      setMessage({
        text: data.error || "Usuário ou senha inválidos.",
        error: true,
      });
    } catch {
      setMessage({ text: "Erro de conexão. Tente novamente.", error: true });
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10 font-sans nordic-grain">
      <Card className="w-full max-w-sm overflow-hidden pt-0 animate-rise">
        <CardImage />
      
        <CardHeader className="p-1">
          <CardTitle className="text-2xl font-bold text-center">Bem-vindo de volta</CardTitle>
          <CardDescription className="text-center">
            Entre com sua conta para continuar.
          </CardDescription>
        </CardHeader>

       < LoginForm onSubmit={handleSubmit} showPassword={showPassword} setShowPassword={setShowPassword} pending={pending} message={message} forgotPasswordUrl={forgotPasswordUrl} />
        
      </Card>
      <p className="mt-6 text-sm text-muted-foreground">
        Não tem uma conta?{" "}
        <Link
          href="/login/sign"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Criar conta
        </Link>
      </p>
    </div>
  );
}
