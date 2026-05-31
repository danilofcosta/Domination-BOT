import { InputFile } from "grammy";
import { getBotPic, setBotPic } from "../../../../cache/cache.js";
import type { MyContext } from "../../../../utils/customTypes.js";
import { Sendmedia } from "../../../../utils/sendmedia.js";
import { bts_yes_or_no } from "../../../../utils/btns.js";
import { error } from "../../../../utils/log.js";

export async function SetBotPicHandler(ctx: MyContext) {
  const reply = ctx.message?.reply_to_message;

  if (!reply?.photo?.length && !reply?.video && !reply?.animation) {
    return ctx.reply(ctx.t("set-bot-pic-not-reply"));
  }

  let fileId: string;
  let mediaType: 'photo' | 'video';
  let tipo: string;

  if (reply.video || reply.animation) {
    const media = reply.video || reply.animation!;
    if (media.duration > 10) {
      return ctx.reply(ctx.t("set-bot-pic-video-too-long", { tipo: reply.video ? ctx.t("tipo-video") : ctx.t("tipo-gif") }));
    }
    if (reply.video) {
      const ratio = reply.video.width / reply.video.height;
      if (ratio < 0.9 || ratio > 1.1) {
        return ctx.reply(ctx.t("set-bot-pic-video-not-square"));
      }
    }
    fileId = media.file_id;
    mediaType = 'video';
    tipo = ctx.t("tipo-video-animado");
  } else {
    fileId = reply.photo!.at(-1)!.file_id;
    mediaType = 'photo';
    tipo = ctx.t("tipo-foto");
  }

  const adminId = ctx.from!.id;

  setBotPic(adminId, { fileId, userId: adminId, mediaType });

  const reply_markup = bts_yes_or_no(
    ctx,
    `setbotpic_yes_${adminId}`,
    `setbotpic_no_${adminId}`,
  );

  await Sendmedia({
    ctx,
    caption: ctx.t("set-bot-pic-confirm", { tipo }),
    reply_markup,
  });
}

export async function SetBotPicCallback(ctx: MyContext) {
  const data = ctx.callbackQuery?.data;
  if (!data) return;

  const parts = data.split("_");
  const action = parts[1];
  const adminId = Number(parts[2]);

  if (ctx.from?.id !== adminId) {
    return ctx.answerCallbackQuery(ctx.t("error-action-not-authorized-by-id"));
  }

  if (action === "no") {
    await ctx.deleteMessage().catch(() => {});
    return ctx.answerCallbackQuery();
  }

  if (action === "yes") {
    const cached = getBotPic(adminId);
    if (!cached) {
      return ctx.answerCallbackQuery(ctx.t("error-character-not-found"));
    }

    try {
      const file = await ctx.api.getFile(cached.fileId);
      const filePath = file.file_path;
      if (!filePath) throw new Error("file_path not available");

      const token = ctx.api.token;
      const url = `https://api.telegram.org/file/bot${token}/${filePath}`;
      const res = await fetch(url);
      const buffer = Buffer.from(await res.arrayBuffer());

      if (cached.mediaType === 'video') {
        await ctx.api.setMyProfilePhoto({
          type: "animated",
          animation: new InputFile(buffer, "video.mp4"),
        });
      } else {
        await ctx.api.setMyProfilePhoto({
          type: "static",
          photo: new InputFile(buffer, "photo.jpg"),
        });
      }

      await ctx.editMessageText(ctx.t("set-bot-pic-success"));
      await ctx.answerCallbackQuery();
    } catch (e: any) {
      error("SetBotPicCallback", e);
      let msg: string;
      if (e.message?.includes("PHOTO_CROP_SIZE_SMALL")) {
        msg = ctx.t("set-bot-pic-too-small");
      } else if (e.message?.includes("VIDEO_FILE_INVALID")) {
        msg = ctx.t("set-bot-pic-video-invalid");
      } else {
        msg = ctx.t("set-bot-pic-error", { error: e.message });
      }
      await ctx.editMessageText(msg);
      await ctx.answerCallbackQuery();
    }
  }
}
