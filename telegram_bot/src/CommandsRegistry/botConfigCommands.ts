import type { MyContext } from "../uteis/CustomTypes.js";


const botPrefix =
  process.env.TYPE_BOT?.charAt(0)?.toLowerCase() ?? "";
 const typeBot = process.env.TYPE_BOT;
const prefixs = "./!";
const options = { ignoreCase: true, prefixs };
type ScopeType = "all_group_chats" | "all_private_chats"|"all_chat_administrators";

export type CommandConfig = {
  command: string;
  commandPrivate?: string;
  description: {
    pt: string;
    en: string;
  };
  handler: (ctx: MyContext) => Promise<any> | any;
  scopes: ScopeType[];
};


export { botPrefix, typeBot, prefixs, options };