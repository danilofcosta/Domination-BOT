import { prisma } from "../../lib/prisma.js";
import type { ChatType } from "../customTypes.js";
import { info, error, debug } from "../log.js";

interface AddCharacterCollectionForm {
  type: ChatType;
  userId: number | bigint | string;
  from?: any;
  characterId: number;
}

const PKEY_VIOLATION = /_pkey/i;

async function upsertCollectionAtomic(
  tx: any,
  isWaifu: boolean,
  telegramId: bigint,
  characterId: number,
) {
  const tableName = isWaifu ? "WaifuCollection" : "HusbandoCollection";
  const seqName = `"${tableName}_id_seq"`;

  try {
    await tx.$executeRawUnsafe(
      `INSERT INTO "${tableName}" ("userId", "characterId", "count", "createdAt", "updatedAt")
       VALUES ($1, $2, 1, NOW(), NOW())
       ON CONFLICT ("userId", "characterId")
       DO UPDATE SET "count" = "${tableName}"."count" + 1, "updatedAt" = NOW()`,
      Number(telegramId),
      characterId,
    );
  } catch (e: any) {
    const isPkeyViolation =
      e?.meta?.code === "23505" && PKEY_VIOLATION.test(String(e?.message ?? ""));

    if (isPkeyViolation) {
      await tx.$executeRawUnsafe(
        `SELECT setval($1, (SELECT COALESCE(MAX("id"), 0) + 1 FROM "${tableName}"), false)`,
        seqName,
      );
      await tx.$executeRawUnsafe(
        `INSERT INTO "${tableName}" ("userId", "characterId", "count", "createdAt", "updatedAt")
         VALUES ($1, $2, 1, NOW(), NOW())
         ON CONFLICT ("userId", "characterId")
         DO UPDATE SET "count" = "${tableName}"."count" + 1, "updatedAt" = NOW()`,
        Number(telegramId),
        characterId,
      );
    } else {
      throw e;
    }
  }

  return isWaifu
    ? await tx.waifuCollection.findUniqueOrThrow({
        where: { userId_characterId: { userId: telegramId, characterId } },
      })
    : await tx.husbandoCollection.findUniqueOrThrow({
        where: { userId_characterId: { userId: telegramId, characterId } },
      });
}

export async function AddCharacterCollection({
  type,
  userId,
  from,
  characterId,
}: AddCharacterCollectionForm) {
  if (type !== "waifu" && type !== "husbando") {
    throw new Error(`Invalid collection type: ${type}`);
  }

  const isWaifu = type === "waifu";

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
        update: {
          ...(from && { telegramData: from }),
        },
        create: {
          telegramId,
          telegramData: from ?? {},
          waifuConfig: {},
          husbandoConfig: {},
        },
      });

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

      return await upsertCollectionAtomic(tx, isWaifu, telegramId, characterId);
    });

    debug("AddCharacterCollection OK", {
      telegramId: telegramId.toString(),
      characterId,
      count: result.count,
    });

    return result as any;
  } catch (e) {
    error("AddCharacterCollection ERROR", e);

    return null;
  }
}