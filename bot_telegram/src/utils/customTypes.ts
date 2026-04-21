// src/types.ts
import type { Context } from "grammy";
import type { I18nFlavor } from "@grammyjs/i18n";
import type { SessionFlavor } from "grammy";

import type { CharacterWaifu, CharacterHusbando, WaifuCollection, HusbandoCollection, MediaType, HusbandoEvent, WaifuEvent, HusbandoRarity, WaifuRarity } from "../../generated/prisma/client.js";
import type { User } from "grammy/types";

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
    data: number | null;
    character: Character | null;
    title:string|null|undefined
    directMessagesTopicId:number|null|undefined
  };
  adminSetup?: {
    action: "edit_nome" | "edit_anime" | null;
    targetId: string | null;
  };
  lock?: {
    userId: number;
    timestamp: number;
  };
}

/* =========================
 * Contexto customizado
 * ========================= */

export type MyContext = Context &
  I18nFlavor &
  SessionFlavor<SessionData>;

export type TipoMessageEntity =
  | "mention"
  | "hashtag"
  | "cashtag"
  | "bot_command"
  | "url"
  | "email"
  | "phone_number"
  | "bold"
  | "italic"
  | "underline"
  | "strikethrough"
  | "spoiler"
  | "blockquote"
  | "expandable_blockquote"
  | "code"
  | "pre"
  | "text_link"
  | "text_mention"
  | "custom_emoji"
  | "date_time";

export interface MessageEntity {
  /** Tipo da entidade */
  type: TipoMessageEntity;

  /** Posição inicial no texto (UTF-16) */
  offset: number;

  /** Tamanho da entidade (UTF-16) */
  length: number;

  /** Apenas para "text_link" */
  url?: string;

  /** Apenas para "text_mention" */
  user?: User;

  /** Apenas para "pre" */
  language?: string;

  /** Apenas para "custom_emoji" */
  custom_emoji_id?: string;

  /** Apenas para "date_time" */
  unix_time?: number;

  /** Apenas para "date_time" */
  date_time_format?: string;
}