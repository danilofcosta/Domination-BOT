import { prisma } from "../../lib/prisma.js";
import { ChatType } from "../CustomTypes.js";
import type { Collection } from "../CustomTypes.js";
import type { Prisma } from "../../../generated/prisma/client.js";
import { info, error, debug } from "../log.js";
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
  const table = isWaifu ? "WaifuCollection" : "HusbandoCollection";
  const seq = `"${table}_id_seq"`;

  try {
    await tx.$executeRawUnsafe(
      `INSERT INTO "${table}" ("userId", "characterId", "count", "fromIdChat", "createdAt", "updatedAt")
       VALUES ($1, $2, 1, $3, NOW(), NOW())
       ON CONFLICT ("userId", "characterId")
       DO UPDATE SET "count" = "${table}"."count" + 1, "updatedAt" = NOW()`,
      Number(telegramId),
      characterId,
      fromIdChat,
    );
  } catch (e: unknown) {
    const isPkey = /_pkey/i.test(String((e as any)?.message ?? ""));
    if (isPkey) {
      await tx.$executeRawUnsafe(
        `SELECT setval($1, (SELECT COALESCE(MAX("id"), 0) + 1 FROM "${table}"), false)`,
        seq,
      );
      await tx.$executeRawUnsafe(
        `INSERT INTO "${table}" ("userId", "characterId", "count", "fromIdChat", "createdAt", "updatedAt")
         VALUES ($1, $2, 1, $3, NOW(), NOW())
         ON CONFLICT ("userId", "characterId")
         DO UPDATE SET "count" = "${table}"."count" + 1, "updatedAt" = NOW()`,
        Number(telegramId),
        characterId,
        fromIdChat,
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

export async function AddCharacterCollection({
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

  info("AddCharacterCollection", {
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

    debug("AddCharacterCollection OK", {
      telegramId: telegramId.toString(),
      characterId,
      count: result.count,
    });

    return result;
  } catch (e) {
    error("AddCharacterCollection ERROR", e);
    return null;
  }
}
