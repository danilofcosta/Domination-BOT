import { Composer } from "grammy";
import type { MyContext } from "./utils/customTypes.js";
import { favConfirmHandler } from "./handlers/callbacks/favCallback.js";
import { giftConfirmHandler } from "./handlers/callbacks/giftCallback.js";
import { haremCallback } from "./handlers/callbacks/haremCallback.js";

import { addCharacterCallbackData } from "./handlers/Comandos/admin/add_charecter_callback_data.js";
import { editCharacterCallbackData } from "./handlers/Comandos/admin/edit_character_callbacks.js";
import { topCallbackQuery } from "./handlers/callbacks/topCallbackQuery.js";
import { StatRefresh } from "./handlers/Comandos/globais/status.js";
import { helpCommand } from "./handlers/callbacks/help.js";

const callbacks = new Composer<MyContext>();

callbacks.callbackQuery("close", async (ctx) => {
  try {
    await ctx.deleteMessage();
  } catch {}
  await ctx.answerCallbackQuery();
});

callbacks.callbackQuery(/^fav_/, favConfirmHandler);
callbacks.callbackQuery(/^gift_/, giftConfirmHandler);
callbacks.callbackQuery(/^harem_/, haremCallback);

callbacks.callbackQuery(/^help_/, helpCommand);
callbacks.callbackQuery(/^topuser_/, topCallbackQuery);
callbacks.callbackQuery("stat_refresh", StatRefresh);

//admin
callbacks.callbackQuery(/^addcharacter_/, addCharacterCallbackData);
callbacks.callbackQuery(/^edit_character_/, editCharacterCallbackData);

export { callbacks };
