import { SourceType, MediaType, ProfileType, Language, WaifuCollection, WaifuEvent, WaifuRarity, HusbandoEvent, HusbandoRarity, HusbandoCollection } from "../../generated/prisma/client"
import { CharacterHusbando, CharacterWaifu } from "../../generated/prisma/client";
export interface ApiCharacter {
  id: number;
  name: string;
  slug: string;
  origem: string;
  media: string | null;
  mediaType: MediaType | null;
  sourceType: SourceType;
  createdAt: string | Date;
  updatedAt: string | Date;
  popularity: number;
  [key: string]: any; // Para relações dinâmicas (WaifuEvent, etc)
}

export interface Character extends ApiCharacter {
  type: "waifu" | "husbando";
}

export type Genero ="waifu" | "husbando"
export interface User {
  id: number;
  telegramId: string;
  profileType: ProfileType;
  language: Language;
  coins: number;
  [key: string]: any;
}
 export type Characterdb = CharacterHusbando | CharacterWaifu;



export type TypeMidia = MediaType;

export type Collection = WaifuCollection | HusbandoCollection;
export type EventType = WaifuEvent | HusbandoEvent;
export type RarityType = WaifuRarity | HusbandoRarity