import { getLeaveGroupCache, setLeaveGroupCache } from "../../../cache/cache.js";
import { createButtonsLeaveMenu } from "../../../uteis/buildButtons/createButtonsLeaveMenu.js";
import type { MyContext } from "../../../uteis/CustomTypes.js";
import { onlyRoleBotAdmin } from "../../../uteis/permissions.js";
import { EditOrSendText } from "../../../uteis/uteis_telegram/EditOrSendText.js";
import { ProfileType } from "../../../../generated/prisma/enums.js";

export async function leaveGroupCallback(ctx: MyContext) {
    await onlyRoleBotAdmin(ProfileType.SUPER_ADMIN)(ctx, async () => {
        await leaveGroupCallbackService(ctx);
    });
}

export async function leaveGroupCallbackService(ctx: MyContext) {
    const callback = ctx.callbackQuery?.data;
    if (!callback) return;

    const parts = callback.split("_");
    const action = parts[2];

    if (!action) {
        await ctx.answerCallbackQuery();
        return;
    }

    const chatId = Number(parts[3]) || 0;
    let cache = getLeaveGroupCache(chatId);


    if (!cache) {
        cache = { membrers_clean_colletion: false, membrers_ban: false, send_message_to_group: false };
    }
    if (action === "cancel") {
        try {
            await ctx.deleteMessage();
        } catch (error) {
            // Ignora o erro caso a mensagem já tenha sido apagada
        }
    } else

        if (action === "membrers.ban") {
            cache.membrers_ban = !cache.membrers_ban;
        } else if (action === "membrers.clean.colletion") {
            cache.membrers_clean_colletion = !cache.membrers_clean_colletion;
        } else if (action === "send.message.to.group") {
            cache.send_message_to_group = !cache.send_message_to_group;
        }

      else if (action === "personalize.message") {
           
        }


        else {
            await ctx.answerCallbackQuery();
            return;
        }


    setLeaveGroupCache(chatId, cache);

    const bot_leave_group_text = ctx.t('bot_leave_group_text', {
        membrers_clean_colletion: String(cache.membrers_clean_colletion),
        membrers_ban: String(cache.membrers_ban),
        send_message_to_group: String(cache.send_message_to_group),
    });

    const reply_markup = createButtonsLeaveMenu({
        membrers_ban: cache.membrers_ban,
        membrers_clean_colletion: cache.membrers_clean_colletion,
        send_message_to_group: cache.send_message_to_group,
    });

    await EditOrSendText({ ctx, caption: bot_leave_group_text, reply_markup });
}
