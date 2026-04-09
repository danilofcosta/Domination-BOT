import { CommandGroup } from "@grammyjs/commands";
import { DropCharacter } from "../handlers/listeners/doprar_per.js";
import type { MyContext } from "../utils/customTypes.js";
import { options } from "./conts.js";
import { createSecureServer, emoji_id } from "../handlers/Comandos/testes_commands.js";


const devCommands = new CommandGroup<MyContext>();
function ForceDrop(ctx: MyContext) {
  console.log("dev");
  console.log(ctx.message?.from.id);
  console.log(process.env.CHAT_ID_DEV);
  if (String(ctx.message?.from.id) === process.env.CHAT_ID_DEV) {
    DropCharacter(ctx);
  }
}

devCommands.command(
  "dev",
  "Start the bot and get a greeting message",
  ForceDrop,
  options,
);
devCommands.command(
  "get",
  "Start the bot and get a greeting message",
  emoji_id,
  options,
);

devCommands.command(
  "createuser",
  "Start the bot and get a greeting message",
  createSecureServer,
  options,
);



export { devCommands };
