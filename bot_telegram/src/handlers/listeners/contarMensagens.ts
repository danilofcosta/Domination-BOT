import { ChatType, NODE_ENV, type MyContext } from "../../utils/customTypes.js";
import { botNewgroupMember } from "./botNewgroupMember.js";
import { DropCharacter } from "./doprar_per.js";

const DROP = 100;
const UNDROP = DROP + 40;
const TEST_GROUP_ID = process.env.TEST_GROUP_ID;

export async function contarMensagens(ctx: MyContext) {
  if (!ctx.chat) return;

  const grupo = ctx.session.grupo;
  if (!grupo) {
    return console.log("Grupo não encontrado");
  }
  const isDev = process.env.NODE_ENV === NODE_ENV.DEVELOPMENT;
  const isTestGroup = TEST_GROUP_ID
    ? ctx.chat.id === Number(TEST_GROUP_ID)
    : false;

  /* =========================
   * CONTADOR
   * ========================= */
  if (isDev && isTestGroup) {
    grupo.cont = 100; // modo teste
  } else {
    grupo.cont = (grupo.cont ?? 0) + 1;
  }

  console.log(
    "msg",ctx.session.settings.genero
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
    const newMember = ctx.message.new_chat_members[0];
    if (newMember?.id === ctx.me.id) {
      return botNewgroupMember(ctx);
    }
  }

  /* =========================
   * DROP
   * ========================= */
  if (grupo.cont >= DROP && !grupo.dropId) {
    const result = await DropCharacter(ctx);
    if (!result) {
      // caso não retorna a mensagem
      grupo.cont = DROP - 10;
      return;
    }

    if (result) {
      console.log("dopre com sucesso");
    }

    return;
  }

  /* =========================
   * UNDROP
   * ========================= */
  if (grupo.cont >= UNDROP && grupo.dropId != null) {
    const character = grupo.character;

    const character_genero =
      ctx.session.settings.genero === ChatType.HUSBANDO
        ? "o husbando"
        : "a waifu";

    const txt = ctx.t("drop_character_secret_caption", {
      charater_nome: character?.name ?? "???",
      charater_anime: character?.origem ?? "???",
      charater_genero: character_genero,
    });

    try {
      await ctx.api.deleteMessage(ctx.chat.id, grupo.dropId);
    } catch (err) {
      console.log("Erro ao deletar mensagem:", err);
    }

    await ctx.reply(txt, { parse_mode: "HTML" });

    /* =========================
     * RESET
     * ========================= */
    ctx.session.grupo = {
      cont: 0,
      dropId: null,
      character: null,
      data: null,
      title: ctx.chat.title || "-",
    };
  }
}
