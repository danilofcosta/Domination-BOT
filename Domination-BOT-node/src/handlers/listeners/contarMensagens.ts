import type { MyContext } from "../../utils/customTypes.js";
import { ChatType } from "../../utils/types.js";
import { botNewgroupMember } from "./botNewgroupMember.js";
import { dropCharacter } from "./doprar_per.js";
const DROP = 100;
const UNDROP = DROP +40;


export async function contarMensagens(ctx: MyContext) {
  console.log("contando mensagens", ctx.chat?.id, ctx.chat?.type,ctx.chat?.title);
  
  const grupo = ctx.session.grupo;
  if(ctx.chat?.id === -1003772830810) {
    grupo.cont = 99;
  }
  
  if (ctx.message?.new_chat_members) {
    const newMembers = ctx.message.new_chat_members[0];
    if (newMembers?.id === ctx.me.id) {
      return botNewgroupMember(ctx);
    }
  }

  if (ctx.message?.left_chat_member) {
    console.log("bot saiu do grupo");
    return;
  }

  if (!ctx.message || !ctx.chat) return;

  grupo.cont++;

  /* =========================
   * DROP
   * ========================= */
  if (grupo.cont === DROP) {
    const result = await dropCharacter(ctx);
    if (!result) return;


    if (result) {
      grupo.dropId = result.messageId;
      grupo.character = result.character; 
      grupo.data = new Date();
    }

    return;
  }

  /* =========================
   * UNDROP
   * ========================= */
  if (grupo.cont >= UNDROP && grupo.dropId !== null) {
    const character = grupo.character;

    const charater_genero =
      ctx.session.settings.genero === ChatType.HUSBANDO
        ? "o husbando"
        : "a waifu";

    const txt = ctx.t("drop_character_secret_caption", {
      charater_nome: character?.name ?? "???",
      charater_anime: character?.origem ?? "???",
      charater_genero,
    });


    try {
      await ctx.api.deleteMessage(ctx.chat.id, grupo.dropId);
    } catch (err) {
      console.log("Erro ao deletar mensagem:", err);
    }

    await ctx.reply(txt, { parse_mode: "HTML" });

    // reset
    ctx.session.grupo = {
      cont: 0,
      dropId: null,
      character: null,
      data: null,
    };
  }
}
