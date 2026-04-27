import type { User } from "grammy/types";
import { ChatType, NODE_ENV, type MyContext } from "../../utils/customTypes.js";
import { botNewgroupMember } from "./botNewgroupMember.js";
import { DropCharacter } from "./doprar_per.js";
import { error, info, log } from "../../utils/log.js";

const DROP = 100;
const UNDROP = DROP + 40;
const TEST_GROUP_ID = process.env.TEST_GROUP_ID;

export async function contarMensagens(ctx: MyContext) {
  if (!ctx.chat) return;

  const grupo = ctx.session.grupo;
  if (!grupo) {
    return; // removido log para não travar disk io
  }
  const isDev = process.env.NODE_ENV === NODE_ENV.DEVELOPMENT;
  const isTestGroup = TEST_GROUP_ID
    ? ctx.chat.id === Number(TEST_GROUP_ID)
    : false;

  const chatId = ctx.chat.id;

  /* =========================
   * CONTADOR EM MEMÓRIA
   * ========================= */
  if (isDev && isTestGroup) {
    grupo.cont < 97 ? 97 : grupo.cont + 1;
  } else {
    grupo.cont += 1;
  }
  // console.log('-------------')
  // console.log(ctx)
  // console.log(ctx.from)
  // console.log('-------------')

  /* =========================
   * BOT ADICIONADO NO GRUPO
   * ========================= */
  if (ctx.message?.new_chat_members) {
    const newMembers: User[] = ctx.message.new_chat_members;

    if (newMembers.some((member) => member.id === ctx.me.id)) {
      return botNewgroupMember(ctx);
    }
  }

  /* =========================
   * DROP
   * ========================= */

  // se o contador for maior ou igual a DROP e não tiver dropId E não houver personagem pendente
  if (grupo.cont >= DROP && !grupo.dropId && !grupo.character) {
    // Agora suja a sessão pois queremos gravar o status base para o Drop
    const result = await DropCharacter(ctx);
    if (!result) {
      // caso o drop falhe
      grupo.cont = DROP - 10;

      return;
    }

    if (result) {
      log("Drop executado com sucesso no chat", chatId);
      const newCont = grupo.cont ?? DROP;
    }

    return;
  }

  /* =========================
   * UNDROP
   * ========================= */

  //caso o contador seja maior ou igual ao UNDROP e tiver dropId
  if (grupo.cont >= UNDROP && grupo.dropId != null) {
    const character = grupo.character;

    const character_genero =
      process.env.TYPE_BOT === ChatType.HUSBANDO ? "o husbando" : "a waifu";

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
                text: "Mais detalhes",
                callback_data: `click_${character?.id ?? "0"}`,
              },
            ],
          ],
        },
      });
      log("undrop com sucesso no chat", chatId);
    } catch (err) {
      error("Erro ao deletar mensagem:", err);
    }

    /* =========================
     * RESET
     * ========================= */
    ctx.session.grupo = {
      cont: 0,
      dropId: null,
      character: null,
      data: null,
      title: ctx.message?.chat.first_name||ctx.from?.first_name|| "-",
      directMessagesTopicId: ctx.session.grupo.directMessagesTopicId,
    };
  
}
}