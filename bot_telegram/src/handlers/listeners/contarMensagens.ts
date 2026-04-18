import type { User } from "grammy/types";
import { ChatType, NODE_ENV, type MyContext } from "../../utils/customTypes.js";
import { botNewgroupMember } from "./botNewgroupMember.js";
import { DropCharacter } from "./doprar_per.js";
import { error, log } from "../../utils/log.js";

const DROP = 100;
const UNDROP = DROP + 20;
const TEST_GROUP_ID = process.env.TEST_GROUP_ID;

// Cache em memória para evitar que o Grammy Middleware faça update no banco de dados
// do Prisma a cada mensagem enviada no grupo (o que derruba a performance)
const counters = new Map<number, number>();
const titles = new Map<number, string | null>();

export function resetContadorCache(chatId: number) {
  counters.set(chatId, 0);
  titles.set(chatId, null);
}

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

  if (!counters.has(chatId)) counters.set(chatId, grupo.cont ?? 0);
  if (!titles.has(chatId)) titles.set(chatId, grupo.title ?? null);

  let cont = counters.get(chatId)!;
  let title = titles.get(chatId)!;

  /* =========================
   * CONTADOR EM MEMÓRIA
   * ========================= */
  if (isDev && isTestGroup) {
    cont = cont < 97 ? 97 : cont + 1;
  } else {
    cont += 1;
  }

  // Apenas salva o novo título se ele de fato mudar. Reduz I/O de session middleware.
  const currentTitle = ctx.chat.title || null;
  if (title !== currentTitle) {
    grupo.title = currentTitle;
    titles.set(chatId, currentTitle);
  }

  // Persiste a nova contagem APENAS no cache de memória, sem sujar a sessão por enquanto
  counters.set(chatId, cont);

  // [REMOVIDO log(ctx.chat.id, ...) AQUI]
  // Logar a cada única mensagem trava inteiramente o console (bottleneck) e gasta HD com os arquivos diarios.
  if (isDev){
    console.log(title,cont)
  }
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

  // se o contador for maior ou igual a DROP e não tiver dropId
  if (cont >= DROP && !grupo.dropId) {
    await new Promise(r => setTimeout(r, 50));
    if (ctx.session.grupo.dropId) return;
    // Agora suja a sessão pois queremos gravar o status base para o Drop
    grupo.cont = cont;
    const result = await DropCharacter(ctx);
    if (!result) {
      // caso o drop falhe
      cont = DROP - 10;
      counters.set(chatId, cont);
      grupo.cont = cont; // sync back to session db
      return;
    }

    if (result) {
      log("Drop executado com sucesso no chat", chatId);
      const newCont = grupo.cont ?? DROP;
      counters.set(chatId, newCont);
      cont = newCont;
    }

    return;
  }

  /* =========================
   * UNDROP
   * ========================= */


  //caso o contador seja maior ou igual ao UNDROP e tiver dropId
  if (cont >= UNDROP && grupo.dropId != null) {
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
      log("undrop com sucesso no chat", chatId);
    } catch (err) {
      error("Erro ao deletar mensagem:", err)
    }

    /* =========================
     * RESET
     * ========================= */
    ctx.session.grupo = {
      cont: 0,
      dropId: null,
      character: null,
      data: null,
      title: currentTitle || "-",
      directMessagesTopicId: ctx.session.grupo.directMessagesTopicId,
    };
    // reseta tb cache
    counters.set(chatId, 0);
  }
}
