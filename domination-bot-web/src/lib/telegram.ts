import { LRUCache } from "lru-cache";

const token_waifu = process.env.BOT_TOKEN_WAIFU;
const token_husbando = process.env.BOT_TOKEN_HUSBANDO;

// Cache para file_id -> file_path
const mediaCache = new LRUCache<string, string>({
  max: 1000,
  ttl: 1000 * 60 * 60, // 1 hora
});

export async function getTelegramImageUrl(fileId: string, type: "waifu" | "husbando" = "waifu"): Promise<string> {
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
    const response = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`);
    const data = await response.json();

    if (data.ok && data.result.file_path) {
      const filePath = data.result.file_path;
      mediaCache.set(`${type}:${fileId}`, filePath);
      return `https://api.telegram.org/file/bot${token}/${filePath}`;
    }
  } catch (error) {
    console.error("Erro ao buscar link do Telegram:", error);
  }

  return "";
}
