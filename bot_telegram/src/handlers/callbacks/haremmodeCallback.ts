import type { MyContext } from "../../utils/customTypes.js";
import { prisma } from "../../../lib/prisma.js";
import { ChatType } from "../../utils/customTypes.js";

export async function haremmodeCallback(ctx: MyContext) {
  if (!ctx.callbackQuery?.data) return;

  const modeMatch = ctx.callbackQuery.data.replace("haremmode_", ""); // latest, rarity, event
  const userId = ctx.from?.id;

  if (!userId) return;

  const user = await prisma.user.findUnique({ where: { telegramId: BigInt(userId) } });
  if (!user) {
    await ctx.answerCallbackQuery("Usuário não encontrado.");
    return;
  }

  const isHusbando = ctx.session.settings.genero === ChatType.HUSBANDO;
  let config = isHusbando ? (user.husbandoConfig as any) || {} : (user.waifuConfig as any) || {};
  
  if (typeof config !== "object") config = {}; // safety

  config.haremMode = modeMatch;

  await prisma.user.update({
    where: { telegramId: BigInt(userId) },
    data: isHusbando ? { husbandoConfig: config } : { waifuConfig: config },
  });

  const modeText = modeMatch === "latest" ? "Recentes" : modeMatch === "rarity" ? "Por Raridade" : "Por Evento";

  await ctx.editMessageText(`Seu modo de organização do harém foi alterado para: **${modeText}**`, {
    parse_mode: "Markdown",
  }).catch(() => {});
  
  await ctx.answerCallbackQuery("Modo atualizado com sucesso!");
}
