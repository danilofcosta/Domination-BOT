import { LRUCache } from "lru-cache";
import { Bot, InputFile } from "grammy";
import { prisma } from "./prisma";
import fs from "fs/promises";
import path from "path";

const tokens = {
  waifu: process.env.BOT_TOKEN_WAIFU || "",
  husbando: process.env.BOT_TOKEN_HUSBANDO || "",
};

const bots = {
  waifu: new Bot(tokens.waifu),
  husbando: new Bot(tokens.husbando),
};

const DATABASE_TELEGRAM_ID = process.env.DATABASE_TELEGRAM_ID || "-1002400748069";

const mediaCache = new LRUCache<string, string>({
  max: 1000,
  ttl: 1000 * 60 * 55,
});

export async function getTelegramImageUrl(
  fileId: string,
  type: "waifu" | "husbando" = "waifu",
): Promise<string> {
  if (!fileId) return "";

  const token = tokens[type];
  if (!token) {
    console.warn(`Token para ${type} não encontrado.`);
    return "";
  }

  const cacheKey = `${type}:${fileId}`;
  const cachedPath = mediaCache.get(cacheKey);
  if (cachedPath) {
    return `https://api.telegram.org/file/bot${token}/${cachedPath}`;
  }

  try {
    const bot = bots[type];
    const file = await bot.api.getFile(fileId);

    if (file.file_path) {
      const filePath = file.file_path;
      mediaCache.set(cacheKey, filePath);
      updatelinkweb(fileId, filePath, type).catch(() => {});
      return `https://api.telegram.org/file/bot${token}/${filePath}`;
    }
  } catch (error) {
    console.error(`[Telegram API] Erro ao buscar link do fileId ${fileId}:`, error);
  }

  return "";
}

async function updatelinkweb(
  fileId: string,
  filePath: string,
  type: "waifu" | "husbando",
) {
  const token = tokens[type];
  if (!token) return;

  const link = `https://api.telegram.org/file/bot${token}/${filePath}`;
  const expiresAt = new Date(Date.now() + 1000 * 60 * 55);

  try {
    if (type === "waifu") {
      await prisma.characterWaifu.updateMany({
        where: { media: fileId },
        data: { linkweb: link, linkwebExpiresAt: expiresAt },
      });
    } else {
      await prisma.characterHusbando.updateMany({
        where: { media: fileId },
        data: { linkweb: link, linkwebExpiresAt: expiresAt },
      });
    }
  } catch (err) {
    console.error(`[Database] Erro ao atualizar o link temporário do ${type}:`, err);
  }
}

export interface TelegramSendResult {
  success: boolean;
  fileId?: string;
  error?: string;
}

export async function sendTelegramMessage(
  chatId: string,
  text: string,
  type: "waifu" | "husbando" = "waifu",
) {
  if (!tokens[type]) {
    console.warn(`Token para ${type} não encontrado.`);
    return;
  }

  try {
    await bots[type].api.sendMessage(chatId, text, { parse_mode: "HTML" });
  } catch (error) {
    console.error(`[Telegram API] Erro ao enviar mensagem:`, error);
  }
}

export async function sendTelegramPhoto(
  chatId: string,
  photo: string,
  caption: string,
  type: "waifu" | "husbando" = "waifu",
): Promise<TelegramSendResult> {
  if (!tokens[type]) {
    console.warn(`Token para ${type} não encontrado.`);
    return { success: false, error: "Token não encontrado" };
  }

  try {
    const result = await bots[type].api.sendPhoto(chatId, photo, {
      caption,
      parse_mode: "HTML",
    });

    const fileId = result.photo?.[result.photo.length - 1]?.file_id || result.photo?.[0]?.file_id;
    return { success: true, fileId };
  } catch (error) {
    console.error(`[Telegram API] Erro ao enviar foto:`, error);
    return { success: false, error: String(error) };
  }
}

export async function sendTelegramVideo(
  chatId: string,
  video: string,
  caption: string,
  type: "waifu" | "husbando" = "waifu",
): Promise<TelegramSendResult> {
  if (!tokens[type]) {
    console.warn(`Token para ${type} não encontrado.`);
    return { success: false, error: "Token não encontrado" };
  }

  try {
    const result = await bots[type].api.sendVideo(chatId, video, {
      caption,
      parse_mode: "HTML",
    });

    const fileId = result.video?.file_id;
    return { success: true, fileId };
  } catch (error) {
    console.error(`[Telegram API] Erro ao enviar vídeo:`, error);
    return { success: false, error: String(error) };
  }
}

export async function notifyDatabaseChannel(
  message: string,
  type: "waifu" | "husbando" = "waifu",
) {
  return sendTelegramMessage(DATABASE_TELEGRAM_ID, message, type);
}

export async function notifyDatabaseChannelWithPhoto(
  photo: string,
  caption: string,
  type: "waifu" | "husbando" = "waifu",
): Promise<TelegramSendResult> {
  return sendTelegramPhoto(DATABASE_TELEGRAM_ID, photo, caption, type);
}

export async function notifyDatabaseChannelWithVideo(
  video: string,
  caption: string,
  type: "waifu" | "husbando" = "waifu",
): Promise<TelegramSendResult> {
  return sendTelegramVideo(DATABASE_TELEGRAM_ID, video, caption, type);
}

export async function sendLocalPhotoToTelegram(
  filePath: string,
  caption: string,
  type: "waifu" | "husbando" = "waifu",
): Promise<TelegramSendResult> {
  if (!tokens[type]) {
    console.warn(`Token para ${type} não encontrado.`);
    return { success: false, error: "Token não encontrado" };
  }

  try {
    const absolutePath = filePath.startsWith("/")
      ? path.join(process.cwd(), "public", filePath)
      : filePath;

    const fileBuffer = await fs.readFile(absolutePath);
    const fileName = path.basename(filePath);

    const result = await bots[type].api.sendPhoto(
      DATABASE_TELEGRAM_ID,
      new InputFile(fileBuffer, fileName),
      { caption, parse_mode: "HTML" }
    );

    const fileId = result.photo?.[result.photo.length - 1]?.file_id || result.photo?.[0]?.file_id;
    return { success: true, fileId };
  } catch (error) {
    console.error(`[Telegram API] Erro ao enviar foto local:`, error);
    return { success: false, error: String(error) };
  }
}

export async function sendLocalVideoToTelegram(
  filePath: string,
  caption: string,
  type: "waifu" | "husbando" = "waifu",
): Promise<TelegramSendResult> {
  if (!tokens[type]) {
    console.warn(`Token para ${type} não encontrado.`);
    return { success: false, error: "Token não encontrado" };
  }

  try {
    const absolutePath = filePath.startsWith("/")
      ? path.join(process.cwd(), "public", filePath)
      : filePath;

    const fileBuffer = await fs.readFile(absolutePath);
    const fileName = path.basename(filePath);

    const result = await bots[type].api.sendVideo(
      DATABASE_TELEGRAM_ID,
      new InputFile(fileBuffer, fileName),
      { caption, parse_mode: "HTML" }
    );

    const fileId = result.video?.file_id;
    return { success: true, fileId };
  } catch (error) {
    console.error(`[Telegram API] Erro ao enviar vídeo local:`, error);
    return { success: false, error: String(error) };
  }
}