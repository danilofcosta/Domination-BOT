import { Composer } from "grammy";
import type { MyContext } from "./utils/customTypes.js";
import { debug, error, info } from "./utils/log.js";
import { topCallback } from "./handlers/CallbackQueries/CallbacksUsers/topCallback.js";
import { giftCallbackHandler } from "./handlers/CallbackQueries/CallbacksUsers/giftCallback.js";
import { favCallbackHandler } from "./handlers/CallbackQueries/CallbacksUsers/favCallback.js";
import { haremCallback } from "./handlers/CallbackQueries/CallbacksUsers/haremCallback.js";
import { haremModeCallback } from "./handlers/CallbackQueries/CallbacksUsers/haremModeCallback.js";
import { animelistCallback } from "./handlers/Commands/CommandsUser/animelist.js";
import { addCharacterCallbackHandler } from "./handlers/CallbackQueries/CallbacksAdminBot/addCharacterCallback.js";
import { showCharacterCallback } from "./handlers/CallbackQueries/CallbacksUsers/showCharacterCallback.js";
import { leaveGroupCallback } from "./handlers/CallbackQueries/CallbacksAdminBot/leaveGroup/leaveGroupCallback.js";
import { leaveGroupFromBotHandler } from "./handlers/CallbackQueries/CallbacksAdminBot/leaveGroup/leaveGroup.js";
import { banUserCallback } from "./handlers/CallbackQueries/CallbacksAdminBot/banUser/banUserCallback.js";
import { cleanCollectionCallback } from "./handlers/CallbackQueries/CallbacksAdminBot/cleanCollection/cleanCollectionCallback.js";
import { upadminCallback } from "./handlers/CallbackQueries/CallbacksAdminBot/upadmin/upadminCallback.js";
import { unbanCallback } from "./handlers/CallbackQueries/CallbacksAdminBot/unban/unbanCallback.js";
import { unadminCallback } from "./handlers/CallbackQueries/CallbacksAdminBot/unadmin/unadminCallback.js";
import { startCallback } from "./handlers/CallbackQueries/CallbacksGlobal/startCallback.js";
import {
  guiaCategoryCallback,
  guiaBackStart,
} from "./handlers/CallbackQueries/CallbacksGlobal/guiaHandler.js";
import { tradeCallback } from "./handlers/CallbackQueries/CallbacksUsers/tradeCallback.js";
import { voteCallbackHandler } from "./handlers/CallbackQueries/CallbacksUsers/voteCallback.js";
import { configCallbackHandler } from "./handlers/CallbackQueries/CallbacksAdminBot/configCallback.js";

const callbacks = new Composer<MyContext>();

callbacks.callbackQuery(/.*/, async (ctx, next) => {
  const msg = ctx.callbackQuery?.message;
  debug("Callback recebido", {
    data: ctx.callbackQuery?.data,
    fromId: ctx.from?.id,
     fromName: ctx.from?.first_name || ctx.from?.username,
     chatId: ctx.chat?.id,
    hatType: ctx.chat?.type,
    // msgText: msg && ("text" in msg ? msg.text : "caption" in msg ? msg.caption : null),
  });
  await next();
});

callbacks.callbackQuery("close", async (ctx) => {
  try {
    await ctx.deleteMessage();
  } catch {
    error("erro ao deletar mensagem");
  }
  await ctx.answerCallbackQuery();
});

callbacks.callbackQuery(/^gift_/, giftCallbackHandler);
callbacks.callbackQuery(/^fav_/, favCallbackHandler);
callbacks.callbackQuery(/^haremmode_/, haremModeCallback);
callbacks.callbackQuery(/^harem_/, haremCallback);
callbacks.callbackQuery(/^topuser_/, topCallback);
callbacks.callbackQuery(/^al_/, animelistCallback);
callbacks.callbackQuery(/^add-/, addCharacterCallbackHandler);
callbacks.callbackQuery(/^ShowCharacterCallback_/, showCharacterCallback);
callbacks.callbackQuery(/^bot_leave_/, leaveGroupCallback);
callbacks.callbackQuery(/^ban_/, banUserCallback);
callbacks.callbackQuery(/^clean_/, cleanCollectionCallback);
callbacks.callbackQuery(/^upadmin_/, upadminCallback);
callbacks.callbackQuery(/^unban_/, unbanCallback);
callbacks.callbackQuery(/^unadmin_/, unadminCallback);
callbacks.callbackQuery(/^start_/, startCallback);
callbacks.callbackQuery(/^guia_cat_/, guiaCategoryCallback);
callbacks.callbackQuery(/^guia_back_start/, guiaBackStart);
callbacks.callbackQuery(/^leave_group_/, leaveGroupFromBotHandler);
callbacks.callbackQuery(/^trade_/, tradeCallback);
callbacks.callbackQuery(/^random-character-/, voteCallbackHandler);
callbacks.callbackQuery(/^config_/, configCallbackHandler);

export { callbacks };
