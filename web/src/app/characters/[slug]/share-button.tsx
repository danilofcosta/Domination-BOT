"use client";

import { useState } from "react";
import { Share2, CheckIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ShareButtonProps {
  name: string;
  slug: string;
  type: string;
}

export function ShareButton({ name: _name, slug, type }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/characters/${slug}_${type}`;

    // Em qualquer dispositivo copia a URL para a área de transferência
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copiado para a área de transferência!", {
        description: url,
        duration: 3000,
      });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Erro ao copiar link.");
    }
  };

  return (
    <button
      onClick={handleShare}
      title={copied ? "Link copiado!" : "Compartilhar"}
      className={cn(
        "p-5 backdrop-blur-xl border rounded-3xl transition-all group flex items-center gap-2",
        copied
          ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
          : "bg-card/40 border-primary/10 hover:bg-primary/5 hover:border-primary/30"
      )}
    >
      {copied ? (
        <CheckIcon className="size-6 text-emerald-400 animate-in zoom-in-95 duration-200" />
      ) : (
        <Share2 className="size-6 text-muted-foreground group-hover:text-primary transition-colors" />
      )}
    </button>
  );
}
