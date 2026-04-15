import { prisma } from "../../../../lib/prisma.js";
import { ChatType, type MyContext } from "../../../utils/customTypes.js";
import { mentionUser } from "../../../utils/manege_caption/metion_user.js";
import { info, warn, error, debug } from "../../../utils/log.js";

export async function Myinfos(ctx: MyContext) {
  info(`Myinfos - carregando informações`, { userId: ctx.from?.id });

  let loading;
  try {
    loading = await ctx.reply(ctx.t("loading"));
  } catch (e) {
    error(`Myinfos - erro ao enviar loading`, e);
    return;
  }

  const isWaifu = ctx.session.settings.genero === ChatType.WAIFU;

  const user = await prisma.user.findUnique({
    where: {
      telegramId: ctx.from!.id,
    },
    include: {
      WaifuCollection: isWaifu ? { select: { id: true } } : false,
      HusbandoCollection: !isWaifu ? { select: { id: true } } : false,
    },
  });

  if (!user) {
    warn(`Myinfos - usuário não registrado`, { userId: ctx.from?.id });
    try {
      await ctx.api.deleteMessage(loading.chat.id, loading.message_id);
    } catch {}
    return ctx.reply(ctx.t("error-not-registered"));
  }

  const totalDB = isWaifu
    ? await prisma.characterWaifu.count()
    : await prisma.characterHusbando.count();

  const totalUser = isWaifu
    ? user?.WaifuCollection?.length || 0
    : user?.HusbandoCollection?.length || 0;

  const ratio = totalDB > 0 ? totalUser / totalDB : 0;
  const percent = (ratio * 100).toFixed(2);

  const maxBlocks = 10;
  const filled = Math.round(ratio * maxBlocks);
  const bar = "▰".repeat(filled) + "▱".repeat(maxBlocks - filled);

  const text = [
    ctx.t("myinfo-title"),
    ctx.t("myinfo-user", {
      name: mentionUser(ctx.from!.first_name, ctx.from!.id),
    }),
    ctx.t("myinfo-id", { id: ctx.from!.id }),
    ctx.t("myinfo-total", {
      genero: ctx.session.settings.genero,
      total: totalUser,
    }),
    ctx.t("myinfo-harem", {
      userTotal: totalUser,
      dbTotal: totalDB,
      percent,
    }),
    ctx.t("myinfo-progress", { bar }),
    ctx.t("myinfo-end"),
  ].join("\n");

  try {
    await ctx.api.deleteMessage(loading.chat.id, loading.message_id);
  } catch (e) {
    debug(`Myinfos - erro ao deletar loading`, { error: e });
  }

  try {
    const msg = await ctx.reply(text, {
      parse_mode: "HTML",
    });

    debug(`Myinfos - informações enviadas`, { userId: ctx.from?.id, percent });

    if (percent === "100.00") {
      await ctx.api.setMessageReaction(msg.chat.id, msg.message_id, [
        { type: "emoji", emoji: "🎉" },
      ]).catch(() => {});
    }
  } catch (e) {
    error(`Myinfos - erro ao enviar reply`, e);
  }
}
