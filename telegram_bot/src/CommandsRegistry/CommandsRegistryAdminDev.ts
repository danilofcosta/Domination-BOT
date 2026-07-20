import { CommandGroup } from "@grammyjs/commands";
import { DropCharacter } from "../handlers/listeners/doprar_per.js";
import { options } from "./botConfigCommands.js";
import type { MyContext } from "../uteis/CustomTypes.js";
import { leaveGroupHandler } from "../handlers/CallBackQuerys/CallBacksAdminBot/leave_group.js";

const devCommands = new CommandGroup<MyContext>();

const guardDevOnly = async (ctx: MyContext): Promise<boolean> => {
  if (String(ctx.message?.from.id) !== process.env.CHAT_ID_DEV) {
    await ctx.reply(ctx.t("dev-cmd-only"));
    return false;
  }
  return true;
};

async function ForceDrop(ctx: MyContext) {
  const allowed = await guardDevOnly(ctx);
  if (!allowed) return;
  const result = await DropCharacter(ctx);
  if (!result) {
    await ctx.reply(ctx.t("dev-fail-drop"));
  }
}

devCommands.command(
  "dev",
  "Forçar drop de personagem",
  ForceDrop,
  options,
);

devCommands.command(
  "teste",
  "Forçar drop de personagem",
  leaveGroupHandler,
  options,
);



export { devCommands, guardDevOnly };