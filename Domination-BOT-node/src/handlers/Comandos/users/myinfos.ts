import { prisma } from "../../../../lib/prisma.js";
import type { MyContext } from "../../../utils/customTypes.js";
import { ChatType } from "../../../utils/types.js";
export async function Myinfos(ctx: MyContext) {
  console.log("myinfos");
  const loading = await ctx.reply(ctx.t("loading"));

  const user = await prisma.user.findUnique({
    where: {
      telegramId: ctx.from!.id,
    },
    include: {
      waifuCollection: true,
      husbandoCollection: true,
    },
  });

  if (!user) {
    try {
      await ctx.api.deleteMessage(loading.chat.id, loading.message_id);
    } catch {}
    return ctx.reply(ctx.t("error-not-registered"));
  }

  const isWaifu = ctx.session.settings.genero === ChatType.WAIFU;

  const totalDB = isWaifu
    ? await prisma.characterWaifu.count()
    : await prisma.characterHusbando.count();

  const totalUser = isWaifu
    ? user.waifuCollection?.length || 0
    : user.husbandoCollection?.length || 0;

  const ratio = totalDB > 0 ? totalUser / totalDB : 0;
  const percent = (ratio * 100).toFixed(2);

  const maxBlocks = 10;
  const filled = Math.round(ratio * maxBlocks);
  const bar = "▰".repeat(filled) + "▱".repeat(maxBlocks - filled);

  const text = [
    ctx.t("myinfo-title"),
    ctx.t("myinfo-user", { name: ctx.from!.first_name }),
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
  } catch {}

  return ctx.reply(text);
}