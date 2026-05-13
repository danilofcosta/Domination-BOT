import { CommandGroup } from "@grammyjs/commands";
import { HaremHandler } from "../handlers/Comandos/users/harem.js";
import type { MyContext } from "../utils/customTypes.js";
import { typeBot } from "./botConfigCommands.js";



const customCommands = new CommandGroup<MyContext>();

// Alias do comando harem (só aparece no privado)
customCommands
  .command(
    typeBot === 'waifu' ? 'harem' : 'haremh',
    "Mostra o seu Harem (atalho)",
  )
  .addToScope({ type: "all_private_chats" }, async (ctx: MyContext) => {
    await HaremHandler(ctx);
  });

export { customCommands };