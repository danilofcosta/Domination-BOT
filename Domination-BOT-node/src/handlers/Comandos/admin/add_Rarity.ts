// model Rarity {
//   id          Int     @id @default(autoincrement())
//   code        String  @unique
//   name        String
//   emoji       String
//   description String?
//   emoji_id    String?

//   waifus      WaifuRarity[]
//   husbandos   HusbandoRarity[]
// }

import { prisma } from "../../../../lib/prisma.js";



const rarity = [
   {
      "id":1,
      "code":"COMMON",
      "name":"comum",
      "emoji":"🥉",
      "description":null
   },
   {
      "id":2,
      "code":"UNCOMMON",
      "name":"incomum",
      "emoji":"🥈",
      "description":null
   },
   {
      "id":3,
      "code":"RARE",
      "name":"raro",
      "emoji":"🥇",
      "description":null
   },
   {
      "id":4,
      "code":"LEGENDARY",
      "name":"lendario",
      "emoji":"🏆",
      "description":null
   },
   {
      "id":5,
      "code":"EXCLUSIVE",
      "name":"exclusivo",
      "emoji":"🎭",
      "description":null
   },
   {
      "id":6,
      "code":"LIMITED",
      "name":"limitado",
      "emoji":"💠",
      "description":null
   },
   {
      "id":7,
      "code":"SPECIAL",
      "name":"especial",
      "emoji":"🏵",
      "description":null
   },
   {
      "id":8,
      "code":"MULTIVERSE",
      "name":"multiverso",
      "emoji":"🧩",
      "description":null
   },
   {
      "id":9,
      "code":"SPECTRAL",
      "name":"Espectral",
      "emoji":"🌗",
      "description":null
   }
]
interface RarityInput {
  id?: number;
  code: string;
  name: string;
  emoji: string;
  description?: string | null;
  emoji_id?: string | null;
}


async function addManyRarities(list: RarityInput[]) {
  try {
    const formatted = list.map((rarity) => ({
      code: rarity.code,
      name: rarity.name,
      emoji: rarity.emoji,
      description: rarity.description ?? null,
      emoji_id: rarity.emoji_id != null ? rarity.emoji_id : null,
    }));

    const result =await prisma.rarity.createMany({
      data: formatted,
      skipDuplicates: true,
    });

    console.log(`success: rarities criadas`);
    return result;
  } catch (err) {
    console.error("error creating rarities:", err);
    return 0;
  }
}


export async function addRarity(data: any) {
  try {
    const rarity = await prisma.rarity.create({ data });
    console.log("success", rarity.code);
    return rarity;
  } catch (err) {
    console.error("error creating rarity:", err);
    return null;
  }
}

function mainModule() {
console.log(addManyRarities(rarity))

}

// mainModule()