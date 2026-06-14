import { Bot } from "grammy";
import { prisma } from "@/lib/prisma";

function getTokens() {
  return {
    waifu: process.env.BOT_TOKEN_WAIFU || "",
    husbando: process.env.BOT_TOKEN_HUSBANDO || "",
  };
}

function getBot(type: "waifu" | "husbando") {
  const tokens = getTokens();
  const token = tokens[type];
  if (!token) throw new Error(`Token para ${type} não encontrado`);
  return new Bot(token);
}

export async function getTelegramImageUrl(
  fileId: string,
  type: "waifu" | "husbando" = "waifu",
): Promise<string> {
  if (!fileId) return "";

  const tokens = getTokens();
  const token = tokens[type];
  if (!token) return "";

  try {
    const bot = getBot(type);
    const file = await bot.api.getFile(fileId);

    if (file.file_path) {
      const filePath = file.file_path;
      const url = `https://api.telegram.org/file/bot${token}/${filePath}`;

      updatelinkweb(fileId, filePath, type).catch(() => {});

      return url;
    }
  } catch {
    return "";
  }

  return "";
}

async function updatelinkweb(
  fileId: string,
  filePath: string,
  type: "waifu" | "husbando",
) {
  const tokens = getTokens();
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
  } catch {}
}

export async function resolveMediaUrl(
  character: {
    mediaType: string;
    media: string;
    linkweb?: string | null;
    linkwebExpiresAt?: Date | string | null;
  },
  type: "waifu" | "husbando" = "waifu",
) {
  try {
    let displayUrl: string | null = null;

    if (
      character.linkweb &&
      character.linkwebExpiresAt &&
      new Date(character.linkwebExpiresAt) > new Date()
    ) {
      displayUrl = character.linkweb;
    } else if (
      character.mediaType === "IMAGE_URL" ||
      character.mediaType === "VIDEO_URL"
    ) {
      displayUrl = character.media || null;
    } else if (
      character.mediaType === "IMAGE_LOCAL" ||
      character.mediaType === "VIDEO_LOCAL"
    ) {
      displayUrl = character.media || null;
    } else if (
      character.mediaType === "IMAGE_FILEID" ||
      character.mediaType === "VIDEO_FILEID"
    ) {
      displayUrl = await getTelegramImageUrl(character.media || "", type);
    } else {
      displayUrl = "/placeholder.png";
    }

    const isVideo =
      character.mediaType === "VIDEO_URL" ||
      character.mediaType === "VIDEO_FILEID" ||
      character.mediaType === "VIDEO_LOCAL";

    return { displayUrl, isVideo };
  } catch {
    return { displayUrl: character.media || "/placeholder.png", isVideo: false };
  }
}
