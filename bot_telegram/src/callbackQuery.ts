import { Composer } from "grammy";
import type { MyContext } from "./utils/customTypes.js";
import { favConfirmHandler } from "./handlers/callbacks/favCallback.js";
import { giftConfirmHandler } from "./handlers/callbacks/giftCallback.js";
import { haremCallback } from "./handlers/callbacks/haremCallback.js";
import { Help } from "./handlers/callbacks/help.js";
import { addCharacterCallbackData } from "./handlers/Comandos/admin/add_charecter_callback_data.js";
import { editCharacterCallbackData } from "./handlers/Comandos/admin/edit_character_callbacks.js";
import { topCallbackQuery } from "./handlers/callbacks/topCallbackQuery.js";

const callbacks = new Composer<MyContext>();

callbacks.callbackQuery(/^fav_/, favConfirmHandler);
callbacks.callbackQuery(/^gift_/, giftConfirmHandler);
callbacks.callbackQuery(/^harem_/, haremCallback);
callbacks.callbackQuery(/^help_/, Help);
callbacks.callbackQuery(/^topuser_/, topCallbackQuery);


//admin
callbacks.callbackQuery(/^addcharacter_/, addCharacterCallbackData);
callbacks.callbackQuery(/^edit_character_/, editCharacterCallbackData);

export { callbacks };
