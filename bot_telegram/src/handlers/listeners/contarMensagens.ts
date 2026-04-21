import type { User } from "grammy/types";
import { ChatType, NODE_ENV, type MyContext } from "../../utils/customTypes.js";
import { botNewgroupMember } from "./botNewgroupMember.js";
import { DropCharacter } from "./doprar_per.js";
import { error, info, log } from "../../utils/log.js";

const DROP = 100;
const UNDROP = DROP + 20;
const TEST_GROUP_ID = process.env.TEST_GROUP_ID;
const PERSIST_EVERY = 10; // A cada 10 mensagens, persiste para DB

const CACHE_TTL_MS = 3600000; // 1 hora

interface CacheEntry<T> {
  value: T;
  expiry: number;
}

// Cache em memória com TTL para evitar memory leak
const counters = new Map<number, CacheEntry<number>>();
const titles = new Map<number, CacheEntry<string | null>>();

// Lock em memória para evitar race condition no mesmo processo
const dropLocks = new Map<number, NodeJS.Timeout>();

function cleanExpiredEntries() {
  const now = Date.now();
  for (const [key, entry] of counters) {
    if (entry.expiry < now) counters.delete(key);
  }
  for (const [key, entry] of titles) {
    if (entry.expiry < now) titles.delete(key);
  }
}

setInterval(cleanExpiredEntries, CACHE_TTL_MS);

function getCounter(chatId: number, fallback: number): number {
  const entry = counters.get(chatId);
  if (entry && entry.expiry > Date.now()) return entry.value;
  return fallback;
}

function setCounter(chatId: number, value: number) {
  counters.set(chatId, { value, expiry: Date.now() + CACHE_TTL_MS });
}

function getTitle(chatId: number): string | null {
  const entry = titles.get(chatId);
  if (entry && entry.expiry > Date.now()) return entry.value;
  return null;
}

function setTitle(chatId: number, value: string | null) {
  titles.set(chatId, { value, expiry: Date.now() + CACHE_TTL_MS });
}

export function resetContadorCache(chatId: number) {
  setCounter(chatId, 0);
  setTitle(chatId, null);
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

  let cont = getCounter(chatId, grupo.cont ?? 0);
  let title = getTitle(chatId);

  /* =========================
   * CONTADOR EM MEMÓRIA
   * ========================= */
  if (isDev && isTestGroup) {
    cont = cont < 97 ? 97 : cont + 1;
  } else {
    cont += 1;
  }

  // Apenas salva o novo título se ele de fato mudar. Reduz I/O de sessão.
  const currentTitle = ctx.chat.title || null;
  if (title !== currentTitle) {
    grupo.title = currentTitle;
    setTitle(chatId, currentTitle);
  }

  // Persiste a nova contagem APENAS no cache de memória
  setCounter(chatId, cont);

  // Persiste para DB a cada 10 mensagens (otimização para múltiplas instâncias)
  // PrismaAdapter faz auto-save automaticamente
  if (cont % PERSIST_EVERY === 0) {
    grupo.cont = cont;
  }

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
    // Previne race condition no mesmo processo
    if (dropLocks.has(chatId)) return;
    dropLocks.set(chatId, setTimeout(() => dropLocks.delete(chatId), 5000));

    await new Promise(r => setTimeout(r, 50));
    if (ctx.session.grupo.dropId) return;
    // Agora suja a sessão pois queremos gravar o status base para o Drop
    grupo.cont = cont;
    const result = await DropCharacter(ctx);
    if (!result) {
      // caso o drop falhe
      cont = DROP - 10;
      setCounter(chatId, cont);
      grupo.cont = cont;
      dropLocks.delete(chatId);
      return;
    }

    if (result) {
      log("Drop executado com sucesso no chat", chatId);
      const newCont = grupo.cont ?? DROP;
      setCounter(chatId, newCont);
      cont = newCont;
      dropLocks.delete(chatId);
    }

    return;
  }

  /* =========================
   * UNDROP
   * ========================= */


  //caso o contador seja maior ou igual ao UNDROP e tiver dropId
  if (cont >= UNDROP && grupo.dropId != null) {
    const character = grupo.character;

    const character_genero =process.env.TYPE_BOT === ChatType.HUSBANDO
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
    setCounter(chatId, 0);
  }
}
