
'use client';

import { useState } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const telegramUrl = `https://t.me/${
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME
  }?start=myacontweb`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (response.ok) {
        window.location.href = '/dashboard';
      } else {
        const data = await response.json();
        setError(data.error || 'Usuário ou senha inválidos');
      }
    } catch {
      setError('Erro de conexão');
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Grid animado */}
      <div className="absolute inset-0 grid-bg opacity-40" />

      {/* Glow */}
      <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/20 blur-3xl" />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md border-white/10 bg-white/5 backdrop-blur-xl">
          <CardHeader className="space-y-2 text-center">
            <h1 className="text-3xl font-bold text-white">
              Admin Panel
            </h1>

            <p className="text-sm text-zinc-400">
              Entre para acessar o sistema
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-zinc-300">
                  Usuário
                </Label>

                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Digite seu usuário"
                  autoComplete="username"
                  className="border-zinc-800 bg-zinc-900/50 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-300">
                  Senha
                </Label>

                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="border-zinc-800 bg-zinc-900/50 text-white"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Entrar
              </Button>

              <Link href={telegramUrl} target="_blank">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-sky-500/30 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20"
                >
                  Criar conta pelo Telegram
                </Button>
              </Link>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

