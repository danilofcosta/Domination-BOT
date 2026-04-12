"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThumbsUp, Maximize2, X, ChevronLeft, Heart } from "lucide-react";

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

type CollectionDetail = {
  id: number;
  name: string;
  slug: string;
  origem: string;
  media: string | null;
  mediaType: string | null;
  sourceType: string;
  popularity: number;
  likes: number;
  dislikes: number;
  type: "waifu" | "husbando";
  userCount: number;
  userHasCount: number;
  topOwners: Array<{
    userId: number;
    telegramId: string;
    count: number;
    telegramData: {
      id?: string|number;
      first_name: string;
      last_name?: string;
      username?: string;
      photo_url?: string;
    } | null;
  }>;
  rarities: Array<{
    id: number;
    code: string;
    name: string;
    emoji: string;
    description: string | null;
  }>;
  events: Array<{
    id: number;
    code: string;
    name: string;
    emoji: string;
    description: string | null;
  }>;
  userHasCharacter: boolean;
  userHasLiked: boolean;
};

type WebAppUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
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

export default function CollectionDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const characterId = params.id as string;
  const type = searchParams.get("type") as "waifu" | "husbando";

  const [character, setCharacter] = useState<CollectionDetail | null>(null);
  const [theme, setTheme] = useState<TelegramTheme | null>(null);
  const [currentUser, setCurrentUser] = useState<WebAppUser | null>(null);
  const [userFavorites, setUserFavorites] = useState<{
    favoriteWaifuId: number | null;
    favoriteHusbandoId: number | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFavoriteMsg, setShowFavoriteMsg] = useState(false);
  const [showNoCollectionMsg, setShowNoCollectionMsg] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);

  const isFavorite = type === "waifu"
    ? userFavorites?.favoriteWaifuId === Number(characterId)
    : userFavorites?.favoriteHusbandoId === Number(characterId);

  const accentColor = type === "waifu" ? "#ec4899" : "#3b82f6";
  const accentBgColor = type === "waifu" ? "#ec489920" : "#3b82f620";

  useEffect(() => {
    if (isFavorite) {
      setShowFavoriteMsg(true);
      const timer = setTimeout(() => {
        setShowFavoriteMsg(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isFavorite]);

  useEffect(() => {
    if (showNoCollectionMsg) {
      const timer = setTimeout(() => {
        setShowNoCollectionMsg(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showNoCollectionMsg]);

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

        setCurrentUser(tg.initDataUnsafe.user || null);
        
        if (tg.initDataUnsafe.user?.id) {
          fetchUserFavorites(tg.initDataUnsafe.user.id);
        }

        tg.BackButton.show();
        tg.BackButton.onClick(() => {
          window.history.back();
        });
      }
    };
  }, []);

  const fetchUserFavorites = async (telegramId: number) => {
    try {
      const res = await fetch(`/api/user?id=${telegramId}`);
      if (res.ok) {
        const data = await res.json();
        setUserFavorites({
          favoriteWaifuId: data.favoriteWaifu?.id || null,
          favoriteHusbandoId: data.favoriteHusbando?.id || null,
        });
      }
    } catch (err) {
      console.error("Error fetching favorites:", err);
    }
  };

  useEffect(() => {
    const fetchCharacter = async () => {
      if (!characterId || !type) return;

      try {
        const tgId = currentUser?.id ? `&telegramId=${currentUser.id}` : "";
        const res = await fetch(`/api/collection/${characterId}?type=${type}${tgId}`);
        if (res.ok) {
          const data = await res.json();
          setCharacter(data);
          setHasLiked(data.userHasLiked);
        } else {
          setError("Personagem não encontrado");
        }
      } catch (err) {
        console.error("Error fetching collection:", err);
        setError("Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };

    fetchCharacter();
  }, [characterId, type, currentUser]);

  const handleFavorite = async () => {
    if (!character || actionLoading || isFavorite) return;

    if (!character.userHasCharacter) {
      setShowNoCollectionMsg(true);
      const timer = setTimeout(() => {
        setShowNoCollectionMsg(false);
      }, 3000);
      return () => clearTimeout(timer);
    }

    setActionLoading(true);
    try {
      const res = await fetch("/api/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegramId: currentUser?.id || 0,
          action: "favorite",
          characterId: Number(characterId),
          characterType: type,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (type === "waifu") {
          setUserFavorites((prev) => prev ? {
            ...prev,
            favoriteWaifuId: data.isFavorite ? Number(characterId) : null,
          } : null);
        } else {
          setUserFavorites((prev) => prev ? {
            ...prev,
            favoriteHusbandoId: data.isFavorite ? Number(characterId) : null,
          } : null);
        }

        const tg = (window as any).Telegram?.WebApp;
        tg?.HapticFeedback?.impactOccurred("light");
      }
    } catch (err) {
      console.error("Error handling favorite:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLike = async () => {
    if (!character || actionLoading || hasLiked) return;

    setActionLoading(true);
    try {
      const res = await fetch("/api/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegramId: currentUser?.id || 0,
          action: "like",
          characterId: Number(characterId),
          characterType: type,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCharacter((prev) => prev ? { ...prev, likes: data.likes } : null);
        setHasLiked(true);

        const tg = (window as any).Telegram?.WebApp;
        tg?.HapticFeedback?.impactOccurred("light");
      }
    } catch (err) {
      console.error("Error handling action:", err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !theme) {
    return (
      <div
        className="min-h-screen p-4 space-y-4"
        style={{ backgroundColor: theme?.themeParams.bg_color || "#ffffff" }}
      >
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !character) {
    return (
      <div
        className="min-h-screen p-4 flex flex-col items-center justify-center gap-4"
        style={{ backgroundColor: theme.themeParams.bg_color || "#ffffff" }}
      >
        <p style={{ color: theme.themeParams.hint_color || "#999999" }}>{error || "Erro desconhecido"}</p>
        <Link href="/miniapptg">
          <Button
            style={{
              backgroundColor: theme.themeParams.button_color || "#2481cc",
              color: theme.themeParams.button_text_color || "#ffffff",
            }}
          >
            Voltar ao perfil
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <div
        className="min-h-screen pb-20"
        style={{ backgroundColor: theme.themeParams.bg_color || "#ffffff" }}
      >
        <div className="relative h-72 overflow-hidden">
          {character.media ? (
            <img src={character.media} alt={character.name} className="w-full h-full object-contain" />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ backgroundColor: theme.themeParams.secondary_bg_color || "#f0f0f0" }}
            >
              <span style={{ color: theme.themeParams.hint_color }}>No image</span>
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent" />

          <Link
            href="/miniapptg"
            className="absolute top-4 left-4 z-10"
          >
            <Button
              variant="secondary"
              size="icon"
              style={{ backgroundColor: theme.themeParams.secondary_bg_color || "#f0f0f0" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
              </svg>
            </Button>
          </Link>

          <div
            className="absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium"
            style={{
              backgroundColor: character.type === "waifu"
                ? theme.themeParams.button_color || "#2481cc"
                : theme.themeParams.secondary_bg_color || "#f0f0f0",
              color: character.type === "waifu"
                ? theme.themeParams.button_text_color || "#ffffff"
                : theme.themeParams.text_color,
            }}
          >
            {character.type === "waifu" ? "❤️ Waifu" : "💙 Husbando"}
          </div>

          <div className="absolute bottom-4 left-4 right-4">
            <h1 className="text-2xl font-bold text-white drop-shadow-lg">
              {character.name}
            </h1>
            <p className="text-sm text-white/80">{character.origem}</p>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => handleFavorite()}
              disabled={actionLoading || !character.userHasCharacter}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              style={{
                backgroundColor: isFavorite 
                  ? accentBgColor
                  : theme.themeParams.secondary_bg_color || "#f0f0f0",
                color: isFavorite ? accentColor : theme.themeParams.text_color,
                cursor: (actionLoading || !character.userHasCharacter) ? "not-allowed" : "pointer",
                opacity: (actionLoading || !character.userHasCharacter) ? 0.5 : 1,
              }}
            >
              <Heart 
                size={20} 
                className={isFavorite ? "fill-current" : ""} 
              />
              {isFavorite && (
                <span className="text-xs" style={{ color: accentColor }}>★</span>
              )}
            </button>

            <button
              onClick={() => handleLike()}
              disabled={actionLoading || hasLiked}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              style={{
                backgroundColor: hasLiked 
                  ? accentBgColor
                  : theme.themeParams.secondary_bg_color || "#f0f0f0",
                color: hasLiked ? accentColor : theme.themeParams.text_color,
              }}
            >
              <ThumbsUp 
                size={20} 
                className={hasLiked ? "fill-current" : ""} 
              />
              <span className="text-sm font-medium">
                {hasLiked ? "Curtido" : "Curtir"}
              </span>
              <span className="text-sm">({character.likes})</span>
            </button>

            <button
              onClick={() => setIsFullscreen(true)}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: theme.themeParams.secondary_bg_color || "#f0f0f0",
                color: theme.themeParams.text_color,
              }}
            >
              <Maximize2 size={20} />
            </button>
          </div>

          {showFavoriteMsg && (
            <div className="flex items-center justify-center gap-2 py-2 text-sm animate-pulse" style={{ color: accentColor }}>
              <Heart size={14} className="fill-current" />
              <span>Adicionado aos favoritos</span>
            </div>
          )}

          {showNoCollectionMsg && (
            <div className="flex items-center justify-center gap-2 py-2 text-sm animate-pulse" style={{ color: theme.themeParams.destructive_text_color || "#ef4444" }}>
              <span>Adicione este personagem à sua coleção para favoritar</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div
              className="rounded-2xl p-3 text-center"
              style={{ backgroundColor: theme.themeParams.secondary_bg_color || "#f0f0f0" }}
            >
              <p className="text-2xl font-bold" style={{ color: theme.themeParams.text_color }}>
                {character.userCount}
              </p>
              <p className="text-xs" style={{ color: theme.themeParams.hint_color || "#999999" }}>
                Donos
              </p>
            </div>
            <div
              className="rounded-2xl p-3 text-center"
              style={{ backgroundColor: theme.themeParams.secondary_bg_color || "#f0f0f0" }}
            >
              <p className="text-2xl font-bold" style={{ color: theme.themeParams.text_color }}>
                {character.popularity}
              </p>
              <p className="text-xs" style={{ color: theme.themeParams.hint_color || "#999999" }}>
                Popularidade
              </p>
            </div>
          </div>

          {character.rarities && character.rarities.length > 0 && (
            <div>
              <h3
                className="text-base font-bold mb-2"
                style={{ color: theme.themeParams.text_color }}
              >
                Raridades
              </h3>
              <div className="flex flex-wrap gap-2">
                {character.rarities.map((rarity) => (
                  <div
                    key={rarity.id}
                    className="px-3 py-1 rounded-full text-sm border"
                    style={{
                      borderColor: theme.themeParams.section_separator_color || "#e0e0e0",
                      color: theme.themeParams.text_color,
                      backgroundColor: theme.themeParams.section_bg_color || "#ffffff",
                    }}
                  >
                    <span className="mr-1">{rarity.emoji}</span>
                    {rarity.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {character.events && character.events.length > 0 && (
            <div>
              <h3
                className="text-base font-bold mb-2"
                style={{ color: theme.themeParams.text_color }}
              >
                Eventos
              </h3>
              <div className="flex flex-wrap gap-2">
                {character.events.map((event) => (
                  <div
                    key={event.id}
                    className="px-3 py-1 rounded-full text-sm"
                    style={{
                      backgroundColor: theme.themeParams.secondary_bg_color || "#f0f0f0",
                      color: theme.themeParams.text_color,
                    }}
                  >
                    <span className="mr-1">{event.emoji}</span>
                    {event.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3
              className="text-base font-bold mb-2"
              style={{ color: theme.themeParams.text_color }}
            >
              Donos ({character.userCount})
            </h3>
            {character.topOwners && character.topOwners.length > 0 ? (
              <div className="space-y-2">
                {character.topOwners.map((owner, index) => {
                  const tgData = owner.telegramData;
                  const firstLetter = tgData?.first_name?.charAt(0).toUpperCase() || "?";
                  return (
                    <Link
                      key={owner.userId}
                      href={`/miniapptg/user/${tgData?.id || 0}`}
                      className="block"
                    >
                      <div
                        className="flex items-center gap-3 p-3 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                        style={{ backgroundColor: theme.themeParams.section_bg_color || "#ffffff" }}
                      >
                        <span
                          className="text-lg font-bold w-6 text-center"
                          style={{ color: theme.themeParams.hint_color || "#999999" }}
                        >
                          #{index + 1}
                        </span>
                        <Avatar size="sm">
                          {tgData?.photo_url ? (
                            <img
                              src={tgData.photo_url||'/login/avatar.jpg'}
                              alt={tgData?.first_name}
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : ( <img
                              src={'/login/avatar.jpg'}
                              alt={tgData?.first_name}
                              className="w-full h-full object-cover rounded-full"
                            />
                          
                            // <AvatarFallback
                            //   style={{
                            //     backgroundColor: theme.themeParams.secondary_bg_color,
                            //     color: theme.themeParams.text_color,
                            //   }}
                            // >
                            //   {firstLetter}
                            // </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate" style={{ color: theme.themeParams.text_color }}>
                            {tgData?.first_name} {tgData?.last_name}
                          </p>
                          {tgData?.username && (
                            <p className="text-xs" style={{ color: theme.themeParams.hint_color || "#999999" }}>
                              @{tgData.username} 
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className="px-2 py-1 rounded-full text-xs border"
                            style={{
                              borderColor: theme.themeParams.section_separator_color || "#e0e0e0",
                              color: theme.themeParams.text_color,
                            }}
                          >
                            x{owner.count}
                          </div>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke={theme.themeParams.hint_color || "#999999"}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="m9 18 6-6-6-6" />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div
                className="text-center py-8 rounded-2xl"
                style={{ 
                  backgroundColor: theme.themeParams.section_bg_color || "#ffffff",
                  color: theme.themeParams.hint_color || "#999999" 
                }}
              >
                Nenhum dono ainda
              </div>
            )}
          </div>

          <div
            className="rounded-2xl p-4"
            style={{ backgroundColor: theme.themeParams.section_bg_color || "#ffffff" }}
          >
            <h3
              className="text-base font-bold mb-2"
              style={{ color: theme.themeParams.text_color }}
            >
              Informações
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span style={{ color: theme.themeParams.hint_color || "#999999" }}>ID Personagem</span>
                <span className="font-mono text-xs" style={{ color: theme.themeParams.text_color }}>
                  #{character.id}
                </span>
              </div>
              {character.userHasCount > 0 && (
                <>
                  <div
                    className="h-px w-full"
                    style={{ backgroundColor: theme.themeParams.section_separator_color || "#e0e0e0" }}
                  />
                  <div className="flex justify-between">
                    <span style={{ color: theme.themeParams.hint_color || "#999999" }}>ID Local</span>
                    <span className="font-mono text-xs" style={{ color: accentColor }}>
                      x{character.userHasCount}
                    </span>
                  </div>
                </>
              )}
              <div
                className="h-px w-full"
                style={{ backgroundColor: theme.themeParams.section_separator_color || "#e0e0e0" }}
              />
              <div className="flex justify-between">
                <span style={{ color: theme.themeParams.hint_color || "#999999" }}>Tipo</span>
                <span style={{ color: theme.themeParams.text_color }}>{character.sourceType}</span>
              </div>
              <div
                className="h-px w-full"
                style={{ backgroundColor: theme.themeParams.section_separator_color || "#e0e0e0" }}
              />
              <div className="flex justify-between">
                <span style={{ color: theme.themeParams.hint_color || "#999999" }}>Origem</span>
                <span style={{ color: theme.themeParams.text_color }}>{character.origem}</span>
              </div>
              <div
                className="h-px w-full"
                style={{ backgroundColor: theme.themeParams.section_separator_color || "#e0e0e0" }}
              />
              <div className="flex justify-between">
                <span style={{ color: theme.themeParams.hint_color || "#999999" }}>Slug</span>
                <span className="font-mono text-xs" style={{ color: theme.themeParams.text_color }}>
                  {character.slug}
                </span>
              </div>
            </div>
          </div>
        </div>

        {isFullscreen && character.media && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
            onClick={() => setIsFullscreen(false)}
          >
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X size={24} className="text-white" />
            </button>
            
            <button
              onClick={() => router.push("/miniapptg")}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-2"
            >
              <ChevronLeft size={20} className="text-white" />
              <span className="text-white font-medium">Sair</span>
            </button>
            
            <img
              src={character.media}
              alt={character.name}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}
