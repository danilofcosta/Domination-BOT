"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      router.replace("/miniapptg");
    }, 3000);

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-web-app.js?62";
    script.async = true;
    document.head.appendChild(script);
    script.onload = () => {
      clearTimeout(timeoutId);
      const tg = (window as any).Telegram?.WebApp;
      if (tg) {
        tg.ready();
        const user = tg.initDataUnsafe.user;
        if (user?.id) {
          router.replace(`/miniapptg/user/${user.id}`);
        } else {
          router.replace("/miniapptg");
        }
      } else {
        router.replace("/miniapptg");
      }
    };
    script.onerror = () => {
      clearTimeout(timeoutId);
      router.replace("/miniapptg");
    };
  }, [router]);

  return (
    <div className="min-h-screen p-4 space-y-4 bg-background">
      <Skeleton className="h-48 w-full rounded-2xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
    </div>
  );
}
