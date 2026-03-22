
import type { MyContext } from "../../../utils/customTypes.js";
import { RandomCharacter } from "../../../utils/randomCharacter.js";
import { Sendmedia } from "../../../utils/sendmedia.js";
import { InlineKeyboard } from "grammy";

export async function start(ctx: MyContext) {
  ctx.react("⚡" ,) ;
  const header = ctx.t("start-greeting-header", { botname: ctx.me.first_name });
  const boby = ctx.t("start-greeting-body", { genero: ctx.session.settings.genero });
  const extra_body = ctx.t("start-greeting-extra-body"); //boby

  const greeting = ` ${header}\n <blockquote>${boby}</blockquote>\n\n <blockquote>${extra_body} </blockquote>`;

  const character = await RandomCharacter(ctx.session.settings.genero);

  const replaymarkup = new InlineKeyboard()
  .url(
    ctx.t("start-btn-add"),
    `https://t.me/${ctx.me.username}?startgroup=true`,
  )
  .row() // start a new row
  .text(ctx.t("start-btn-help"), `help_${ctx.from?.id}`) // callback button
  .url(
    ctx.t("start-btn-database"),
    process.env.DATABASE_TELEGRAM_LINK ||`https://t.me/${ctx.me.username}?startgroup=true`,// fixed typo: DATABASE_TELEGRAM_LINK
  );

  if (!character) return ctx.reply(greeting, { parse_mode: "HTML", reply_markup: replaymarkup });
  console.log('character', character.slug);
  await Sendmedia(
    { ctx: ctx, per: character, caption: greeting, reply_markup: replaymarkup},
  );
}
