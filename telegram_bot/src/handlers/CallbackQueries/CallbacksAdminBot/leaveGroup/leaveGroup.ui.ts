import { InlineKeyboard } from "grammy";
import { ProfileType } from "../../../../../generated/prisma/enums.js";
import { getLeaveGroupCache, setLeaveGroupCache } from "../../../../cache/cache.js";
import { createButtonsLeaveMenu } from "../../../../utils/buildButtons/createButtonsLeaveMenu.js";
import type { MyContext } from "../../../../utils/customTypes.js";
import { onlyRoleBotAdmin } from "../../../../utils/permissions.js";
import { editOrSendText } from "../../../../utils/telegram/editOrSendText.js";

export async function leaveGroupHandlerUI(ctx: MyContext, targetChatId?: number) {
    await onlyRoleBotAdmin(ProfileType.SUPER_ADMIN)(ctx, async () => {
        await leaveGroupServiceUI(ctx, targetChatId);
    });
}

export async function leaveGroupServiceUI(ctx: MyContext, targetChatId?: number) {
    const chatId = targetChatId || 0;

    const caption = `Mensagem Atual :\n <blockquote expandable> ${ctx.t('bot_leave_send_message_to_group_flood')}</blockquote >`
    const reply_markup = new InlineKeyboard();

    reply_markup.text('Editar mensagem', `bot_leave_personalize.message.edit.text_${chatId}`).row()
    reply_markup.text('voltar', `bot_leave_menu.main_${chatId}`)
    editOrSendText({ ctx, caption: caption, reply_markup })
}
