import { CommandGroup, LanguageCodes } from "@grammyjs/commands";
import type { MyContext } from "../utils/customTypes.js";
import { setChatTopicHandler } from "../handlers/Comandos/admin_groups/set_chat_topic.js";
import { botPrefix, options } from "./botConfigCommands.js";
import { debug } from "../utils/log.js";

const adminGroupsCommands = new CommandGroup<MyContext>();

adminGroupsCommands
  .command(`setchattopic${botPrefix}`, "Define the topic for drop messages", options)
  .addToScope({ type: "all_group_chats" }, async (ctx: MyContext) => {
    debug("Comando adminGroups setchattopic executado por", ctx.from?.username || ctx.from?.id);
    await setChatTopicHandler(ctx);
  })
  .localize(LanguageCodes.Spanish, `setchattopic${botPrefix}`, "Define o topic para mensagens de drop")
  .localize(LanguageCodes.Portuguese, `setchattopic${botPrefix}`, "Define o topic para mensagens de drop");

export { adminGroupsCommands };
