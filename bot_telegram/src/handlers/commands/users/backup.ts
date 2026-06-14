import { InlineKeyboard } from "grammy";
import { CreateOneBtn } from "../../../utils/btns.js";
import { BTN_TYPE, type MyContext } from "../../../utils/customTypes.js";
import { Sendmedia } from "../../../utils/sendmedia.js";
import { prisma } from "../../../lib/prisma.js";

export async function Backup_harem(ctx: MyContext) {
  const text = String(ctx.match).trim().toLocaleLowerCase();
  if (ctx.chat?.type !== "private") {
    return await Sendmedia({
      ctx,
      caption: ctx.t("backup-open-private-label"),
      reply_markup: CreateOneBtn({
        callback: `http://t.me/${ctx.me.username}?start=backup`,
        text: ctx.t("backup-open-private-btn"),
        typeBtn: BTN_TYPE.url,
      }),
    });
  }

  const user = await prisma.telegramUser.findUnique({
    where: { telegramId: BigInt(ctx.from!.id) },
    select: { backupHash: true },
  });

  const hasBackup = !!user?.backupHash;

  const keyboard = new InlineKeyboard();

  if (!hasBackup) {
    keyboard.text(ctx.t("backup-btn-create"), "backup:create");
  } else {
    keyboard
      .text(ctx.t("backup-btn-restore"), "backup:restore")
      .text(ctx.t("backup-btn-change"), "backup:change")
      .row()
      .text(ctx.t("backup-btn-remove"), "backup:remove");
  }

  keyboard
    .row()
    .text(ctx.t("backup-btn-info"), "backup:info")
    .row()
    .text("", "close");

  await ctx.reply(ctx.t("backup-title"), {
    reply_markup: keyboard,
  });
}
