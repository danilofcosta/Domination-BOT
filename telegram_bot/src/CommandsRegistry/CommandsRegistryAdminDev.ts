import { CommandGroup } from "@grammyjs/commands";
import { dropCharacter } from "../handlers/listeners/dropCharacter.js";
import { options } from "./botConfigCommands.js";
import { ChatType, type MyContext } from "../utils/customTypes.js";
import { prisma } from "../lib/prisma.js";
import { createMentionUser } from "../utils/telegram/createMentionUser.js";
import type { InputRichMessage } from "grammy/types";

const devCommands = new CommandGroup<MyContext>();

const guardDevOnly = async (ctx: MyContext): Promise<boolean> => {
  if (String(ctx.message?.from.id) !== process.env.CHAT_ID_DEV) {
    await ctx.reply(ctx.t("dev-cmd-only"));
    return false;
  }
  return true;
};

async function ForceDrop(ctx: MyContext) {
  const allowed = await guardDevOnly(ctx);
  if (!allowed) return;
  const result = await dropCharacter(ctx);
  if (!result) {
    await ctx.reply(ctx.t("dev-fail-drop"));
  }
}

function buildProgressBar(ratio: number, maxBlocks = 10) {
  const filled = Math.round(Math.min(ratio, 1) * maxBlocks);
  return "▰".repeat(filled) + "▱".repeat(maxBlocks - filled);
}

const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
};

async function teste(ctx: MyContext) {
  const allowed = await guardDevOnly(ctx);
  if (!allowed) return;

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
  );
}

devCommands.command(
  "dev",
  "Forçar drop de personagem",
  ForceDrop,
  options,
);

devCommands.command(
  "test",
  "Teste de comando",
  teste,
  options,
);

export { devCommands, guardDevOnly };
