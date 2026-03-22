"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function TelegramInitializer() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if we are inside Telegram Web App
    if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      tg.ready();
      tg.expand();

      const user = tg.initDataUnsafe?.user;
      if (user && user.id) {
        const currentId = searchParams.get("telegramId");
        // If no ID is in URL, or it's different, update it
        if (!currentId || currentId !== user.id.toString()) {
          const params = new URLSearchParams(searchParams.toString());
          params.set("telegramId", user.id.toString());
          router.replace(`/collection?${params.toString()}`);
        }
      }
    }
  }, [router, searchParams]);

  return null;
}
