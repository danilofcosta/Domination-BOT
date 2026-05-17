import { InlineKeyboard, Keyboard } from "grammy";
import { getHarem } from "../../../cache/cache.js";
import type { MyContext } from "../../../utils/customTypes.js";
import { info, warn, error, debug } from "../../../utils/log.js";
import {  Harem_setup_dict } from "./harem_setup/build.js";
import { Build_btn_harem, Build_btn_Keyboard } from "../../../utils/btns.js";
// recebe s chamadas do bts do harem via callback
//   camada experada : prefixo ,prefixo2 , id do user , ação , extras 
// harem_user_000000_close
// harem_user_000000_pagenext_2


export async function haremCallback(ctx: MyContext) {
  const match = ctx.match as any;
  const parts =
    (typeof match === "string" ? match : match?.input)?.split("_") ?? [];
  const [tag, userTag, userid, action, pageRaw, jumpRaw] = parts;

  const userId = Number(userid);
// autentição dono do hare
  if (ctx.from?.id !== userId) {
    warn(`haremCallback - usuário não autorizado`, {
      expected: userId,
      actual: ctx.from?.id,
    });
    await ctx.answerCallbackQuery(ctx.t("error-action-not-authorized-by-id"));
    return;
  }


// tenta deleta a mensagem
  if (action === "close") {
    await ctx.deleteMessage().catch(() => {});
    return;
  }


  if (action === "opensetup") {
    // abre os btns no lugar fo teclado do user 
    
    const keyboard = Build_btn_Keyboard(
      Harem_setup_dict.main
    );

    return await ctx.reply("Escolha uma opção:", {
      reply_markup: keyboard,
    });
  }
  
  // busca paginas salva em cache
  const harem = await getHarem(userId);
  
  if (!harem) {
    warn(`haremCallback - harém não encontrado no cache`, { userId });
    return;
  }

  const total = harem.length;
  let page = Number(pageRaw ?? 0);

  if (isNaN(page)) return;

  let jump = Number(jumpRaw ?? 2);
  if (isNaN(jump)) jump = 2;

  if (action === "prev") page--;
  if (action === "next") page++;
  if (action === "jump") page += jump;
  if (action === "page") page = 0;

  if (page < 0) page = 0;
  if (page >= total) page = total - 1;

  const nextJump = jump * 2;

  debug(`haremCallback - navegando harém`, { userId, page, action });
  const keyboard = Build_btn_harem({
    ctx: ctx,
    current_page: page,
    total_page: total,
    userId: userId,
    nextJump: nextJump,
  });

  try {
    await ctx.editMessageCaption({
      caption: harem[page],
      reply_markup: keyboard,
      parse_mode: "HTML",
    });
  } catch (e) {
      error(`haremCallback - erro ao editar caption`, e);
  }

  await ctx.answerCallbackQuery();
}

