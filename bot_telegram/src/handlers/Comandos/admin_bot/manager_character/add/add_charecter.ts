import { prisma } from "../../../../../lib/prisma.js";
import { setCharacter } from "../../../../../cache/cache.js";
import { LinkMsg } from "../../../../../utils/link_msg.js";
import { mentionUser } from "../../../../../utils/metion_user.js";
import { create_caption } from "../../../../../utils/manege_caption/create_caption.js";
import { Sendmedia } from "../../../../../utils/sendmedia.js";
import {
  ChatType,
  MediaType,
  type MyContext,
  type PreCharacter,
} from "../../../../../utils/customTypes.js";
const processingQueue: (() => Promise<void>)[] = [];
let isProcessing = false;
const TELEGRAM_API_DELAY_MS = 3000;

async function processQueue() {
  if (isProcessing || processingQueue.length === 0) return;
  isProcessing = true;

  while (processingQueue.length > 0) {
    const task = processingQueue.shift()!;
    try {
      await task();
    } catch (err) {
      console.error("[AddCharacterQueue] Error processing task:", err);
    }
    if (processingQueue.length > 0) {
      await new Promise((resolve) =>
        setTimeout(resolve, TELEGRAM_API_DELAY_MS),
      );
    }
  }

  isProcessing = false;
}

export async function AddCharacterHandler(ctx: MyContext) {
  console.log("add per");
  let text_command: string | undefined;
  let reply = ctx.message?.reply_to_message;
  //vericar se e uma midia 
  if (ctx.message?.caption && (ctx.message?.photo || ctx.message?.video)) {
    reply = (ctx?.message as any) ?? undefined;
  }
// comando não associado a uma midia 
  if (!reply) {
    ctx.reply(ctx.t("add_character_not_reply"));
    return;
  }
  // extrai o file id da mensagem
  const media = getMedia(reply);



  if (!media) {
    ctx.reply(ctx.t("add-char-only-photo-video"));
    return;
  }


  //tratando o texto do comando
  text_command =  ctx.match?.length === 0 ? reply.caption : (ctx.match as string);

  if (!text_command) {
    text_command = "";
  }
  const isNoconf = (text_command || "").toLowerCase().includes("noconf");
  const isNoautor = (text_command || "").toLowerCase().includes("noautor");
  const cleanCommand = (text_command || "")
    .replace(/noconf|noautor/gi, "")
    .trim();
// caso nem um texto for achado
  if (!cleanCommand.includes(",")) {
    ctx.reply(ctx.t("add-char-usage"));
    return;
  }

  const [nome, anime, ...rest] = cleanCommand.split(",");
  //anime e nome sao requeridos caso nãp seja passado 
  if (!nome || !anime) {
    ctx.reply(ctx.t("add_character_not_info"));
    return;
  }

  const { rarities, events } = parseTokens(rest);

  const charData: PreCharacter = {
    idchat: ctx.message!.message_id,
    nome: nome.trim(),
    anime: anime.trim(),
    rarities,
    events,
    genero: ctx.session.settings.genero,
    mediatype: media.type,
    media: media.file_id,
    username: ctx.from?.first_name || "",
    user_id: ctx.from?.id || 0,
    extras: ctx.from as Record<string, any>,
  };

  /// caso pametro noconf for passado na mensagem , n confimar dados
  /// caso isNoautor for passado nao infirmar o autor (dados de quem add o character )
  if (isNoconf) {
    const queuePosition = processingQueue.length;
    await ctx.reply(ctx.t("add-char-queue", { pos: queuePosition + 1 }));

    processingQueue.push(async () => {
      await addCharacterDirect(ctx, charData, isNoautor);
    });

    void processQueue();
    return;
  }

  await confirmCharacter(ctx, charData);
}

function getMedia(
  reply: any,
): { file_id: string; type: MediaType } | undefined {
  if (reply.photo?.length) {
    return {
      file_id: reply.photo.at(-1).file_id,
      type: MediaType.IMAGE_FILEID,
    };
  }

  if (reply.video) {
    return {
      file_id: reply.video.file_id,
      type: MediaType.VIDEO_FILEID,
    };
  }

  return undefined;
}

function parseTokens(rest: string[]) {
  const tokens = rest.join(" ").toLowerCase().split(/\s+/);

  const rarities: number[] = [];
  const events: number[] = [];

  for (const token of tokens) {
    if (!token) continue;

    if (token.startsWith("r")) {
      const id = parseInt(token.slice(1), 10);
      if (!isNaN(id)) rarities.push(id);
    }

    if (token.startsWith("e")) {
      const id = parseInt(token.slice(1), 10);
      if (!isNaN(id)) events.push(id);
    }
  }

  return {
    rarities: rarities.length ? rarities : undefined,
    events: events.length ? events : undefined,
  };
}

async function getRandomRarity(genero: ChatType): Promise<number | undefined> {
  const rarities =
    genero === "husbando"
      ? await prisma.husbandoRarity.findMany({ select: { rarityId: true } })
      : await prisma.waifuRarity.findMany({ select: { rarityId: true } });

  if (rarities.length === 0) return undefined;

  const randomIndex = Math.floor(Math.random() * rarities.length);
  return rarities[randomIndex]?.rarityId;
}

