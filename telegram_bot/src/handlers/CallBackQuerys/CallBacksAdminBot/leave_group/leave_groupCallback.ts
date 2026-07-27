import { getLeaveGroupCache, setLeaveGroupCache } from "../../../../cache/cache.js";
import { createButtonsLeaveMenu } from "../../../../uteis/buildButtons/createButtonsLeaveMenu.js";
import type { MyContext } from "../../../../uteis/CustomTypes.js";
import { onlyRoleBotAdmin } from "../../../../uteis/permissions.js";
import { EditOrSendText } from "../../../../uteis/uteis_telegram/EditOrSendText.js";
import { ProfileType } from "../../../../../generated/prisma/enums.js";
import { leaveGroupHandlerUI } from "./leave_group.ui.js";
import { setListener } from "../../../../cache/listenerStore.js";
import { translationService } from "../../../../locales/translationService.js";
import { CreateOneBtn } from "../../../../uteis/buildButtons/createOneButton.js";
import { info, error } from "../../../../uteis/log.js";
import { prisma } from "../../../../lib/prisma.js";

export async function leaveGroupCallback(ctx: MyContext) {
    await onlyRoleBotAdmin(ProfileType.SUPER_ADMIN)(ctx, async () => {
        await leaveGroupCallbackService(ctx);
    });
}

export async function leaveGroupCallbackService(ctx: MyContext) {
    const callback = ctx.callbackQuery?.data;
    if (!callback) return;

    const match = callback.match(/^bot_leave_(.+)_(-?\d+)$/);
    if (!match) {
        await ctx.answerCallbackQuery();
        return;
    }

    const action = match[1];
    const chatId = Number(match[2]);
    let cache = getLeaveGroupCache(chatId);

    if (!cache) {
        cache = { groupId: chatId, groupName: "", membrers_clean_colletion: false, membrers_ban: false, send_message_to_group: false };
    }

    if (action === "cancel") {
        try {
            await ctx.deleteMessage();
        } catch (error) {
        }
        return;
    }

    if (action === "membrers.ban") {
        cache.membrers_ban = !cache.membrers_ban;
    } else if (action === "membrers.clean.colletion") {
        cache.membrers_clean_colletion = !cache.membrers_clean_colletion;
    } else if (action === "send.message.to.group") {
        cache.send_message_to_group = !cache.send_message_to_group;
    } else if (action === "personalize.message") {
        return await leaveGroupHandlerUI(ctx, chatId);
    } else if (action === "personalize.message.edit.text") {
        const userId = ctx.from?.id;
        const chatIdFrom = ctx.chat?.id;
        const promptMsgId = ctx.callbackQuery?.message?.message_id;

        if (!userId || !chatIdFrom) {
            await ctx.answerCallbackQuery();
            return;
        }

        setListener(userId, chatIdFrom, {
            type: "text",
            action: async (msgCtx: MyContext) => {
                const text = msgCtx.message?.text;
                if (!text) return;
                const before = `${ctx.t('bot_leave_send_message_to_group_flood')}`
                await translationService.setTranslation(
                    'bot_leave_send_message_to_group_flood',
                    'pt',
                    text
                );

                info('mensagem editadaa', { textrecebido: text, new: ` ${ctx.t('bot_leave_send_message_to_group_flood')}`, before: before })

                if (promptMsgId) {
                    await msgCtx.api.deleteMessage(chatIdFrom, promptMsgId).catch(() => { });
                }

                await leaveGroupHandlerUI(msgCtx, chatId);
            },
        });

        await EditOrSendText({
            ctx,
            caption: "Digite a nova mensagem de saída do bot:",
            reply_markup: CreateOneBtn({
                text: ctx.t("cancel"),
                callback: `bot_leave_personalize.message_${chatId}`,
            }),
        });
        return;
    } else if (action === "executar.message.to.group") {
        await executeLeaveGroup(ctx, chatId, cache);
        return;
    } else {
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
        targetChatId: chatId,
        membrers_ban: cache.membrers_ban,
        membrers_clean_colletion: cache.membrers_clean_colletion,
        send_message_to_group: cache.send_message_to_group,
    });

    await EditOrSendText({ ctx, caption: bot_leave_group_text, reply_markup });
}

async function executeLeaveGroup(ctx: MyContext, chatId: number, cache: ReturnType<typeof getLeaveGroupCache> & {}) {
    await ctx.answerCallbackQuery("Executando...");

    // 1. Enviar mensagem ao grupo
    if (cache.send_message_to_group) {
        try {
            const leaveMessage = ctx.t('bot_leave_send_message_to_group_flood');
            await ctx.api.sendMessage(chatId, leaveMessage);
        } catch (e) {
            error("executeLeaveGroup - erro ao enviar mensagem ao grupo", e);
        }
    }

    // 2. Limpar coleções dos membros deste grupo
    if (cache.membrers_clean_colletion) {
        try {
            await prisma.waifuCollection.deleteMany({
                where: { fromIdChat: BigInt(chatId) },
            });
            await prisma.husbandoCollection.deleteMany({
                where: { fromIdChat: BigInt(chatId) },
            });
            info("executeLeaveGroup - coleções limpas", { chatId });
        } catch (e) {
            error("executeLeaveGroup - erro ao limpar coleções", e);
        }
    }

    // 3. Banir membros conhecidos (usuários que têm coleções deste grupo)
    if (cache.membrers_ban) {
        try {
            const waifuUsers = await prisma.waifuCollection.findMany({
                where: { fromIdChat: BigInt(chatId) },
                select: { userId: true },
                distinct: ["userId"],
            });
            const husbandoUsers = await prisma.husbandoCollection.findMany({
                where: { fromIdChat: BigInt(chatId) },
                select: { userId: true },
                distinct: ["userId"],
            });

            const userIds = new Set([
                ...waifuUsers.map((u) => Number(u.userId)),
                ...husbandoUsers.map((u) => Number(u.userId)),
            ]);

            for (const userId of userIds) {
                try {
                    await ctx.api.banChatMember(chatId, userId);
                } catch (e) {
                    error("executeLeaveGroup - erro ao banir membro", { userId, chatId });
                }
            }
            info("executeLeaveGroup - membros banidos", { chatId, count: userIds.size });
        } catch (e) {
            error("executeLeaveGroup - erro ao banir membros", e);
        }
    }

    // 4. Bot sai do grupo
    try {
        await ctx.api.leaveChat(chatId);
        info("executeLeaveGroup - bot saiu do grupo", { chatId });
    } catch (e) {
        error("executeLeaveGroup - erro ao sair do grupo", e);
    }

    // 5. Deletar mensagem do admin
    try {
        await ctx.deleteMessage();
    } catch (e) {
    }
}
