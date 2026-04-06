"use client";

import { useEffect, useState } from "react";
import { User, Wallet, Gamepad2, ShieldAlert } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function WebTGProfile() {
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const app = typeof window !== "undefined" ? window.Telegram?.WebApp : null;
        
        let telegramId = "UNKNOWN";
        
        // Em produção, pegamos o ID direto do contexto do Telegram
        if (app?.initDataUnsafe?.user?.id) {
          telegramId = app.initDataUnsafe.user.id.toString();
        } else {
          // Fallback para desenvolvimento local:
          telegramId = "6874062454"; 
          setError("Aviso: Testando fora do Telegram. Usando ID da conta principal.");
        }

        const res = await fetch(`/api/user?id=${telegramId}`);
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || "Usuário não encontrado.");
        }
        
        setUserData(data);
      } catch (err: any) {
         setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="w-full flex justify-between items-center mb-8">
         <h1 className="text-2xl font-black uppercase tracking-tighter italic">Seu Perfil</h1>
         <ThemeToggle />
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-muted rounded-2xl w-full"></div>
          <div className="h-12 bg-muted rounded-xl w-3/4"></div>
          <div className="h-12 bg-muted rounded-xl w-1/2"></div>
        </div>
      ) : userData ? (
        <div className="space-y-6 animate-in fade-in zoom-in duration-500">
           
          {/* Card Principal */}
          <div className="p-6 bg-primary/10 border border-primary/20 rounded-3xl flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-4">
              <User className="size-10 text-primary" />
            </div>
            {userData.telegramData?.first_name ? (
               <h2 className="text-2xl font-bold">{userData.telegramData.first_name}</h2>
            ) : (
               <h2 className="text-xl font-bold text-muted-foreground">Usuário Anônimo</h2>
            )}
            <p className="text-sm text-foreground/50 font-mono mt-1">ID: {userData.telegramId}</p>
            <div className="mt-4 inline-block px-3 py-1 bg-background rounded-full border text-xs font-bold uppercase tracking-widest text-primary">
              {userData.profileType}
            </div>
          </div>

          {/* Moedas */}
          <div className="grid grid-cols-2 gap-4">
             <div className="p-5 bg-muted/30 rounded-2xl border flex flex-col gap-2">
                <Wallet className="size-6 text-foreground/60" />
                <span className="text-3xl font-black">{userData.coins}</span>
                <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Dommas (Coins)</span>
             </div>

             <div className="p-5 bg-muted/30 rounded-2xl border flex flex-col gap-2">
                <Gamepad2 className="size-6 text-foreground/60" />
                <span className="text-3xl font-black">{userData.waifuCount + userData.husbandoCount}</span>
                <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Personagens</span>
             </div>
          </div>

          {/* Cards Detalhados */}
          <div className="bg-muted/10 rounded-2xl border p-4 space-y-3">
             <div className="flex justify-between items-center py-2 border-b">
                <span className="font-bold text-foreground/80">Waifus na Coleção</span>
                <span className="font-black text-xl">{userData.waifuCount}</span>
             </div>
             <div className="flex justify-between items-center py-2">
                <span className="font-bold text-foreground/80">Husbandos na Coleção</span>
                <span className="font-black text-xl">{userData.husbandoCount}</span>
             </div>
          </div>

          {error && (
            <div className="mt-10 p-4 bg-yellow-500/10 border-yellow-500/20 text-yellow-600 rounded-xl flex items-center gap-3 text-sm font-bold">
               <ShieldAlert className="size-5" />
               <p>{error}</p>
            </div>
          )}

        </div>
      ) : (
        <div className="py-20 text-center">
            <h2 className="text-xl font-bold mb-2">Ops!</h2>
            <p className="text-muted-foreground">{error}</p>
        </div>
      )}
    </div>
  );
}
