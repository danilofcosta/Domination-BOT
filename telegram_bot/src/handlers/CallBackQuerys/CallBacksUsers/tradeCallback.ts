import type { MyContext } from "../../../uteis/CustomTypes.js";
import { TradeHandler } from "../../Commands/CommandsUser/trade.js";
import { getTradeSession, deleteTradeSession } from "../../../cache/tradeCache.js";
import { cleanupCallback } from "../../../uteis/uteis_telegram/cleanupCallback.js";
import { SendMensageCustom } from "../../../uteis/sendMensageCustom.js";

export async function TradeCallbackQuery(ctx: MyContext) {

    const data = ctx.callbackQuery?.data ?? "";
    const parts = data.split("_");
    const [, action, tradeKey] = parts;

    if (!tradeKey) return;

    const session = getTradeSession(tradeKey);

    switch (action) {
        case 'accept': {
            if (!session) {
                await ctx.answerCallbackQuery({ text: ctx.t("trade_expired"), show_alert: true });
                return;
            }

            if (ctx.from?.id !== session.receiverId) {
                await ctx.answerCallbackQuery({ text: ctx.t("trade_accept_only_receiver"), show_alert: true });
                return;
            }

            if (!session.transmitterCharacterId || !session.receiverCharacterId) {
                await ctx.answerCallbackQuery({ text: ctx.t("trade_incomplete"), show_alert: true });
                return;
            }

            await cleanupCallback(ctx);

            await TradeHandler(ctx, {
                Transmitter_id: session.transmitterId,
                Transmitter_characterId: session.transmitterCharacterId,
                receiver_id: session.receiverId,
                receiver_characterId: session.receiverCharacterId,
                chat_id: session.chatId,
            });

            deleteTradeSession(tradeKey);
            return;
        }

        case 'counter': {
            if (!session) {
                await ctx.answerCallbackQuery({ text: ctx.t("trade_expired"), show_alert: true });
                return;
            }

            if (ctx.from?.id !== session.transmitterId && ctx.from?.id !== session.receiverId) {
                await ctx.answerCallbackQuery({ text: ctx.t("trade_not_authorized"), show_alert: true });
                return;
            }

            await SendMensageCustom({
                ctx,
                caption: ctx.t("trade_counter_not_implemented"),
            });
            await cleanupCallback(ctx);
            return;
        }

        case 'decline': {
            if (!session) {
                await ctx.answerCallbackQuery({ text: ctx.t("trade_expired"), show_alert: true });
                return;
            }

            if (ctx.from?.id !== session.transmitterId && ctx.from?.id !== session.receiverId) {
                await ctx.answerCallbackQuery({ text: ctx.t("trade_not_authorized"), show_alert: true });
                return;
            }

            await SendMensageCustom({
                ctx,
                caption: ctx.t("trade_declined"),
            });
            await cleanupCallback(ctx);
            deleteTradeSession(tradeKey);
            return;
        }

        case 'execute': {
            if (!session || !session.transmitterCharacterId || !session.receiverCharacterId) {
                await ctx.answerCallbackQuery({ text: ctx.t("trade_expired_or_incomplete"), show_alert: true });
                return;
            }

            await cleanupCallback(ctx);

            await TradeHandler(ctx, {
                Transmitter_id: session.transmitterId,
                Transmitter_characterId: session.transmitterCharacterId,
                receiver_id: session.receiverId,
                receiver_characterId: session.receiverCharacterId,
                chat_id: session.chatId,
            });

            deleteTradeSession(tradeKey);
            return;
        }

        case 'cancel': {
            await cleanupCallback(ctx);
            deleteTradeSession(tradeKey);
            return;
        }
    }
}
