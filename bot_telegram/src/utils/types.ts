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

// export type SessionData = {
//   settings: {
//     genero: ChatType;
//   },
//   grupo: {
//     cont: number;
//     dropId: string | null;
//     data: string | null;
//     character: Character | null;
//   },
// };
