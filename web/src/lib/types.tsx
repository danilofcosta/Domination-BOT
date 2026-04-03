import { CharacterHusbando, CharacterWaifu } from "../../generated/prisma/client";

export type ApiCharacter = {
  id: string;
  name?: string | null;
  origem: string | null;
  displayUrl: string | null;
  slug: string;
};

export  type Character = ApiCharacter & {
  type: Genero
};

export type Genero ="waifu" | "husbando";

export type Characterdb = CharacterHusbando|CharacterWaifu