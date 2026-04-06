import { LRUCache } from "lru-cache";
import { prisma } from "./prisma";

const tokens = {
  waifu: process.env.BOT_TOKEN_WAIFU,
  husbando: process.env.BOT_TOKEN_HUSBANDO,
};

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
    const response = await fetch(
      `https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`,
      { cache: "no-store" } // Evita conflitos com cache global do Next.js para links expirados
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
