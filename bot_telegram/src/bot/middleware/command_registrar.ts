import type { Bot } from "grammy";
import type { MyContext } from "../../utils/customTypes.js";
import { privateCommands } from "../../commands/private.js";
import { UserCommands } from "../../commands/User.js";
import { adminGroupsCommands } from "../../commands/admin_groups.js";
import { devCommands } from "../../commands/devcommands.js";
import { adminCommands_bot } from "../../commands/adminCommands_bot.js";
import { warn } from "../../utils/log.js";

const COMMAND_GROUPS = [
  { name: "private", group: privateCommands },
  { name: "user", group: UserCommands },
  { name: "adminGroups", group: adminGroupsCommands },
  { name: "dev", group: devCommands },
  { name: "adminBot", group: adminCommands_bot },
] as const;
export async function registerCommands(bot: Bot<MyContext>) {
  console.log('registerCommands')
  try {
    await bot.api.deleteMyCommands();
    for (const { group } of COMMAND_GROUPS) {
      await group.setCommands(bot);
    }
    const groupCmds = await bot.api.getMyCommands({
      scope: { type: "all_group_chats" },
    });
    const privateCmds = await bot.api.getMyCommands({
      scope: { type: "all_private_chats" },
    });
    const admCmds = await bot.api.getMyCommands({
      scope: { type: "all_chat_administrators" },
    });
    console.log("📋 GRUPO:", JSON.stringify(groupCmds));
    console.log("📋 PRIVADO:", JSON.stringify(privateCmds));
    console.log("📋 ADM:", JSON.stringify(admCmds));
  } catch (e: any) {
    if (e.error_code === 429) {
      const wait = e.parameters?.retry_after ?? 60;
      console.log(`Rate limit atingido. Aguardando ${wait}s...`);
      await new Promise((res) => setTimeout(res, wait * 1000));
      for (const { group } of COMMAND_GROUPS) {
        await group.setCommands(bot);
      }
    } else {
      warn("Erro ao configurar comandos:", e);
    }
  }
}
