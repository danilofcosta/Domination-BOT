/*
import { MediaType } from "../../../../generated/prisma/client.js";
import { prisma } from "../../../lib/prisma.js";
import { CreateOneBtn } from "../../../utils/buildButtons/createOneButton.js";
import { ChatType, type MyContext } from "../../../utils/customTypes.js";
import { error, info } from "../../../utils/log.js";
import { sendMessageCustom } from "../../../utils/sendMessageCustom.js";
import { createMentionUser } from "../../../utils/telegram/createMentionUser.js";

export function buildProgressBar(ratio: number, maxBlocks = 10) {
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
  ].join("<br>");

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
*/

import { ChatType, type MyContext } from "../../../utils/customTypes.js";
import { prisma } from "../../../lib/prisma.js";
import { createMentionUser } from "../../../utils/telegram/createMentionUser.js";
import type { InputRichMessage } from "grammy/types";

export function buildProgressBar(ratio: number, maxBlocks = 10) {
  const filled = Math.round(Math.min(ratio, 1) * maxBlocks);
  return "▰".repeat(filled) + "▱".repeat(maxBlocks - filled);
}

const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
};

export async function Myinfos(ctx: MyContext) {
  const telegramUser = ctx.from!;
  const isWaifu = ctx.botType === ChatType.WAIFU;

  const user = await prisma.telegramUser.findUnique({
    where: { telegramId: telegramUser.id },
    include: {
      WaifuCollection: isWaifu ? { select: { id: true } } : false,
      HusbandoCollection: !isWaifu ? { select: { id: true } } : false,
    },
  });

  if (!user) {
    await ctx.reply(ctx.t("error-not-registered"));
    return;
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
        Nome: telegramUser.first_name,
        telegramiduser: telegramUser.id,
      }),
    }),
    ctx.t("myinfo-id", { id: String(telegramUser.id) }),
    ctx.t("myinfo-total", { genero: ctx.botType, total: String(totalUser) }),
    ctx.t("myinfo-harem", {
      userTotal: String(totalUser),
      dbTotal: String(totalDB),
      percent,
    }),
    ctx.t("myinfo-progress", { bar: buildProgressBar(ratio) }),
    ctx.t("myinfo-end"),
  ].join("<br>");

  const [photos, profileAudios] = await Promise.all([
    ctx.api.getUserProfilePhotos(telegramUser.id, { limit: 1 }).catch(() => null),
    ctx.api.getUserProfileAudios(telegramUser.id, { limit: 1 }).catch(() => null),
  ]);

  const profilePhotoFileId = photos?.photos?.[0]?.at(-1)?.file_id;
  const lastMusic = profileAudios?.audios?.[0];

  const fullName = [
    telegramUser.first_name,
    telegramUser.last_name,
  ]
    .filter(Boolean)
    .join(" ");

  const rich_message: InputRichMessage = {
    html: `
      ${
        profilePhotoFileId
          ? `<img src="tg://photo?id=profile">`
          : ""
      }
  ${lastMusic?.file_id ? `<audio src="tg://audio?id=last_music">` : ""}
      <hr>

      <h2>👤 ${fullName}</h2>

      <p>
        ${text}
      </p>

    
    `,

    media: [
      ...(profilePhotoFileId
        ? [
            {
              id: "profile",
              media: {
                type: "photo" as const,
                media: profilePhotoFileId,
              },
            },
          ]
        : []),

      ...(lastMusic?.file_id
        ? [
            {
              id: "last_music",
              media: {
                type: "audio" as const,
                media: lastMusic.file_id,
              },
            },
          ]
        : []),
    ],

    is_rtl: false,
  };

  if (!ctx.chat) return;

  await ctx.api.sendRichMessage(
    ctx.chat.id,
    rich_message,
     {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: ctx.t("harem_btn_close"),
              callback_data:`harem_user_${ctx.from!.id}_close`,
            },
          ],
        ],
      },
    }
  );
}
