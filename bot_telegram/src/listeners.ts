import { Composer } from "grammy";
import type { MyContext } from "./utils/customTypes.js";
import { countMessages } from "./handlers/listeners/message_counter.js";
import { haremInlineQuery } from "./handlers/inline_query/harem/harem_inline_query.js";
import {
  getCharacters,
  getCharactersall,
  QueryCharacet,
} from "./handlers/inline_query/global/inline_query.js";
import { getCharacter, setCharacter, getCharList } from "./cache/cache.js";
import { addCharacterEditMenu } from "./handlers/commands/admin_bot/manager_character/add_character/edit.ui.js";
import { editCharacterEditMenu } from "./handlers/commands/admin_bot/manager_character/edit_character/edit.ui.js";
import { getMedia } from "./handlers/commands/admin_bot/manager_character/utils/media.js";
import { debug, info, error as logError } from "./utils/log.js";
import { ChatType, MediaType } from "./utils/customTypes.js";
import { inline_per } from "./handlers/inline_query/global/inline_by_id.js";
import { animeInlineQuery } from "./handlers/inline_query/global/anime_inline_query.js";
import { SetRarityReplyHandler } from "./handlers/commands/admin_bot/configs/set_rarity.js";
import { SetEventReplyHandler } from "./handlers/commands/admin_bot/configs/set_event.js";
import { animelistCallback } from "./handlers/commands/users/animelist.js";
import { Gift_Inline_query } from "./handlers/inline_query/harem/gift_iniline_query.js";
import { Fav_Inline_query } from "./handlers/inline_query/harem/fav_iniline_query.js";
import { searchHarem } from "./handlers/inline_query/harem/search_haren.js";
import { prisma } from "./lib/prisma.js";
import { calcHash } from "./utils/calcHash.js";
import { Backup_harem } from "./handlers/commands/users/backup.js";
import { HaremHandler } from "./handlers/commands/users/harem.js";
import {
  getBackupState,
  clearBackupState,
  getAdminSetup,
  clearAdminSetup,
} from "./cache/workflowState.js";

const listeners = new Composer<MyContext>();

async function handleEditMediaMessage(ctx: MyContext) {
  const adminSetup = getAdminSetup(ctx);
  if (adminSetup?.action !== "edit_media" || !adminSetup?.targetId)
    return false;
  if (!ctx.message) return false;

  const numTargetId = Number(adminSetup.targetId);
  const character = getCharacter(numTargetId);
  if (!character) {
    clearAdminSetup(ctx);
    return true;
  }

  let reply = ctx.message.reply_to_message;
  if (!reply) {
    if (ctx.message.photo || ctx.message.video || ctx.message.document) {
      reply = ctx.message as any;
    }
  }
  if (!reply) {
    await ctx.reply(ctx.t("edit_character_prompt_media_reply"));
    return true;
  }
  const media = getMedia(reply);
  if (!media) {
    await ctx.reply(ctx.t("edit_character_prompt_media_invalid"));
    return true;
  }
  character.media = media.fileId;
  character.mediaUniqueId = media.fileUniqueId;
  character.mediatype = media.type;

  const editMessageId = adminSetup?.messageId;
  if (editMessageId && ctx.chat?.id) {
    const inputMedia =
      media.type === MediaType.VIDEO_FILEID
        ? { type: "video" as const, media: media.fileId }
        : { type: "photo" as const, media: media.fileId };
    await ctx.api
      .editMessageMedia(ctx.chat.id, editMessageId, inputMedia)
      .catch(() => {});
  }

  setCharacter(numTargetId, character);
  clearAdminSetup(ctx);

  if (character.editId) {
    await editCharacterEditMenu(ctx, String(numTargetId));
  } else {
    await addCharacterEditMenu(ctx, String(numTargetId));
  }
  return true;
}

listeners.on(":photo", async (ctx, next) => {
  if (await handleEditMediaMessage(ctx)) return;
  return next();
});

listeners.on(":video", async (ctx, next) => {
  if (await handleEditMediaMessage(ctx)) return;
  return next();
});

