import { CommandGroup } from "@grammyjs/commands";
import { dropCharacter } from "../handlers/listeners/dropCharacter.js";
import { options } from "./botConfigCommands.js";
import type { MyContext } from "../utils/customTypes.js";
import { leaveGroupHandler } from "../handlers/CallbackQueries/CallbacksAdminBot/leaveGroup/leaveGroup.js";
import { botNewgroupMember } from "../handlers/listeners/botNewGroupMember.js";

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
  const result = await dropCharacter(ctx);
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
  botNewgroupMember,
  options,
);



export { devCommands, guardDevOnly };