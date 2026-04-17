import type { User } from "grammy/types";
import { ChatType, NODE_ENV, type MyContext } from "../../utils/customTypes.js";
import { botNewgroupMember } from "./botNewgroupMember.js";
import { DropCharacter } from "./doprar_per.js";
import { error, log } from "../../utils/log.js";

const DROP = 100;
const UNDROP = DROP +20  ;
const TEST_GROUP_ID = process.env.TEST_GROUP_ID;

export async function contarMensagens(ctx: MyContext) {
  if (!ctx.chat) return;

  const grupo = ctx.session.grupo;
  if (!grupo) {
    return log("Grupo não encontrado");
  }
  const isDev = process.env.NODE_ENV === NODE_ENV.DEVELOPMENT;
  const isTestGroup = TEST_GROUP_ID
    ? ctx.chat.id === Number(TEST_GROUP_ID)
    : false;

  /* =========================
   * CONTADOR
   * ========================= */
  if (isDev && isTestGroup) {
    const cont = grupo.cont ?? 0;

    grupo.cont = cont < 97 ? 97 : cont + 1;
    grupo.title = ctx.chat.title || null;

  } else {
    grupo.title = ctx.chat.title || null;
    grupo.cont = (grupo.cont ?? 0) + 1;
  }

  log(
    "log", ctx.session.settings.genero
    ,
    ctx.chat.id,
    ctx.chat.type,
    ctx.chat.title,
    grupo.cont,
  );

  /* =========================
   * BOT ADICIONADO NO GRUPO
   * ========================= */
  if (ctx.message?.new_chat_members) {
    const newMembers: User[] = ctx.message.new_chat_members;

    if (newMembers.some(member => member.id === ctx.me.id)) {
      return botNewgroupMember(ctx);
    }


  }

  /* =========================
    * DROP
    * ========================= */

  // se o contador for maior ou igual a 100 e não tiver dropId
  if (grupo.cont >= DROP && !grupo.dropId) {
    const result = await DropCharacter(ctx);
    if (!result) {
      // caso não retorna a mensagem
      grupo.cont = DROP - 10;
      return;
    }

    if (result) {
      //log terminal
      log("dopre com sucesso");
    }

    return;
  }

  /* =========================
   * UNDROP
   * ========================= */


  //caso o contador seja maior ou igual a 140 e tiver dropId
  if (grupo.cont >= UNDROP && grupo.dropId != null) {
    const character = grupo.character;

    const character_genero =
      ctx.session.settings.genero || process.env.TYPE_BOT === ChatType.HUSBANDO
        ? "o husbando"
        : "a waifu";

    const txt = ctx.t("drop_character_secret_caption", {
      charater_nome: character?.name ?? "??",
      charater_anime: character?.origem ?? "???",
      charater_genero: character_genero,
    });

    try {
      await ctx.api.deleteMessage(ctx.chat.id, grupo.dropId);
      
  await ctx.reply(txt, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Mais detalhes',
            callback_data: `click_${character?.id ?? "0"}`,
          },
        ],
      ],
    },
  });
      log("undrop com sucesso");
    } catch (err) {
      error("Erro ao deletar mensagem:", err)
    }



    /* =========================
          * RESET
          * ========================= */
    //caso o contador seja maior ou igual a 180 e tiver dropId resetar o grupo

    ctx.session.grupo = {
      cont: 0,
      dropId: null,
      character: null,
      data: null,
      title: ctx.chat.title || "-",
      directMessagesTopicId: ctx.session.grupo.directMessagesTopicId,

    }
  }
}
