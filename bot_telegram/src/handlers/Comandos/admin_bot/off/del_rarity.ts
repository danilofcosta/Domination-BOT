import { prisma } from "../../../../../lib/prisma.js";
import { type MyContext } from "../../../../utils/customTypes.js";

/**
 * Handler to delete a rarity.
 * Command: /delrarity <code>
 */
export async function DeleteRarityHandler(ctx: MyContext) {
  const code = (ctx.match as string)?.trim();

  if (!code) {
    return ctx.reply(
      "❌ Formato inválido! Use: `/delrarity CODE` (Ex: /delrarity COMMON)",
    );
  }

  try {
    const deleted = await prisma.rarity.delete({
      where: { code: code.toUpperCase() },
    });

    return ctx.reply(
      `✅ Raridade **${deleted.name}** (${deleted.code}) removida com sucesso.`,
    );
  } catch (error) {
    console.error("[DeleteRarity] Error:", error);
    return ctx.reply(
      `❌ Erro ao deletar: Verifique se o código \`${code}\` existe ou se há personagens vinculados a este código.`,
    );
  }
}
