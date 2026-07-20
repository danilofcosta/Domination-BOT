import { Composer } from "grammy";
import type { MyContext } from "./uteis/CustomTypes.js";
import { error, info } from "./uteis/log.js";
import { TopCallbackQuery } from "./handlers/CallBackQuerys/CallBacksUsers/topCallbackQuery.js";
import { giftCallbackHandler } from "./handlers/CallBackQuerys/CallBacksUsers/giftCallback.js";
import { favCallbackHandler } from "./handlers/CallBackQuerys/CallBacksUsers/favCallback.js";
import { haremCallback } from "./handlers/CallBackQuerys/CallBacksUsers/haremCallback.js";
import { haremmodeCallback } from "./handlers/CallBackQuerys/CallBacksUsers/haremmodeCallback.js";
import { animelistCallback } from "./handlers/Commands/CommandsUser/animelist.js";
import { addCharacterCallbackHandler } from "./handlers/CallBackQuerys/CallBacksAdminBot/addCharacterCallback.js";
import { ShowCharacterCallback } from "./handlers/CallBackQuerys/CallBacksUsers/showchararterCallback.js";
import { leaveGroupCallback } from "./handlers/CallBackQuerys/CallBacksAdminBot/leave_groupCallback.js";

const callbacks = new Composer<MyContext>();

callbacks.callbackQuery(/.*/, async (ctx, next) => {
  const msg = ctx.callbackQuery?.message;
  info("Callback recebido", {
    data: ctx.callbackQuery?.data,
    // fromId: ctx.from?.id,
    // fromName: ctx.from?.first_name || ctx.from?.username,
    // chatId: ctx.chat?.id,
    // chatType: ctx.chat?.type,
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

export { callbacks };
