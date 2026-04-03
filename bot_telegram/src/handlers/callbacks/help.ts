import { InlineKeyboard } from "grammy";
import type { MyContext } from "../../utils/customTypes.js";

// Map of section callback data -> translation key for detail text
const sections: Record<string, string> = {
  help_section_dominar: "help-section-dominar",
  help_section_harem: "help-section-harem",
  help_section_info: "help-section-info",
  help_section_top: "help-section-top",
  help_section_fav: "help-section-fav",
  help_section_gift: "help-section-gift",
};

// Callback for the start button "Help" (help_<userId>)
export async function Help(ctx: MyContext) {
  const keyboard = new InlineKeyboard()
    .text(ctx.t("help-cmd-dominar"), "help_section_dominar")
    .row()
    .text(ctx.t("help-cmd-harem"), "help_section_harem")
    .row()
    .text(ctx.t("help-cmd-info"), "help_section_info")
    .text(ctx.t("help-cmd-top"), "help_section_top")
    .row()
    .text(ctx.t("help-cmd-fav"), "help_section_fav")
    .text(ctx.t("help-cmd-gift"), "help_section_gift")
    .row()
    .text(ctx.t("btn-close"), "close");

  await ctx.editMessageCaption({
    caption: ctx.t("help-caption"),
    parse_mode: "HTML",
    reply_markup: keyboard,
  }).catch(() => {
    // Fallback: send as new message if editMessageCaption fails (e.g., no caption)
    ctx.reply(ctx.t("help-caption"), {
      parse_mode: "HTML",
      reply_markup: keyboard,
    });
  });

  await ctx.answerCallbackQuery();
}

// Callback for each help section button
export async function HelpSection(ctx: MyContext) {
  const data = ctx.callbackQuery?.data ?? "";
  const textKey = sections[data];
  if (!textKey) return ctx.answerCallbackQuery();

  const keyboard = new InlineKeyboard().text(ctx.t("help-btn-back"), "help_back");

  await ctx.editMessageText(ctx.t(textKey), {
    parse_mode: "HTML",
    reply_markup: keyboard,
  }).catch(() =>
    ctx.answerCallbackQuery(ctx.t(textKey))
  );

  await ctx.answerCallbackQuery();
}

// Callback "back" from a section — re-shows main help menu
export async function HelpBack(ctx: MyContext) {
  const keyboard = new InlineKeyboard()
    .text(ctx.t("help-cmd-dominar"), "help_section_dominar")
    .row()
    .text(ctx.t("help-cmd-harem"), "help_section_harem")
    .row()
    .text(ctx.t("help-cmd-info"), "help_section_info")
    .text(ctx.t("help-cmd-top"), "help_section_top")
    .row()
    .text(ctx.t("help-cmd-fav"), "help_section_fav")
    .text(ctx.t("help-cmd-gift"), "help_section_gift")
    .row()
    .text(ctx.t("btn-close"), "close");

  await ctx.editMessageText(ctx.t("help-caption"), {
    parse_mode: "HTML",
    reply_markup: keyboard,
  }).catch(() =>
    ctx.editMessageCaption({
      caption: ctx.t("help-caption"),
      parse_mode: "HTML",
      reply_markup: keyboard,
    })
  );

  await ctx.answerCallbackQuery();
}
