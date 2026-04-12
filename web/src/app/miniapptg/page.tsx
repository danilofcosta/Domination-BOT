"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { HeartIcon, Spade } from "lucide-react";

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

type WebAppUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
};

type TelegramUser = {
  id: string;
  telegramId: string;
  coins: number;
  profileType: string;
  language: string;
  waifuCount: number;
  husbandoCount: number;
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
  telegramData: WebAppUser | null;
};

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function adjustColor(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const adjust = (c: number) => Math.min(255, Math.max(0, c + amount));
  return `#${adjust(rgb.r).toString(16).padStart(2, "0")}${adjust(rgb.g).toString(16).padStart(2, "0")}${adjust(rgb.b).toString(16).padStart(2, "0")}`;
}

function ThemeProvider({
  children,
  theme,
}: {
  children: React.ReactNode;
  theme: TelegramTheme;
}) {
  useEffect(() => {
    const root = document.documentElement;
    const { themeParams, colorScheme } = theme;

    root.style.setProperty("--tg-bg-color", themeParams.bg_color || "#ffffff");
    root.style.setProperty("--tg-text-color", themeParams.text_color || "#000000");
    root.style.setProperty("--tg-hint-color", themeParams.hint_color || "#999999");
    root.style.setProperty("--tg-link-color", themeParams.link_color || "#2481cc");
    root.style.setProperty("--tg-button-color", themeParams.button_color || "#2481cc");
    root.style.setProperty("--tg-button-text-color", themeParams.button_text_color || "#ffffff");
    root.style.setProperty("--tg-secondary-bg-color", themeParams.secondary_bg_color || "#f0f0f0");
    root.style.setProperty("--tg-header-bg-color", themeParams.header_bg_color || "#ffffff");
    root.style.setProperty("--tg-bottom-bar-bg-color", themeParams.bottom_bar_bg_color || "#ffffff");
    root.style.setProperty("--tg-accent-text-color", themeParams.accent_text_color || "#2481cc");
    root.style.setProperty("--tg-section-bg-color", themeParams.section_bg_color || "#ffffff");
    root.style.setProperty("--tg-section-header-text-color", themeParams.section_header_text_color || "#000000");
    root.style.setProperty("--tg-section-separator-color", themeParams.section_separator_color || "#e0e0e0");
    root.style.setProperty("--tg-subtitle-text-color", themeParams.subtitle_text_color || "#999999");
    root.style.setProperty("--tg-destructive-text-color", themeParams.destructive_text_color || "#ff3b30");
    root.style.setProperty("--tg-background-color", theme.backgroundColor);
    root.style.setProperty("--tg-header-color", theme.headerColor);

    root.setAttribute("data-tg-color-scheme", colorScheme);
  }, [theme]);

  return <>{children}</>;
}

function CharacterMedia({
  media,
  mediaType,
  name,
  type,
  theme,
}: {
  media: string | null;
  mediaType: string | null;
  name: string;
  type: "waifu" | "husbando";
  theme: TelegramTheme;
}) {
  if (!media) {
    return (
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ backgroundColor: theme.themeParams.section_bg_color || "#f0f0f0" }}
      >
        <span
          className="text-sm"
          style={{ color: theme.themeParams.hint_color || "#999999" }}
        >
          No image
        </span>
      </div>
    );
  }

  return (
    <img
      src={media}
      alt={name}
      className="w-full h-full object-cover"
      loading="lazy"
    />
  );
}

function StatCard({
  icon,
  label,
  value,
  theme,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  theme: TelegramTheme;
}) {
  return (
    <div
      className="flex-1 min-w-[120px] rounded-2xl p-3 flex flex-col items-center gap-1 backdrop-blur-xl shadow-md"
      style={{
        backgroundColor: theme.themeParams.secondary_bg_color || "#f0f0f0",
      }}
    >
      <div className="text-2xl">{icon}</div>
      <p
        className="text-xs"
        style={{ color: theme.themeParams.hint_color || "#999999" }}
      >
        {label}
      </p>
      <p className="text-lg font-bold text-center" style={{ color: theme.themeParams.text_color }}>
        {value}
      </p>
    </div>
  );
}

function FavoriteCard({
  character,
  type,
  theme,
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
}) {
  return (
    <a
      href={`/miniapptg/detal/${character.id}?type=${type}`}
      className="block overflow-hidden hover:shadow-lg transition-shadow cursor-pointer rounded-2xl"
      style={{ backgroundColor: theme.themeParams.section_bg_color || "#ffffff" }}
    >
      <div className="aspect-[2/3] relative overflow-hidden">
        <CharacterMedia
          media={character.media}
          mediaType={character.mediaType}
          name={character.name}
          type={type}
          theme={theme}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div
          className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: type === "waifu"
              ? theme.themeParams.button_color || "#2481cc"
              : theme.themeParams.secondary_bg_color || "#f0f0f0",
            color: type === "waifu"
              ? theme.themeParams.button_text_color || "#ffffff"
              : theme.themeParams.text_color,
          }}
        >
          {type === "waifu" ? "❤️ Fav" : "💙 Fav"}
        </div>
      </div>
      <div className="p-2">
        <h3 className="font-bold text-sm truncate" style={{ color: theme.themeParams.text_color }}>
          {character.name}
        </h3>
        <p
          className="text-xs truncate"
          style={{ color: theme.themeParams.hint_color || "#999999" }}
        >
          {character.origem}
        </p>
      </div>
    </a>
  );
}