async function addCharacterDirect(
  ctx: MyContext,
  data: PreCharacter,
  isNoautor: boolean,
) {
  let rarities = data.rarities;

  if (!rarities || rarities.length === 0) {
    const randomRarity = await getRandomRarity(data.genero);
    if (randomRarity) {
      rarities = [randomRarity];
      console.log("addCharacterDirect - raridade aleatoria:", randomRarity);
    }
  }

  const slug = generateSlug(data.nome, data.anime);
  const extras = data.extras as any;

  try {
    if (data.genero === "husbando") {
      const char = await prisma.$transaction(async (tx) => {
        const created = await tx.characterHusbando.create({
          data: {
            name: data.nome,
            origem: data.anime,
            mediaType: data.mediatype,
            media: data.media,
            slug,
            addby: extras,
          },
        });

        if (rarities && rarities.length > 0) {
          await tx.husbandoRarity.createMany({
            data: rarities.map((rarityId) => ({
              characterId: created.id,
              rarityId,
            })),
          });
        }

        if (data.events && data.events.length > 0) {
          await tx.husbandoEvent.createMany({
            data: data.events.map((eventId) => ({
              characterId: created.id,
              eventId,
            })),
          });
        }

        return created;
      });

      const character_db = await prisma.characterHusbando.findUnique({
        where: { id: char.id },
        include: {
          HusbandoRarity: { include: { Rarity: true } },
          HusbandoEvent: { include: { Event: true } },
        },
      });

      await sendAddedNotification(ctx, character_db, data, isNoautor);
    } else {
      const char = await prisma.$transaction(async (tx) => {
        const created = await tx.characterWaifu.create({
          data: {
            name: data.nome,
            origem: data.anime,
            mediaType: data.mediatype,
            media: data.media,
            slug,
            addby: extras,
          },
        });

        if (rarities && rarities.length > 0) {
          await tx.waifuRarity.createMany({
            data: rarities.map((rarityId) => ({
              characterId: created.id,
              rarityId,
            })),
          });
        }

        if (data.events && data.events.length > 0) {
          await tx.waifuEvent.createMany({
            data: data.events.map((eventId) => ({
              characterId: created.id,
              eventId,
            })),
          });
        }

        return created;
      });

      const character_db = await prisma.characterWaifu.findUnique({
        where: { id: char.id },
        include: {
          WaifuRarity: { include: { Rarity: true } },
          WaifuEvent: { include: { Event: true } },
        },
      });

      await sendAddedNotification(ctx, character_db, data, isNoautor);
    }
  } catch (e: any) {
    console.error("addCharacterDirect error:", e);
    await ctx.reply(
      ctx.t("add-char-error", { error: e?.message || "erro desconhecido" }),
    );
  }
}

async function sendAddedNotification(
  ctx: MyContext,
  character_db: any,
  data: PreCharacter,
  isNoautor: boolean,
) {
  const chatId = process.env.DATABASE_TELEGRAM_ID;

  if (!chatId) {
    console.log(
      "sendAddedNotification - DATABASE_TELEGRAM_ID nao configurado, pulando envio",
    );
    await ctx.reply(ctx.t("add-char-success"));
    return;
  }

  const usermention = mentionUser(data.username || "user", data.user_id);

  const caption = create_caption({
    ctx,
    chatType: data.genero,
    character: character_db,
    username: null,
    user_id: null,
    noformat: false,
  });

  const fullCaption = isNoautor
    ? caption
    : caption +
      "\n\n" +
      ctx.t("add_character_confirm", {
        usermention,
      });

  await Sendmedia({
    ctx,
    chat_id: chatId,
    caption: fullCaption,
    per: character_db,
  });
}

let slugCounter = 0;

function generateSlug(nome: string, anime: string): string {
  slugCounter++;
  const base = (nome + "-" + anime)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return base + "-" + Date.now() + "-" + slugCounter;
}

async function confirmCharacter(ctx: MyContext, data: PreCharacter) {
  const { idchat, nome, anime, rarities, events, genero, mediatype, media } =
    data;

  const textoRarities = rarities
    ? rarities.toString()
    : ctx.t("add-char-default-value");
  const textoEvents = events
    ? events.toString()
    : ctx.t("add-char-default-event");
  const text = ctx.t("add-char-preview", {
    nome: nome,
    anime: anime,
    genero: genero,
    mediatype: mediatype,
    media: media,
    link: LinkMsg(Number(ctx.chat?.id), Number(idchat)),
    rarities: textoRarities,
    events: textoEvents,
  });

  const id = Date.now();

  setCharacter(id, data);

  await ctx.reply(text, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: ctx.t("add_character_btn_confirm"),
            callback_data: "addcharacter_confirm_" + id,
          },
          {
            text: ctx.t("add_character_btn_cancel"),
            callback_data: "addcharacter_cancel_" + id,
          },
          {
            text: ctx.t("add_character_btn_edit"),
            callback_data: "addcharacter_edit_" + id,
          },
        ],
      ],
    },
  });
}
