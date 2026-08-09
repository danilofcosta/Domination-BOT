"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TelegramUser {
  id: number;
  telegramId: string;
  profileType: string;
  language: string;
  coins: number;
  webLogin: string | null;
  waifuConfig: Record<string, unknown> | null;
  husbandoConfig: Record<string, unknown> | null;
  telegramData: Record<string, unknown> | null;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  username: string | null;
  image?: string | null;
  telegramUser?: TelegramUser | null;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) {
          router.push("/login");
          return;
        }
        setUser(data.user);
      })
      .finally(() => setLoading(false));
  }, [router]);

  const profileTypeVariant: Record<string, string> = {
    SUPREME: "default",
    SUPER_ADMIN: "destructive",
    ADMIN: "destructive",
    MODERATOR: "secondary",
    USER: "outline",
    BANNED: "destructive",
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-col items-center gap-4">
          <Avatar className="size-20">
            <AvatarImage src={user.image || ""} />
            <AvatarFallback className="text-xl">{initials}</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <CardTitle>{user.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Username</p>
            <p className="font-medium">{user.username || "—"}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">ID</p>
            <p className="font-mono text-sm">{user.id}</p>
          </div>

          {user.telegramUser && (
            <>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Telegram ID</p>
                <p className="font-mono text-sm">
                  {user.telegramUser.telegramId}
                </p>
              </div>

              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Profile Type</p>
                <Badge
                  variant={
                    (profileTypeVariant[user.telegramUser.profileType] as "default" | "destructive" | "secondary" | "outline") || "outline"
                  }
                >
                  {user.telegramUser.profileType}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Idioma</p>
                  <p className="font-medium">{user.telegramUser.language}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Moedas</p>
                  <p className="font-medium">
                    {user.telegramUser.coins.toLocaleString("pt-BR")}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Login Web</p>
                  <p className="font-medium">
                    {user.telegramUser.webLogin || "—"}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Telegram ID</p>
                  <p className="font-mono text-sm">
                    {user.telegramUser.telegramId}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground mb-1">
                    Waifu Config
                  </p>
                  <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-all font-mono text-xs text-muted-foreground">
                    {user.telegramUser.waifuConfig
                      ? JSON.stringify(user.telegramUser.waifuConfig, null, 2)
                      : "—"}
                  </pre>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground mb-1">
                    Husbando Config
                  </p>
                  <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-all font-mono text-xs text-muted-foreground">
                    {user.telegramUser.husbandoConfig
                      ? JSON.stringify(user.telegramUser.husbandoConfig, null, 2)
                      : "—"}
                  </pre>
                </div>
              </div>

              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground mb-1">
                  Telegram Data
                </p>
                <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-all font-mono text-xs text-muted-foreground">
                  {user.telegramUser.telegramData
                    ? JSON.stringify(user.telegramUser.telegramData, null, 2)
                    : "—"}
                </pre>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
