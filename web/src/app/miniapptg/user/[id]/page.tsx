"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

type ThemeParams = {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
  header_bg_color?: string;
  bottom_bar_bg_color?: string;
  accent_text_color?: string;
  section_bg_color?: string;
  section_header_text_color?: string;
  section_separator_color?: string;
  subtitle_text_color?: string;
  destructive_text_color?: string;
};

type TelegramTheme = {
  themeParams: ThemeParams;
  colorScheme: "light" | "dark";
  backgroundColor: string;
  headerColor: string;
};

type UserProfile = {
  id: number;
  telegramId: string;
  profileType: string;
  language: string;
  coins: number;
  waifuCount: number;
  husbandoCount: number;
  telegramData: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
  } | null;
  waifus: Array<{
    id: number;
    name: string;
    slug: string;
    origem: string;
    media: string | null;
    mediaType: string | null;
    count: number;
  }>;
  husbandos: Array<{
    id: number;
    name: string;
    slug: string;
    origem: string;
    media: string | null;
    mediaType: string | null;
    count: number;
  }>;
  favoriteWaifu: {
    id: number;
    name: string;
    slug: string;
    origem: string;
    media: string | null;
    mediaType: string | null;
  } | null;
  favoriteHusbando: {
    id: number;
    name: string;
    slug: string;
    origem: string;
    media: string | null;
    mediaType: string | null;
  } | null;
};

function ThemeProvider({
  children,
  theme,
}: {
  children: React.ReactNode;
  theme: TelegramTheme;
}) {
  useEffect(() => {
    const root = document.documentElement;
    const { themeParams } = theme;

    root.style.setProperty("--tg-bg-color", themeParams.bg_color || "#ffffff");
    root.style.setProperty("--tg-text-color", themeParams.text_color || "#000000");
    root.style.setProperty("--tg-hint-color", themeParams.hint_color || "#999999");
    root.style.setProperty("--tg-button-color", themeParams.button_color || "#2481cc");
    root.style.setProperty("--tg-button-text-color", themeParams.button_text_color || "#ffffff");
    root.style.setProperty("--tg-secondary-bg-color", themeParams.secondary_bg_color || "#f0f0f0");
    root.style.setProperty("--tg-section-bg-color", themeParams.section_bg_color || "#ffffff");
    root.style.setProperty("--tg-section-separator-color", themeParams.section_separator_color || "#e0e0e0");
  }, [theme]);

  return <>{children}</>;
}

