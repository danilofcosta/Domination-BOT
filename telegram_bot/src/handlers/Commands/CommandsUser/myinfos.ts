import { MediaType } from "../../../../generated/prisma/client.js";
import { prisma } from "../../../lib/prisma.js";
import { CreateOneBtn } from "../../../utils/buildButtons/createOneButton.js";
import { ChatType, type MyContext } from "../../../utils/customTypes.js";
import { error, info } from "../../../utils/log.js";
import { sendMessageCustom } from "../../../utils/sendMessageCustom.js";
import { createMentionUser } from "../../../utils/telegram/createMentionUser.js";

function buildProgressBar(ratio: number, maxBlocks = 10) {
  const filled = Math.round(Math.min(ratio, 1) * maxBlocks);
  return "▰".repeat(filled) + "▱".repeat(maxBlocks - filled);
}

export async function Myinfos(ctx: MyContext) {
  const isWaifu = ctx.botType === ChatType.WAIFU;

  const user = await prisma.telegramUser.findUnique({
    where: { telegramId: ctx.from!.id },
    include: {
      WaifuCollection: isWaifu ? { select: { id: true } } : false,
      HusbandoCollection: !isWaifu ? { select: { id: true } } : false,
    },
  });

  if (!user) {
    return sendMessageCustom({
      ctx,
      caption: ctx.t("error-not-registered"),
    });
  }

  const totalDB = isWaifu
    ? await prisma.characterWaifu.count()
    : await prisma.characterHusbando.count();

  const totalUser = isWaifu
    ? (user.WaifuCollection?.length ?? 0)
    : (user.HusbandoCollection?.length ?? 0);

  const ratio = totalDB > 0 ? totalUser / totalDB : 0;
  const percent = (ratio * 100).toFixed(2);

  const text = [
    ctx.t("myinfo-title"),
    ctx.t("myinfo-user", {
      name: createMentionUser({
        Nome: ctx.from!.first_name,
        telegramiduser: ctx.from!.id,
      }),
    }),
    ctx.t("myinfo-id", { id: String(ctx.from!.id) }),
    ctx.t("myinfo-total", { genero: ctx.botType, total: String(totalUser) }),
    ctx.t("myinfo-harem", {
      userTotal: String(totalUser),
      dbTotal: String(totalDB),
      percent,
    }),
    ctx.t("myinfo-progress", { bar: buildProgressBar(ratio) }),
    ctx.t("myinfo-end"),
  ].join("\n");

  const photos = await ctx.api
    .getUserProfilePhotos(ctx.from!.id, { limit: 1 })
    .catch(() => null);

  const bestPhoto = photos?.photos?.[0]?.at(-1)?.file_id;

  const msg = await sendMessageCustom({
    ctx,
    reply_markup:CreateOneBtn({text:ctx.t("harem_btn_close"),callback:`harem_user_${ctx.from!.id}_close`}),
    caption: text,
    ...(bestPhoto && {
      character: { media: bestPhoto, mediaType: MediaType.IMAGE_FILEID },
    }),

  });

  if (percent === "100.00") {
    ctx.api
      .setMessageReaction(msg.chat.id, msg.message_id, [
        { type: "emoji", emoji: "🎉" },
      ])
      .catch((e: unknown) => {
        if (
          e &&
          typeof e === "object" &&
          "description" in e &&
          (e as { description?: string }).description?.includes(
            "message to react not found",
          )
        )
          return;
        console.error("Erro inesperado:", e);
      });
  }

  setTimeout(() => {
    ctx.api.deleteMessage(msg.chat.id, msg.message_id).catch(() => {});
  }, 30000);
}
