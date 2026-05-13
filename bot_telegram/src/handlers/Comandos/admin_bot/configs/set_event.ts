import { prisma } from "../../../../../lib/prisma.js";
import type { MyContext } from "../../../../utils/customTypes.js";
import { InlineKeyboard } from "grammy";
import { error } from "../../../../utils/log.js";
import { extrair_customid } from "../../testes_commands.js";
import { Id_to_enomji } from "../../../../utils/manege_caption/extractListEmojisCharacter.js";

interface EventEditCache {
  name?: string;
  emoji?: string;
  emoji_id?: string | undefined;
  description?: string;
}

async function getCustomEmojiFromId(
  ctx: MyContext,
  emojiId: string,
): Promise<string> {
  try {
    const stickers = await ctx.api.getCustomEmojiStickers([emojiId]);
    if (stickers && stickers.length > 0) {
      const sticker = stickers[0];
      if (sticker && "emoji" in sticker) {
        return sticker.emoji || emojiId;
      }
    }
    return emojiId;
  } catch {
    return emojiId;
  }
}

async function formatEditMessage(
  event: {
    code: string;
    name: string;
    emoji: string;
    emoji_id?: string | null;
    description?: string | null;
  },
  cache: EventEditCache,
  ctx: MyContext,
): Promise<string> {
  const novoName = cache.name !== undefined ? cache.name : "-";
  const novoEmoji = cache.emoji !== undefined ? cache.emoji : "-";
  const novoEmojiId = cache.emoji_id !== undefined ? (cache.emoji_id === "__NULL__" ? ctx.t("setevent-value-null") : cache.emoji_id) : "-";
  const novoDesc = cache.description !== undefined ? cache.description : "-";

  const atualEmojiId = event.emoji_id || null;
  let atualEmojiIdDisplay = ctx.t("setevent-value-not-defined");

  if (atualEmojiId && ctx) {
    const emoji = await getCustomEmojiFromId(ctx, atualEmojiId);
    atualEmojiIdDisplay =
      emoji === atualEmojiId ? atualEmojiId : `${emoji} (${atualEmojiId})`;
  } else if (atualEmojiId) {
    atualEmojiIdDisplay = atualEmojiId;
  }

  let novoEmojiIdDisplay = novoEmojiId;
  if (novoEmojiId !== "-" && novoEmojiId !== ctx.t("setevent-value-null") && ctx) {
    const emoji = await getCustomEmojiFromId(ctx, novoEmojiId);
    novoEmojiIdDisplay =
      emoji === novoEmojiId ? novoEmojiId : `${emoji} (${novoEmojiId})`;
  }

  return `${ctx.t("setevent-edit-title")} <b>${event.name}</b> (${event.code})

${ctx.t("setevent-label-current")}
${ctx.t("setevent-label-name")} ${event.name}
${ctx.t("setevent-label-emoji")} ${event.emoji}
${ctx.t("setevent-label-emoji-id")} ${atualEmojiIdDisplay}
•show emojid :${event.emoji_id ? Id_to_enomji(event.emoji_id, event.emoji) : ctx.t("setevent-value-not-set")}

${ctx.t("setevent-label-new")}
${ctx.t("setevent-label-name")} ${novoName}
${ctx.t("setevent-label-emoji")} ${novoEmoji}
${ctx.t("setevent-label-emoji-id")} ${novoEmojiIdDisplay}
${novoDesc !== "-" ? `${ctx.t("setevent-label-description")} ${novoDesc}` : ""}
${novoEmojiId !== "-" && novoEmojiId !== ctx.t("setevent-value-null") ? `•show emojid : ${Id_to_enomji(novoEmojiId, event.emoji)}` : ""}


`;
}

const ITEMS_PER_PAGE = 10;

function getEditKeyboard(
  ctx: MyContext,
  eventCode: string,
  hasChanges: boolean,
  currentPage: number = 1,
): ReturnType<typeof InlineKeyboard.prototype.text> extends (
  ...args: any[]
) => any
  ? InstanceType<any>
  : any {
  const keyboard = new InlineKeyboard()
    .text(ctx.t("setevent-btn-name"), `setevent_edit_name_${eventCode}`)
    .text(ctx.t("setevent-btn-emoji"), `setevent_edit_emoji_${eventCode}`)
    .row()
    .text(ctx.t("setevent-btn-emoji-id"), `setevent_edit_emojiId_${eventCode}`)
    .text(ctx.t("setevent-btn-description"), `setevent_edit_description_${eventCode}`)
    .row();

  if (hasChanges) {
    keyboard.text(ctx.t("setevent-btn-save"), `setevent_save_${eventCode}`);
  }

  keyboard.text(ctx.t("setevent-btn-back-list"), `setevent_list_${currentPage}`);

  return keyboard;
}

