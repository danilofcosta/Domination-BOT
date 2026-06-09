import type { MyContext, PreCharacter } from "../../../../../utils/customTypes.js";
import { ChatType, MediaType } from "../../../../../utils/customTypes.js";
import { setCharacter } from "../../../../../cache/cache.js";
import { getCharacterById } from "../services/character.service.js";
import { editCharacterEditMenu } from "./edit.ui.js";

export async function editCharHandler(ctx: MyContext) {
  let charid: number | undefined;

  if (ctx.match) {
    charid = Number(ctx.match);
  }

  if (!charid && ctx.message?.reply_to_message) {
    const reply = ctx.message.reply_to_message;
    const text = reply.text || reply.caption || "";
    const match = text.match(/\d+/);
    if (match) {
      charid = Number(match[0]);
    }
  }

  if (!charid || isNaN(charid)) {
    return ctx.reply(ctx.t("error-not-id"));
  }

  const genero = ctx.botType;

  const character = await getCharacterById(charid, genero);

  if (!character) {
    return ctx.reply(ctx.t("error-character-not-found"));
  }

  let rarities: number[] | undefined;
  let events: number[] | undefined;

  if ("HusbandoRarity" in character && character.HusbandoRarity) {
    rarities = character.HusbandoRarity.map((r: { rarityId: number }) => r.rarityId);
  } else if ("WaifuRarity" in character && character.WaifuRarity) {
    rarities = character.WaifuRarity.map((r: { rarityId: number }) => r.rarityId);
  }

  if ("HusbandoEvent" in character && character.HusbandoEvent) {
    events = character.HusbandoEvent.map((e: { eventId: number }) => e.eventId);
  } else if ("WaifuEvent" in character && character.WaifuEvent) {
    events = character.WaifuEvent.map((e: { eventId: number }) => e.eventId);
  }

  const preChar: PreCharacter = {
    nome: character.name,
    anime: character.origem,
    rarities,
    events,
    genero: ctx.botType,
    mediatype: character.mediaType as unknown as MediaType,
    media: character.media,
    mediaUniqueId: character.mediaUniqueId ?? undefined,
    username: ctx.from?.first_name || "",
    user_id: ctx.from?.id || 0,
    extras: ctx.from as Record<string, any>,
    editId: character.id,
  };

  const cacheId = character.id;
  setCharacter(cacheId, preChar);

  await editCharacterEditMenu(ctx, String(cacheId));
}
