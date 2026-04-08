'use client'

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    onTelegramAuth: (user: any) => void;
  }
}

interface TelegramLoginWidgetProps {
  onAuth: (user: any) => void;
}

export function TelegramLoginWidget({ onAuth }: TelegramLoginWidgetProps) {
  const telegramRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (telegramRef.current && !telegramRef.current.hasChildNodes()) {
      const script = document.createElement("script");
      script.src = "https://telegram.org/js/telegram-widget.js?23";
      script.async = true;
      script.setAttribute("data-telegram-login", "Wadomination_bot");
      script.setAttribute("data-size", "large");
      script.setAttribute("data-radius", "20");
      script.setAttribute("data-request-access", "write");
      script.setAttribute("data-onauth", "onTelegramAuth(user)");

      telegramRef.current.appendChild(script);
    }

    window.onTelegramAuth = (user) => {
      onAuth(user);
    };
  }, [onAuth]);

  return (
    <div ref={telegramRef} className="mt-2"></div>
  );
}

export default function TelegramLoginPage() {
  return <TelegramLoginWidget onAuth={() => {}} />;
}