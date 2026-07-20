import { ProfileType } from "../../../../generated/prisma/enums.js";
import { getLeaveGroupCache, setLeaveGroupCache } from "../../../cache/cache.js";
import { createButtonsLeaveMenu } from "../../../uteis/buildButtons/createButtonsLeaveMenu.js";
import type { MyContext } from "../../../uteis/CustomTypes.js";
import { onlyRoleBotAdmin } from "../../../uteis/permissions.js";
import { EditOrSendText } from "../../../uteis/uteis_telegram/EditOrSendText.js";

export async function leaveGroupHandler(ctx: MyContext) {
    await onlyRoleBotAdmin(ProfileType.SUPER_ADMIN)(ctx, async () => {
        await leaveGroupService(ctx);
    });
}

export async function leaveGroupService(ctx: MyContext) {
    const chatId = ctx.chat?.id || 0;
    let cache = getLeaveGroupCache(chatId);

    if (!cache) {
        cache = { membrers_clean_colletion: false, membrers_ban: false, send_message_to_group: false };
        setLeaveGroupCache(chatId, cache);
    }

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
