import { InlineKeyboard } from "grammy";
import type { MyContext } from "../customTypes.js";

export function CreateButtunConfirmation(
  ctx: MyContext,
  yes: string,
  no: string,
  text_yes?: string,
  text_no?: string,
  icon_no?: string,
  icon_yes?: string,
): InlineKeyboard {
  const btn = new InlineKeyboard();

  btn.text(text_no || ctx.t("Buttun-confirmation-label-no"), no).style("danger");
  if (icon_no) btn.icon(icon_no);

  btn.text(text_yes || ctx.t("Buttun-confirmation-label-yes"), yes).style("success");
  if (icon_yes) btn.icon(icon_yes);

  return btn;
}