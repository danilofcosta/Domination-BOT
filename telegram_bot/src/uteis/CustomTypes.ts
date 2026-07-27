import type { Context, SessionFlavor } from "grammy";
import type { CommandsFlavor } from "@grammyjs/commands";
import type {
  CharacterWaifu,
  CharacterHusbando,
  WaifuCollection,
  HusbandoCollection,
  WaifuEvent,
  HusbandoEvent,
  WaifuRarity,
  HusbandoRarity,
  MediaType,
  Language,
  ProfileType,
  SourceType,
  $Enums,
} from "../../generated/prisma/client.js";
import type { I18nFlavor } from "../locales/i18nFlavor.js";

export enum ChatType {
  WAIFU = "waifu",
  HUSBANDO = "husbando",
}

export interface SessionData {
  chatType: "private" | "group" | "supergroup" | "channel";
  chatTypeBot: ChatType;
}
export type MyContext = Context & SessionFlavor<SessionData> & I18nFlavor & CommandsFlavor & { botType: ChatType };

export type Character = CharacterWaifu | CharacterHusbando;
export type Collection = WaifuCollection | HusbandoCollection ;
export type EventType = WaifuEvent | HusbandoEvent;
export type RarityType = WaifuRarity | HusbandoRarity;


export interface PreCharacter {
  idchat?: number;
  nome: string;
  anime: string;
  rarities?: number[] | undefined;
  events?: number[] | undefined;
  genero: ChatType;
  mediatype: MediaType;
  media: string;
  mediaUniqueId?: string;
  sourceType?: $Enums.SourceType;
  username: string;
  user_id: number;
  extras?: Record<string, any>;
  editId?: number;
}