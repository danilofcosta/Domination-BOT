import type { MyContext, PreCharacter } from "../../../../uteis/CustomTypes.js";
import { ChatType } from "../../../../uteis/CustomTypes.js";
import { setCharacter } from "../../../../cache/cache.js";
import { EditUI } from "./addcharacter/edit.ui.js";
import { error, info } from "../../../../uteis/log.js";
import { botPrefix } from "../../../../CommandsRegistry/botConfigCommands.js";
import { SendMensageCustom } from "../../../../uteis/sendMensageCustom.js";
import { GetCharacterById } from "../../../../uteis/extras/GetCharacterById.js";

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
  let noCache = false;

  if (ctx.match) {
    const raw = String(ctx.match);
    noCache = /(?:^|\s)nocache(?:\s|$)/i.test(raw);
    const idStr = raw.replace(/nocache/gi, "").trim();
    if (idStr !== "") {
      idcharactertoedit = Number(idStr);
    }
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
    const usage = ctx.t("edit-id-not-informed", { botPrefix: botPrefix });
    const caption = `${usage}\n\n💡 Para buscar direto do banco (sem cache), use: <code>/editchar${botPrefix} &lt;id&gt; nocache</code>`;
    await ctx.reply(caption, { parse_mode: "HTML" });
    await SendMensageCustom({ ctx, caption });
    return;
  }

  try {
    const genero = ctx.botType;

    info("EditCharacterHandler - buscando personagem para edição", {
      id: idcharactertoedit,
      noCache,
    });

    const dbChar = await GetCharacterById(genero, idcharactertoedit, !noCache);

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
