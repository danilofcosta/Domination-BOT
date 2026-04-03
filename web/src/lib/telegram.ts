import { LRUCache } from "lru-cache";
import { prisma } from "./prisma";

const token_waifu = process.env.BOT_TOKEN_WAIFU;
const token_husbando = process.env.BOT_TOKEN_HUSBANDO;

// Cache para file_id -> file_path
const mediaCache = new LRUCache<string, string>({
  max: 1000,
  ttl: 1000 * 60 * 60, // 1 hora
});

export async function getTelegramImageUrl(
  fileId: string,
  type: "waifu" | "husbando" = "waifu",
): Promise<string> {
  console.log(fileId, "fileId");
  if (!fileId) return "";

  const token = type === "waifu" ? token_waifu : token_husbando;
  if (!token) {
    console.warn(`Token para ${type} não encontrado.`);
    return "";
  }

  // Se já estiver no cache, retorna a URL montada com o file_path
  const cachedPath = mediaCache.get(`${type}:${fileId}`);
  if (cachedPath) {
    return `https://api.telegram.org/file/bot${token}/${cachedPath}`;
  }

  try {
    console.log("buscando link do telegram");
    const response = await fetch(
      `https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`,
    );
    const data = await response.json();

    if (data.ok && data.result.file_path) {
      const filePath = data.result.file_path;
      mediaCache.set(`${type}:${fileId}`, filePath);
      updatelinkweb(fileId, filePath, type).catch(console.error);
      return `https://api.telegram.org/file/bot${token}/${filePath}`;
    }
  } catch (error) {
    console.error("Erro ao buscar link do Telegram:", error);
  }

  return "";
}

async function updatelinkweb(
  fileId: string,
  filePath: string,
  type: "waifu" | "husbando",
) {
  const token = type === "waifu" ? token_waifu : token_husbando;
  if (!token) {
    console.warn(`Token para ${type} não encontrado.`);
    return "";
  }

  const link = `https://api.telegram.org/file/bot${token}/${filePath}`;
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1h
  console.log("salvando linkweb");
  try {
    if (type === "waifu") {
      await prisma.characterWaifu.updateMany({
        where: {
          media: fileId,
        },
        data: {
          linkweb: link,
          linkwebExpiresAt: expiresAt,
        },
      });
    } else {
      await prisma.characterHusbando.updateMany({
        where: {
          media: fileId,
        },
        data: {
          linkweb: link,
          linkwebExpiresAt: expiresAt,
        },
      });
    }
  } catch (err) {
    console.error("Erro ao atualizar linkweb:", err);
  }
}
