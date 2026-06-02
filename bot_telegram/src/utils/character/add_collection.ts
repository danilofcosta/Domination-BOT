import { prisma } from "../../lib/prisma.js";
import type { ChatType } from "../customTypes.js";
import { info, error, debug } from "../log.js";

interface AddCharacterCollectionForm {
  type: ChatType;
  userId: number | bigint | string;
  from?: any;
  characterId: number;
}

export async function AddCharacterCollection({
  type,
  userId,
  from,
  characterId,
}: AddCharacterCollectionForm) {
  const isWaifu = type === "waifu";

  const telegramId = BigInt(userId);

  info("AddCharacterCollection", {
    telegramId: telegramId.toString(),
    characterId,
    isWaifu,
  });

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Garantir que o user existe (sem lógica de favorito)
      await tx.user.upsert({
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

      // 2. Atribuir favorito atômico (só se ainda for null)
      if (isWaifu) {
        await tx.user.updateMany({
          where: { telegramId, favoriteWaifuId: null },
          data: { favoriteWaifuId: characterId },
        });
      } else {
        await tx.user.updateMany({
          where: { telegramId, favoriteHusbandoId: null },
          data: { favoriteHusbandoId: characterId },
        });
      }

      // 3. Inserir/incrementar coleção sem queimar sequence
      const table = isWaifu ? '"WaifuCollection"' : '"HusbandoCollection"';
      const [collection] = await tx.$queryRawUnsafe<Array<{ id: number; count: number }>>(
        `
        WITH updated AS (
          UPDATE ${table}
          SET "count" = "count" + 1, "updatedAt" = NOW()
          WHERE "userId" = $1::bigint AND "characterId" = $2
          RETURNING id, count
        ),
        inserted AS (
          INSERT INTO ${table} ("userId", "characterId", "count", "createdAt", "updatedAt")
          SELECT $1::bigint, $2, 1, NOW(), NOW()
          WHERE NOT EXISTS (SELECT 1 FROM updated)
          RETURNING id, count
        )
        SELECT id, count FROM updated
        UNION ALL
        SELECT id, count FROM inserted
        `,
        telegramId.toString(),
        characterId,
      );

      return collection ?? null;
    });

    if (!result) {
      debug("AddCharacterCollection retornou null", {
        telegramId: telegramId.toString(),
        characterId,
      });
      return null;
    }

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