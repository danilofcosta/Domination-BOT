import { prisma } from "../../../../lib/prisma.js";
import { getCharacter } from "../../../cache/cache.js";
import type { MyContext } from "../../../utils/customTypes.js";
import { mentionUser } from "../../../utils/metion_user.js";
import { Sendmedia } from "../../../utils/sendmedia.js";
import { create_caption } from "../../../utils/create_caption.js";
import { addCharacter_edit_CallbackData } from "./add_character_edit.js";

export async function addCharacterCallbackData(ctx: MyContext) {
  if (!ctx.callbackQuery?.data) return;

  const [command, action, ...rest] = ctx.callbackQuery.data.split("_");
  const id_cached = rest.join("_");

  const character = getCharacter(Number(id_cached));

  if (!character) {
    await ctx.answerCallbackQuery(ctx.t("error-character-not-found"));
    return;
  }

  // =========================
  // CONFIRMAR CRIAÇÃO
  // =========================
  if (action === "confirm") {
    try {
      const rarities = character.rarities?.length ? character.rarities : [1];

      const slug =
        character.nome
          .toLowerCase()
          .normalize("NFD")
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-") +
        (character.media ? `-${character.media}` : "");

      const isWaifu = ctx.session.settings.genero === "waifu";

      const baseData = {
        name: character.nome.trim(),
        origem: character.anime.trim(),
        mediaType: character.mediatype,
        media: character.media ?? null,
        slug,
      };

      const character_db = isWaifu
        ? await prisma.characterWaifu.create({
            data: {
              ...baseData,

              WaifuRarity: {
                create: rarities.map((rarityId: number) => ({
                  Rarity: {
                    connect: { id: rarityId },
                  },
                })),
              },

              ...(character.events?.length && {
                WaifuEvent: {
                  create: character.events.map((eventId: number) => ({
                    Event: {
                      connect: { id: eventId },
                    },
                  })),
                },
              }),
            },
            include: {
              WaifuEvent: { include: { Event: true } },
              WaifuRarity: { include: { Rarity: true } },
            },
          })
        : await prisma.characterHusbando.create({
            data: {
              ...baseData,

              HusbandoRarity: {
                create: rarities.map((rarityId: number) => ({
                  Rarity: {
                    connect: { id: rarityId },
                  },
                })),
              },

              ...(character.events?.length && {
                HusbandoEvent: {
                  create: character.events.map((eventId: number) => ({
                    Event: {
                      connect: { id: eventId },
                    },
                  })),
                },
              }),
            },
            include: {
              HusbandoEvent: { include: { Event: true } },
              HusbandoRarity: { include: { Rarity: true } },
            },
          });

      // =========================
      // CAPTION
      // =========================
      let caption = create_caption({
        character: character_db,
        chatType: ctx.session.settings.genero,
        ctx,
        noformat: true,
      });

      caption += `\n\n${ctx.t("add_character_confirm", {
        usermention: mentionUser(
          character.username || "user",
          character.user_id || 0,
        ),
      })}`;

      // =========================
      // SEND MEDIA
      // =========================
      await Sendmedia({
        ctx,
        chat_id: process.env.DATABASE_TELEGREM_ID,
        caption,
        per: character_db,
      });

      await ctx.deleteMessage().catch(() => {});
      return;
    } catch (error) {
      console.error(error);
      await ctx.answerCallbackQuery("Erro ao salvar personagem.");
    }

    return;
  }

  // =========================
  // CANCELAR
  // =========================
  if (action === "cancel") {
    await ctx.deleteMessage().catch(() => {});
    return;
  }

  // =========================
  // EDITAR
  // =========================
  if (action === "edit") {
    await addCharacter_edit_CallbackData(ctx, id_cached);
    return;
  }
}