function CharacterMiniCard({
  character,
  type,
  theme,
  count,
}: {
  character: {
    id: number;
    name: string;
    slug: string;
    origem: string;
    media: string | null;
    mediaType: string | null;
  };
  type: "waifu" | "husbando";
  theme: TelegramTheme;
  count?: number;
}) {
  const href = `/miniapptg/detal/${character.id}?type=${type}`;
  
  return (
    <a
      href={href}
      className="block relative overflow-hidden rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
      style={{ backgroundColor: theme.themeParams.section_bg_color || "#ffffff" }}
    >
      <div className="aspect-[2/3] overflow-hidden">
        {character.media ? (
          <img
            src={character.media}
            alt={character.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: theme.themeParams.secondary_bg_color || "#f0f0f0" }}
          >
            <span style={{ color: theme.themeParams.hint_color }}>?</span>
          </div>
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-2">
        <h4 className="text-white text-sm font-bold truncate drop-shadow-lg">
          {character.name}
        </h4>
        <p className="text-white/60 text-xs truncate">{character.origem}</p>
      </div>
      {count && count > 1 && (
        <div
          className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold"
          style={{
            backgroundColor: type === "waifu" ? "#ec4899" : "#3b82f6",
            color: "white",
          }}
        >
          x{count}
        </div>
      )}
    </a>
  );
}

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<UserProfile | null>(null);
  const [theme, setTheme] = useState<TelegramTheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"waifus" | "husbandos">("waifus");

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-web-app.js?62";
    script.async = true;
    document.head.appendChild(script);
    script.onload = () => {
      const tg = (window as any).Telegram?.WebApp;
      if (tg) {
        tg.ready();
        tg.expand();
        
        const themeParams = tg.themeParams || {};
        setTheme({
          themeParams,
          colorScheme: tg.colorScheme || "light",
          backgroundColor: tg.backgroundColor || themeParams.bg_color || "#ffffff",
          headerColor: tg.headerColor || themeParams.header_bg_color || "#ffffff",
        });

        tg.BackButton.show();
        tg.BackButton.onClick(() => {
          window.history.back();
        });
      }
    };
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;

      try {
        const res = await fetch(`/api/admin/users?id=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          setError("Usuário não encontrado");
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading || !theme) {
    return (
      <div
        className="min-h-screen p-4 space-y-4"
        style={{ backgroundColor: theme?.themeParams.bg_color || "#ffffff" }}
      >
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div
        className="min-h-screen p-4 flex flex-col items-center justify-center gap-4"
        style={{ backgroundColor: theme.themeParams.bg_color || "#ffffff" }}
      >
        <p style={{ color: theme.themeParams.hint_color || "#999999" }}>{error || "Erro desconhecido"}</p>
        <Link
          href="/miniapptg"
          className="px-4 py-2 rounded-xl text-white font-medium"
          style={{ backgroundColor: theme.themeParams.button_color || "#2481cc" }}
        >
          Voltar ao perfil
        </Link>
      </div>
    );
  }

  const tgData = user.telegramData;
  const firstLetter = tgData?.first_name?.charAt(0).toUpperCase() || "?";
  const isOwnProfile = (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id === Number(user.telegramId);

  return (
    <ThemeProvider theme={theme}>
      <div
        className="min-h-screen pb-20"
        style={{ backgroundColor: theme.themeParams.bg_color || "#ffffff" }}
      >
        <div
          className="h-40 relative"
          style={{
            background: `linear-gradient(135deg, ${theme.themeParams.button_color || "#2481cc"}, ${theme.themeParams.accent_text_color || "#2481cc"})`,
          }}
        >
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
            <Avatar className="w-32 h-32 ring-4 ring-background shadow-xl">
              {tgData?.photo_url ? (
                <AvatarImage src={tgData.photo_url} alt={tgData.first_name} />
              ) : null}
              <AvatarFallback
                className="text-4xl"
                style={{
                  backgroundColor: theme.themeParams.secondary_bg_color,
                  color: theme.themeParams.text_color,
                }}
              >
                {firstLetter}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div
          className="pt-20 pb-4 px-4 flex flex-col items-center gap-2"
          style={{ backgroundColor: theme.themeParams.section_bg_color || "#ffffff" }}
        >
          <div className="text-center">
            <h1 className="text-xl font-bold" style={{ color: theme.themeParams.text_color }}>
              {tgData?.first_name} {tgData?.last_name}
            </h1>
            {tgData?.username && (
              <p style={{ color: theme.themeParams.hint_color || "#999999" }}>
                @{tgData.username}
              </p>
            )}
          </div>

          <div className="flex gap-2 flex-wrap justify-center">
            <div
              className="px-3 py-1 rounded-full text-xs border"
              style={{
                borderColor: theme.themeParams.section_separator_color || "#e0e0e0",
                color: theme.themeParams.text_color,
              }}
            >
              {user.profileType}
            </div>
            <div
              className="px-3 py-1 rounded-full text-xs"
              style={{
                backgroundColor: theme.themeParams.secondary_bg_color || "#f0f0f0",
                color: theme.themeParams.text_color,
              }}
            >
              💰 {user.coins}
            </div>
            {isOwnProfile && (
              <div
                className="px-3 py-1 rounded-full text-xs"
                style={{
                  backgroundColor: "#22c55e",
                  color: "white",
                }}
              >
                Seu perfil
              </div>
            )}
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div
              className="rounded-2xl p-3 text-center"
              style={{ backgroundColor: theme.themeParams.secondary_bg_color || "#f0f0f0" }}
            >
              <p className="text-2xl font-bold" style={{ color: theme.themeParams.text_color }}>
                {user.waifuCount}
              </p>
              <p className="text-xs" style={{ color: theme.themeParams.hint_color || "#999999" }}>
                Waifus
              </p>
            </div>
            <div
              className="rounded-2xl p-3 text-center"
              style={{ backgroundColor: theme.themeParams.secondary_bg_color || "#f0f0f0" }}
            >
              <p className="text-2xl font-bold" style={{ color: theme.themeParams.text_color }}>
                {user.husbandoCount}
              </p>
              <p className="text-xs" style={{ color: theme.themeParams.hint_color || "#999999" }}>
                Husbandos
              </p>
            </div>
          </div>

          {(user.favoriteWaifu || user.favoriteHusbando) && (
            <div>
              <h3
                className="text-base font-bold mb-2"
                style={{ color: theme.themeParams.text_color }}
              >
                Favoritos
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {user.favoriteWaifu && (
                  <CharacterMiniCard
                    character={user.favoriteWaifu}
                    type="waifu"
                    theme={theme}
                  />
                )}
                {user.favoriteHusbando && (
                  <CharacterMiniCard
                    character={user.favoriteHusbando}
                    type="husbando"
                    theme={theme}
                  />
                )}
              </div>
            </div>
          )}

          <div>
            <div
              className="rounded-xl p-1 flex mb-2"
              style={{ backgroundColor: theme.themeParams.secondary_bg_color || "#f0f0f0" }}
            >
              <button
                type="button"
                onClick={() => setActiveTab("waifus")}
                className="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all select-none"
                style={{
                  backgroundColor: activeTab === "waifus" 
                    ? theme.themeParams.section_bg_color || "#ffffff"
                    : "transparent",
                  color: theme.themeParams.text_color,
                }}
              >
                ❤️ Waifus ({user.waifus.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("husbandos")}
                className="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all select-none"
                style={{
                  backgroundColor: activeTab === "husbandos" 
                    ? theme.themeParams.section_bg_color || "#ffffff"
                    : "transparent",
                  color: theme.themeParams.text_color,
                }}
              >
                💙 Husbandos ({user.husbandos.length})
              </button>
            </div>

            {activeTab === "waifus" ? (
              user.waifus.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {user.waifus.map((waifu) => (
                    <CharacterMiniCard
                      key={waifu.id}
                      character={waifu}
                      type="waifu"
                      theme={theme}
                      count={waifu.count}
                    />
                  ))}
                </div>
              ) : (
                <div
                  className="text-center py-8 rounded-2xl"
                  style={{ 
                    backgroundColor: theme.themeParams.section_bg_color || "#ffffff",
                    color: theme.themeParams.hint_color || "#999999"
                  }}
                >
                  Nenhuma waifu na coleção
                </div>
              )
            ) : user.husbandos.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {user.husbandos.map((husbando) => (
                  <CharacterMiniCard
                    key={husbando.id}
                    character={husbando}
                    type="husbando"
                    theme={theme}
                    count={husbando.count}
                  />
                ))}
              </div>
            ) : (
              <div
                className="text-center py-8 rounded-2xl"
                style={{ 
                  backgroundColor: theme.themeParams.section_bg_color || "#ffffff",
                  color: theme.themeParams.hint_color || "#999999"
                }}
              >
                Nenhum husbando na coleção
              </div>
            )}
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
