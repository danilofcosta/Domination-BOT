import type { ReactionType, User } from "grammy/types";
import { ChatType, NODE_ENV, type MyContext } from "../../utils/customTypes.js";
import { botNewgroupMember } from "./botNewgroupMember.js";
import { DropCharacter } from "./doprar_per.js";
import { error, info, log } from "../../utils/log.js";
import { Sendmedia } from "../../utils/sendmedia.js";
import { CreateOneBtn } from "../../utils/btns.js";
import { getRuntime } from "../../runtime/groupRuntime.js";
import { GetCharacterById } from "../../utils/character/get_by_id.js";
import { DROP, UNDROP } from "../../bot/middleware/constants.js";


export async function countMessages(ctx: MyContext) {
  return
  if (!ctx.chat) return;
  const chatId = ctx.chat.id;

  const runtime = getRuntime(chatId);

  if (!runtime) {
    return;
  }
  // incrementa o contador de mensagens
  runtime.cont += 1;
  /* =========================
   * BOT ADICIONADO NO GRUPO
   * ========================= */
  if (ctx.message?.new_chat_members) {
    const newMembers: User[] = ctx.message.new_chat_members;
    // Verifica se o bot foi adicionado ao grupo
    if (newMembers.some((member) => member.id === ctx.me.id)) {
      return botNewgroupMember(ctx);
    }
  }


// Reage a mensagens que contenham o comando "/dominar" pq  sla 
  if (ctx.message?.text && ctx.message.text.includes("/dominar")) {
    try {
      const reaction = [
        "💘",
        "😍",
        "🥰",
        "😘",
        "😻",
        "💕",
        "💖",
        "💗",
        "💓",
        "💝",
      ] as unknown as ReactionType[];

      const randomReaction = reaction[Math.floor(Math.random() * reaction.length)] as ReactionType;


      await ctx.react(randomReaction);
    } catch (err) {
      error("Erro ao reagir à mensagem:", err);
    }}




  /* =========================
   * DROP
   * ========================= */

  if (runtime.cont >= DROP && !runtime.dropId && !runtime.characterId) {
    const result = await DropCharacter(ctx);

    // Se o resultado for falso, significa que o drop não foi executado (por exemplo, por falta de personagens disponíveis), então ajustamos o contador para tentar novamente em breve, evitando que o drop seja tentado a cada mensagem.
    if (!result) {
      runtime.cont = DROP - 10;
      return;
    }

    if (result) {
      log("Drop executado com sucesso no chat", chatId);
     // const newCont = runtime.cont ?? DROP;
         return;
    }

    return;
  }

  /* =========================
   * UNDROP
   * ========================= */

  if (runtime.cont >= UNDROP && runtime.dropId != null) {
   
    const character = runtime.characterId
      ? await GetCharacterById(ctx.botType, runtime.characterId)
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
