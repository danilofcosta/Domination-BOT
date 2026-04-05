import { CommandGroup } from "@grammyjs/commands";
import { DropCharacter } from "../handlers/listeners/doprar_per.js";
import type { MyContext } from "../utils/customTypes.js";
import { options } from "./conts.js";


const devCommands = new CommandGroup<MyContext>();
export function ForceDrop(ctx: MyContext) {
  if (ctx.message?.from.id === process.env.CHAT_ID_DEV) {
    DropCharacter(ctx);
  }
}


devCommands.command(
  "start",
  "Start the bot and get a greeting message",
  ForceDrop,
  options,
);


export { devCommands };