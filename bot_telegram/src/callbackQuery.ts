import { Composer } from "grammy";
import type { MyContext } from "./utils/customTypes.js";
import { favConfirmHandler } from "./handlers/callbacks/users_callback/favCallback.js";
import { giftConfirmHandler } from "./handlers/callbacks/users_callback/giftCallback.js";
import { haremCallback } from "./handlers/callbacks/users_callback/haremCallback.js";
import { haremmodeCallback } from "./handlers/callbacks/users_callback/haremmodeCallback.js";

import { topCallbackQuery } from "./handlers/callbacks/users_callback/topCallbackQuery.js";
import { StatRefresh } from "./handlers/Comandos/globais/status.js";
import { helpCommand } from "./handlers/Comandos/globais/help.js";
import { helpCallback } from "./handlers/callbacks/users_callback/helpCallback.js";
import { addCharacterCallbackData } from "./handlers/Comandos/admin_bot/manager_character/add/add_charecter_callback_data.js";
import { editCharacterCallbackData } from "./handlers/Comandos/admin_bot/off/edit_character_callbacks.js";
import { ClickByDetail_Callback } from "./handlers/callbacks/users_callback/cickCallback.js";
import { addcolletionCallback } from "./handlers/callbacks/callback_admin_bot/addcolletionCallback.js";
import { SetRarityCallback } from "./handlers/Comandos/admin_bot/configs/set_rarity.js";
import { SetEventCallback } from "./handlers/Comandos/admin_bot/configs/set_event.js";
import { error } from "./utils/log.js";

const callbacks = new Composer<MyContext>();

callbacks.callbackQuery("close", async (ctx) => {
  try {
    await ctx.deleteMessage();
  } catch {
    error('erro ao deletar mensagem')
  }
  await ctx.answerCallbackQuery();
});

callbacks.callbackQuery(/^fav_/, favConfirmHandler);
callbacks.callbackQuery(/^gift_/, giftConfirmHandler);
callbacks.callbackQuery(/^harem_/, haremCallback);
callbacks.callbackQuery(/^haremmode_/, haremmodeCallback);

callbacks.callbackQuery(/^start_help_/, helpCommand);
callbacks.callbackQuery(/^help_/, helpCallback);
callbacks.callbackQuery(/^topuser_/, topCallbackQuery);
callbacks.callbackQuery("stat_refresh", StatRefresh);
callbacks.callbackQuery(/^click_/, ClickByDetail_Callback);

//admin
callbacks.callbackQuery(/^addcharacter_/, addCharacterCallbackData);
callbacks.callbackQuery(/^edit_character_/, editCharacterCallbackData);
callbacks.callbackQuery(/^addcolletion_/, addcolletionCallback);
callbacks.callbackQuery(/^setrarity_/, SetRarityCallback);
callbacks.callbackQuery(/^setevent_/, SetEventCallback);

export { callbacks };