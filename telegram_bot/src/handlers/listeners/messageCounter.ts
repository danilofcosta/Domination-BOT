import type { User } from "grammy/types";
import type { MyContext } from "../../utils/customTypes.js";
import { ChatType } from "../../utils/customTypes.js";
import { botNewgroupMember } from "./botNewGroupMember.js";
import { dropCharacter } from "./dropCharacter.js";
import { debug, error, info, log } from "../../utils/log.js";
import { sendMessageCustom } from "../../utils/sendMessageCustom.js";
import {
  CreateOneBtn,
  
} from "../../utils/buildButtons/createOneButton.js";
import { getRuntime } from "../../runtime/groupRuntime.js";
import { getCharacterById } from "../../utils/extras/getCharacterById.js";
import { getDropConfig } from "../../cache/dropConfig.js";
import { getGroupConfig } from "../../cache/groupConfig.js";

export async function countMessages(ctx: MyContext) {
  debug('mensagem recibida ',ctx.message?.text ,{ group:ctx.chat?.title?? ctx.from?.first_name,user:ctx.from?.first_name,id:ctx.from?.id})
  if (!ctx.chat) return;

  const chatId = ctx.chat.id;
  const runtime = getRuntime(chatId);

  // runtime.cont += 1;

  /* ── Bot added to group ── */
  if (ctx.message?.new_chat_members) {
    const newMembers = ctx.message.new_chat_members as User[];
    if (newMembers.some((m) => m.id === ctx.me.id)) {
      return botNewgroupMember(ctx);
    }
  }

  /* ── React to /dominar ── */
  if (ctx.message?.text?.includes("/dominar")) {
    try {
      const reactions = [
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
      ];
      await ctx.react(
        reactions[Math.floor(Math.random() * reactions.length)] as any,
      );
    } catch (err) {
      debug("Erro ao reagir à mensagem (não crítico):", err);
    }
  }

  /* ── DROP ── */
  const globalDrop = await getDropConfig();
  const groupConfig = await getGroupConfig(chatId, ctx.botType);
  const dropsEnabled = groupConfig.dropsEnabled ?? true;
  const dropMsg = Math.max(groupConfig.dropMsg ?? globalDrop.dropMsg, 100);
  const undropMsg = globalDrop.undropMsg;
  console.log(dropMsg,runtime.cont,ctx.chat.title)

  if (!dropsEnabled) {
    runtime.cont = 0;
    return;
  }

  if (runtime.cont >= dropMsg && !runtime.dropId && !runtime.characterId) {
    const result = await dropCharacter(ctx);
    if (!result) {
      runtime.cont = dropMsg - 10;
      return;
    }
    if (result) {
      log("Drop executado com sucesso no chat", chatId);
      return;
    }
    return;
  }

  /* ── UNDROP ── */
  if (runtime.cont >= undropMsg && runtime.dropId != null) {
    const character = runtime.characterId
      ? await getCharacterById(ctx.botType, runtime.characterId)
      : null;

    const generoText = ctx.t(
      ctx.botType === ChatType.HUSBANDO
        ? "drop-gender-husbando"
        : "drop-gender-waifu",
    );

    const caption = ctx.t("drop_character_secret_caption", {
      charater_nome: character?.name ?? "??",
      charater_anime: character?.origem ?? "???",
      charater_genero: generoText,
    });

    try {
      await ctx.api.deleteMessage(ctx.chat.id, runtime.dropId);
      const btn = CreateOneBtn({
        text: ctx.t("drop_character_secret_btn"),
        callback: `click_${character?.id ?? "0"}`,
        style: "primary",
      });
      await sendMessageCustom({ ctx, caption, reply_markup: btn });
      log("undrop com sucesso no chat", chatId);
    } catch (err) {
      error("Erro ao deletar mensagem:", err);
    }

    runtime.cont = 0;
    runtime.dropId = null;
    runtime.characterId = null;
    runtime.data = null;
    delete runtime.lock;
  }

// 

  runtime.cont ++
}