function getEventEditCache(
  ctx: MyContext,
  eventCode: string,
): EventEditCache {
  if (!ctx.session.eventEdits) {
    ctx.session.eventEdits = {};
  }
  if (!ctx.session.eventEdits[eventCode]) {
    ctx.session.eventEdits[eventCode] = {};
  }
  return ctx.session.eventEdits[eventCode];
}

function clearEventEditCache(ctx: MyContext, eventCode: string): void {
  if (ctx.session.eventEdits && ctx.session.eventEdits[eventCode]) {
    delete ctx.session.eventEdits[eventCode];
  }
}

function hasChanges(cache: EventEditCache): boolean {
  return Object.values(cache).some((v) => v !== undefined);
}

export async function SetEventHandler(ctx: MyContext) {
  let input = ctx.match ? String(ctx.match).trim() : "";

  if (
    input === "" ||
    input === ctx.me.username ||
    input === `@${ctx.me.username}`
  ) {
    input = "";
  }

  if (!input) {
    const page = Number(ctx.match) || 1;
    ctx.session.eventListPage = page;

    const skip = (page - 1) * ITEMS_PER_PAGE;
    const [allEvents, totalCount] = await Promise.all([
      prisma.event.findMany({
        skip,
        take: ITEMS_PER_PAGE,
        orderBy: { code: "asc" },
      }),
      prisma.event.count(),
    ]);

    if (allEvents.length === 0) {
      return ctx.reply(ctx.t("setevent-empty"));
    }

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE) || 1;
    const keyboard = new InlineKeyboard();

    for (const event of allEvents) {
      keyboard
        .text(
          `${event.emoji} ${event.name}`,
          `setevent_select_${event.code}`,
        )
        .row();
    }

    const navRow: { text: string; callback_data: string }[] = [];
    if (page > 1) {
      navRow.push({
        text: ctx.t("setevent-btn-prev"),
        callback_data: `setevent_list_${page - 1}`,
      });
    }
    if (page < totalPages) {
      navRow.push({
        text: ctx.t("setevent-btn-next"),
        callback_data: `setevent_list_${page + 1}`,
      });
    }
    if (navRow.length > 0) {
      keyboard.row(...navRow);
    }

    return ctx.reply(
      ctx.t("setevent-select-page", { page, totalPages }),
      {
        reply_markup: keyboard,
      },
    );
  }

  const emojiRegex = /^(\p{Emoji_Presentation}|\p{Extended_Pictographic})/u;
  const isEmojiInput = emojiRegex.test(input);

  let event: Awaited<ReturnType<typeof prisma.event.findUnique>>;

  if (input.includes("|")) {
    const parts = input.split("|").map((p) => p.trim());
    const nameOrCode = parts[0] || "";
    event = await prisma.event.findFirst({
      where: {
        OR: [
          { code: nameOrCode.toUpperCase() },
          { name: { equals: nameOrCode, mode: "insensitive" } },
        ],
      },
    });
  } else if (isEmojiInput) {
    event = await prisma.event.findFirst({
      where: {
        OR: [{ emoji: { equals: input } }, { emoji_id: { equals: input } }],
      },
    });
  } else {
    event = await prisma.event.findUnique({
      where: { code: input.toUpperCase() },
    });

    if (!event) {
      event = await prisma.event.findFirst({
        where: {
          name: { equals: input, mode: "insensitive" },
        },
      });
    }
  }

  if (!event) {
    return ctx.reply(ctx.t("setevent-not-found-id", { input }));
  }

  const cache = getEventEditCache(ctx, event.code);
  const currentPage = ctx.session.eventListPage || 1;
  const keyboard = getEditKeyboard(ctx, event.code, hasChanges(cache), currentPage);
  const message = await formatEditMessage(event, cache, ctx);

  await ctx.reply(message, {
    parse_mode: "HTML",
    reply_markup: keyboard,
  });
}

