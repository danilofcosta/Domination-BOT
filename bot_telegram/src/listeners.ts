import { Composer } from "grammy";
import type { MyContext } from "./utils/customTypes.js";
import { contarMensagens } from "./handlers/listeners/contarMensagens.js";
import { haremInlineQuery } from "./handlers/inline_query/harem_inline_query.js";
import { getCharacters, getCharactersall } from "./handlers/inline_query/inline_query.js";
import { getCharacter, setCharacter } from "./cache/cache.js";
import { addCharacter_edit_CallbackData } from "./handlers/Comandos/admin_bot/add_character_edit.js";
import { debug, info } from "./utils/log.js";

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
  const query = ctx.inlineQuery.query || "";
  debug("inline_query", { query, userId: ctx.from?.id });

  if (query.startsWith("harem_user_")) {
    return haremInlineQuery(ctx);
  }

  if (query !== "" && !isNaN(Number(query))) {
    await getCharacters(ctx);
  }
  if (query === "") {
    info("inline_query vazia", { userId: ctx.from?.id });
    await getCharactersall(ctx);
  }

  return;
});

export { listeners };
