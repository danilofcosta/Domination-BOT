import type { User } from "grammy/types";
import { ChatType, NODE_ENV, type MyContext } from "../../utils/customTypes.js";
import { botNewgroupMember } from "./botNewgroupMember.js";
import { DropCharacter } from "./doprar_per.js";
import { error, info, log } from "../../utils/log.js";
import { Sendmedia } from "../../utils/sendmedia.js";
import { CreateOneBtn } from "../../utils/btns.js";
import { getRuntime } from "../../runtime/groupRuntime.js";
import { GetCharacterById } from "../../utils/chareter/getbyid.js";

const DROP = 100;
const UNDROP = DROP + 40;
const TEST_GROUP_ID = process.env.TEST_GROUP_ID;

export async function contarMensagens(ctx: MyContext) {
  if (!ctx.chat) return;
  const runtime = getRuntime(ctx.chat.id);
  if (!runtime) {
    return;
  }
  const isDev = process.env.NODE_ENV === NODE_ENV.DEVELOPMENT;
  const isTestGroup = TEST_GROUP_ID
    ? ctx.chat.id === Number(TEST_GROUP_ID)
    : false;
  console.log("----", runtime.cont, ctx.from?.first_name, ctx.chat.title);

  const chatId = ctx.chat.id;

  /* =========================
   * CONTADOR EM MEMÓRIA
   * ========================= */
  if (isDev && isTestGroup) {
    runtime.cont < 97 ? 97 : runtime.cont + 1;
  } else {
    runtime.cont += 1;
  }

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

  if (runtime.cont >= DROP && !runtime.dropId && !runtime.characterId) {
    const result = await DropCharacter(ctx);
    if (!result) {
      runtime.cont = DROP - 10;
      return;
    }

    if (result) {
      log("Drop executado com sucesso no chat", chatId);
      const newCont = runtime.cont ?? DROP;
    }

    return;
  }

  /* =========================
   * UNDROP
   * ========================= */

  if (runtime.cont >= UNDROP && runtime.dropId != null) {
    const character = runtime.characterId
      ? await GetCharacterById(ctx.session.settings.genero, runtime.characterId)
      : null;

    const character_genero = ctx.t(
      process.env.TYPE_BOT === ChatType.HUSBANDO
        ? "drop-gender-husbando"
        : "drop-gender-waifu",
    );

    const txt = ctx.t("drop_character_secret_caption", {
      charater_nome: character?.name ?? "??",
      charater_anime: character?.origem ?? "???",
      charater_genero: character_genero,
    });

    try {
      await ctx.api.deleteMessage(ctx.chat.id, runtime.dropId);
      const reply_markup = CreateOneBtn({
        text: ctx.t("drop_character_secret_btn"),
        callback: `click_${character?.id ?? "0"}`,
        style: "primary",
      });
      await Sendmedia({
        ctx,
        caption: txt,
        reply_markup: reply_markup,
      });
      log("undrop com sucesso no chat", chatId);
    } catch (err) {
      error("Erro ao deletar mensagem:", err);
    }

    /* =========================
     * RESET
     * ========================= */
    runtime.cont = 0;
    runtime.dropId = null;
    runtime.characterId = null;
    runtime.data = null;
    delete runtime.lock;
  }
}
