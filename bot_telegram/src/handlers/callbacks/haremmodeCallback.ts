import type { MyContext } from "../../utils/customTypes.js";
import { prisma } from "../../../lib/prisma.js";
import { ChatType } from "../../utils/customTypes.js";
import { InlineKeyboard } from "grammy";

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

  const currentMode = config.haremMode || "latest";
  if (currentMode === modeMatch) {
    await ctx.answerCallbackQuery({
      text: "Não atualizou, talvez seu harém esteja vazio ou você escolheu o mesmo modo novamente.",
      show_alert: true
    });
    return;
  }

  config.haremMode = modeMatch;

  await prisma.user.update({
    where: { telegramId: BigInt(userId) },
    data: isHusbando ? { husbandoConfig: config } : { waifuConfig: config },
  });

  const modeText = modeMatch === "latest" ? "Recentes" : modeMatch === "rarity" ? "Por Raridade" : "Por Evento";

  await ctx.editMessageCaption({
    caption: `Modo selecionado: <b>${modeMatch}</b>`,
    parse_mode: "HTML",
    reply_markup: new InlineKeyboard() // Isso remove os botões
  }).catch(() => {});
  
  await ctx.answerCallbackQuery(`Modo atualizado com sucesso para: ${modeText}`);
}
