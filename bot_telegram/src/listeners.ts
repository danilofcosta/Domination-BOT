import { Composer } from "grammy";
import type { MyContext } from "./utils/customTypes.js";
import { contarMensagens } from "./handlers/listeners/contarMensagens.js";
import { haremInlineQuery } from "./handlers/inline_query/harem_inline_query.js";
import { getCharacters, getCharactersall } from "./handlers/inline_query/inline_query.js";
import { getCharacter, setCharacter } from "./cache/cache.js";
import { addCharacter_edit_CallbackData } from "./handlers/Comandos/admin/add_character_edit.js";
import { UploadMediaHandler, UploadMediaMiddleware } from "./handlers/Comandos/admin/upload_media_handler.js";
import { botPrefix } from "./CommandesManage/botConfigCommands.js";

const listeners = new Composer<MyContext>();

listeners.on("message:text", async (ctx, next) => {
  if (ctx.session.adminSetup?.action && ctx.session.adminSetup?.targetId) {
    const action = ctx.session.adminSetup.action;
    const targetId = Number(ctx.session.adminSetup.targetId);
    const text = ctx.message.text;
    
    let character = getCharacter(targetId);
    if (!character) {
      ctx.session.adminSetup = { action: null, targetId: null };
      return;
    }

    if (action === "edit_nome") {
      character.nome = text;
    } else if (action === "edit_anime") {
      character.anime = text;
    }

    setCharacter(targetId, character);
    ctx.session.adminSetup = { action: null, targetId: null };

    await addCharacter_edit_CallbackData(ctx, String(targetId));
    return;
  }
  return next();
});

listeners.chatType(["group", "supergroup"]).on("message", contarMensagens);




listeners.on("inline_query", async (ctx) => {
  console.log("inline query:", ctx.inlineQuery?.query);
  const query = ctx.inlineQuery.query || "";

  if (query.startsWith("harem_user_")) {
    return haremInlineQuery(ctx);
  }

  if (query !== "" && !isNaN(Number(query))) {
  await  getCharacters(ctx);
  }
  if (query === "") {
    console.log("consuta vazia");
     await  getCharactersall(ctx);
  }

  return;
});

// listeners.chatType("private")
// .on("my_chat_member", myPrivateChatMemberHandler); //

// listeners.filter((ctx) => {
//   const msg = ctx.message;
//   if (!msg) return false;
//   const caption = msg.caption || "";
//   const regex1 = new RegExp(`^[/!]${botPrefix}up[wWhH]?\\s*`, "i");
//   const regex2 = new RegExp(`^[/!]up[wWhH]?\\s*`, "i");
//   const matches = regex1.test(caption) || regex2.test(caption);
//   console.log("[Upload Filter] Prefixo:", botPrefix, "| Caption:", caption, "| Corresponde:", matches);
//   return matches;
// }).on("message", UploadMediaMiddleware, UploadMediaHandler);

export { listeners };
