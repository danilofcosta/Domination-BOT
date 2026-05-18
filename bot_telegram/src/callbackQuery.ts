import { Composer } from "grammy";
import type { MyContext } from "./utils/customTypes.js";
import { favConfirmHandler } from "./handlers/callbacks/users_callback/favCallback.js";
import { giftConfirmHandler } from "./handlers/callbacks/users_callback/giftCallback.js";
import { haremCallback } from "./handlers/callbacks/users_callback/harem_Callback.js";
import { haremmodeCallback } from "./handlers/callbacks/users_callback/haremmodeCallback.js";

import { topCallbackQuery } from "./handlers/callbacks/users_callback/topCallbackQuery.js";
import { helpCommand } from "./handlers/Comandos/globais/help.js";
import { helpCallback } from "./handlers/callbacks/users_callback/helpCallback.js";
import { addCharacterCallbackData } from "./handlers/Comandos/admin_bot/manager_character/add/add_charecter_callback_data.js";
import { handleEditMenuCallback } from "./handlers/Comandos/admin_bot/manager_character/add/edit-menu-callback.js";
import { ClickByDetail_Callback } from "./handlers/callbacks/users_callback/cickCallback.js";
import { randomCharacterCallback } from "./handlers/callbacks/users_callback/randomCharacterCallback.js";
import { addcolletionCallback } from "./handlers/callbacks/callback_admin_bot/addcolletionCallback.js";
import { SetRarityCallback } from "./handlers/Comandos/admin_bot/configs/set_rarity.js";
import { SetEventCallback } from "./handlers/Comandos/admin_bot/configs/set_event.js";
import { setlangCallback } from "./handlers/callbacks/callback_admin_bot/setlangCallback.js";
import { unbanCallback } from "./handlers/callbacks/callback_admin_bot/unbanCallback.js";
import { error } from "./utils/log.js";

const callbacks = new Composer<MyContext>();

callbacks.callbackQuery("close", async (ctx) => {
  try {
    await ctx.deleteMessage();
  } catch {
    error("erro ao deletar mensagem");
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
callbacks.callbackQuery(/^click_/, ClickByDetail_Callback);
callbacks.callbackQuery(/^random-character-/, randomCharacterCallback);

//admin
callbacks.callbackQuery(/^addcharacter_/, addCharacterCallbackData);
callbacks.callbackQuery(/^edit_character_/, handleEditMenuCallback);
callbacks.callbackQuery(/^addcolletion_/, addcolletionCallback);
callbacks.callbackQuery(/^setrarity_/, SetRarityCallback);
callbacks.callbackQuery(/^setevent_/, SetEventCallback);
callbacks.callbackQuery(/^setlang_/, setlangCallback);
callbacks.callbackQuery(/^maneger_user_unban-(\d+)/, unbanCallback);

export { callbacks };
