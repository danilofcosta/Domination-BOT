import { Bot, InputFile } from "grammy";

const botCache: Partial<Record<"waifu" | "husbando", Bot>> = {};

function getBot(type: "waifu" | "husbando") {
  if (botCache[type]) return botCache[type]!;
  const token = type === "waifu"
    ? process.env.BOT_TOKEN_WAIFU || ""
    : process.env.BOT_TOKEN_HUSBANDO || "";
  if (!token) throw new Error(`Token para ${type} não encontrado`);
  botCache[type] = new Bot(token);
  return botCache[type]!;
}

const GROUP_ADM = process.env.GROUP_ADM ? Number(process.env.GROUP_ADM) : 0;

export async function uploadMediaToTelegram(
  buffer: Buffer,
  filename: string,
  type: "waifu" | "husbando",
): Promise<{ fileId: string; mimeType: string }> {
  if (!GROUP_ADM) throw new Error("GROUP_ADM não configurado");

  const bot = getBot(type);

  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const isVideo = ["mp4", "webm", "mov", "avi", "mkv"].includes(ext);

  const inputFile = new InputFile(buffer, filename);

  let msg: { message_id: number };
  let fileId: string;

  if (isVideo) {
    const videoMsg = await bot.api.sendVideo(GROUP_ADM, inputFile);
    fileId = videoMsg.video?.file_id ?? "";
    msg = videoMsg;
  } else {
    const photoMsg = await bot.api.sendPhoto(GROUP_ADM, inputFile);
    fileId = photoMsg.photo?.at(-1)?.file_id ?? "";
    msg = photoMsg;
  }

  const mimeType = isVideo ? "video/mp4" : "image/jpeg";

  if (!fileId) throw new Error("Não foi possível obter o file_id do Telegram");

  try {
    await bot.api.deleteMessage(GROUP_ADM, msg.message_id);
  } catch {}

  return { fileId, mimeType };
}
