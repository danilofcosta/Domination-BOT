import { prisma } from "../../../../lib/prisma.js";
import type { MyContext } from "../../../../utils/customTypes.js";
import { InlineKeyboard } from "grammy";
import { error } from "../../../../utils/log.js";
import { rarityCache, getOrSet } from "../../../../cache/cache.js";
import { extrair_customid } from "../../testes_commands.js";
import { Id_to_enomji } from "../../../../utils/manage_captures/extract_emojis.js";

interface RarityEditCache {
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
  rarity: {
    code: string;
    name: string;
    emoji: string;
    emoji_id?: string | null;
    description?: string | null;
  },
  cache: RarityEditCache,
  ctx: MyContext,
): Promise<string> {
  const novoName = cache.name !== undefined ? cache.name : "-";
  const novoEmoji = cache.emoji !== undefined ? cache.emoji : "-";
  const novoEmojiId = cache.emoji_id !== undefined ? (cache.emoji_id === "__NULL__" ? ctx.t("setrarity-value-null") : cache.emoji_id) : "-";
  const novoDesc = cache.description !== undefined ? cache.description : "-";

  const atualEmojiId = rarity.emoji_id || null;
  let atualEmojiIdDisplay = ctx.t("setrarity-value-not-defined");

  if (atualEmojiId && ctx) {
    const emoji = await getCustomEmojiFromId(ctx, atualEmojiId);
    atualEmojiIdDisplay =
      emoji === atualEmojiId ? atualEmojiId : `${emoji} (${atualEmojiId})`;
  } else if (atualEmojiId) {
    atualEmojiIdDisplay = atualEmojiId;
  }

  let novoEmojiIdDisplay = novoEmojiId;
  if (novoEmojiId !== "-" && novoEmojiId !== ctx.t("setrarity-value-null") && ctx) {
    const emoji = await getCustomEmojiFromId(ctx, novoEmojiId);
    novoEmojiIdDisplay =
      emoji === novoEmojiId ? novoEmojiId : `${emoji} (${novoEmojiId})`;
  }

  return `${ctx.t("setrarity-edit-title")} <b>${rarity.name}</b> (${rarity.code})

${ctx.t("setrarity-label-current")}
${ctx.t("setrarity-label-name")} ${rarity.name}
${ctx.t("setrarity-label-emoji")} ${rarity.emoji}
${ctx.t("setrarity-label-emoji-id")} ${atualEmojiIdDisplay}
•show emojid :${rarity.emoji_id ? Id_to_enomji(rarity.emoji_id, rarity.emoji) : ctx.t("setrarity-value-not-set")}

${ctx.t("setrarity-label-new")}
${ctx.t("setrarity-label-name")} ${novoName}
${ctx.t("setrarity-label-emoji")} ${novoEmoji}
${ctx.t("setrarity-label-emoji-id")} ${novoEmojiIdDisplay}
${novoDesc !== "-" ? `${ctx.t("setrarity-label-description")} ${novoDesc}` : ""}
${novoEmojiId !== "-" && novoEmojiId !== ctx.t("setrarity-value-null") ? `•show emojid : ${Id_to_enomji(novoEmojiId, rarity.emoji)}` : ""}


`;
}

const ITEMS_PER_PAGE = 10;

function getEditKeyboard(
  ctx: MyContext,
  rarityCode: string,
  hasChanges: boolean,
  currentPage: number = 1,
): ReturnType<typeof InlineKeyboard.prototype.text> extends (
  ...args: any[]
) => any
  ? InstanceType<any>
  : any {
  const keyboard = new InlineKeyboard()
    .text(ctx.t("setrarity-btn-name"), `setrarity_edit_name_${rarityCode}`)
    .text(ctx.t("setrarity-btn-emoji"), `setrarity_edit_emoji_${rarityCode}`)
    .row()
    .text(ctx.t("setrarity-btn-emoji-id"), `setrarity_edit_emojiId_${rarityCode}`)
    .text(ctx.t("setrarity-btn-description"), `setrarity_edit_description_${rarityCode}`)
    .row();

  if (hasChanges) {
    keyboard.text(ctx.t("setrarity-btn-save"), `setrarity_save_${rarityCode}`);
  }

  keyboard.text(ctx.t("setrarity-btn-back-list"), `setrarity_list_${currentPage}`);

  return keyboard;
}

