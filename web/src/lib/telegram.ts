import { LRUCache } from "lru-cache";
import { prisma } from "./prisma";
import fs from "fs/promises";
import path from "path";

const tokens = {
  waifu: process.env.BOT_TOKEN_WAIFU,
  husbando: process.env.BOT_TOKEN_HUSBANDO,
};

const DATABASE_TELEGRAM_ID = process.env.DATABASE_TELEGRAM_ID || "-1002400748069";

const TELEGRAM_TIMEOUT = 30 * 1000; // 30 segundos

async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TELEGRAM_TIMEOUT);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

// Cache na memória (file_id -> file_path) para acesso ultrarrápido
const mediaCache = new LRUCache<string, string>({
  max: 1000,
  ttl: 1000 * 60 * 55, // 55 minutos para segurança, antes de expirar no Telegram (1h)
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

  // Se já estiver no cache de memória, retorna instantaneamente a URL montada
  const cachedPath = mediaCache.get(cacheKey);
  if (cachedPath) {
    return `https://api.telegram.org/file/bot${token}/${cachedPath}`;
  }

  try {
    const response = await fetchWithTimeout(
      `https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`,
      { cache: "no-store" }
    );
    
    if (!response.ok) return "";
    
    const data = await response.json();

    if (data.ok && data.result?.file_path) {
      const filePath = data.result.file_path;
      
      // Salva no cache local
      mediaCache.set(cacheKey, filePath);
      
      // Atualiza o banco de dados via Job assíncrono totalmente paralelo
      updatelinkweb(fileId, filePath, type).catch(() => {});
      
      return `https://api.telegram.org/file/bot${token}/${filePath}`;
    }
  } catch (error: unknown) {
    const err = error as Error;
    if (err.name === "AbortError") {
      console.error(`[Telegram API] Timeout ao buscar link do fileId ${fileId}`);
    } else {
      console.error(`[Telegram API] Erro ao buscar link do fileId ${fileId}:`, error);
    }
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
  const expiresAt = new Date(Date.now() + 1000 * 60 * 55); // Expira em 55 mins

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

export async function sendTelegramMessage(
  chatId: string,
  text: string,
  type: "waifu" | "husbando" = "waifu",
) {
  const token = tokens[type];
  if (!token) {
    console.warn(`Token para ${type} não encontrado.`);
    return;
  }

  try {
    await fetchWithTimeout(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
      }),
    });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.name === "AbortError") {
      console.error(`[Telegram API] Timeout ao enviar mensagem`);
    } else {
      console.error(`[Telegram API] Erro ao enviar mensagem:`, error);
    }
  }
}

export interface TelegramSendResult {
  success: boolean;
  fileId?: string;
  error?: string;
}










