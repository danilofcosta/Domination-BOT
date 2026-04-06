"use client";

import Script from "next/script";
import { useEffect } from "react";

// Declaração de tipo para não dar erro no TypeScript
declare global {
  interface Window {
    Telegram?: {
      WebApp: any;
    };
  }
}

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Isso é executado apenas do lado do cliente após o script ser carregado
    const initTelegram = () => {
      const app = window.Telegram?.WebApp;
      if (app) {
        app.ready(); // Comunica ao Telegram que a página terminou de carregar
        app.expand(); // Expande o Mini App para ocupar a tela toda
        
        // Opcional: Se quiser forçar a interface a seguir o tema do celular do usuário
        // document.documentElement.className = app.colorScheme;
      }
    };

    // Pequeno delay para garantir que a injeção do arquivo Javascript do TG rolou
    setTimeout(initTelegram, 100);
  }, []);

  return (
    <>
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      {children}
    </>
  );
}