export async function SetEventCallback(ctx: MyContext) {
  if (!ctx.callbackQuery?.data) return;

  const data = ctx.callbackQuery.data;
  const parts = data.split("_");
  const action = parts[1];

  if (action === "cancel") {
    const eventCode = parts[2];
    if (eventCode) {
      clearEventEditCache(ctx, eventCode);
    }
    await ctx.editMessageText(ctx.t("setevent-cancel"));
    await ctx.answerCallbackQuery();
    const keyboard = new InlineKeyboard().text(
      ctx.t("setevent-btn-back-list"),
      `setevent_list_${ctx.session.eventListPage || 1}`,
    );
    await ctx.editMessageReplyMarkup({ reply_markup: keyboard });
    return;
  }

  if (action === "list") {
    const page = Math.max(1, Number(parts[2]) || 1);
    ctx.session.eventListPage = page;

    const skip = (page - 1) * ITEMS_PER_PAGE;
    const [allEvents, totalCount] = await Promise.all([
      prisma.event.findMany({
        skip,
        take: ITEMS_PER_PAGE,
        orderBy: { code: "asc" },
      }),
      prisma.event.count(),
    ]);

    if (allEvents.length === 0) {
      await ctx.answerCallbackQuery(ctx.t("setevent-empty"));
      return;
    }

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE) || 1;
    const keyboard = new InlineKeyboard();

    for (const event of allEvents) {
      keyboard
        .text(
          `${event.emoji} ${event.name}`,
          `setevent_select_${event.code}`,
        )
        .row();
    }

    const navRow: { text: string; callback_data: string }[] = [];
    if (page > 1) {
      navRow.push({
        text: ctx.t("setevent-btn-prev"),
        callback_data: `setevent_list_${page - 1}`,
      });
    }
    if (page < totalPages) {
      navRow.push({
        text: ctx.t("setevent-btn-next"),
        callback_data: `setevent_list_${page + 1}`,
      });
    }
    if (navRow.length > 0) {
      keyboard.row(...navRow);
    }

    await ctx.editMessageText(
      ctx.t("setevent-select-page", { page, totalPages }),
      {
        reply_markup: keyboard,
      },
    );
    await ctx.answerCallbackQuery();
    return;
  }

  if (action === "select") {
    const eventCode = parts[2];
    if (!eventCode) {
      await ctx.answerCallbackQuery(ctx.t("setevent-invalid-data"));
      return;
    }

    const event = await prisma.event.findUnique({
      where: { code: eventCode },
    });

    if (!event) {
      await ctx.answerCallbackQuery(ctx.t("setevent-not-found"));
      return;
    }

    clearEventEditCache(ctx, eventCode);
    const cache = getEventEditCache(ctx, eventCode);
    const currentPage = ctx.session.eventListPage || 1;
    const keyboard = getEditKeyboard(ctx, event.code, hasChanges(cache), currentPage);
    const message = await formatEditMessage(event, cache, ctx);

    await ctx.editMessageText(message, {
      parse_mode: "HTML",
      reply_markup: keyboard,
    });
    await ctx.answerCallbackQuery();
    return;
  }

  if (action === "save") {
    const eventCode = parts[2];
    if (!eventCode) {
      await ctx.answerCallbackQuery(ctx.t("setevent-invalid-data"));
      return;
    }

    const event = await prisma.event.findUnique({
      where: { code: eventCode },
    });

    if (!event) {
      await ctx.answerCallbackQuery(ctx.t("setevent-not-found"));
      return;
    }

    const cache = getEventEditCache(ctx, eventCode);

    if (!hasChanges(cache)) {
      const keyboard = new InlineKeyboard();
      keyboard.text(ctx.t("setevent-btn-back-list"), `setevent_list_${ctx.session.eventListPage || 1}`);
      await ctx.editMessageReplyMarkup({ reply_markup: keyboard });
      await ctx.answerCallbackQuery(ctx.t("setevent-no-changes"));
      return;
    }

    try {
      const updateData: Record<string, any> = {};

      if (cache.name !== undefined) updateData.name = cache.name;
      if (cache.emoji !== undefined) updateData.emoji = cache.emoji;
      if (cache.emoji_id !== undefined)
        updateData.emoji_id = cache.emoji_id === "__NULL__" ? null : cache.emoji_id;
      if (cache.description !== undefined)
        updateData.description = cache.description;

      const updated = await prisma.event.update({
        where: { code: eventCode },
        data: updateData,
      });

      clearEventEditCache(ctx, eventCode);

      const savedFields = [
        cache.name !== undefined ? `${ctx.t("setevent-label-name")} ${cache.name}` : "",
        cache.emoji !== undefined ? `${ctx.t("setevent-label-emoji")} ${cache.emoji}` : "",
        cache.emoji_id !== undefined ? `${ctx.t("setevent-label-emoji-id")} ${cache.emoji_id}` : "",
        cache.description !== undefined ? `${ctx.t("setevent-label-description")} ${cache.description}` : "",
      ].filter(Boolean).join("\n");

      const message = `${ctx.t("setevent-success", { name: updated.name })}\n\n${ctx.t("setevent-success-values")}\n${savedFields}`;

      const keyboard = new InlineKeyboard().text(
        ctx.t("setevent-btn-back-list"),
        `setevent_list_${ctx.session.eventListPage || 1}`,
      );

      await ctx.editMessageText(message, {
        parse_mode: "HTML",
        reply_markup: keyboard,
      });
      await ctx.answerCallbackQuery();
    } catch (err) {
      error("[SetEvent] Erro ao salvar evento", err);
      await ctx.answerCallbackQuery(ctx.t("setevent-error-save"));
    }
    return;
  }

  if (action === "edit") {
    const field = parts[2];
    const eventCode = parts[3];

    if (!field || !eventCode) {
      await ctx.answerCallbackQuery(ctx.t("setevent-invalid-data"));
      return;
    }

    const event = await prisma.event.findUnique({
      where: { code: eventCode },
    });

    if (!event) {
      await ctx.answerCallbackQuery(ctx.t("setevent-not-found"));
      return;
    }

    if (!ctx.session.adminSetup) {
      ctx.session.adminSetup = { action: null, targetId: null };
    }
    const normalizedField = field === "emojiid" ? "emojiId" : field;
    ctx.session.adminSetup.action = `setevent_${normalizedField}`;
    ctx.session.adminSetup.targetId = eventCode;

    const currentValues: Record<string, string> = {
      name: event.name,
      emoji: event.emoji,
      emoji_id: event.emoji_id || "",
      description: event.description || "",
    };

    const fieldLabelsKeys: Record<string, string> = {
      name: "setevent-field-name",
      emoji: "setevent-field-emoji",
      emoji_id: "setevent-field-emoji-id",
      emojiid: "setevent-field-emoji-id",
      description: "setevent-field-description",
    };

    const labelKey = fieldLabelsKeys[normalizedField || field];
    const label = labelKey ? ctx.t(labelKey) : field;

    await ctx.reply(
      ctx.t("setevent-prompt-field", { label, name: event.name, code: event.code, current: currentValues[normalizedField || field] || ctx.t("setevent-value-not-defined") }),
      { parse_mode: "HTML", reply_markup: { force_reply: true } },
    );
    await ctx.answerCallbackQuery();
    return;
  }

  await ctx.answerCallbackQuery();
}

