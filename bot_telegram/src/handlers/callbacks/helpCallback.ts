import { InlineKeyboard } from "grammy";
import type { MyContext } from "../../utils/customTypes.js";
import { ComandosUser } from "../../CommandesManage/User.js";
import { botPrefix } from "../../CommandesManage/botConfigCommands.js";
import { error, debug } from "../../utils/log.js";
import { adminCommands_bot_dict } from "../../CommandesManage/adminCommands_bot.js";


export async function helpCallback(ctx: MyContext) {
    if (!ctx.callbackQuery?.data) return;
    
    const [command, btn, action, ...rest] = ctx.callbackQuery.data.split("_");
    
    debug(`helpCallback`, { action, rest, userId: ctx.from?.id });

    const handleEditOrReply = async (textToUse: string, reply_markup: InlineKeyboard) => {
        const msg = ctx.callbackQuery?.message;
        const currentText = msg?.text || msg?.caption;

        if (currentText && currentText.trim() === textToUse.trim()) {
            await ctx.answerCallbackQuery().catch(() => {});
            return;
        }

        try {
            if (!msg) {
                await ctx.reply(textToUse, { parse_mode: "HTML", reply_markup });
            } else if (msg.text !== undefined) {
                await ctx.editMessageText(textToUse, { parse_mode: "HTML", reply_markup });
            } else if (msg.caption !== undefined) {
                await ctx.editMessageCaption({ caption: textToUse, parse_mode: "HTML", reply_markup });
            } else {
                await ctx.reply(textToUse, { parse_mode: "HTML", reply_markup });
            }
        } catch (e: any) {
            if (e.description?.includes("message is not modified")) {
                await ctx.answerCallbackQuery().catch(() => {});
                return;
            }
            error(`helpCallback - erro ao editar/enviar ${action}`, e);
        }
    };

    if (action === "comandos") {
        if (!rest.length) {
            await handleEditOrReply(
                "Selecione uma categoria:", 
                new InlineKeyboard().text("user", 'help_btn_comandos_user').text("admin", 'help_btn_comandos_admin').row().text("close", 'close')
            );
        } else if (rest[0] === "user") {
            const comandosText = Object.entries(ComandosUser).map(([key, value]) => `/${value.command} - ${value.description.pt}`).join("\n");
            await handleEditOrReply(comandosText, new InlineKeyboard().text(ctx.t("help-btn-back"), 'help_btn_comandos').text(ctx.t("help-btn-close"), 'close'));
        } else if (rest[0] === "admin") {
            const comandosText = Object.values(adminCommands_bot_dict).map((value) => `/${value.command} - ${value.description.pt}`).join("\n");
            await handleEditOrReply(comandosText, new InlineKeyboard().text(ctx.t("help-btn-back"), 'help_btn_comandos').text(ctx.t("help-btn-close"), 'close'));
        }
        return;
    }

    await ctx.answerCallbackQuery().catch(() => {});
}