import type { MyContext } from "../../../uteis/CustomTypes.js";
import {
  Extract_id_user,
  type TelegramUserData,
} from "../../../uteis/uteis_telegram/extract_id_user.js";

export async function TradeHandler(ctx: MyContext) {
  const userData: TelegramUserData | null = await Extract_id_user(ctx);

  if (!userData) {
    ctx.reply(ctx.t("trade.error.user_not_found"));
    return;
  }

  await ctx.reply("teste", {
    // reply_markup: {
    //   inline_keyboard: [
    //     [
    //       { text: "setmy", callback_data: "trade_accept" },
    //       { text: "setre", callback_data: "trade_decline" },
    //     ],
    //   ],
    // },
  });
}
