import { InlineKeyboard } from "grammy";
import type { MyContext } from "../../../uteis/CustomTypes.js";
import { category } from "../../../CommandsRegistry/botConfigCommands.js";
import { userCommandsRegistryDict } from "../../../CommandsRegistry/CommandsRegistryUser.js";
import { EditOrSendText } from "../../../uteis/uteis_telegram/EditOrSendText.js";
import { StartHandler } from "../../Commands/CommandsGlobais/start.js";
import { error } from "../../../uteis/log.js";

const categoryNames: Record<category, string> = {
  [category.main]: "Principais",
  [category.Collection]: "Coleção",
  [category.Economy_Trade]: "Economia e Troca",
  [category.Info_Personalization]: "Info e Personalização",
};

function buildGuideText(cat: category): string {
  const commands = Object.values(userCommandsRegistryDict).filter(
    (c) => c.category === cat,
  );

  const lines = commands
    .map((c) => `/${c.command} - ${c.description.pt}`)
    .join("\n");

  const header =
    cat === category.main
      ? "<b>📖 Bem-vindo ao guia</b>\n\n<b>Principais comandos do usuário:</b>"
      : `<b>📖 Guia</b>\n\n<b>Comandos de ${categoryNames[cat]}:</b>`;

  return `${header}\n\n-----------------------------------------\n${lines}\n-----------------------------------------\n\nEscolha uma categoria abaixo:`;
}

function buildGuideKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text("⚙️ Principais", "guia_cat_main")
    .text("📚 Coleção", "guia_cat_Collection")
    .text("💰 Economia e Troca", "guia_cat_Economy_Trade")
    .row()
    .text("👤 Info e Personalização", "guia_cat_Info_Personalization")
    .row()
    .text("⬅️ Voltar ao menu", "guia_back_start");
}

export async function guiaHandler(ctx: MyContext) {
  try {
    await EditOrSendText({
      ctx,
      caption: buildGuideText(category.main),
      reply_markup: buildGuideKeyboard(),
    });
  } catch (e) {
    error("guia - erro ao renderizar guia", e);
  }
}

export async function guiaCategoryCallback(ctx: MyContext) {
  try {
    const data = ctx.callbackQuery?.data;
    if (!data) return;

    const match = data.match(/^guia_cat_(\w+)$/);
    if (!match) return;

    const name = match[1]!;
    const cat = (category as unknown as Record<string, category | undefined>)[
      name
    ];
    if (cat === undefined) return;

    await EditOrSendText({
      ctx,
      caption: buildGuideText(cat),
      reply_markup: buildGuideKeyboard(),
    });
  } catch (e) {
    error("guia - erro ao trocar de categoria", e);
  }
}

export async function guiaBackStart(ctx: MyContext) {
  try {
    await ctx.answerCallbackQuery();
    await StartHandler(ctx);
  } catch (e) {
    error("guia - erro ao voltar ao menu", e);
  }
}
