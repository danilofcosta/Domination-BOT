import { Composer } from "grammy";
import type { MyContext } from "./uteis/CustomTypes.js";
import { debug, error, info } from "./uteis/log.js";
import { TopCallbackQuery } from "./handlers/CallBackQuerys/CallBacksUsers/topCallbackQuery.js";
import { giftCallbackHandler } from "./handlers/CallBackQuerys/CallBacksUsers/giftCallback.js";
import { favCallbackHandler } from "./handlers/CallBackQuerys/CallBacksUsers/favCallback.js";
import { haremCallback } from "./handlers/CallBackQuerys/CallBacksUsers/haremCallback.js";
import { haremmodeCallback } from "./handlers/CallBackQuerys/CallBacksUsers/haremmodeCallback.js";
import { animelistCallback } from "./handlers/Commands/CommandsUser/animelist.js";
import { addCharacterCallbackHandler } from "./handlers/CallBackQuerys/CallBacksAdminBot/addCharacterCallback.js";
import { ShowCharacterCallback } from "./handlers/CallBackQuerys/CallBacksUsers/showchararterCallback.js";
import { leaveGroupCallback } from "./handlers/CallBackQuerys/CallBacksAdminBot/leave_group/leave_groupCallback.js";
import { leaveGroupFromBotHandler } from "./handlers/CallBackQuerys/CallBacksAdminBot/leave_group/leave_group.js";
import { banUserCallback } from "./handlers/CallBackQuerys/CallBacksAdminBot/ban_user/banUserCallback.js";
import { cleanCollectionCallback } from "./handlers/CallBackQuerys/CallBacksAdminBot/clean_collection/cleanCollectionCallback.js";
import { upadminCallback } from "./handlers/CallBackQuerys/CallBacksAdminBot/upadmin/upadminCallback.js";
import { unbanCallback } from "./handlers/CallBackQuerys/CallBacksAdminBot/unban/unbanCallback.js";
import { unadminCallback } from "./handlers/CallBackQuerys/CallBacksAdminBot/unadmin/unadminCallback.js";
import { startCallback } from "./handlers/CallBackQuerys/CallBacksGlobais/startCallback.js";
import {
  guiaCategoryCallback,
  guiaBackStart,
} from "./handlers/CallBackQuerys/CallBacksGlobais/guiaHandler.js";
import { TradeCallbackQuery } from "./handlers/CallBackQuerys/CallBacksUsers/tradeCallback.js";

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
callbacks.callbackQuery(/^haremmode_/, haremmodeCallback);
callbacks.callbackQuery(/^harem_/, haremCallback);
callbacks.callbackQuery(/^topuser_/, TopCallbackQuery);
callbacks.callbackQuery(/^al_/, animelistCallback);
callbacks.callbackQuery(/^add-/, addCharacterCallbackHandler);
callbacks.callbackQuery(/^ShowCharacterCallback_/, ShowCharacterCallback);
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
callbacks.callbackQuery(/^trade_/, TradeCallbackQuery);

export { callbacks };
