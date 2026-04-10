const botPrefix = process.env.TYPE_BOT?.charAt(0) ?? "";
const typeBot = process.env.TYPE_BOT;
const prefixs = "./!";
const options = { ignoreCase: true, prefixs: prefixs };

export { botPrefix, typeBot, prefixs, options };