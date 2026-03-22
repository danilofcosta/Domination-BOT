import type { CharacterHusbando, CharacterWaifu, User, WaifuCollection, HusbandoCollection } from "../../generated/prisma/client.js";

export type Character = CharacterWaifu | CharacterHusbando;
export type Collection = WaifuCollection | HusbandoCollection;
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