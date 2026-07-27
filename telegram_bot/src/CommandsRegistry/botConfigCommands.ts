import { ChatType, type MyContext } from "../uteis/CustomTypes.js";
import { debug } from "../uteis/log.js";


const botPrefix =
  process.env.TYPE_BOT?.charAt(0)?.toLowerCase() ?? "";
const typeBot = process.env.TYPE_BOT;
const prefixs = "./!";
const options = { ignoreCase: true, prefixs };
type ScopeType = "all_group_chats" | "all_private_chats" | "all_chat_administrators";

export type CommandConfig = {
  command: string;
  commandPrivate?: string;
  commandPrivateInChat?: boolean

  description: {
    pt: string;
    en: string;
  };
  handler: (ctx: MyContext) => Promise<any> | any;
  scopes: ScopeType[];
};

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