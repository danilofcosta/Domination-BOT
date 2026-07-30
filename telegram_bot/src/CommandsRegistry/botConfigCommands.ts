import { CommandGroup } from "@grammyjs/commands";
import { ChatType, type MyContext } from "../uteis/CustomTypes.js";
import { debug } from "../uteis/log.js";

const botPrefix =
  process.env.TYPE_BOT?.charAt(0)?.toLowerCase() ?? "";
const typeBot = process.env.TYPE_BOT ?process.env.TYPE_BOT .toLowerCase() :process.env.TYPE_BOT ;
const prefixs = "./!";
const options = { ignoreCase: true, prefixs };
type ScopeType = "all_group_chats" | "all_private_chats" | "all_chat_administrators";

export type CommandConfig = {
  command: string;
  commandPrivate?: string;
  commandPrivateInChat?: boolean
  other_commands?: [string]

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
  commandPrivate?: string,other_commands?: [string]
) {
  const groupCmd = registry.command(command, description, handler, options);
  groupCmd.addToScope({ type: "all_group_chats" }, handler);
  debug('registrando comando', command)
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