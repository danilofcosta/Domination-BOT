import { CommandGroup } from "@grammyjs/commands";
import { ChatType, type MyContext } from "../utils/customTypes.js";
import { verbose } from "../utils/log.js";
import type { ProfileType } from "../../generated/prisma/enums.js";
//botPrefix [waifu , husbando]  
const botPrefix = process.env.TYPE_BOT?.charAt(0)?.toLowerCase() ?? "";
const typeBot = process.env.TYPE_BOT ? process.env.TYPE_BOT.toLowerCase() : process.env.TYPE_BOT;
const prefixs = "./!";
const options = { ignoreCase: true, prefixs };
type ScopeType = "all_group_chats" | "all_private_chats" | "all_chat_administrators";

export enum category_user {
  Main = "principais user",
  Collection = "collection",
  EconomyTrade = "economia & Troca",
  InfoPersonalization = "info & Personalização",
  Hidden = "ocultos publicos",
}
export enum category_admin_group {
  main = "principais admin group",
}
export enum category_admin_bot {
  main = "principais admin bot",
  Characters = "personagens",
  Admins = "administradores"
}


export type CommandConfig = {
  command: string;
  commandPrivate?: string;
  commandPrivateInChat?: boolean
  commandInChat?: boolean
minPermission?: ProfileType
  other_commands?: [string]
  category_user?: category_user
  category_admin_group?: category_admin_group
  category_admin_bot?: category_admin_bot

  description: {
    pt: string;
    en: string;
  };
  handler: (ctx: MyContext) => Promise<any> | any;
 // scopes: ScopeType[];
};

export function registerCommand(
  registry: CommandGroup<MyContext>,
CommandsRegistryDict: CommandConfig
) {
  verbose('registrando comando', CommandsRegistryDict.command)

  if (CommandsRegistryDict.commandInChat || CommandsRegistryDict.commandInChat === undefined) {
    const publicCmd = registry.command(CommandsRegistryDict.command, CommandsRegistryDict.description.pt, CommandsRegistryDict.handler, options);
    publicCmd.addToScope({ type: 'all_chat_administrators' }, CommandsRegistryDict.handler);
  }

  if (CommandsRegistryDict.commandPrivate) {
    const privateCmd = registry.command(CommandsRegistryDict.commandPrivate, CommandsRegistryDict.description.pt, CommandsRegistryDict.handler, options);
    privateCmd.addToScope({ type: 'all_private_chats' }, CommandsRegistryDict.handler);
  }


  // if (CommandsRegistryDict.minPermission && process.env.GROUP_ADM) {
  //      const publicCmd = registry.command(CommandsRegistryDict.command, CommandsRegistryDict.description.pt, CommandsRegistryDict.handler, options);
  //   publicCmd.addToScope({ type: "chat_administrators",
  //   chat_id: process.env.GROUP_ADM ||0 }, CommandsRegistryDict.handler);
  // }
}


export function isWaifuBotCheck(): boolean {
  verbose("checando tipo de bot fun isWaifuBotCheck()", typeBot?.toLowerCase());

  if (typeBot?.toLowerCase() === ChatType.WAIFU) {
    return true;
  }

  if (typeBot?.toLowerCase() === ChatType.HUSBANDO) {
    return false;
  }

  return false;
}
export { botPrefix, typeBot, prefixs, options };