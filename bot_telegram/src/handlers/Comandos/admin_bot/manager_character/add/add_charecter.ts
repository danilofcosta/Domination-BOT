import { MediaType } from "../../../../../../generated/prisma/client.js";
import { setCharacter } from "../../../../../cache/cache.js";
import { type MyContext } from "../../../../../utils/customTypes.js";
import { LinkMsg } from "../../../../../utils/manege_caption/link_msg.js";
import type { ChatType } from "../../../../../utils/customTypes.js";

export interface PreCharacter {
  idchat?: number;
  nome: string;
  anime: string;
  rarities?: number[] | undefined;
  events?: number[] | undefined;
  genero: ChatType;
  mediatype: MediaType;
  media: string;
  username: string;
  user_id: number;
  extras?: JSON;
}

export async function AddCharacterHandler(ctx: MyContext) {
  console.log("add per");
  let text_command: string | undefined;
  let reply = ctx.message?.reply_to_message;

  if (ctx.message?.caption && (ctx.message?.photo || ctx.message?.video)) {
    reply = ctx?.message as any ?? undefined;
  }
  // ❌ Não respondeu mensagem
  if (!reply) {
    ctx.reply(ctx.t("add_character_not_reply"));
    return;
  }

  // 🎯 Detectar mídia
  const media = getMedia(reply);
  if (!media) {
    ctx.reply("Only photo or video is supported.");
    return;
  }

  // 🧠 Pegar comando (ctx.match ou caption)
  text_command =
    ctx.match?.length === 0 ? reply.caption : (ctx.match as string);

  if (!text_command) {
    text_command = "";
  }

  // ❌ Formato inválido
  if (!text_command.includes(",")) {
    ctx.reply("Use: nome, anime, extras");
    return;
  }

  const [nome, anime, ...rest] = text_command.split(",");

  if (!nome || !anime) {
    ctx.reply(ctx.t("add_character_not_info"));
    return;
  }

  // 🔎 Parse rarities & events
  const { rarities, events } = parseTokens(rest);

  await confirmCharacter(ctx, {
    idchat: ctx.message!.message_id,
    nome: nome.trim(),
    anime: anime.trim(),
    rarities,
    events,
    genero: ctx.session.settings.genero,
    mediatype: media.type,
    media: media.file_id,
    username: ctx.from?.first_name || "",
    user_id: ctx.from?.id || 0,
    extras: ctx.from as any,
  });
}

/* ================= HELPERS ================= */

function getMedia(
  reply: any,
): { file_id: string; type: MediaType } | undefined {
  if (reply.photo?.length) {
    return {
      file_id: reply.photo.at(-1).file_id,
      type: MediaType.IMAGE_FILEID,
    };
  }

  if (reply.video) {
    return {
      file_id: reply.video.file_id,
      type: MediaType.VIDEO_FILEID,
    };
  }

  return undefined;
}

function parseTokens(rest: string[]) {
  const tokens = rest.join(" ").toLowerCase().split(/\s+/);

  const rarities: number[] = [];
  const events: number[] = [];

  for (const token of tokens) {
    if (!token) continue;

    if (token.startsWith("r")) {
      const id = parseInt(token.slice(1), 10);
      if (!isNaN(id)) rarities.push(id);
    }

    if (token.startsWith("e")) {
      const id = parseInt(token.slice(1), 10);
      if (!isNaN(id)) events.push(id);
    }
  }

  return {
    rarities: rarities.length ? rarities : undefined,
    events: events.length ? events : undefined,
  };
}

/* ================= CONFIRM ================= */

async function confirmCharacter(ctx: MyContext, data: PreCharacter) {
  const { idchat, nome, anime, rarities, events, genero, mediatype, media } =
    data;

  const text = `Nome: ${nome}
Anime: ${anime}
Genero: ${genero}
Mediatype: ${mediatype}
Data: ${media}
Link: ${LinkMsg(Number(ctx.chat?.id), Number(idchat))}
Rarities: ${rarities ?? "valor padrão"}
Events: ${events ?? "sem evento"}`;

  const id = Date.now();

  // 💾 salva no cache
  setCharacter(id, data);

  await ctx.reply(text, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: ctx.t("add_character_btn_confirm"),
            callback_data: `addcharacter_confirm_${id}`,
          },
          {
            text: ctx.t("add_character_btn_cancel"),
            callback_data: `addcharacter_cancel_${id}`,
          },
          {
            text: ctx.t("add_character_btn_edit"),
            callback_data: `addcharacter_edit_${id}`,
          },
        ],
      ],
    },
  });
}
