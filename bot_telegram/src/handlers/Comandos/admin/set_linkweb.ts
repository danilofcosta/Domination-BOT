import { prisma } from "../../../../lib/prisma.js";
import type { MyContext } from "../../../utils/customTypes.js";
import { ChatType } from "../../../utils/types.js";

export async function setLinkWebHandler(ctx: MyContext) {
  const args = ctx.match ? String(ctx.match).split(" ") : [];
  
  if (args.length < 2) {
    return ctx.reply("Uso: /setlink [id] [url]");
  }

  const id = parseInt(args[0]!, 10);
  const url = args[1];

  if (!url) {
    return ctx.reply("URL inválida.");
  }

  if (isNaN(id)) {
    return ctx.reply("ID inválido. Deve ser um número.");
  }

  const isWaifu = ctx.session.settings.genero === ChatType.WAIFU;
  const expiresAt = new Date(Date.now() + 3600000); // 1 hora de validade

  try {
    if (isWaifu) {
      await prisma.characterWaifu.update({
        where: { id },
        data: { linkweb: url, linkwebExpiresAt: expiresAt },
      });
    } else {
      await prisma.characterHusbando.update({
        where: { id },
        data: { linkweb: url, linkwebExpiresAt: expiresAt },
      });
    }

    await ctx.reply(`Link web definido para o personagem ${id}!\nExpira em: ${expiresAt.toLocaleString("pt-BR")}`);
  } catch (error) {
    console.error(error);
    await ctx.reply("Erro ao atualizar o personagem. Verifique se o ID está correto.");
  }
}
