
import { InlineKeyboard } from "grammy";
import { ProfileType } from "../../../../generated/prisma/enums.js";
import { getAddToCollectionMulti, getHarem } from "../../../cache/cache.js";
import { AddCharacterCollection } from "../../../utils/chareter/add_character_colletion.js";
import { type MyContext, ChatType } from "../../../utils/customTypes.js";
import { mentionUser } from "../../../utils/manege_caption/metion_user.js";
import { getUserRole, roleWeights } from "../../../utils/permissions.js";
import { debug, error, info, warn } from "../../../utils/log.js";


export async function addcolletionCallback(ctx: MyContext) {
  if (!ctx.callbackQuery?.data) return;

  const parts = ctx.callbackQuery.data.split("_");
  const userIdStr = parts[1];
  const action = parts[2];
  const mode = parts[3];
  const charIdsStr = parts[4];

  const userId = Number(userIdStr);
  const adminId = ctx.from?.id;

  const isMulti = mode === "multi";

  if (action === "s" || action === "n") {
    debug(`addcolletionCallback - ação recebida`, { userId, action, isMulti, adminId });

    const userRole = await getUserRole(adminId || 0);
    const userWeight = roleWeights[userRole] ?? 0;

    if (userWeight < roleWeights[ProfileType.ADMIN]) {
      await ctx.deleteMessage().catch(() => {});
      await ctx.answerCallbackQuery("❌ Apenas admins podem confirmar.");
      return;
    }

    if (action === "s") {
      let characterIds: number[] = [];

      if (isMulti) {
        const cachedData = getAddToCollectionMulti(userId);
        if (!cachedData) {
          warn(`addcolletionCallback - dados multi não encontrados no cache`, { userId });
          await ctx.answerCallbackQuery("❌Dados expirados. Execute o comando novamente.");
          return;
        }
        characterIds = cachedData.characterIds;
      } else if (charIdsStr) {
        characterIds = [Number(charIdsStr)];
      }

      let addedCount = 0;
      let failedCount = 0;

      for (const charId of characterIds) {
        const result = await AddCharacterCollection({
          type: (isMulti ? getAddToCollectionMulti(userId)?.genero : ctx.session.settings.genero) as ChatType || ChatType.WAIFU,
          userId,
          from: isMulti ? getAddToCollectionMulti(userId)?.from : ctx.from,
          Charater_id: charId,
        });

        if (result) {
          addedCount++;
        } else {
          failedCount++;
        }
      }

      info(`addcolletionCallback - personagens adicionados por admin`, {
        adminId,
        userId,
        addedCount,
        failedCount,
      });
    }

    const keyboard = new InlineKeyboard().switchInlineCurrent(
      "Ver coleção",
      `harem_user_${userId}`,
    );

    const msgText = action === "s"
      ? `✅ ${isMulti ? "Personagens" : "Personagem"} adicionado(s) à coleção!\n\nPor: ${mentionUser(ctx.from?.first_name || "admin", ctx.from?.id || 0)}`
      : "❌ Ação cancelada.";

    try {
      await ctx.editMessageText(msgText, {
        reply_markup: keyboard,
        parse_mode: "HTML",
      });
    } catch (e) {
      if ((e as any).description?.includes("message is not modified")) {
        await ctx.answerCallbackQuery();
        return;
      }
      try {
        await ctx.deleteMessage();
      } catch {
        error('errro ao apagar mensagem ')
      }
    }

    await ctx.answerCallbackQuery();
    return;
  }

  if (isMulti) {
    const harem = await getHarem(userId);
    if (!harem) {
      warn(`addcolletionCallback - harém não encontrado no cache`, { userId });
      await ctx.answerCallbackQuery("Coleção não encontrada no cache.");
      return;
    }

    const keyboard = new InlineKeyboard()
      .text("✅ Sim", `addcolletion_${userId}_s_multi_${charIdsStr}`)
      .text("❌ Não", `addcolletion_${userId}_n_multi`)
      .row()
      .switchInlineCurrent(
        "Ver harém",
        `harem_user_${userId}`,
      );

    try {
      await ctx.editMessageReplyMarkup({
        reply_markup: keyboard,
      });
    } catch (e) {
      error(`addcolletionCallback - erro ao editar markup`, e);
    }

    await ctx.answerCallbackQuery();
  }
}