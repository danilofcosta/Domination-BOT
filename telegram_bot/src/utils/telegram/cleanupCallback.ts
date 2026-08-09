import type { Context } from "@grammyjs/commands/out/deps.node.js";
import { debug, error } from "../log.js";
import { editOrSendText } from "./editOrSendText.js";
import type { MyContext } from "../customTypes.js";


// tenta apagar a mensagem ou remover os bts 
export async function cleanupCallback(ctx: MyContext) {
  debug('tentando apagar mensagem')
  try {
    await ctx.deleteMessage().catch((e) => { error("cleanupCallback - erro ao deletar mensagem", e); });
    await ctx.answerCallbackQuery();
  } catch (e) {
   

    error("cleanupCallback - erro ao deletar mensagem", e);

    try{
await ctx.editMessageReplyMarkup()
    }catch{
        await editOrSendText({
        ctx,
        caption: 'newcaption',
        reply_markup: { inline_keyboard: [] },
      });
    }
    }



    }
  

