"use client";

import { useEffect, useRef } from "react";
import { saveMalExtras } from "./actions";

interface Props {
  characterId: string;
  type: "waifu" | "husbando";
  extras: Record<string, unknown>;
}

export function MalCacheClient({ characterId, type, extras }: Props) {
  const saved = useRef(false);

  useEffect(() => {
    if (saved.current) return;
    saved.current = true;
    if ((extras as any)?.mal?.data) {
      saveMalExtras(characterId, type, extras);
    }
  }, []);

  return null;
}
