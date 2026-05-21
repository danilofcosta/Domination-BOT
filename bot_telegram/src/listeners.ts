import { Composer } from "grammy";
import type { MyContext } from "./utils/customTypes.js";
import { contarMensagens } from "./handlers/listeners/contarMensagens.js";
import { haremInlineQuery } from "./handlers/inline_query/harem_inline_query.js";
import {
  getCharacters,
  getCharactersall,
  QueryCharacet,
} from "./handlers/inline_query/inline_query.js";
import { getCharacter, setCharacter, getCharList } from "./cache/cache.js";
import { addCharacter_edit_CallbackData } from "./handlers/Comandos/admin_bot/manager_character/add/add_character_edit.js";
import { debug, info, error as logError } from "./utils/log.js";
import { ChatType } from "./utils/customTypes.js";
import { inline_per } from "./handlers/inline_query/inline_by_id.js";
import { animeInlineQuery } from "./handlers/inline_query/anime_inline_query.js";
import { SetRarityReplyHandler } from "./handlers/Comandos/admin_bot/configs/set_rarity.js";
import { SetEventReplyHandler } from "./handlers/Comandos/admin_bot/configs/set_event.js";
import { animelistCallback } from "./handlers/Comandos/users/animelist.js";
import { Gift_Inline_query } from "./handlers/inline_query/gift_iniline_query.js";
import { Fav_Inline_query } from "./handlers/inline_query/fav_iniline_query.js";
import { prisma } from "./lib/prisma.js";
import { calcHash } from "./utils/calcHash.js";
import { Backup_harem } from "./handlers/Comandos/users/backup.js";
import { HaremHandler } from "./handlers/Comandos/users/harem.js";

const listeners = new Composer<MyContext>();

listeners.on("message:text", async (ctx, next) => {
    const backupState = ctx.session.backupState;
  if (backupState) {
    const password = ctx.message.text.trim();

    if (password.length < 6) {
      await ctx.reply(ctx.t("backup-password-too-short"));
      return;
    }

    ctx.session.backupState = undefined;

    const hash = calcHash(password);

    try {
      if (backupState.action === "create" || backupState.action === "change") {
        await prisma.user.upsert({
          where: { telegramId: BigInt(ctx.from!.id) },
          update: { backupHash: hash },
          create: { telegramId: BigInt(ctx.from!.id), backupHash: hash },
        });
        await ctx.reply(
          backupState.action === "change"
            ? ctx.t("backup-password-saved")
            : ctx.t("backup-create-success"),
        );
     await   Backup_harem(ctx)
      } else if (backupState.action === "restore") {
        const oldUser = await prisma.user.findFirst({
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
          await ctx.reply(ctx.t("backup-restore-success"));
          HaremHandler(ctx)
          return;
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
            const mergeUnique = (a: number[], b: number[]) =>
              [...new Set([...a, ...b])];

            await tx.user.update({
              where: { telegramId: currentTelegramId },
              data: {
                coins: currentUser.coins + oldUser.coins,
                waifuLikes: mergeUnique(currentUser.waifuLikes, oldUser.waifuLikes),
                husbandoLikes: mergeUnique(currentUser.husbandoLikes, oldUser.husbandoLikes),
                waifuDislikes: mergeUnique(currentUser.waifuDislikes, oldUser.waifuDislikes),
                husbandoDislikes: mergeUnique(currentUser.husbandoDislikes, oldUser.husbandoDislikes),
                favoriteWaifuId: currentUser.favoriteWaifuId ?? oldUser.favoriteWaifuId,
                favoriteHusbandoId: currentUser.favoriteHusbandoId ?? oldUser.favoriteHusbandoId,
                waifuConfig: (currentUser.waifuConfig ?? oldUser.waifuConfig) as any,
                husbandoConfig: (currentUser.husbandoConfig ?? oldUser.husbandoConfig) as any,
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

     HaremHandler   (ctx)
      }
    } catch (e) {
      logError("backup password handler error", e);
      await ctx.reply(ctx.t("error-permission-internal"));
    }
    return;
  }

  if (ctx.session.adminSetup?.action && ctx.session.adminSetup?.targetId) {
    const action = ctx.session.adminSetup.action;
    const targetId = ctx.session.adminSetup.targetId;
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
      ctx.session.adminSetup = { action: null, targetId: null };
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
    }

    setCharacter(numTargetId, character);
    ctx.session.adminSetup = { action: null, targetId: null };

    await addCharacter_edit_CallbackData(ctx, String(numTargetId));
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

listeners.chatType(["group", "supergroup"]).on("message", contarMensagens);

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
