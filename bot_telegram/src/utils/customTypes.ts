// src/types.ts
import type { Context } from "grammy";
import type { I18nFlavor } from "@grammyjs/i18n";
import type { SessionFlavor } from "grammy";

import type { CharacterWaifu, CharacterHusbando, WaifuCollection, HusbandoCollection, MediaType, HusbandoEvent, WaifuEvent, HusbandoRarity, WaifuRarity } from "../../generated/prisma/client.js";

export type TypeMidia = MediaType;
export type Character = CharacterWaifu | CharacterHusbando ;

export type Collection = WaifuCollection | HusbandoCollection;
export type EventType = WaifuEvent | HusbandoEvent;
export type RarityType = WaifuRarity | HusbandoRarity

// export type
export enum ChatType {
  WAIFU = "waifu",
  HUSBANDO = "husbando",
}

export enum NODE_ENV {
  PRODUCTION = "production",
  DEVELOPMENT = "development",
}

export const roleHierarchy: Record<string, number> = {
  OWNER: 6,
  SUPREME: 5,
  SUPER_ADMIN: 4,
  ADMIN: 3,
  MODERATOR: 2,
  USER: 1,
  BANNED: -1,
};

export interface SessionData {
  settings: {
    genero: ChatType;
  };
  grupo: {
    cont: number;
    dropId: number | null;
    data: Date | null;
    character: Character | null;
    title:string|null|undefined
  };
  adminSetup?: {
    action: "edit_nome" | "edit_anime" | null;
    targetId: string | null;
  };
}

/* =========================
 * Contexto customizado
 * ========================= */

export type MyContext = Context &
  I18nFlavor &
  SessionFlavor<SessionData>;
