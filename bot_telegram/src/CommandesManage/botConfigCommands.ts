import type { MyContext } from "../utils/customTypes.js";

const botPrefix = process.env.TYPE_BOT?.charAt(0) ?? "";
const typeBot = process.env.TYPE_BOT;
const prefixs = "./!";
const options = { ignoreCase: true, prefixs };

const guardDevOnly = (ctx: MyContext) => {
  return String(ctx.message?.from.id) === process.env.CHAT_ID_DEV;
};

export { botPrefix, typeBot, prefixs, options, guardDevOnly };