import { CommandGroup } from "@grammyjs/commands";
import { ChatType, type MyContext } from "../utils/customTypes.js";
import { debug } from "../utils/log.js";

const botPrefix =
  process.env.TYPE_BOT?.charAt(0)?.toLowerCase() ?? "";
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
  other_commands?: [string]
  category_user?: category_user
  category_admin_group?: category_admin_group
  category_admin_bot?: category_admin_bot

  description: {
    pt: string;
    en: string;
  };
  handler: (ctx: MyContext) => Promise<any> | any;
  scopes: ScopeType[];
};

export function registerCommand(
  registry: CommandGroup<MyContext>,
  command: string,

  description: string,
  handler: (ctx: MyContext) => Promise<any> | any,
  commandPrivate?: string, other_commands?: [string]
) {
  debug('registrando comando', command)
  const groupCmd = registry.command(command, description, handler, options);
  groupCmd.addToScope({ type: "all_group_chats" }, handler);

  if (commandPrivate) {
    const privateCmd = registry.command(commandPrivate, description, handler, options);
    privateCmd.addToScope({ type: "all_private_chats" }, handler);
  }
}

export function isWaifuBotCheck(): boolean {
  debug("Tipo de bot em execução", typeBot?.toLowerCase());

  if (typeBot?.toLowerCase() === ChatType.WAIFU) {
    return true;
  }

  if (typeBot?.toLowerCase() === ChatType.HUSBANDO) {
    return false;
  }

  return false;
}
export { botPrefix, typeBot, prefixs, options };