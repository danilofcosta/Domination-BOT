import type { MyContext, PreCharacter } from "../../../uteis/CustomTypes.js";
import { ChatType } from "../../../uteis/CustomTypes.js";
import { prisma } from "../../../lib/prisma.js";
import { setCharacter } from "../../../cache/cache.js";
import { EditUI } from "./addcharacter/edit.ui.js";
import { error } from "../../../uteis/log.js";
import { botPrefix } from "../../../CommandsRegistry/botConfigCommands.js";

function dbCharacterToPreCharacter(
  dbChar: any,
  genero: ChatType,
): PreCharacter {
  const raritiesField =
    genero === ChatType.HUSBANDO ? "HusbandoRarity" : "WaifuRarity";
  const eventsField =
    genero === ChatType.HUSBANDO ? "HusbandoEvent" : "WaifuEvent";

  return {
    editId: dbChar.id,
    nome: dbChar.name,
    anime: dbChar.origem,
    genero,
    mediatype: dbChar.mediaType,
    media: dbChar.media,
    mediaUniqueId: dbChar.mediaUniqueId ?? undefined,
    sourceType: dbChar.sourceType,
    rarities: dbChar[raritiesField]?.map((r: any) => r.Rarity?.id) ?? [],
    events: dbChar[eventsField]?.map((e: any) => e.Event?.id) ?? [],
    username: "",
    user_id: 0,
  };
}

export async function EditCharacterHandler(ctx: MyContext) {
  let idcharactertoedit: number | undefined;

  if (ctx.match) {
    idcharactertoedit = Number(ctx.match);
  }

  if (!idcharactertoedit && ctx.message?.reply_to_message) {
    const text =
      ctx.message.reply_to_message.text ||
      ctx.message.reply_to_message.caption ||
      "";
    const match = text.match(/\d+(?:\.\d+)*/);

    if (match) {
      idcharactertoedit = Number(match[0]);
    }
  }

  if (!idcharactertoedit || isNaN(idcharactertoedit)) {
    await ctx.reply(ctx.t("edit-id-not-informed", { botPrefix: botPrefix }));
    return;
  }

  try {
    const genero = ctx.botType;
    const isHusbando = genero === ChatType.HUSBANDO;

    const dbChar = isHusbando
      ? await (prisma as any).characterHusbando.findUnique({
          where: { id: idcharactertoedit },
          include: {
            HusbandoRarity: { include: { Rarity: true } },
            HusbandoEvent: { include: { Event: true } },
          },
        })
      : await (prisma as any).characterWaifu.findUnique({
          where: { id: idcharactertoedit },
          include: {
            WaifuRarity: { include: { Rarity: true } },
            WaifuEvent: { include: { Event: true } },
          },
        });

    if (!dbChar) {
      await ctx.reply(ctx.t("error-character-not-found"));
      return;
    }

    const preChar = dbCharacterToPreCharacter(dbChar, genero);
    const cacheId = `precharacter:${idcharactertoedit}`;
    setCharacter(cacheId, preChar);

    await EditUI(ctx, preChar, cacheId, "edit");
  } catch (e) {
    error("EditCharacterHandler error", e);
    await ctx.reply(ctx.t("add-char-error", { error: "erro interno" }));
  }
}
