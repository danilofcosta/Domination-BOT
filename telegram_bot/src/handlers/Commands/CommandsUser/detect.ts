import { prisma } from "../../../lib/prisma.js";
import { ChatType, type MyContext } from "../../../uteis/CustomTypes.js";
import { error, info, warn } from "../../../uteis/log.js";
import { SendMensageCustom } from "../../../uteis/sendMensageCustom.js";
import { CreateMentionUser } from "../../../uteis/uteis_telegram/CreateMentionUser.js";
import { GetCharacterById } from "../../../uteis/extras/GetCharacterById.js";

const SOURCE_TYPE_EMOJI: Record<string, string> = {
  ANIME: "📺",
  GAME: "🎮",
  MANGA: "📚",
  MOVIE: "🎬",
};

export async function DetectHandler(ctx: MyContext) {
  try {
    const raw = String(ctx.match ?? "").trim();
    const noCache = /(?:^|\s)nocache(?:\s|$)/i.test(raw);
    const idStr = raw.replace(/nocache/gi, "").trim();
    const detectId = Number(idStr);

    if (!ctx.match || idStr === "" || isNaN(detectId)) {
      return SendMensageCustom({
        ctx,
        caption: [
          "Por favor, forneça um ID de personagem.",
          "Uso: /detect &lt;id_do_personagem&gt; [nocache]",
          "💡 <code>nocache</code> busca direto no banco, sem cache.",
        ].join("\n"),
      });
    }

    info("DetectHandler - buscando personagem", {
      id: detectId,
      genero: ctx.botType,
      noCache,
    });

    const character = await GetCharacterById(ctx.botType, detectId, !noCache);
    if (!character) {
      warn("DetectHandler - personagem não encontrado", { id: detectId });
      return SendMensageCustom({
        ctx,
        caption: "Personagem não encontrado. Verifique o ID informado.",
      });
    }

    const isHusbando = ctx.botType === ChatType.HUSBANDO;
    const collections = isHusbando
      ? await prisma.husbandoCollection.findMany({
          where: { characterId: detectId },
          include: {
            TelegramUser: { select: { telegramId: true, telegramData: true } },
          },
        })
      : await prisma.waifuCollection.findMany({
          where: { characterId: detectId },
          include: {
            TelegramUser: { select: { telegramId: true, telegramData: true } },
          },
        });

    const char = character as any;
    const rarity =
      char?.WaifuRarity?.[0]?.Rarity ?? char?.HusbandoRarity?.[0]?.Rarity;

    const addby = char?.addby as
      | { id?: number; first_name?: string; last_name?: string }
      | null
      | undefined;
    const uploader = addby?.id
      ? CreateMentionUser({
          Nome: `${addby.first_name ?? "Usuário"}${
            addby.last_name ? ` ${addby.last_name}` : ""
          }`,
          telegramiduser: addby.id,
        })
      : "—";

    const sourceType = String(char?.sourceType ?? "ANIME");
    const sourceEmoji = SOURCE_TYPE_EMOJI[sourceType] ?? "";

    const infoLines = [
      `Nome: <b>${character.name}</b>`,
      `Anime: ${character.origem}${sourceEmoji ? ` (${sourceEmoji})` : ""}`,
      `Raridade: ${rarity?.emoji ?? ""} ${rarity?.name ?? "—"}`.trim(),
      `ID do personagem: <code>${character.id}</code>`,
      `Adicionado por: ${uploader}`,
    ];



    const usersList = collections.map((c) => {
      
      const data = (c.TelegramUser?.telegramData ?? {}) as Record<string, any>;
      const name = data.first_name ?? "Usuário";
    
      const username = data.username ? ` (@${data.username})` :  CreateMentionUser({ Nome: data.first_name ??'', telegramiduser:   Number(c.TelegramUser?.telegramId ?? c.userId ?? 0)});
      return `• ${name}${username.trim()} (<code>${String(
        c.TelegramUser?.telegramId ?? c.userId,
      )}</code>)`;
    });

    const caption = [
      infoLines.join("\n"),
      "",
      "-------------------------",
      "",
      usersList.length
        ? ["Lista de usuários:", "", ...usersList].join("\n")
        : "Ninguém possui esse personagem ainda.",
    ].join("\n");

    info("DetectHandler - resposta montada", {
      id: detectId,
      owners: usersList.length,
    });

    return SendMensageCustom({ ctx, caption,character });
  } catch (e) {
    error("DetectHandler - erro ao buscar personagem", e);
    return SendMensageCustom({
      ctx,
      caption: "Erro ao buscar o personagem. Tente novamente.",
    });
  }
}
