import { CommandGroup } from "@grammyjs/commands";
import { HaremHandler } from "../handlers/Comandos/users/harem.js";
import type { MyContext } from "../utils/customTypes.js";
import { typeBot } from "./botConfigCommands.js";



const customCommands = new CommandGroup<MyContext>();

customCommands.command(
  typeBot === 'waifu' ? 'harem' : 'haremh',
  "Comando harem",
  (ctx) => HaremHandler(ctx),{
  }
);

//nao funciona essa bagaça
export { customCommands };