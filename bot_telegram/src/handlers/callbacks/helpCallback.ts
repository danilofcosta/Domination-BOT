import { InlineKeyboard } from "grammy";
import type { MyContext } from "../../utils/customTypes.js";
import { ComandosUser } from "../../CommandesManage/User.js";
import { botPrefix } from "../../CommandesManage/botConfigCommands.js";
import { error, debug } from "../../utils/log.js";

const ComandosAdmin = [
    { command: `addchar${botPrefix}`, description: "Add a character to the database (admin)" },
    { command: `addrarity${botPrefix}`, description: "Add a new rarity (admin)" },
    { command: `editrarity${botPrefix}`, description: "Edit an existing rarity (admin)" },
    { command: `delrarity${botPrefix}`, description: "Delete a rarity (admin)" },
    { command: `reloadadms${botPrefix}`, description: "Atualiza todos os admins do grupo como ADMIN no banco" },
    { command: `banuser${botPrefix}`, description: "Banir usuário" },
    { command: `unbanuser${botPrefix}`, description: "Desbanir usuário" },
    { command: `listbanned${botPrefix}`, description: "Listar usuários banidos" },
] as const;

export async function helpCallback(ctx: MyContext) {
    if (!ctx.callbackQuery?.data) return;
    
    const [command, btn, action, ...rest] = ctx.callbackQuery.data.split("_");
    
    debug(`helpCallback`, { action, rest, userId: ctx.from?.id });

    if (action === "comandos") {
        if (!ctx.callbackQuery.message?.text) {
            await ctx.editMessageCaption({
                caption: "comandos",
                parse_mode: "HTML",
                reply_markup: new InlineKeyboard().text("user", 'help_btn_comandos_user').text("admin", 'help_btn_comandos_admin').row().text("close", 'close'),
            }).catch(err => {
                if (err.description?.includes("message is not modified")) return;
                error("helpCallback - erro ao editar caption", err);
            });
        }
        else
            try {
                await ctx.editMessageText("comandos", {
                    parse_mode: "HTML",
                    reply_markup: new InlineKeyboard().text("user", 'help_btn_comandos_user').text("admin", 'help_btn_comandos_admin').row().text("close", 'close'),
                });
            } catch (e) {
                error("helpCallback - erro ao editar texto", e);
            }
    }
    if (action === "comandos" && rest[0] === "user") {
        const comandosText = Object.entries(ComandosUser).map(([key, value]) => {
            return `/${value.command} - ${value.description}`;
        }).join("\n");

        if (!ctx.callbackQuery.message?.text) {
            await ctx.editMessageCaption({
                caption: comandosText,
                parse_mode: "HTML",
                reply_markup: new InlineKeyboard().text("voltar", 'help_btn_comandos').text("close", 'close'),
            }).catch(err => {
                if (err.description?.includes("message is not modified")) return;
                error("helpCallback - erro ao editar caption (user)", err);
            });
        }
        else
            try {
                await ctx.editMessageText(comandosText, {
                    parse_mode: "HTML",
                    reply_markup: new InlineKeyboard().text("voltar", 'help_btn_comandos').text("close", 'close'),
                });
            } catch (e) {
                error("helpCallback - erro ao editar texto (user)", e);
            }
    }

    if (action === "comandos" && rest[0] === "admin") {

        if (!ctx.callbackQuery.message?.text) {
            const comandosText = ComandosAdmin.map((cmd) => {
                return `/${cmd.command} - ${cmd.description}`;
            }).join("\n");
            await ctx.editMessageCaption({
                caption: comandosText,
                parse_mode: "HTML",
                reply_markup: new InlineKeyboard().text("voltar", 'help_btn_comandos').text("close", 'close'),
            }).catch(err => {
                if (err.description?.includes("message is not modified")) return;
                error("helpCallback - erro ao editar caption (admin)", err);
            });
        }
        else
            try {
                await ctx.editMessageText("comandos admin", {
                    parse_mode: "HTML",
                    reply_markup: new InlineKeyboard().text("voltar", 'help_btn_comandos').text("close", 'close'),
                });
            } catch (e) {
                error("helpCallback - erro ao editar texto (admin)", e);
            }
    }
    await ctx.answerCallbackQuery();
}