// src/types.ts
import type { Context } from "grammy";
import type { I18nFlavor } from "@grammyjs/i18n";
import type { SessionFlavor } from "grammy";


import type { User } from "grammy/types";
import type { SessionData } from "./customInteface.js";
import type { WaifuCollection } from "../../generated/prisma/client.js";
import type { CharacterHusbando, CharacterWaifu, HusbandoCollection, HusbandoEvent, HusbandoRarity, WaifuEvent, WaifuRarity } from "../../generated/prisma/client.js";
 // db types



export type Character = CharacterWaifu | CharacterHusbando;

export type Collection = WaifuCollection | HusbandoCollection;
export type EventType = WaifuEvent | HusbandoEvent;
export type RarityType = WaifuRarity | HusbandoRarity;




export type CreateOneBtnOptions = {
  typeBtn?: BTN_TYPE;
  text: string;
  callback: string;
  icon?: string;
  style?: BTN_STYLE;
};
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
export enum BTN_TYPE {
  switch_inline_query_current_chat = "switch_inline_query_current_chat",
  callback_data = "callback_data",
  url = "url",
}
export type BTN_STYLE = "primary" | "success" | "danger" | undefined


/* =========================
 * Contexto customizado
 * ========================= */

export type MyContext = Context & I18nFlavor & SessionFlavor<SessionData>;

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

export interface PreCharacter {
  idchat?: number;
  nome: string;
  anime: string;
  rarities?: number[] | undefined;
  events?: number[] | undefined;
  genero: ChatType;
  mediatype: MediaType;
  media: string;
  username: string;
  user_id: number;
  extras?: Record<string, any>;
}

export enum Language {
  PT = "PT",
  EN = "EN"
}

export enum MediaType {
  IMAGE_URL = "IMAGE_URL",
  IMAGE_FILEID = "IMAGE_FILEID",
  VIDEO_URL = "VIDEO_URL",
  VIDEO_FILEID = "VIDEO_FILEID",
  VIDEO_LOCAL = "VIDEO_LOCAL",
  IMAGE_LOCAL = "IMAGE_LOCAL"
}

export enum ProfileType {
  SUPREME = "SUPREME",
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  MODERATOR = "MODERATOR",
  USER = "USER",
  BANNED = "BANNED"
}

export enum SourceType {
  ANIME = "ANIME",
  GAME = "GAME",
  MANGA = "MANGA",
  MOVIE = "MOVIE"
}