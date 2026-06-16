import { Bot } from "grammy";

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

type Changes = {
  name?: { from: string; to: string };
  origem?: { from: string; to: string };
  rarity?: { from: string; to: string };
  event?: { from: string; to: string };
  mediaChanged?: boolean;
};

export async function notifyCharacterUpdate(
  type: "waifu" | "husbando",
  id: number,
  changes: Changes,
) {
  if (!GROUP_ADM) return;

  const lines: string[] = [];
  lines.push(`🔄 #${id} foi alterada\n`);

  if (changes.mediaChanged) lines.push(" Mídia alterada");
  if (changes.name) lines.push(` Nome: ${changes.name.to}`);
  if (changes.origem) lines.push(` Anime: ${changes.origem.to}`);
  if (changes.rarity) lines.push(` Raridade: ${changes.rarity.to}`);
  if (changes.event) lines.push(`Evento: ${changes.event.to}`);

  if (lines.length <= 1) return;

  try {
    const bot = getBot(type);
  //  await bot.api.sendMessage(GROUP_ADM, lines.join("\n"));
    await bot.api.sendMessage(6874062454, lines.join("\n"));
  } catch {}
}