listeners.on("message:text", async (ctx, next) => {
  const userId = ctx.from?.id;
  const backupState = userId ? getBackupState(userId) : undefined;
  if (backupState) {
    const password = ctx.message.text.trim();

    if (password.length < 6) {
      await ctx.reply(ctx.t("backup-password-too-short"));
      return;
    }

    if (userId) clearBackupState(userId);

    const hash = calcHash(password);

    try {
      if (backupState.action === "create" || backupState.action === "change") {
        await prisma.telegramUser.upsert({
          where: { telegramId: BigInt(ctx.from!.id) },
          update: { backupHash: hash },
          create: { telegramId: BigInt(ctx.from!.id), backupHash: hash },
        });
        await ctx.reply(
          backupState.action === "change"
            ? ctx.t("backup-password-saved")
            : ctx.t("backup-create-success"),
        );
        await Backup_harem(ctx);
      } else if (backupState.action === "restore") {
        const oldUser = await prisma.telegramUser.findFirst({
          where: { backupHash: hash },
          include: {
            WaifuCollection: true,
            HusbandoCollection: true,
          },
        });

        if (!oldUser) {
          await ctx.reply(ctx.t("backup-restore-error"));
          return;
        }

        const currentTelegramId = BigInt(ctx.from!.id);

        if (oldUser.telegramId === currentTelegramId) {
          return await ctx.reply(ctx.t("backup-profile-curret"));
        }

        await prisma.$transaction(async (tx) => {
          const currentUser = await tx.user.findUnique({
            where: { telegramId: currentTelegramId },
          });

          if (!currentUser) {
            await tx.user.create({
              data: {
                telegramId: currentTelegramId,
                telegramData: oldUser.telegramData as any,
                coins: oldUser.coins,
                waifuConfig: oldUser.waifuConfig as any,
                husbandoConfig: oldUser.husbandoConfig as any,
                favoriteWaifuId: oldUser.favoriteWaifuId,
                favoriteHusbandoId: oldUser.favoriteHusbandoId,
                waifuLikes: oldUser.waifuLikes,
                husbandoLikes: oldUser.husbandoLikes,
                waifuDislikes: oldUser.waifuDislikes,
                husbandoDislikes: oldUser.husbandoDislikes,
                backupHash: hash,
              },
            });

            if (oldUser.WaifuCollection.length > 0) {
              await tx.waifuCollection.createMany({
                data: oldUser.WaifuCollection.map((c) => ({
                  userId: currentTelegramId,
                  characterId: c.characterId,
                  count: c.count,
                })),
              });
            }
            if (oldUser.HusbandoCollection.length > 0) {
              await tx.husbandoCollection.createMany({
                data: oldUser.HusbandoCollection.map((c) => ({
                  userId: currentTelegramId,
                  characterId: c.characterId,
                  count: c.count,
                })),
              });
            }
          } else {
            const mergeUnique = (a: number[], b: number[]) => [
              ...new Set([...a, ...b]),
            ];

            await tx.user.update({
              where: { telegramId: currentTelegramId },
              data: {
                coins: currentUser.coins + oldUser.coins,
                waifuLikes: mergeUnique(
                  currentUser.waifuLikes,
                  oldUser.waifuLikes,
                ),
                husbandoLikes: mergeUnique(
                  currentUser.husbandoLikes,
                  oldUser.husbandoLikes,
                ),
                waifuDislikes: mergeUnique(
                  currentUser.waifuDislikes,
                  oldUser.waifuDislikes,
                ),
                husbandoDislikes: mergeUnique(
                  currentUser.husbandoDislikes,
                  oldUser.husbandoDislikes,
                ),
                favoriteWaifuId:
                  currentUser.favoriteWaifuId ?? oldUser.favoriteWaifuId,
                favoriteHusbandoId:
                  currentUser.favoriteHusbandoId ?? oldUser.favoriteHusbandoId,
                waifuConfig: (currentUser.waifuConfig ??
                  oldUser.waifuConfig) as any,
                husbandoConfig: (currentUser.husbandoConfig ??
                  oldUser.husbandoConfig) as any,
              },
            });

            for (const wc of oldUser.WaifuCollection) {
              const existing = await tx.waifuCollection.findUnique({
                where: {
                  userId_characterId: {
                    userId: currentTelegramId,
                    characterId: wc.characterId,
                  },
                },
              });
              if (existing) {
                await tx.waifuCollection.update({
                  where: { id: existing.id },
                  data: { count: existing.count + wc.count },
                });
              } else {
                await tx.waifuCollection.create({
                  data: {
                    userId: currentTelegramId,
                    characterId: wc.characterId,
                    count: wc.count,
                  },
                });
              }
            }

            for (const hc of oldUser.HusbandoCollection) {
              const existing = await tx.husbandoCollection.findUnique({
                where: {
                  userId_characterId: {
                    userId: currentTelegramId,
                    characterId: hc.characterId,
                  },
                },
              });
              if (existing) {
                await tx.husbandoCollection.update({
                  where: { id: existing.id },
                  data: { count: existing.count + hc.count },
                });
              } else {
                await tx.husbandoCollection.create({
                  data: {
                    userId: currentTelegramId,
                    characterId: hc.characterId,
                    count: hc.count,
                  },
                });
              }
            }
          }

          await tx.user.delete({
            where: { telegramId: oldUser.telegramId },
          });
        });

        await ctx.reply(ctx.t("backup-restore-success"));

        HaremHandler(ctx);
      }
    } catch (e) {
      logError("backup password handler error", e);
      await ctx.reply(ctx.t("error-permission-internal"));
    }
    return;
  }

  const adminSetup = getAdminSetup(ctx);
  if (adminSetup?.action && adminSetup?.targetId) {
    const action = adminSetup.action;
    const targetId = adminSetup.targetId;
    const text = ctx.message.text;

    if (action.startsWith("setrarity_")) {
      return SetRarityReplyHandler(ctx);
    }

    if (action.startsWith("setevent_")) {
      return SetEventReplyHandler(ctx);
    }

    const numTargetId = Number(targetId);
    let character = getCharacter(numTargetId);
    if (!character) {
      clearAdminSetup(ctx);
      return;
    }

    if (action === "edit_nome") {
      character.nome = text;
    } else if (action === "edit_anime") {
      character.anime = text;
    } else if (action === "edit_events") {
      if (text.toLowerCase() === "null" || text === "") {
        character.events = undefined;
      } else {
        character.events = text
          .split(",")
          .map((t) => parseInt(t.trim(), 10))
          .filter((n) => !isNaN(n));
      }
    } else if (action === "edit_rarities") {
      if (text.toLowerCase() === "null" || text === "") {
        character.rarities = undefined;
      } else {
        character.rarities = text
          .split(",")
          .map((t) => parseInt(t.trim(), 10))
          .filter((n) => !isNaN(n));
      }
    } else if (action === "edit_media") {
      if (await handleEditMediaMessage(ctx)) return;
      return;
    }

    setCharacter(numTargetId, character);
    clearAdminSetup(ctx);

    if (character.editId) {
      await editCharacterEditMenu(ctx, String(numTargetId));
    } else {
      await addCharacterEditMenu(ctx, String(numTargetId));
    }
    return;
  }
  return next();
});

