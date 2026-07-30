import type { User } from "grammy/types";
import type { MyContext } from "../../uteis/CustomTypes.js";
import { ChatType } from "../../uteis/CustomTypes.js";
import { botNewgroupMember } from "./botNewgroupMember.js";
import { DropCharacter } from "./doprar_per.js";
import { debug, error, info, log } from "../../uteis/log.js";
import { SendMensageCustom } from "../../uteis/sendMensageCustom.js";
import {
  CreateOneBtn,
  
} from "../../uteis/buildButtons/createOneButton.js";
import { getRuntime } from "../../runtime/groupRuntime.js";
import { GetCharacterById } from "../../uteis/extras/GetCharacterById.js";
import { getDropConfig } from "../../cache/dropConfig.js";

export async function CountMessages(ctx: MyContext) {
  debug('mensagem recibida ',ctx.message?.text)
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
  const { dropMsg, undropMsg } = await getDropConfig();
  console.log(dropMsg,runtime.cont,ctx.chat.title)

  if (runtime.cont >= dropMsg && !runtime.dropId && !runtime.characterId) {
    const result = await DropCharacter(ctx);
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
      ? await GetCharacterById(ctx.botType, runtime.characterId)
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
      await SendMensageCustom({ ctx, caption, reply_markup: btn });
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
