import type { MyContext } from "../../../utils/customTypes.js";
import {
  LastRandomCharacter,
  RandomCharacter,
} from "../../../utils/randomCharacter.js";
import { Sendmedia } from "../../../utils/sendmedia.js";
import { InlineKeyboard } from "grammy";
import { helpCommand } from "./help.js";

export async function StartGreetings(ctx: MyContext) {
  
 if (ctx.match === "help") {
  helpCommand(ctx);
  return;
 }
  ctx.react("⚡");
  const header = ctx.t("start-greeting-header", { botname: ctx.me.first_name });
  const boby = ctx.t("start-greeting-body", {
    genero: ctx.session.settings.genero,
  });
  const extra_body = ctx.t("start-greeting-extra-body"); //boby

  const greeting = ` ${header}\n <blockquote>${boby}</blockquote>\n\n <blockquote>${extra_body} </blockquote>`;

  const character = await LastRandomCharacter(
    ctx.session.settings.genero || process.env.TYPE_BOT,
  );

  const replaymarkup = new InlineKeyboard()
    .url(
      ctx.t("start-btn-add"),
      `https://t.me/${ctx.me.username}?startgroup=true`,
    )
    .row() // start a new row
    .text(ctx.t("start-btn-help"), `help_${ctx.from?.id}`) // callback button
    .url(
      ctx.t("start-btn-database"),
      process.env.DATABASE_TELEGRAM_LINK ||
        `https://t.me/${ctx.me.username}?startgroup=true`,
    ).url(
      ctx.t("start-btn-colaboradores"),
      
        `https://telegra.ph/Colaboradores-04-04`,
    );


  if (!character)
    return ctx.reply(greeting, {
      parse_mode: "HTML",
      reply_markup: replaymarkup,
    });
  await Sendmedia({
    ctx: ctx,
    per: character,
    caption: greeting,
    reply_markup: replaymarkup,
  });
}
