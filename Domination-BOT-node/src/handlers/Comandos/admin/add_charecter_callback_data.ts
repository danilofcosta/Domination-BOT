import type {
  CharacterHusbando,
  CharacterWaifu,
} from "../../../../generated/prisma/client.js";
import { prisma } from "../../../../lib/prisma.js";
import { getCharacter } from "../../../cache/cache.js";
import type { MyContext } from "../../../utils/customTypes.js";
import { mentionUser } from "../../../utils/metion_user.js";
import { Sendmedia } from "../../../utils/sendmedia.js";
import { create_caption } from "../../inline_query/create_caption.js";
import { addCharacter_edit_CallbackData } from "./add_character_edit.js";
import type { PreCharacter } from "./add_charecter.js";
//addcharacter_edit_4cb8055c-63e2-41df-b77f-a5339ce64921
export async function addCharacterCallbackData(ctx: MyContext) {
  if (!ctx.callbackQuery?.data) return;

  const [command, action, ...rest] = ctx.callbackQuery.data.split("_");
  const id_cached = rest.join("_");

  let character = getCharacter(Number(id_cached));
  console.log(action);
  if (!character) {
    await ctx.answerCallbackQuery(ctx.t("error-character-not-found"));
    return;
  }

  if (action === "confirm") {
    try {
      if (character.rarities?.length === 0 || !character.rarities) {
        character.rarities = [1];
      }

      const slug =
        character.nome
          .toLowerCase()
          .normalize("NFD")
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-") +
        (character.media ? `-${character.media}` : "");

      const isWaifu = ctx.session.settings.genero === "waifu";
      const data = {
        name: character.nome.trim(),
        origem: character.anime.trim(),
        mediaType: character.mediatype,
        slug,
        media: character.media ?? undefined,

        ...(character.rarities?.length && {
          rarities: {
            create: character.rarities.map((rarityId: number) => ({
              rarity: { connect: { id: rarityId } },
            })),
          },
        }),

        ...(character.events?.length && {
          events: {
            create: character.events.map((eventId: number) => ({
              event: { connect: { id: eventId } },
            })),
          },
        }),
      };

      const character_db = isWaifu
        ? await prisma.characterWaifu.create({
            data,
            include: { events: true, rarities: true },
          })
        : await prisma.characterHusbando.create({
            data,
            include: { events: true, rarities: true },
          });

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

  if (action === "cancel") {
    await ctx.deleteMessage().catch(() => {});
    return;
  }
  
  if (action === "edit") {
    await addCharacter_edit_CallbackData(ctx, id_cached);
    return;
  }
}
