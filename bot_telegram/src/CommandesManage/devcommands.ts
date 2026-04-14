import { CommandGroup } from "@grammyjs/commands";
import { DropCharacter } from "../handlers/listeners/doprar_per.js";
import type { MyContext } from "../utils/customTypes.js";
import { options } from "./botConfigCommands.js";
import {
  createSecureServer,
  emoji_id,
} from "../handlers/Comandos/testes_commands.js";
// import { updbts } from "../testes/utts.js";

const devCommands = new CommandGroup<MyContext>();
async function ForceDrop(ctx: MyContext) {
  console.log("dev");
  console.log(ctx.message?.from.id);
  console.log(process.env.CHAT_ID_DEV);
  if (String(ctx.message?.from.id) === process.env.CHAT_ID_DEV) {
    const result = await DropCharacter(ctx);
    console.log("ForceDrop result:", result);
    if (!result) {
      await ctx.reply("Falha ao dropar character");
    }
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
// devCommands.command(
//   "d",
//   "Start the bot and get a greeting message",
//   updbts,
//   options,
// );

export { devCommands };