export async function sendTelegramPhoto(
  chatId: string,
  photo: string,
  caption: string,
  type: "waifu" | "husbando" = "waifu",
): Promise<TelegramSendResult> {
  const token = tokens[type];
  if (!token) {
    console.warn(`Token para ${type} não encontrado.`);
    return { success: false, error: "Token não encontrado" };
  }

  try {
    const response = await fetchWithTimeout(`https://api.telegram.org/bot${token}/sendPhoto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        photo,
        caption,
        parse_mode: "HTML",
      }),
    });

    const data = await response.json();

    if (data.ok && data.result?.photo) {
      const fileId = data.result.photo[data.result.photo.length - 1]?.file_id || data.result.photo[0]?.file_id;
      return { success: true, fileId };
    }

    return { success: false, error: data.description || "Erro ao enviar foto" };
  } catch (error: unknown) {
    const err = error as Error;
    if (err.name === "AbortError") {
      console.error(`[Telegram API] Timeout ao enviar foto`);
    } else {
      console.error(`[Telegram API] Erro ao enviar foto:`, error);
    }
    return { success: false, error: err.name === "AbortError" ? "Timeout" : String(error) };
  }
}

export async function sendTelegramVideo(
  chatId: string,
  video: string,
  caption: string,
  type: "waifu" | "husbando" = "waifu",
): Promise<TelegramSendResult> {
  const token = tokens[type];
  if (!token) {
    console.warn(`Token para ${type} não encontrado.`);
    return { success: false, error: "Token não encontrado" };
  }

  try {
    const response = await fetchWithTimeout(`https://api.telegram.org/bot${token}/sendVideo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        video,
        caption,
        parse_mode: "HTML",
      }),
    });

    const data = await response.json();

    if (data.ok && data.result?.video) {
      const fileId = data.result.video.file_id;
      return { success: true, fileId };
    }

    return { success: false, error: data.description || "Erro ao enviar vídeo" };
  } catch (error: unknown) {
    const err = error as Error;
    if (err.name === "AbortError") {
      console.error(`[Telegram API] Timeout ao enviar vídeo`);
    } else {
      console.error(`[Telegram API] Erro ao enviar vídeo:`, error);
    }
    return { success: false, error: err.name === "AbortError" ? "Timeout" : String(error) };
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
  const token = tokens[type];
  if (!token) {
    console.warn(`Token para ${type} não encontrado.`);
    return { success: false, error: "Token não encontrado" };
  }

  try {
    const absolutePath = filePath.startsWith("/") 
      ? path.join(process.cwd(), "public", filePath)
      : filePath;
    
    const fileBuffer = await fs.readFile(absolutePath);
    const formData = new FormData();
    formData.append("chat_id", DATABASE_TELEGRAM_ID);
    formData.append("photo", new Blob([fileBuffer]), path.basename(filePath));
    formData.append("caption", caption);
    formData.append("parse_mode", "HTML");

    const response = await fetchWithTimeout(`https://api.telegram.org/bot${token}/sendPhoto`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.ok && data.result?.photo) {
      const fileId = data.result.photo[data.result.photo.length - 1]?.file_id || data.result.photo[0]?.file_id;
      return { success: true, fileId };
    }

    return { success: false, error: data.description || "Erro ao enviar foto local" };
  } catch (error: unknown) {
    const err = error as Error;
    if (err.name === "AbortError") {
      console.error(`[Telegram API] Timeout ao enviar foto local`);
    } else {
      console.error(`[Telegram API] Erro ao enviar foto local:`, error);
    }
    return { success: false, error: err.name === "AbortError" ? "Timeout" : String(error) };
  }
}

export async function sendLocalVideoToTelegram(
  filePath: string,
  caption: string,
  type: "waifu" | "husbando" = "waifu",
): Promise<TelegramSendResult> {
  const token = tokens[type];
  if (!token) {
    console.warn(`Token para ${type} não encontrado.`);
    return { success: false, error: "Token não encontrado" };
  }

  try {
    const absolutePath = filePath.startsWith("/") 
      ? path.join(process.cwd(), "public", filePath)
      : filePath;
    
    const fileBuffer = await fs.readFile(absolutePath);
    const formData = new FormData();
    formData.append("chat_id", DATABASE_TELEGRAM_ID);
    formData.append("video", new Blob([fileBuffer]), path.basename(filePath));
    formData.append("caption", caption);
    formData.append("parse_mode", "HTML");

    const response = await fetchWithTimeout(`https://api.telegram.org/bot${token}/sendVideo`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.ok && data.result?.video) {
      const fileId = data.result.video.file_id;
      return { success: true, fileId };
    }

    return { success: false, error: data.description || "Erro ao enviar vídeo local" };
  } catch (error: unknown) {
    const err = error as Error;
    if (err.name === "AbortError") {
      console.error(`[Telegram API] Timeout ao enviar vídeo local`);
    } else {
      console.error(`[Telegram API] Erro ao enviar vídeo local:`, error);
    }
    return { success: false, error: err.name === "AbortError" ? "Timeout" : String(error) };
  }
}
