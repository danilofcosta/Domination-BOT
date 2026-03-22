import { CommandGroup } from "@grammyjs/commands";
import type { MyContext } from "./utils/customTypes.js";

// // Handlers
import { start } from "./handlers/Comandos/globais/start.js";
 import { CapturarCharacter } from "./handlers/Comandos/users/dominar.js";
 import { giftHandler } from "./handlers/Comandos/users/gift.js";
import { topHandler } from "./handlers/Comandos/users/top.js";
import { Myinfos } from "./handlers/Comandos/users/myinfos.js";
import { favCharacter } from "./handlers/Comandos/users/fav.js";
import { HaremHandler } from "./handlers/Comandos/users/harem.js";
 import { AddCharacterHandler } from "./handlers/Comandos/admin/add_charecter.js";
import { add_evento, emoji_id, teste, testeemoj } from "./handlers/Comandos/globais/teste.js";
import { Ramdon_Character } from "./handlers/Comandos/globais/random_character.js";


import { setLinkWebHandler } from "./handlers/Comandos/admin/set_linkweb.js";

const botPrefix = process.env.TYPE_BOT?.charAt(0) ?? "";
const typeBot = process.env.TYPE_BOT;
const prefixs ='./!'
const options = { ignoreCase: true , prefixs : prefixs };

const tagbotCommands = new CommandGroup<MyContext>();



// // comandos gerais
 tagbotCommands.command("dominar", "Dominate a character", CapturarCharacter, options);
tagbotCommands.command("teste", "Test the bot", teste);

tagbotCommands.command("start", "Start the bot and get a greeting message", start , options);
tagbotCommands.command(typeBot || "random", "Start the bot and get a greeting message", Ramdon_Character , options);

// // comandos com prefixo do bot
tagbotCommands.command(`${botPrefix}gift`, "Gift a character to another user", giftHandler , options);
tagbotCommands.command(`${botPrefix}top`, "Show the top players", topHandler   , options);
tagbotCommands.command(`${botPrefix}info`, "Show your information", Myinfos , options);
tagbotCommands.command(`${botPrefix}fav`, "Show your favorite character", favCharacter  , options);

// // Harem

tagbotCommands.command(
  `my${typeBot}s`,
  "Get information about the Harem feature",
  HaremHandler,
  options
);


// // comando admis 
const adminCommands = new CommandGroup<MyContext>(); // adicionar  verificação admin
// adminCommands.command(`${botPrefix}add`, "Add a character to the database", AddCharacter);
adminCommands.command(`addchar`, "Add a character to the database (admin)", AddCharacterHandler);
// adminCommands.command(`setlink`, "Set a temporary web link for a character (admin)", setLinkWebHandler);

const devCommands = new CommandGroup<MyContext>();
devCommands.command("teste", "Test the bot", teste);
devCommands.command("emojiid", "Test the bot", emoji_id);
devCommands.command("add_evento", "Test the bot", add_evento);
devCommands.command("testeemoj", "Test the bot", testeemoj);

// // devCommands.command("broadcast", "Broadcast a message to all groups and users", broadcastHandler);

export { tagbotCommands, devCommands, adminCommands };
