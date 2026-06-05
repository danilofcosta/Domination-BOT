import { prisma } from "../../../../lib/prisma.js";
import { InlineKeyboard } from "grammy";
import type { MyContext } from "../../../../utils/customTypes.js";

const PAGE_SIZE = 10;

type ChatEntry = {
  chatId: string;
  type: string;
  count: number;
  title: string;
};

const titleCache = new Map<string, { title: string; ts: number }>();
const TITLE_CACHE_TTL = 5 * 60 * 1000;

function parseSessionKey(key: string): { chatId: string; chatType: string } | null {
  const typeIdx = key.lastIndexOf("_type_");
  if (typeIdx === -1) return null;

  const chatType = key.slice(typeIdx + 6);
  if (chatType === "private") return null;

  const prefix = key.slice(0, typeIdx);
  const firstUnderscore = prefix.indexOf("_");
  if (firstUnderscore === -1) return null;

  return { chatId: prefix.slice(firstUnderscore + 1), chatType };
}

async function getChatTitle(ctx: MyContext, chatId: string): Promise<string> {
  const cached = titleCache.get(chatId);
  if (cached && Date.now() - cached.ts < TITLE_CACHE_TTL) return cached.title;

  try {
    const chat = await ctx.api.getChat(Number(chatId));
    const title = chat.title || chat.first_name || ctx.t("activechats-no-name");
    titleCache.set(chatId, { title, ts: Date.now() });
    return title;
  } catch {
    return ctx.t("activechats-no-access");
  }
}

async function getProcessedData(ctx: MyContext) {
  const sessions = await prisma.botSession.findMany({ select: { key: true } });

  const countMap = new Map<string, { type: string; count: number }>();

  for (const { key } of sessions) {
    const parsed = parseSessionKey(key);
    if (!parsed) continue;

    const existing = countMap.get(parsed.chatId);
    if (existing) {
      existing.count++;
    } else {
      countMap.set(parsed.chatId, { type: parsed.chatType, count: 1 });
    }
  }

  const entries: ChatEntry[] = [];

  for (const [chatId, data] of countMap) {
    const title = await getChatTitle(ctx, chatId);
    entries.push({ chatId, type: data.type, count: data.count, title });
  }

  entries.sort((a, b) => b.count - a.count);

  return { entries, total: entries.length };
}

function buildPageMessage(ctx: MyContext, entries: ChatEntry[], page: number, total: number) {
  const start = page * PAGE_SIZE;
  const pageItems = entries.slice(start, start + PAGE_SIZE);

  const lines: string[] = [];
  for (const item of pageItems) {
    const lineKey = item.type === "channel" ? "activechats-line-channel" : "activechats-line-group";
    lines.push(
      ctx.t(lineKey, {
        n: String(start + lines.length + 1),
        title: item.title,
        count: String(item.count),
        chatId: item.chatId,
      }),
    );
  }

  const header = ctx.t("activechats-header", { total: String(total) });

  const body = lines.join("\n\n");

  const totalPages = Math.ceil(entries.length / PAGE_SIZE);
  const keyboard = new InlineKeyboard();

  if (totalPages > 1) {
    if (page > 0) {
      keyboard.text(ctx.t("activechats-btn-prev"), `activechats_page:${page - 1}`);
    }
    keyboard.text(`${page + 1}/${totalPages}`, "noop__");
    if (page < totalPages - 1) {
      keyboard.text(ctx.t("activechats-btn-next"), `activechats_page:${page + 1}`);
    }
    keyboard.row();
  }

  keyboard.text(ctx.t("activechats-btn-close"), "close");

  return { text: header + "\n\n" + body, keyboard };
}

export async function listActiveChats(ctx: MyContext) {
  const { entries, total } = await getProcessedData(ctx);

  if (total === 0) {
    return ctx.reply(ctx.t("activechats-none"));
  }

  const { text, keyboard } = buildPageMessage(ctx, entries, 0, total);

  await ctx.reply(text, {
    parse_mode: "HTML",
    reply_markup: keyboard,
  });
}

export async function activeChatsPagination(ctx: MyContext) {
  const data = ctx.callbackQuery?.data;
  if (!data) return;

  const page = Number(data.split(":")[1] ?? 0);
  const { entries, total } = await getProcessedData(ctx);
  const { text, keyboard } = buildPageMessage(ctx, entries, page, total);

  await ctx.editMessageText(text, {
    parse_mode: "HTML",
    reply_markup: keyboard,
  });

  await ctx.answerCallbackQuery();
}
