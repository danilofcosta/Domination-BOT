import { ProfileType } from "../../../../generated/prisma/client.js";
import { prisma } from "../../../../lib/prisma.js";
import type { MyContext } from "../../../utils/customTypes.js";

export async function banHandler(ctx: MyContext) {
  const args = ctx.match?.toString().split(" ");
  const userIdStr = args?.[1];

  if (!userIdStr) {
    await ctx.reply("Use: /banuser <user_id>");
    return;
  }

  const userId = parseInt(userIdStr);
  if (isNaN(userId)) {
    await ctx.reply("ID inválido");
    return;
  }

  try {
    await prisma.user.upsert({
      where: { telegramId: BigInt(userId) },
      update: { profileType: ProfileType.BANNED },
      create: {
        telegramId: BigInt(userId),
        profileType: ProfileType.BANNED,
        favoriteWaifuId: null,
        favoriteHusbandoId: null,
        waifuConfig: {},
        husbandoConfig: {},
      },
    });
    await ctx.reply(`✅ Usuário ${userId} banido!`);
  } catch (err) {
    console.error(err);
    await ctx.reply("❌ Erro ao banir");
  }
}

export async function unbanHandler(ctx: MyContext) {
  const args = ctx.match?.toString().split(" ");
  const userIdStr = args?.[1];

  if (!userIdStr) {
    await ctx.reply("Use: /unbanuser <user_id>");
    return;
  }

  const userId = parseInt(userIdStr);
  if (isNaN(userId)) {
    await ctx.reply("ID inválido");
    return;
  }

  try {
    await prisma.user.update({
      where: { telegramId: BigInt(userId) },
      data: { profileType: ProfileType.USER },
    });
    await ctx.reply(`✅ Usuário ${userId} desbanido!`);
  } catch (err) {
    console.error(err);
    await ctx.reply("❌ Erro ao desbanir");
  }
}

export async function listBannedHandler(ctx: MyContext) {
  try {
    const banned = await prisma.user.findMany({
      where: { profileType: ProfileType.BANNED },
      select: { telegramId: true, telegramData: true },
    });

    if (banned.length === 0) {
      await ctx.reply("Nenhum usuário banido.");
      return;
    }

    let text = "📋 Usuários banidos:\n\n";
    for (const user of banned) {
      const data = user.telegramData as any;
      const name = data?.first_name || data?.username || "Desconhecido";
      text += `• ${user.telegramId} - ${name}\n`;
    }

    await ctx.reply(text);
  } catch (err) {
    console.error(err);
    await ctx.reply("❌ Erro ao listar");
  }
}