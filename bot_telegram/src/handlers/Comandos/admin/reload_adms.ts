
import { ProfileType } from "../../../../generated/prisma/client.js";
import { prisma } from "../../../../lib/prisma.js";
import type { MyContext } from "../../../utils/customTypes.js";
import { roleWeights } from "../../../utils/permissions.js";



export async function reloadAdmsHandler(ctx: MyContext) {
  const groupId = process.env.GROUP_ADM;
  if (!groupId) {
    await ctx.reply("❌ Grupo ADM não configurado");
    return;
  }

  let totalUpdated = 0;
  let totalErrors = 0;

  await ctx.reply("🔄 Atualizando ADMs do grupo...");

  const admins = await ctx.api.getChatAdministrators(groupId);

  if (!admins || admins.length === 0) {
    await ctx.reply("Nenhum admin encontrado neste grupo.");
    return;
  }

  for (const admin of admins) {
    if (!admin.user?.id) continue;
    if (admin.user.is_bot) continue;

      const userId = admin.user.id;

      try {
        const existingUser = await prisma.user.findUnique({
          where: { telegramId: BigInt(userId) },
          select: { profileType: true },
        });

        if (!existingUser) {
          const existingWebLogin = await prisma.user.findFirst({
            where: { webLogin: "admin" },
            select: { telegramId: true },
          });

          const createData: any = {
            telegramId: BigInt(userId),
            telegramData: admin.user as Record<string, any>,
            profileType: ProfileType.ADMIN,
            favoriteWaifuId: null,
            favoriteHusbandoId: null,
            waifuConfig: {},
            husbandoConfig: {},
          };

          if (!existingWebLogin) {
            createData.webLogin = "admin";
            createData.webPassword = String(userId);
          }

          await prisma.user.create({ data: createData });
          totalUpdated++;
        }
    } catch (err) {
      console.error(`Erro ao atualizar user ${userId}:`, err);
      totalErrors++;
    }
  }

  await ctx.reply(
    `✅ Atualização concluída!\n\n📊 Total atualizados: ${totalUpdated}\n❌ Erros: ${totalErrors}`
  );
}