function CollectionCard({
  character,
  type,
  theme,
}: {
  character: {
    id: number;
    name: string;
    slug: string;
    origem: string;
    media: string | null;
    mediaType: string | null;
    isVideo?: boolean;
    count: number;
  };
  type: "waifu" | "husbando";
  theme: TelegramTheme;
}) {
  const accentColor = type === "waifu" ? "#ec4899" : "#3b82f6";

  return (
    <a
      href={`/miniapptg/detal/${character.id}?type=${type}`}
      className="block overflow-hidden rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
      style={{ backgroundColor: theme.themeParams.section_bg_color || "#ffffff" }}
    >
      <div className="aspect-[2/3] relative overflow-hidden">
        {character.media ? (
          character.isVideo ? (
            <video
              src={character.media}
              className="w-full h-full object-cover"
              muted
              loop
              playsInline
            />
          ) : (
            <img
              src={character.media}
              alt={character.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          )
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: theme.themeParams.secondary_bg_color || "#f0f0f0" }}
          >
            <span style={{ color: theme.themeParams.hint_color }}>?</span>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        <div
          className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-mono font-bold"
          style={{ backgroundColor: accentColor, color: "white" }}
        >
          #{character.id}
        </div>
        
        {character.count > 1 && (
          <div
            className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold"
            style={{ backgroundColor: "rgba(0,0,0,0.6)", color: "white" }}
          >
            x{character.count}
          </div>
        )}
        
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <h3 className="text-white text-sm font-bold truncate drop-shadow-lg">
            {character.name}
          </h3>
          <p className="text-white/60 text-xs truncate">{character.origem}</p>
        </div>
      </div>
    </a>
  );
}

function ProfileCard({
  user,
  tgUser,
  theme,
}: {
  user: TelegramUser | null;
  tgUser: WebAppUser | null;
  theme: TelegramTheme;
}) {
  if (!user || !tgUser) {
    return (
      <div
        className="rounded-2xl p-4 flex flex-col items-center gap-3"
        style={{ backgroundColor: theme.themeParams.section_bg_color || "#ffffff" }}
      >
        <Skeleton className="w-24 h-24 rounded-full" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
    );
  }

  const firstLetter = tgUser.first_name?.charAt(0).toUpperCase() || "?";

  return (
    <div className="overflow-hidden rounded-2xl">
      <div
        className="h-32 relative"
        style={{
          background: `linear-gradient(135deg, ${adjustColor(theme.themeParams.button_color || "#2481cc", -30)}, ${theme.themeParams.button_color || "#2481cc"})`,
        }}
      >
        <a
          href="/miniapptg"
          className="absolute top-4 left-4 z-10 p-2 rounded-full transition-all hover:scale-105"
          style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "white" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 19-7-7 7-7"/>
            <path d="M19 12H5"/>
          </svg>
        </a>
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
          <div className="relative">
            <Avatar className="w-24 h-24 ring-4 shadow-lg">
              <AvatarImage src={tgUser.photo_url} alt={tgUser.first_name} />
              <AvatarFallback
                className="text-3xl"
                style={{ backgroundColor: theme.themeParams.secondary_bg_color, color: theme.themeParams.text_color }}
              >
                {firstLetter}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
      <div
        className="pt-14 pb-4 flex flex-col items-center gap-2"
        style={{ backgroundColor: theme.themeParams.section_bg_color || "#ffffff" }}
      >
        <div className="text-center">
          <h1 className="text-xl font-bold" style={{ color: theme.themeParams.text_color }}>
            {tgUser.first_name} {tgUser.last_name}
          </h1>
          {tgUser.username && (
            <p className="text-sm" style={{ color: theme.themeParams.hint_color || "#999999" }}>
              @{tgUser.username}
            </p>
          )}
        </div>
        <div className="flex gap-2 flex-wrap justify-center">
          <div
            className="px-2 py-1 rounded-full text-xs border"
            style={{
              borderColor: theme.themeParams.section_separator_color || "#e0e0e0",
              color: theme.themeParams.text_color,
            }}
          >
            {user.profileType}
          </div>
          <div
            className="px-2 py-1 rounded-full text-xs"
            style={{
              backgroundColor: theme.themeParams.secondary_bg_color || "#f0f0f0",
              color: theme.themeParams.text_color,
            }}
          >
            💰 {user.coins}
          </div>
          <div
            className="px-2 py-1 rounded-full text-xs"
            style={{
              backgroundColor: theme.themeParams.secondary_bg_color || "#f0f0f0",
              color: theme.themeParams.text_color,
            }}
          >
            {user.language}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({
  children,
  theme,
}: {
  children: React.ReactNode;
  theme: TelegramTheme;
}) {
  return (
    <h2
      className="text-lg font-bold mb-2"
      style={{ color: theme.themeParams.section_header_text_color || theme.themeParams.text_color || "#000000" }}
    >
      {children}
    </h2>
  );
}

function EmptyState({
  message,
  theme,
}: {
  message: string;
  theme: TelegramTheme;
}) {
  return (
    <div
      className="rounded-2xl p-4 text-center"
      style={{
        backgroundColor: theme.themeParams.section_bg_color || "#ffffff",
        color: theme.themeParams.hint_color || "#999999",
      }}
    >
      {message}
    </div>
  );
}

export default function MiniAppTelegram() {
  const [tgUser, setTgUser] = useState<WebAppUser | null>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [activeTab, setActiveTab] = useState<"waifus" | "husbandos">("waifus");
  const [theme, setTheme] = useState<TelegramTheme | null>(null);
  const [loading, setLoading] = useState(true);

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
        const colorScheme = tg.colorScheme || "light";
        
        setTheme({
          themeParams,
          colorScheme,
          backgroundColor: tg.backgroundColor || themeParams.bg_color || "#ffffff",
          headerColor: tg.headerColor || themeParams.header_bg_color || "#ffffff",
        });
        
        setTgUser(tg.initDataUnsafe.user || null);
        fetchUserData(tg.initDataUnsafe.user?.id);

        tg.BackButton.show();
        tg.BackButton.onClick(() => {
          window.location.href = "/miniapptg";
        });
      }
    };
  }, []);

  const fetchUserData = async (telegramId: number) => {
    if (!telegramId) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/user?id=${telegramId}`);
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !tgUser || !theme) {
    return (
      <div
        className="min-h-screen p-4 space-y-4"
        style={{ backgroundColor: theme?.themeParams.bg_color || "#ffffff" }}
      >
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <div
        className="min-h-screen p-4 pb-20"
        style={{ backgroundColor: theme.themeParams.bg_color || "#ffffff" }}
      >
        <ProfileCard user={user} tgUser={tgUser} theme={theme} />

        <div className="grid grid-cols-2 gap-2 mt-4">
          <StatCard
            icon={<HeartIcon size={20} />}
            label="Waifus"
            value={user?.waifuCount || 0}
            theme={theme}
          />
          <StatCard
            icon={<Spade size={20} />}
            label="Husbandos"
            value={user?.husbandoCount || 0}
            theme={theme}
          />
        </div>

        {(user?.favoriteWaifu || user?.favoriteHusbando) && (
          <div className="mt-4">
            <SectionTitle theme={theme}>Favoritos</SectionTitle>
            <div className="grid grid-cols-2 gap-2">
              {user.favoriteWaifu && (
                <FavoriteCard
                  character={user.favoriteWaifu}
                  type="waifu"
                  theme={theme}
                />
              )}
              {user.favoriteHusbando && (
                <FavoriteCard
                  character={user.favoriteHusbando}
                  type="husbando"
                  theme={theme}
                />
              )}
            </div>
          </div>
        )}

        <div className="mt-4">
          <SectionTitle theme={theme}>Coleção</SectionTitle>
          <div
            className="rounded-xl p-1 mb-2 flex"
            style={{ backgroundColor: theme.themeParams.secondary_bg_color || "#f0f0f0" }}
          >
            <button
              type="button"
              className="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all select-none"
              style={{ 
                backgroundColor: activeTab === "waifus" ? theme.themeParams.section_bg_color || "#ffffff" : "transparent",
                color: theme.themeParams.text_color,
              }}
              onClick={() => setActiveTab("waifus")}
            >
              ❤️ Waifus ({user?.waifus.length || 0})
            </button>
            <button
              type="button"
              className="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all select-none"
              style={{ 
                backgroundColor: activeTab === "husbandos" ? theme.themeParams.section_bg_color || "#ffffff" : "transparent",
                color: theme.themeParams.text_color,
              }}
              onClick={() => setActiveTab("husbandos")}
            >
              💙 Husbandos ({user?.husbandos.length || 0})
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {activeTab === "waifus" ? (
              user?.waifus && user.waifus.length > 0 ? (
                user.waifus.map((waifu) => (
                  <CollectionCard
                    key={waifu.id}
                    character={waifu}
                    type="waifu"
                    theme={theme}
                  />
                ))
              ) : (
                <div className="col-span-3">
                  <EmptyState message="Nenhuma waifu na coleção" theme={theme} />
                </div>
              )
            ) : (
              user?.husbandos && user.husbandos.length > 0 ? (
                user.husbandos.map((husbando) => (
                  <CollectionCard
                    key={husbando.id}
                    character={husbando}
                    type="husbando"
                    theme={theme}
                  />
                ))
              ) : (
                <div className="col-span-3">
                  <EmptyState message="Nenhum husbando na coleção" theme={theme} />
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
