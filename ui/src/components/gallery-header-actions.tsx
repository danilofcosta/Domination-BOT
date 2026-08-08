"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CreateCharacterDialog } from "@/components/create-character-dialog";
import { getRandomCharacter } from "@/actions/characters";
import {
  SparklesIcon,
  DiamondIcon,
  CalendarDaysIcon,
  UsersIcon,
  LoaderIcon,
} from "lucide-react";

type RarityOrEvent = {
  id: number;
  code: string;
  name: string;
  emoji: string;
};

interface GalleryHeaderActionsProps {
  canAdd: boolean;
  canManageRarities: boolean;
  canManageEvents: boolean;
  allRarities: RarityOrEvent[];
  allEvents: RarityOrEvent[];
}

export function GalleryHeaderActions({
  canAdd,
  canManageRarities,
  canManageEvents,
  allRarities,
  allEvents,
}: GalleryHeaderActionsProps) {
  const router = useRouter();
  const [surprising, setSurprising] = useState(false);

  async function handleSurprise() {
    if (surprising) return;
    setSurprising(true);
    const result = await getRandomCharacter();
    setSurprising(false);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    router.push(`/characters/${result.type}/${result.id}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleSurprise}
        disabled={surprising}
      >
        {surprising ? (
          <LoaderIcon className="mr-1 size-3 animate-spin" />
        ) : (
          <SparklesIcon className="mr-1 size-3" />
        )}
        Surpreenda-me
      </Button>

      {canManageRarities && (
        <Button variant="outline" size="sm" asChild>
          <Link href="/characters/raridades">
            <DiamondIcon className="mr-1 size-3" />
            Raridades
          </Link>
        </Button>
      )}

      {canManageEvents && (
        <Button variant="outline" size="sm" asChild>
          <Link href="/characters/eventos">
            <CalendarDaysIcon className="mr-1 size-3" />
            Eventos
          </Link>
        </Button>
      )}

      {canAdd && (
        <>
          <Button variant="outline" size="sm" asChild>
            <Link href="/characters">
              <UsersIcon className="mr-1 size-3" />
              Personagens
            </Link>
          </Button>
          <CreateCharacterDialog
            type="waifu"
            allRarities={allRarities}
            allEvents={allEvents}
          />
          <CreateCharacterDialog
            type="husbando"
            allRarities={allRarities}
            allEvents={allEvents}
          />
        </>
      )}

      <Link
        href="/home"
        className="text-muted-foreground hover:text-foreground text-xs transition-colors"
      >
        &larr; Voltar
      </Link>
    </div>
  );
}