listeners.on("callback_query:data", async (ctx, next) => {
  const data = ctx.callbackQuery?.data || "";

  if (data.startsWith("al_")) {
    await animelistCallback(ctx);
    return;
  }

  return next();
});

listeners.chatType(["group", "supergroup"]).on("message", countMessages);

const userLatestQuery = new Map<number, string>();

setInterval(() => {
  if (userLatestQuery.size > 100) {
    userLatestQuery.clear();
  }
}, 60000);
listeners.on("inline_query", async (ctx) => {
  const start = Date.now();
  const query = ctx.inlineQuery?.query || "";
  const userId = ctx.from?.id;
  if (!userId) return;

  const queryId = ctx.inlineQuery?.id;
  if (!queryId) return;

  userLatestQuery.set(userId, queryId);

  const queryParts = query.split("_");
  const firstPart = queryParts[0];

  debug("inline_query_start", { query, userId });

  let answered = false;
  const originalAnswer = ctx.answerInlineQuery.bind(ctx);

  ctx.answerInlineQuery = async (results: any, other?: any) => {
    if (answered) return {} as any;
    if (userLatestQuery.get(userId) !== queryId) {
      debug("inline_query_stale_discarded", { query, userId });
      return {} as any;
    }
    answered = true;
    return originalAnswer(results, other);
  };

  const processQuery = async () => {
    if (query.startsWith("anime_")) {
      return await animeInlineQuery(ctx);
    }

    if (query.startsWith("select_gift_to_")) {
      return await Gift_Inline_query(ctx);
    }
    // selecionar favarioto e inline
    if (query.startsWith("select_my_fav")) {
      return await Fav_Inline_query(ctx);
    }

    if (firstPart === "harem" && queryParts[1] === "user") {
      return haremInlineQuery(ctx);
    }

    if (
      firstPart === "list" &&
      queryParts[1] === "char" &&
      queryParts[2] === "user"
    ) {
      const targetUserId = Number(queryParts[3]);
      const genero = (queryParts[4] as ChatType) || ChatType.WAIFU;

      const charListData = getCharList(targetUserId, genero);

      if (!charListData) return;
      return await inline_per(ctx, charListData);
    }

    if (query.startsWith("my:")) {
      return await searchHarem(ctx);
    }

    if (query.startsWith("harem_user_")) {
      return haremInlineQuery(ctx);
    }

    if (query !== "" && !isNaN(Number(query))) {
      await getCharacters(ctx);
      return;
    }

    if (query === "") {
      await getCharactersall(ctx);
      return;
    }

    await QueryCharacet(ctx);
    return;
  };

  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("TIMEOUT")), 2500),
    );
    await Promise.race([processQuery(), timeoutPromise]);
  } catch (err: any) {
    if (err.message === "TIMEOUT") {
      debug("inline_query_timeout", { query, userId });
      if (!answered && userLatestQuery.get(userId) === queryId) {
        try {
          await originalAnswer([]);
          answered = true;
        } catch (e) {}
      }
    } else {
      logError("inline_query_error", err);
    }
  } finally {
    const duration = Date.now() - start;
    info(
      "Inline query [" +
        query +
        "] do usuario " +
        userId +
        " levou " +
        duration +
        "ms",
    );
  }
});

export { listeners };
