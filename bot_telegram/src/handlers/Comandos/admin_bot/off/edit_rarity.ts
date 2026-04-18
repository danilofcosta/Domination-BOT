import { prisma } from "../../../../../lib/prisma.js";
import { type MyContext } from "../../../../utils/customTypes.js";

/**
 * Handler to edit a rarity.
 * Command: /editrarity <code, field, new_value>
 */
export async function EditRarityHandler(ctx: MyContext) {
  const input = ctx.match as string;

  if (!input || !input.includes(",")) {
    return ctx.reply(
      "❌ Formato inválido! Use: `/editrarity CODE, campo, valor` (campos: name, emoji, description, emoji_id)",
    );
  }

  const parts = input.split(",").map((p) => p.trim());
  const [code, field, value] = parts;

  if (!code || !field || !value) {
    return ctx.reply(
      "❌ Campos obrigatórios ausentes: CODE, campo e valor são necessários.",
    );
  }

  const allowedFields = ["name", "emoji", "description", "emoji_id"];
  if (!allowedFields.includes(field.toLowerCase())) {
    return ctx.reply(
      `❌ Campo inválido: ${field}. Use: ${allowedFields.join(", ")}`,
    );
  }

  try {
    const updated = await prisma.rarity.update({
      where: { code: code.toUpperCase() },
      data: { [field.toLowerCase()]: value },
    });

    return ctx.reply(
      `✅ Raridade **${updated.code}** atualizada: ${field} = \`${value}\``,
    );
  } catch (error) {
    console.error("[EditRarity] Error:", error);
    return ctx.reply(
      `❌ Erro ao atualizar raridade. Verifique se o código \`${code}\` existe.`,
    );
  }
}
