"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { linkCharacter } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  characterId: number;
  characterType: "waifu" | "husbando";
  initialLikes: number;
  slug: string;
}

export function LikeButton({
  characterId,
  characterType,
  initialLikes,
  slug,
}: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiking, setIsLiking] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);

  const handleLike = async () => {
    if (isLiking) return;

    setIsLiking(true);
    // Optimistic update
    setLikes((prev) => prev + 1);
    setHasLiked(true);

    try {
      const result = await linkCharacter(characterId, characterType, slug);
      if (!result.success) {
        // Rollback on error
        setLikes((prev) => prev - 1);
        setHasLiked(false);
        console.error("Erro ao curtir:", result.error);
      }
    } catch (error) {
      setLikes((prev) => prev - 1);
      setHasLiked(false);
      console.error("Erro ao curtir:", error);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <Button
      variant={hasLiked ? "default" : "secondary"}
      size="default"
      className={cn(
        "px-10 py-8 transition-all duration-300 gap-3",
        hasLiked && "bg-rose-700 hover:bg-rose-800 text-white border-none shadow-lg shadow-rose-500/10"
      )}
      onClick={!isLiking && !hasLiked ? handleLike : undefined}
    >
      <Heart
        className={cn(
          "size-5 transition-transform duration-300",
          hasLiked && "fill-current scale-125",
          isLiking && "animate-pulse"
        )}
      />

      <span className="font-bold" >{hasLiked ? "Curtido!" : "Favoritar"}</span>
      <span className="ml-2 px-2 py-0.5 bg-background/20 rounded-full text-xs font-bold">
        {likes}
      </span>
    </Button>
  );
}
