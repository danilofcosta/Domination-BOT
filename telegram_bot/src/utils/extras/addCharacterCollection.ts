import { prisma } from "../../lib/prisma.js";
import { ChatType, type Collection } from "../customTypes.js";
import { Prisma } from "../../../generated/prisma/client.js";
import { info, error, debug } from "../log.js";

const COLLECTION_TABLE_BY_GENERO = {
  [ChatType.WAIFU]: "WaifuCollection",
  [ChatType.HUSBANDO]: "HusbandoCollection",
} as const;
// Adiciona um personagem à coleção do usuário, garantindo que o usuário exista e lidando com possíveis conflitos de chave primária.
interface AddCharacterCollectionForm {
  type: ChatType;
  userId: number | bigint | string;
  from?: any;
  characterId: number;
  fromIdChat: number | bigint
  chat:any
}

async function upsertCollectionAtomic(
  tx: Prisma.TransactionClient,
  isWaifu: boolean,
  telegramId: bigint,
  characterId: number,
  fromIdChat: number | bigint,
 
) {
  const table = COLLECTION_TABLE_BY_GENERO[isWaifu ? ChatType.WAIFU : ChatType.HUSBANDO];
  const quotedTable = Prisma.raw(`"${table}"`);
  const seq = `${table}_id_seq`;

  try {
    await tx.$executeRaw(
      Prisma.sql`INSERT INTO ${quotedTable} ("userId", "characterId", "count", "fromIdChat", "createdAt", "updatedAt")
       VALUES (${Number(telegramId)}, ${characterId}, 1, ${fromIdChat}, NOW(), NOW())
       ON CONFLICT ("userId", "characterId")
       DO UPDATE SET "count" = ${quotedTable}."count" + 1, "updatedAt" = NOW()`,
    );
  } catch (e: unknown) {
    const isPkey = /_pkey/i.test(String((e as any)?.message ?? ""));
    if (isPkey) {
      await tx.$executeRaw(
        Prisma.sql`SELECT setval(${seq}, (SELECT COALESCE(MAX("id"), 0) + 1 FROM ${quotedTable}), false)`,
      );
      await tx.$executeRaw(
        Prisma.sql`INSERT INTO ${quotedTable} ("userId", "characterId", "count", "fromIdChat", "createdAt", "updatedAt")
         VALUES (${Number(telegramId)}, ${characterId}, 1, ${fromIdChat}, NOW(), NOW())
         ON CONFLICT ("userId", "characterId")
         DO UPDATE SET "count" = ${quotedTable}."count" + 1, "updatedAt" = NOW()`,
      );
    } else {
      throw e;
    }
  }

  return isWaifu
    ? tx.waifuCollection.findUniqueOrThrow({
        where: { userId_characterId: { userId: telegramId, characterId } },
      })
    : tx.husbandoCollection.findUniqueOrThrow({
        where: { userId_characterId: { userId: telegramId, characterId } },
      });
}

export async function addCharacterCollection({
  type,
  userId,
  from,
  characterId,
  fromIdChat,chat
}: AddCharacterCollectionForm): Promise<Collection | null> {
  if (type !== ChatType.WAIFU && type !== ChatType.HUSBANDO) {
    throw new Error(`Invalid collection type: ${type}`);
  }

  const isWaifu = type === ChatType.WAIFU;
  const telegramId = BigInt(userId);

  info("addCharacterCollection", {
    telegramId: telegramId.toString(),
    characterId,
    isWaifu,
  });

  try {
    const result = await prisma.$transaction(async (tx) => {
      await tx.telegramUser.upsert({
        where: { telegramId },
        update: from ? { telegramData: from } : {},
        create: {
          telegramId,

          telegramData: from ?? {},
          waifuConfig: {},
          husbandoConfig: {},
        },
      });

      if (
        chat &&
        (chat.type === "group" || chat.type === "supergroup") &&
        chat.title
      ) {
        await tx.telegramGroup.upsert({
          where: { groupId: BigInt(chat.id) },
          update: { groupName: chat.title },
          create: { groupId: BigInt(chat.id), groupName: chat.title },
        });
      }

      if (isWaifu) {
        await tx.telegramUser.updateMany({
          where: { telegramId, favoriteWaifuId: null },
          data: { favoriteWaifuId: characterId },
        });
      } else {
        await tx.telegramUser.updateMany({
          where: { telegramId, favoriteHusbandoId: null },
          data: { favoriteHusbandoId: characterId },
        });
      }

      return upsertCollectionAtomic(tx, isWaifu, telegramId, characterId, fromIdChat);
    });

    debug("addCharacterCollection OK", {
      telegramId: telegramId.toString(),
      characterId,
      count: result.count,
    });

    return result;
  } catch (e) {
    error("addCharacterCollection ERROR", e);
    return null;
  }
}
