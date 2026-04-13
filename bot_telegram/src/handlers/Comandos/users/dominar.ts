import { prisma } from "../../../../lib/prisma.js";
import { ChatType, type Character, type MyContext } from "../../../utils/customTypes.js";
import { mentionUser } from "../../../utils/manege_caption/metion_user.js";
import { LinkMsg } from "../../../utils/manege_caption/link_msg.js";
import { AddCharacterCollection } from "../../../utils/chareter/add_character_colletion.js";
import { extractListEmojisCharacter } from "../../../utils/manege_caption/extractListEmojisCharacter.js";

function verificarNome(personagem: string, tentativa: string) {
  const ignorar = [
    "da",
    "de",
    "do",
    "dos",
    "das",
    "the",
    "a",
    "an",
    "the",
    "&",
  ];

  const partes = personagem
    .toLowerCase()
    .split(/\s+/)
    .filter((p) => !ignorar.includes(p));

  tentativa = tentativa.toLowerCase().trim();

  if (partes.includes(tentativa)) return true;

  if (tentativa === partes.join(" ")) return true;

  return false;
}

function calcularTempo(per: { data: Date | string | null }) {
  if (!per.data) return "desconhecido";

  const agora = new Date();
  const data = typeof per.data === "string" ? new Date(per.data) : per.data;
  const diferenca = agora.getTime() - data.getTime();

  const segundos = Math.floor(diferenca / 1000);
  const minutos = Math.floor(diferenca / 60000);
  const horas = Math.floor(diferenca / 3600000);

  if (segundos < 60) {
    return `${segundos} seg`;
  }

  if (minutos < 60) {
    return `${minutos} min`;
  }

  return `${horas} h`;
}

function successDominarMessage(ctx: MyContext,character: Character) {
  if (!character) return "vc tem um personagem novo!";
  //success_dominar_title = ✅ { $usermention }, você tem { $genero }!
  const success_dominar_title = ctx.t("success_dominar_title", {
    usermention: mentionUser(ctx.from?.first_name || "user", ctx.from?.id || 0),
    genero:
      ctx.session.settings.genero === ChatType.WAIFU
        ? "uma waifu"
        : "um husbando",
  });

  const success_dominar_name = ctx.t("success_dominar_name", {
    character_name: character.name,
  });

  const success_dominar_anime = ctx.t("success_dominar_anime", {
    anime: character.origem,
  });
  const { emoji_event, emoji_raridade: rarityEmojis } =
    extractListEmojisCharacter(ctx, character);
  // const rarityEmojis = extrair_emojis(
  //   (character.extras as any)?.rarities ?? [],
  // );

  const success_dominar_rarity = ctx.t("success_dominar_rarity", {
    rarity:
      rarityEmojis.length > 1
        ? `[${rarityEmojis.join(", ")}]`
        : rarityEmojis.length === 1
          ? rarityEmojis.join(", ")
          : "",
  });

  const success_dominar_time = ctx.t("success_dominar_time", {
    time: calcularTempo({ data: ctx.session.grupo.data }),
  });

  const success_dominar = `${success_dominar_title}\n\n${success_dominar_name}\n${success_dominar_anime}\n${success_dominar_rarity}\n\n${success_dominar_time}`;

  return success_dominar;
}

export async function CapturarCharacter(ctx: MyContext) {
  const tentativa = String(ctx.match).trim();
  const character = ctx.session.grupo.character;
  const type = ctx.session.settings.genero || process.env.TYPE_BOT

  if (!character || !tentativa) {
    try {
    //  await ctx.answerCallbackQuery(ctx.t("not-charater-to-dominar"));
    console.log("not-charater-to-dominar");
      return;
    } catch (e) {
      console.log("Erro ao enviar resposta de callback query", e);
      return;
    }
  }

  // ❌ nome errado
  if (!verificarNome(character.name, tentativa)) {
    const url = LinkMsg(Number(ctx.chat?.id), Number(ctx.session.grupo.dropId));

    const msg = await ctx.reply(ctx.t("name-not-found"), {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[{ text: ctx.t("bt-tentative-again"), url }]],
      },
    });

    setTimeout(() => {
      ctx.api.deleteMessage(ctx.chat!.id, msg.message_id).catch(() => {});
    }, 120000);

    return;
  }
  
  ctx.session.grupo.character = null;
  ctx.session.grupo.dropId = null;
  ctx.session.grupo.cont = 0;
 
  // ✅ nome correto

  let userId = Number(ctx.from?.id);

  const res = await AddCharacterCollection({
    type,
    userId,
    from: ctx.from || {},
    Charater_id: character.id
  });

  if (!res) {
    ctx.reply(ctx.t("error add character"));
  }

  await ctx.reply(successDominarMessage(ctx,character), {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: ctx.t("success_dominar_btn"),
            switch_inline_query_current_chat: "harem_user_" + ctx.from?.id,
          },
        ],
      ],
    },
  });

  //limpar sessao
 ctx.session.grupo = {
    cont: 0,
    dropId: null,
    character: null,
    data: null,
    title: ctx.chat?.title || "",
    directMessagesTopicId: ctx.session.grupo.directMessagesTopicId , 
  };
}
