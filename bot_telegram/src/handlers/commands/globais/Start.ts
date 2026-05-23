import type { MyContext } from "../../../utils/customTypes.js";
import { LastRandomCharacter } from "../../../utils/character/random_character.js";
import { Sendmedia } from "../../../utils/sendmedia.js";
import { InlineKeyboard } from "grammy";
import { helpCommand } from "./help.js";
import { prisma } from "../../../lib/prisma.js";
import { formatUptime } from "./status.js";
import { Backup_harem } from "../users/backup.js";

let lastRefreshTime = Date.now();

export async function StartGreetings(ctx: MyContext) {
  if (ctx.match) {
    switch (ctx.match) {
      case "help": {
        helpCommand(ctx);
        return;
      }
      case "backup": {
        Backup_harem(ctx);
      }
      default:
        return;
    }
  }

  if (ctx.chat?.type !== "private") {
    try {
      await ctx.react("❤");
    } catch (error: any) {
      if (!error.description?.includes("message to react not found")) {
        console.error("Erro ao reagir com ⚡:", error);
      }
    }
    if (!ctx.message) return;
    return await Sendmedia({
      ctx,
      caption: ctx.t("bot-on-check", {
        nomegroup: `${ctx.message.chat.title}`,
        istopic: ctx.chat?.is_forum ? "true" : "false",
      }),
    });
  }

  const startTime = Date.now();

  try {
    await ctx.react("⚡");
  } catch (error: any) {
    if (!error.description?.includes("message to react not found")) {
      console.error("Erro ao reagir com ⚡:", error);
    }
  }
  const header = ctx.t("start-greeting-header", { botName: ctx.me.first_name });
  const boby = ctx.t("start-greeting-body", {
    genero: ctx.session.settings.genero,
  });

  const dbPing = await prisma.$queryRaw<[{ now: Date }]>`
    SELECT NOW()
  `.then(() => Date.now() - startTime);

  const uptime = formatUptime(process.uptime());
  lastRefreshTime = Date.now();

  const extra_body = ctx.t("start-greeting-extra-body"); //boby

  let greeting = ` ${header}\n <blockquote>${boby}</blockquote>\n\n <blockquote>${extra_body} </blockquote>`;

  const status =
    `➺ <b>ᴘɪɴɢ:</b>  ${dbPing}ms\n➺ <b>ᴜᴘᴛɪᴍᴇ:</b> ${uptime}`.trim();
  greeting = `${greeting}\n\n ${status}`;
  const character = await LastRandomCharacter(
    ctx.session.settings.genero || process.env.TYPE_BOT,
  );

  const replaymarkup = new InlineKeyboard()
    .url(
      ctx.t("start-btn-add"),
      `https://t.me/${ctx.me.username}?startgroup=true`,
    )
    .row() // start a new row
    .text(ctx.t("start-btn-help"), `start_help_${ctx.from?.id}`) // callback button
    .url(
      ctx.t("start-btn-database"),
      process.env.DATABASE_TELEGRAM_LINK ||
        `https://t.me/${ctx.me.username}?startgroup=true`,
    )
    .url(
      ctx.t("start-btn-colaboradores"),

      `https://telegra.ph/Colaboradores-04-04`,
    );

  if (!character)
    return await Sendmedia({
      ctx,
      caption: greeting,
    });
  await Sendmedia({
    ctx: ctx,
    per: character,
    caption: greeting,
    reply_markup: replaymarkup,
  });
}