function getRarityEditCache(
  ctx: MyContext,
  rarityCode: string,
): RarityEditCache {
  if (!ctx.session.rarityEdits) {
    ctx.session.rarityEdits = {};
  }
  if (!ctx.session.rarityEdits[rarityCode]) {
    ctx.session.rarityEdits[rarityCode] = {};
  }
  return ctx.session.rarityEdits[rarityCode];
}

function clearRarityEditCache(ctx: MyContext, rarityCode: string): void {
  if (ctx.session.rarityEdits && ctx.session.rarityEdits[rarityCode]) {
    delete ctx.session.rarityEdits[rarityCode];
  }
}

function hasChanges(cache: RarityEditCache): boolean {
  return Object.values(cache).some((v) => v !== undefined);
}

export async function SetRarityHandler(ctx: MyContext) {
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
    ctx.session.rarityListPage = page;

    const allRarities = await getOrSet(
      rarityCache,
      "rarities:all",
      () => prisma.rarity.findMany({ orderBy: { code: "asc" } }),
    );
    const totalCount = allRarities.length;
    const skip = (page - 1) * ITEMS_PER_PAGE;
    const pageRarities = allRarities.slice(skip, skip + ITEMS_PER_PAGE);

    if (allRarities.length === 0) {
      return ctx.reply(ctx.t("setrarity-empty"));
    }

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE) || 1;
    const keyboard = new InlineKeyboard();

    for (const rarity of pageRarities) {
      keyboard
        .text(
          `${rarity.emoji} ${rarity.name}`,
          `setrarity_select_${rarity.code}`,
        )
        .row();
    }

    const navRow: { text: string; callback_data: string }[] = [];
    if (page > 1) {
      navRow.push({
        text: ctx.t("setrarity-btn-prev"),
        callback_data: `setrarity_list_${page - 1}`,
      });
    }
    if (page < totalPages) {
      navRow.push({
        text: ctx.t("setrarity-btn-next"),
        callback_data: `setrarity_list_${page + 1}`,
      });
    }
    if (navRow.length > 0) {
      keyboard.row(...navRow);
    }

    return ctx.reply(
      ctx.t("setrarity-select-page", { page, totalPages }),
      {
        reply_markup: keyboard,
      },
    );
  }

  const emojiRegex = /^(\p{Emoji_Presentation}|\p{Extended_Pictographic})/u;
  const isEmojiInput = emojiRegex.test(input);

  let rarity: Awaited<ReturnType<typeof prisma.rarity.findUnique>>;

  if (input.includes("|")) {
    const parts = input.split("|").map((p) => p.trim());
    const nameOrCode = parts[0] || "";
    rarity = await prisma.rarity.findFirst({
      where: {
        OR: [
          { code: nameOrCode.toUpperCase() },
          { name: { equals: nameOrCode, mode: "insensitive" } },
        ],
      },
    });
  } else if (isEmojiInput) {
    rarity = await prisma.rarity.findFirst({
      where: {
        OR: [{ emoji: { equals: input } }, { emoji_id: { equals: input } }],
      },
    });
  } else {
    rarity = await prisma.rarity.findUnique({
      where: { code: input.toUpperCase() },
    });

    if (!rarity) {
      rarity = await prisma.rarity.findFirst({
        where: {
          name: { equals: input, mode: "insensitive" },
        },
      });
    }
  }

  if (!rarity) {
    return ctx.reply(ctx.t("setrarity-not-found-id", { input }));
  }

  const cache = getRarityEditCache(ctx, rarity.code);
  const currentPage = ctx.session.rarityListPage || 1;
  const keyboard = getEditKeyboard(ctx, rarity.code, hasChanges(cache), currentPage);
  const message = await formatEditMessage(rarity, cache, ctx);

  await ctx.reply(message, {
    parse_mode: "HTML",
    reply_markup: keyboard,
  });
}

