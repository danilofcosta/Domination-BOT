import { InlineKeyboard } from "grammy";
import type { MyContext } from "../../../uteis/CustomTypes.js";
import { SendMensageCustom } from "../../../uteis/sendMensageCustom.js";
import { getLatestCharacter } from "../../../uteis/extras/getLatestCharacter.js";
import { info, error } from "../../../uteis/log.js";
import { ProcessStartArgument } from "./ProcessStartArgument.js";
import { typeBot } from "../../../CommandsRegistry/botConfigCommands.js";

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
let lastRefreshTime = Date.now(); 

export async function StartHandler(ctx: MyContext) {
  if (ctx.match) {
    info("start - comando com argumento", { match: ctx.match });
     await ProcessStartArgument(ctx);
  }

  if (ctx.chat?.type !== "private") {
    try {
      await ctx.react("❤‍🔥");
    } catch (error: any) {
      if (!error.description?.includes("message to react not found")) {
        console.error("Erro ao reagir com ⚡:", error);
      }
    }
    if (!ctx.message) return;
    return await SendMensageCustom({
      ctx,
      caption: `Eu estou online :D`,
    });
  }

  try {
    await ctx.react("⚡");
  } catch (error: any) {
    if (!error.description?.includes("message to react not found")) {
      error("Erro ao reagir com ⚡:", error);
    }
  }

  try {
    const ping = ctx.message ? Date.now() - ctx.message.date * 1000 : 0;
    const uptime = formatUptime((Date.now() - lastRefreshTime) / 1000);

    const reply_markup = new InlineKeyboard()
      .url(
        ctx.t("start_btn_addme"),
        `https://t.me/${ctx.me?.username}?startgroup=true`,
      )
      .row()
      .url(ctx.t("start_btn_canal"), "https://t.me/SEU_CANAL")
      .url(ctx.t("start_btn_creditos"), "https://t.me/SEU_CREDITO")
      .row()
      .text(ctx.t("start_btn_guia"), `start_guia_${ctx.from?.id}`)
      .text(ctx.t("start_btn_redirect"), `start_redirect_${ctx.from?.id}`);

    return await SendMensageCustom({
      ctx,
      character: await getLatestCharacter(ctx.botType),
      caption: ctx.t("start_welcome_private", {
        bot: ctx.me?.first_name ?? "Anime Bot",
        ping: ping.toFixed(3),
        uptime,
        gener: typeBot
          ? typeBot.charAt(0).toUpperCase() + typeBot.slice(1)
          : "Waifu",
      }),
      reply_markup,
    });
  } catch (e) {
    error("start - erro ao enviar boas-vindas", e);
  }
}
