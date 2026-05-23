import { InlineKeyboard } from "grammy";
import { prisma } from "../../../lib/prisma.js";
import type { MyContext } from "../../../utils/customTypes.js";
import { EditOrSendText } from "../../../utils/EditOrSendText.js";
import { calcHash } from "../../../utils/calcHash.js";
import { error } from "../../../utils/log.js";
import { Backup_harem } from "../../commands/users/backup.js";

export async function backupCallback(ctx: MyContext) {
  const data = ctx.callbackQuery?.data;
  if (!data) return;

  const action = data.replace("backup:", "");
  const userId = ctx.from?.id;

  if (!userId) {
    await ctx.answerCallbackQuery(ctx.t("error-not-registered"));
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { telegramId: userId },
    });

    switch (action) {
      case "info":
        return handleInfo(ctx);
      case "create":
        return handleCreate(ctx, user);
      case "change":
        return handleChange(ctx);
      case "restore":
        return handleRestore(ctx, user);
      case "remove":
        return handleRemove(ctx, user);
      case "remove-confirm":
        return handleRemoveConfirm(ctx, user);
      case "menu":
        return Backup_harem(ctx);
      case "cancel":
        return handleCancel(ctx);
      default:
  await ctx.answerCallbackQuery();
}

async function handleRemoveConfirm(
  ctx: MyContext,
  user: { backupHash: string | null } | null,
) {
  if (!user?.backupHash) {
    await EditOrSendText({
      ctx,
      caption: ctx.t("backup-no-backup"),
    });
    await ctx.answerCallbackQuery();
    return;
  }

  try {
    await prisma.user.update({
      where: { telegramId: BigInt(ctx.from!.id) },
      data: { backupHash: null },
    });

    await EditOrSendText({
      ctx,
      caption: ctx.t("backup-remove-success"),
    });
  } catch (e) {
    error("backup remove error", e);
    await EditOrSendText({
      ctx,
      caption: ctx.t("error-permission-internal"),
    });
  }

  await ctx.answerCallbackQuery();
}

async function handleCancel(ctx: MyContext) {
  ctx.session.backupState = undefined;

  await EditOrSendText({
    ctx,
    caption: ctx.t("backup-cancelled"),
  });

  await ctx.answerCallbackQuery();
}
  } catch (e) {
    error("backupCallback error", e);
    await ctx.answerCallbackQuery(ctx.t("error-permission-internal"));
  }
}

async function handleInfo(ctx: MyContext) {
  const keyboard = new InlineKeyboard()
    .text("◀ " + ctx.t("help-btn-back"), "backup:menu")
    .text(ctx.t("btn-close"), "close");

  await EditOrSendText({
    ctx,
    caption: ctx.t("backup-info-text"),
    reply_markup: keyboard,
  });

  await ctx.answerCallbackQuery();
}

async function handleCreate(
  ctx: MyContext,
  user: { backupHash: string | null } | null,
) {
  if (user?.backupHash) {
    await EditOrSendText({
      ctx,
      caption: ctx.t("backup-create-error"),
    });
    await ctx.answerCallbackQuery();
    return;
  }

  ctx.session.backupState = { action: "create" };

  const keyboard = new InlineKeyboard().text(ctx.t("btn-no"), "close");

  await EditOrSendText({
    ctx,
    caption: ctx.t("backup-password-prompt"),
    reply_markup: keyboard,
  });

  await ctx.answerCallbackQuery();
}

async function handleChange(ctx: MyContext) {
  ctx.session.backupState = { action: "change" };

  const keyboard = new InlineKeyboard().text(ctx.t("btn-no"), "close");

  await EditOrSendText({
    ctx,
    caption: ctx.t("backup-password-prompt"),
    reply_markup: keyboard,
  });

  await ctx.answerCallbackQuery();
}

async function handleRestore(
  ctx: MyContext,
  user: { backupHash: string | null } | null,
) {
  if (!user?.backupHash) {
    await EditOrSendText({
      ctx,
      caption: ctx.t("backup-no-backup"),
    });
    await ctx.answerCallbackQuery();
    return;
  }

  ctx.session.backupState = { action: "restore" };

  const keyboard = new InlineKeyboard().text(ctx.t("btn-no"), "close");

  await EditOrSendText({
    ctx,
    caption: ctx.t("backup-restore-prompt"),
    reply_markup: keyboard,
  });

  await ctx.answerCallbackQuery();
}

async function handleRemove(
  ctx: MyContext,
  user: { backupHash: string | null } | null,
) {
  if (!user?.backupHash) {
    await EditOrSendText({
      ctx,
      caption: ctx.t("backup-no-backup"),
    });
    await ctx.answerCallbackQuery();
    return;
  }

  const keyboard = new InlineKeyboard()
    .text(ctx.t("btn-yes"), "backup:remove-confirm")
    .row()
    .text(ctx.t("btn-no"), "backup:cancel");

  await EditOrSendText({
    ctx,
    caption: ctx.t("backup-remove-confirm"),
    reply_markup: keyboard,
  });

  await ctx.answerCallbackQuery();
}
