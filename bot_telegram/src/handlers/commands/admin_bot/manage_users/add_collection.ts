import { InlineKeyboard } from "grammy";
import {
  setAddToCollectionMulti,
  setCharList,
} from "../../../../cache/cache.js";
import type { MyContext } from "../../../../utils/customTypes.js";
import { ChatType } from "../../../../utils/customTypes.js";
import { info, warn, debug } from "../../../../utils/log.js";
import { prisma } from "../../../../lib/prisma.js";
import { mentionUser } from "../../../../utils/mention_user.js";

export async function addCollection(ctx: MyContext) {
  const genero: ChatType = ctx.botType;
  let userId: number = 0;
  let from: any = undefined;

  if (ctx?.message?.reply_to_message) {
    const User = ctx.message.reply_to_message.from;
    userId = User?.id || 0;
    from = User;
  }

  if (!userId) {
    warn(`addCollection - userId não fornecido`, { userId: ctx.from?.id });
    await ctx.reply(ctx.t("addCollection-error-reply"));
    return;
  }

  if (!ctx.match) {
    warn(`addCollection - id do personagem não fornecido`, {
      userId: ctx.from?.id,
    });
    await ctx.reply(ctx.t("addCollection-error-need-id"));
    return;
  }

  const idsString = String(ctx.match);
  const ids = idsString
    .split(/[,;\s]+/)
    .map((s) => Number(s.trim()))
    .filter((n) => !isNaN(n) && n > 0);

  if (ids.length === 0) {
    warn(`addCollection - ids inválidos`, { userId: ctx.from?.id });
    await ctx.reply(ctx.t("addCollection-error-invalid-ids"));
    return;
  }

  const registros =
    genero === ChatType.HUSBANDO
      ? await prisma.characterHusbando.findMany({
          where: { id: { in: ids } },
          select: { id: true, name: true },
        })
      : await prisma.characterWaifu.findMany({
          where: { id: { in: ids } },
          select: { id: true, name: true },
        });

  const idsEncontrados = registros.map((r) => r.id);
  const idsNaoEncontrados = ids.filter((id) => !idsEncontrados.includes(id));

  const validCharacters = registros.map((r) => ({ id: r.id, name: r.name }));
  const invalidIds = idsNaoEncontrados;

  if (validCharacters.length === 0) {
    warn(`addCollection - nenhum personagem encontrado`, { ids, userId });
    await ctx.reply(ctx.t("addCollection-error-no-char"));
    return;
  }

  const addedCount = validCharacters.length;

  setAddToCollectionMulti(userId, {
    userId,
    characterIds: validCharacters.map((c) => c.id),
    genero,
    from,
  });

  setCharList(userId, genero, {
    userId,
    characterIds: validCharacters.map((c) => c.id),
    genero,
  });

  info(`addCollection - dados salvos no cache`, {
    userId,
    count: addedCount,
    ids: validCharacters.map((c) => c.id),
  });

  const charsList = validCharacters.map((c) => `• ${c.name}`).join("\n");
  const invalidText =
    invalidIds.length > 0
      ? `\n❌ Não encontrados: ${invalidIds.join(", ")}`
      : "";

  const keyboard = new InlineKeyboard()
    .text(
      ctx.t("addCollection-btn-yes"),
      `addCollection_${userId}_s_multi_${ids.join(",")}`,
    )
    .text(ctx.t("addCollection-btn-no"), `addCollection_${userId}_n_multi`)
    .row()
    .switchInlineCurrent(
      ctx.t("addCollection-btn-view-collection"),
      `list_char_user_${userId}_${genero}`,
    );

  await ctx.reply(
    ctx.t("addCollection-confirm", {
      count: addedCount,
      list: charsList,
      invalid: invalidText,
      user: mentionUser(
        from?.first_name || ctx.t("addCollection-default-user"),
        from?.id || 0,
      ),
    }),
    {
      parse_mode: "HTML",
      reply_markup: keyboard,
    },
  );
}
