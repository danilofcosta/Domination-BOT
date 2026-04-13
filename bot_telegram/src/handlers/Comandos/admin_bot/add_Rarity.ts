import { prisma } from "../../../../lib/prisma.js";
import { type MyContext } from "../../../utils/customTypes.js";

/**
 * Handler to add a new rarity.
 * Command: /addrarity <code, name, emoji, [description], [emoji_id]>
 */
export async function AddRarityHandler(ctx: MyContext) {
  const input = ctx.match as string;

  if (!input || !input.includes(",")) {
    return ctx.reply("❌ Formato inválido! Use: `/addrarity CODE, Nome, Emoji, [Descrição], [Emoji_ID]`");
  }

  const parts = input.split(",").map((p) => p.trim());
  const [code, name, emoji, description, emoji_id] = parts;

  if (!code || !name || !emoji) {
    return ctx.reply("❌ Campos obrigatórios ausentes: CODE, Nome e Emoji são necessários.");
  }

  try {
    const existing = await prisma.rarity.findUnique({ where: { code } });
    if (existing) {
      return ctx.reply(`⚠️ A raridade com código \`${code}\` já existe.`);
    }

    const newRarity = await prisma.rarity.create({
      data: {
        code: code.toUpperCase(),
        name,
        emoji,
        description: description || null,
        emoji_id: emoji_id || null,
      },
    });

    return ctx.reply(
      `✅ Raridade **${newRarity.name}** (${newRarity.code}) criada com sucesso!\nEmoji: ${newRarity.emoji}\nEmoji ID: ${newRarity.emoji_id || "N/A"}`
    );
  } catch (error) {
    console.error("[AddRarity] Error:", error);
    return ctx.reply("❌ Erro ao criar raridade. Verifique os logs.");
  }
}