function extractCustomEmojiId(
  ctx: MyContext,
): { emoji: string; emojiId: string } | null {
  const message = ctx.message;
  if (!message) return null;

  const text =
    "text" in message
      ? message.text
      : "caption" in message
        ? message.caption
        : null;
  if (!text) return null;

  const entities =
    "entities" in message
      ? message.entities
      : "caption_entities" in message
        ? message.caption_entities
        : [];

  if (!entities || entities.length === 0) return null;

  for (const entity of entities) {
    if (entity.type === "custom_emoji") {
      const emoji = text.slice(entity.offset, entity.offset + entity.length);
      const emojiId = (entity as any).custom_emoji_id;
      if (emojiId) {
        return { emoji, emojiId };
      }
    }
  }

  return null;
}

export async function SetEventReplyHandler(ctx: MyContext) {
  if (!ctx.message?.text && !ctx.message?.caption) return;
  if (!ctx.session.adminSetup?.action?.startsWith("setevent_")) return;

  const { action, targetId } = ctx.session.adminSetup;
  const field = action.replace("setevent_", "");
  let newValue = ctx.message.text?.trim() || ctx.message.caption?.trim() || "";

  if (field === "emojiId") {
    const extracted = extractCustomEmojiId(ctx);
    if (extracted) {
      newValue = extracted.emojiId;
    } else if (newValue.toLowerCase() === "null" || newValue === "") {
      newValue = "__NULL__";
    }
  }

  const cache = getEventEditCache(ctx, targetId!);

  switch (field) {
    case "name":
      cache.name = newValue;
      break;
    case "emoji":
      cache.emoji = newValue;
      break;
    case "emojiId":
      cache.emoji_id = newValue === "__NULL__" ? undefined : newValue;
      break;
    case "description":
      cache.description = newValue;
      break;
  }

  ctx.session.adminSetup = { action: null, targetId: null };

  const event = await prisma.event.findUnique({
    where: { code: targetId! },
  });

  if (!event) {
    await ctx.reply(ctx.t("setevent-not-found"));
    return;
  }

  const keyboard = getEditKeyboard(ctx, event.code, hasChanges(cache), ctx.session.eventListPage || 1);
  const message = await formatEditMessage(event, cache, ctx);

  await ctx.reply(message, {
    parse_mode: "HTML",
    reply_markup: keyboard,
  });
}
