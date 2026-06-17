import { Bot } from "grammy";
import { prisma } from "@/lib/prisma";

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

const GROUP_ADM = process.env.DATABASE_TELEGREM_ID ? Number(process.env.DATABASE_TELEGREM_ID) : 0;

type NotificationData = {
  id: number;
  name: string;
  origem: string;
  media: string;
  mediaType: string;
  rarities: { emoji: string; name: string }[];
  events: { emoji: string; name: string }[];
  addedBy?: { name: string; id: number } | null;
};

export async function notifyCharacterCreation(
  type: "waifu" | "husbando",
  data: NotificationData,
) {
  if (!GROUP_ADM) return;

  const genero = type === "waifu" ? "essa waifu" : "esse husbando";
  const rarityEmojis = data.rarities.map((r) => r.emoji).filter(Boolean);
  const eventEmojis = data.events.map((e) => e.emoji).filter(Boolean);
  const rarityNames = data.rarities.map((r) => r.name).filter(Boolean);
  const eventNames = data.events.map((e) => e.name).filter(Boolean);

  const lines: string[] = [];

  lines.push(`wow! veja ${genero}\n`);
  lines.push(`<b>${data.name}</b>`);

  const eventPart = eventEmojis.length > 0
    ? eventEmojis.length > 1 ? ` [${eventEmojis.join(", ")}]` : ` ${eventEmojis[0]}`
    : "";

  lines.push(`${data.id} : ${data.origem}${eventPart}`);

  if (rarityNames.length > 0) {
    const rarityEmojiPart = rarityEmojis.length > 1
      ? ` [${rarityEmojis.join(", ")}]`
      : rarityEmojis.length === 1 ? ` ${rarityEmojis[0]}` : "";
    lines.push(`Raridade: ${rarityNames[0]}${rarityEmojiPart}`);
  }

  if (eventNames.length > 0) {
    const emoji = eventEmojis[0] || "";
    lines.push(`\n${emoji} ${eventNames[0]} ${emoji}`);
  }

  if (data.addedBy) {
    lines.push(`\n⚕ ᴀᴅᴅᴇᴅ ʙʏ: <a href="tg://user?id=${data.addedBy.id}"><b>${data.addedBy.name}</b></a>`);
  }

  const caption = lines.join("\n");

  try {
    const bot = getBot(type);

    const isVideo = data.mediaType.startsWith("VIDEO");
    const isFileId = data.mediaType.endsWith("FILEID");

    if (isFileId) {
      if (isVideo) {
        await bot.api.sendVideo(GROUP_ADM, data.media, {
          caption,
          parse_mode: "HTML",
        });
      } else {
        await bot.api.sendPhoto(GROUP_ADM, data.media, {
          caption,
          parse_mode: "HTML",
        });
      }
    } else {
      await bot.api.sendMessage(GROUP_ADM, caption, { parse_mode: "HTML" });
    }
  } catch {}
}
