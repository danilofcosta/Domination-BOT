import { InlineKeyboard } from "grammy";
import type { MyContext } from "../../../utils/customTypes.js";
import { createInlineResult } from "../utils/createInlineResult.js";
import { showResultsInline } from "../utils/showResultsInline.js";
import { getHaremCollection, LIMIT } from "./haremInlineQuery.js";
import { debug, error } from "../../../utils/log.js";
import { getTradeSession, updateTradeSession } from "../../../cache/tradeCache.js";


async function deleteInitMenu(ctx: MyContext, session: ReturnType<typeof getTradeSession>) {
    if (!session?.menuInitMessageId || !session?.menuChatId) return;
    try {
      await ctx.api.deleteMessage(session.menuChatId, session.menuInitMessageId);
      debug('tradeInlineQuery - menu inicial deletado', { chatId: session.menuChatId, messageId: session.menuInitMessageId });
    } catch (e) {
        error("tradeInlineQuery - erro ao deletar menu inicial", e);
    }
    updateTradeSession(`${session.chatId}:${session.transmitterId}`, { menuInitMessageId: undefined, menuChatId: undefined });
}


export async function TradeInlineQuery(ctx: MyContext) {
    if (!ctx.inlineQuery) return;
    const parts = ctx.inlineQuery.query.split("_");
    const [, action, tradeKey, alreadySelectedCharacterId] = parts;
    const offset = Number(ctx.inlineQuery.offset || "0");

    if (!tradeKey) return debug('tradeInlineQuery - tradeKey não fornecido na query', { query: ctx.inlineQuery.query });

    const session = getTradeSession(tradeKey);


    if (!session) {
        debug('tradeInlineQuery - sessão não encontrada', { tradeKey, userId: ctx.from?.id });
        await ctx.answerInlineQuery([], { cache_time: 0 });
        return;
    }

    if (ctx.from?.id !== session.transmitterId && ctx.from?.id !== session.receiverId) {
        debug('tradeInlineQuery - usuário não autorizado', { tradeKey, userId: ctx.from?.id, transmitterId: session.transmitterId, receiverId: session.receiverId });
        await ctx.answerInlineQuery([], { cache_time: 0 });
        return;
    }

    const genero = ctx.botType;

    if (action === "set.character.id.transmitter") {

        if (alreadySelectedCharacterId) {
            await deleteInitMenu(ctx, session);
            const transmitterCharacterId = Number(alreadySelectedCharacterId);
            if (!transmitterCharacterId) return debug('tradeInlineQuery - transmitterCharacterId inválido', { tradeKey, raw: alreadySelectedCharacterId });

            updateTradeSession(tradeKey, { transmitterCharacterId });

            const { collection, total } = await getHaremCollection({
                telegramId: session.transmitterId,
                offset,
                genero,
            });

            const results = collection.map((item: any) => {
                const btn = new InlineKeyboard();
                btn.text(ctx.t("trade_btn_confirm_trade"), `trade_execute_${tradeKey}`);

                return createInlineResult({
                    t: ctx.t,
                    character: item,
                    chatType: genero,
                    rawEmoji: true,
                    reply_markup: btn,
                });
            });

            await showResultsInline({
                ctx,
                results,
                next_offset: offset + LIMIT < total ? String(offset + LIMIT) : "",
                text: ctx.t("trade_inline_confirm_transmitter"),
                is_personal: true,
                notCacheTelegram: true,
            });
            return;
        }

        const { collection, total } = await getHaremCollection({
            telegramId: session.transmitterId,
            offset,
            genero,
        });

        const results = collection.map((item: any) => {
            const btn = new InlineKeyboard();
            btn.switchInlineCurrent(
                ctx.t("trade_btn_my_label_receiver"),
                `trade_set.character.id.receiver_${tradeKey}_${item.characterId}`
            ).row();
            btn.text(ctx.t("trade_btn_my_label_cancel"), 'trade_btn_cancel');

            return createInlineResult({
                t: ctx.t,
                character: item,
                chatType: genero,
                rawEmoji: true,
                reply_markup: btn,
            });
        });

        await showResultsInline({
            ctx,
            results,
            next_offset: offset + LIMIT < total ? String(offset + LIMIT) : "",
            text: ctx.t("trade_inline_transmitter"),
            is_personal: true,
            notCacheTelegram: true,
        });
        return;
    }

    if (action === "set.character.id.receiver") {

        if (alreadySelectedCharacterId) {
            await deleteInitMenu(ctx, session);
            const receiverCharacterId = Number(alreadySelectedCharacterId);
            if (!receiverCharacterId) return debug('tradeInlineQuery - receiverCharacterId inválido', { tradeKey, raw: alreadySelectedCharacterId });

            updateTradeSession(tradeKey, { receiverCharacterId });

            const { collection, total } = await getHaremCollection({
                telegramId: session.receiverId,
                offset,
                genero,
            });

            const results = collection.map((item: any) => {
                const btn = new InlineKeyboard();
                btn.text(ctx.t("trade_btn_confirm_trade"), `trade_execute_${tradeKey}`);
                btn.text(ctx.t("trade_btn_my_label_cancel"), `trade_cancel_${tradeKey}`);

                return createInlineResult({
                    t: ctx.t,
                    character: item,
                    chatType: genero,
                    rawEmoji: true,
                    reply_markup: btn,
                });
            });

            await showResultsInline({
                ctx,
                results,
                next_offset: offset + LIMIT < total ? String(offset + LIMIT) : "",
                text: ctx.t("trade_inline_confirm_receiver"),
                is_personal: true,
                notCacheTelegram: true,
            });
            return;
        }

        const { collection, total } = await getHaremCollection({
            telegramId: session.receiverId,
            offset,
            genero,
        });

        const results = collection.map((item: any) => {
            const btn = new InlineKeyboard();
            btn.switchInlineCurrent(
                ctx.t("trade_btn_my_label_my"),
                `trade_set.character.id.transmitter_${tradeKey}_${item.characterId}`
            ).row();
            btn.text(ctx.t("trade_btn_my_label_cancel"), 'trade_btn_cancel');

            return createInlineResult({
                t: ctx.t,
                character: item,
                chatType: genero,
                rawEmoji: true,
                reply_markup: btn,
            });
        });

        await showResultsInline({
            ctx,
            results,
            next_offset: offset + LIMIT < total ? String(offset + LIMIT) : "",
            text: ctx.t("trade_inline_receiver"),
            is_personal: true,
            notCacheTelegram: true,
        });
        return;
    }
}