export async function SetRarityCallback(ctx: MyContext) {
  if (!ctx.callbackQuery?.data) return;

  const data = ctx.callbackQuery.data;
  const parts = data.split("_");
  const action = parts[1];

  if (action === "cancel") {
    const rarityCode = parts[2];
    if (rarityCode) {
      clearRarityEditCache(ctx, rarityCode);
    }
    await ctx.editMessageText(ctx.t("setrarity-cancel"));
    await ctx.answerCallbackQuery();
    const keyboard = new InlineKeyboard().text(
      ctx.t("setrarity-btn-back-list"),
      `setrarity_list_${ctx.session.rarityListPage || 1}`,
    );
    await ctx.editMessageReplyMarkup({ reply_markup: keyboard });
    return;
  }

  if (action === "list") {
    const page = Math.max(1, Number(parts[2]) || 1);
    ctx.session.rarityListPage = page;

    const allRarities = await getOrSet(
      rarityCache,
      "rarities:all",
      () => prisma.rarity.findMany({ orderBy: { code: "asc" } }),
    );
    const totalCount = allRarities.length;
    const skip = (page - 1) * ITEMS_PER_PAGE;
    const pageRarities = allRarities.slice(skip, skip + ITEMS_PER_PAGE);

    if (allRarities.length === 0) {
      await ctx.answerCallbackQuery(ctx.t("setrarity-empty"));
      return;
    }

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE) || 1;
    const keyboard = new InlineKeyboard();

    for (const rarity of pageRarities) {
      keyboard
        .text(
          `${rarity.emoji} ${rarity.name}`,
          `setrarity_select_${rarity.code}`,
        )
        .row();
    }

    const navRow: { text: string; callback_data: string }[] = [];
    if (page > 1) {
      navRow.push({
        text: ctx.t("setrarity-btn-prev"),
        callback_data: `setrarity_list_${page - 1}`,
      });
    }
    if (page < totalPages) {
      navRow.push({
        text: ctx.t("setrarity-btn-next"),
        callback_data: `setrarity_list_${page + 1}`,
      });
    }
    if (navRow.length > 0) {
      keyboard.row(...navRow);
    }

    await ctx.editMessageText(
      ctx.t("setrarity-select-page", { page, totalPages }),
      {
        reply_markup: keyboard,
      },
    );
    await ctx.answerCallbackQuery();
    return;
  }

  if (action === "select") {
    const rarityCode = parts[2];
    if (!rarityCode) {
      await ctx.answerCallbackQuery(ctx.t("setrarity-invalid-data"));
      return;
    }

    const rarity = await prisma.rarity.findUnique({
      where: { code: rarityCode },
    });

    if (!rarity) {
      await ctx.answerCallbackQuery(ctx.t("setrarity-not-found"));
      return;
    }

    clearRarityEditCache(ctx, rarityCode);
    const cache = getRarityEditCache(ctx, rarityCode);
    const currentPage = ctx.session.rarityListPage || 1;
    const keyboard = getEditKeyboard(
      ctx,
      rarity.code,
      hasChanges(cache),
      currentPage,
    );
    const message = await formatEditMessage(rarity, cache, ctx);

    await ctx.editMessageText(message, {
      parse_mode: "HTML",
      reply_markup: keyboard,
    });
    await ctx.answerCallbackQuery();
    return;
  }

  if (action === "save") {
    const rarityCode = parts[2];
    if (!rarityCode) {
      await ctx.answerCallbackQuery(ctx.t("setrarity-invalid-data"));
      return;
    }

    const rarity = await prisma.rarity.findUnique({
      where: { code: rarityCode },
    });

    if (!rarity) {
      await ctx.answerCallbackQuery(ctx.t("setrarity-not-found"));
      return;
    }

    const cache = getRarityEditCache(ctx, rarityCode);

    if (!hasChanges(cache)) {
      const keyboard = new InlineKeyboard();
      keyboard.text(
        ctx.t("setrarity-btn-back-list"),
        `setrarity_list_${ctx.session.rarityListPage || 1}`,
      );
      await ctx.editMessageReplyMarkup({ reply_markup: keyboard });
      await ctx.answerCallbackQuery(ctx.t("setrarity-no-changes"));
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

      const updated = await prisma.rarity.update({
        where: { code: rarityCode },
        data: updateData,
      });

      clearRarityEditCache(ctx, rarityCode);

      const savedFields = [
        cache.name !== undefined ? `${ctx.t("setrarity-label-name")} ${cache.name}` : "",
        cache.emoji !== undefined ? `${ctx.t("setrarity-label-emoji")} ${cache.emoji}` : "",
        cache.emoji_id !== undefined ? `${ctx.t("setrarity-label-emoji-id")} ${cache.emoji_id}` : "",
        cache.description !== undefined ? `${ctx.t("setrarity-label-description")} ${cache.description}` : "",
      ].filter(Boolean).join("\n");

      const message = `${ctx.t("setrarity-success", { name: updated.name })}\n\n${ctx.t("setrarity-success-values")}\n${savedFields}`;

      const keyboard = new InlineKeyboard().text(
        ctx.t("setrarity-btn-back-list"),
        `setrarity_list_${ctx.session.rarityListPage || 1}`,
      );

      await ctx.editMessageText(message, {
        parse_mode: "HTML",
        reply_markup: keyboard,
      });
      await ctx.answerCallbackQuery();
    } catch (err) {
      error("[SetRarity] Erro ao salvar raridade", err);
      await ctx.answerCallbackQuery(ctx.t("setrarity-error-save"));
    }
    return;
  }

  if (action === "edit") {
    const field = parts[2];
    const rarityCode = parts[3];

    if (!field || !rarityCode) {
      await ctx.answerCallbackQuery(ctx.t("setrarity-invalid-data"));
      return;
    }

    const rarity = await prisma.rarity.findUnique({
      where: { code: rarityCode },
    });

    if (!rarity) {
      await ctx.answerCallbackQuery(ctx.t("setrarity-not-found"));
      return;
    }

    if (!ctx.session.adminSetup) {
      ctx.session.adminSetup = { action: null, targetId: null };
    }
    const normalizedField = field === "emojiid" ? "emojiId" : field;
    ctx.session.adminSetup.action = `setrarity_${normalizedField}`;
    ctx.session.adminSetup.targetId = rarityCode;

    const currentValues: Record<string, string> = {
      name: rarity.name,
      emoji: rarity.emoji,
      emoji_id: rarity.emoji_id || "",
      description: rarity.description || "",
    };

    const fieldLabelsKeys: Record<string, string> = {
      name: "setrarity-field-name",
      emoji: "setrarity-field-emoji",
      emoji_id: "setrarity-field-emoji-id",
      emojiid: "setrarity-field-emoji-id",
      description: "setrarity-field-description",
    };

    const labelKey = fieldLabelsKeys[normalizedField || field];
    const label = labelKey ? ctx.t(labelKey) : field;

    await ctx.reply(
      ctx.t("setrarity-prompt-field", { label, name: rarity.name, code: rarity.code, current: currentValues[normalizedField || field] || ctx.t("setrarity-value-not-defined") }),
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

export async function SetRarityReplyHandler(ctx: MyContext) {
  if (!ctx.message?.text && !ctx.message?.caption) return;
  if (!ctx.session.adminSetup?.action?.startsWith("setrarity_")) return;

  const { action, targetId } = ctx.session.adminSetup;
  const field = action.replace("setrarity_", "");
  let newValue = ctx.message.text?.trim() || ctx.message.caption?.trim() || "";

  if (field === "emojiId") {
    const extracted = extractCustomEmojiId(ctx);
    if (extracted) {
      newValue = extracted.emojiId;
    } else if (newValue.toLowerCase() === "null" || newValue === "") {
      newValue = "__NULL__";
    }
  }

  const cache = getRarityEditCache(ctx, targetId!);

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

  const rarity = await prisma.rarity.findUnique({
    where: { code: targetId! },
  });

  if (!rarity) {
    await ctx.reply(ctx.t("setrarity-not-found"));
    return;
  }

  const keyboard = getEditKeyboard(
    ctx,
    rarity.code,
    hasChanges(cache),
    ctx.session.rarityListPage || 1,
  );
  const message = await formatEditMessage(rarity, cache, ctx);

  await ctx.reply(message, {
    parse_mode: "HTML",
    reply_markup: keyboard,
  });
}
