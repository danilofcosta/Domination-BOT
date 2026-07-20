import { ChatType, type MyContext } from "../../../uteis/CustomTypes.js";
import { showResults } from "../uteis/show_results_inline.js";
import { createResult } from "../uteis/create_inline_result.js";
import { prisma } from "../../../lib/prisma.js";
import { log } from "../../../uteis/log.js";
import { CreateButtunConfirmation } from "../../../uteis/buildButtons/createButtonConfirmation.js";
import { getOrSet, rankingCache } from "../../../cache/cache.js";

export async function getCharacters(ctx: MyContext) {
  if (!ctx.inlineQuery) return;
  const query = ctx.inlineQuery.query;
  if (!query || isNaN(Number(query))) return;
  const chatType = ctx.botType;

  const per =
    chatType === ChatType.HUSBANDO
      ? await prisma.characterHusbando.findFirst({
          where: { id: Number(query) },
          include: {
            HusbandoEvent: { include: { Event: true } },
            HusbandoRarity: { include: { Rarity: true } },
          },
        })
      : await prisma.characterWaifu.findFirst({
          where: { id: Number(query) },
          include: {
            WaifuEvent: { include: { Event: true } },
            WaifuRarity: { include: { Rarity: true } },
          },
        });

  if (!per) return;
  const result = createResult({
    character: per,
    t: ctx.t,
    rawEmoji: true,
    chatType,
  });

  await showResults({
    ctx,
    results: [result],
  });
}

export async function QueryCharacet(ctx: MyContext) {
  const LIMIT = 20;

  if (!ctx.inlineQuery) return;
  const query = ctx.inlineQuery.query.trim();
  const offset = Number(ctx.inlineQuery.offset || "0");
  const chatType = ctx.botType;
  const isHusbando = chatType === ChatType.HUSBANDO;

  const model = isHusbando
    ? {
        count: (args: any) => prisma.characterHusbando.count(args),
        findMany: (args: any) => prisma.characterHusbando.findMany(args),
      }
    : {
        count: (args: any) => prisma.characterWaifu.count(args),
        findMany: (args: any) => prisma.characterWaifu.findMany(args),
      };

  const include = isHusbando
    ? { HusbandoEvent: { include: { Event: true } }, HusbandoRarity: { include: { Rarity: true } } }
    : { WaifuEvent: { include: { Event: true } }, WaifuRarity: { include: { Rarity: true } } };

  const where = {
    OR: [
      { name: { contains: query, mode: 'insensitive' as const } },
      { origem: { contains: query, mode: 'insensitive' as const } },
    ],
  };

  const [characters, total] = await Promise.all([
    model.findMany({ where, take: LIMIT, skip: offset, orderBy: { id: 'desc' }, include }),
    model.count({ where }),
  ]);

  const results = characters.map((char: any) =>
    createResult({
      character: char,
      t: ctx.t,
      rawEmoji: true,
      chatType,
      reply_markup: CreateButtunConfirmation(
        ctx,
        `random-character-yes-${char.id}-${3}`,
        `random-character-no-${char.id}-${2}`,
        char.likes?.toString(),
        char.dislikes?.toString(),
        "5289772607556568230",
        "5318868949402667784",
      ),
    }),
  );

  await showResults({
    ctx,
    results,
    next_offset: offset + LIMIT < total ? String(offset + LIMIT) : undefined,
    text: results.length === 0
      ? ctx.t('query_not_fould')
      : `${ctx.t('Logo_bt')} : ${total}`,
  });
}

export async function getCharactersall(ctx: MyContext) {
  const LIMIT = 20;
  if (!ctx.inlineQuery) return;
  const offset = Number(ctx.inlineQuery?.offset) || 0;
  const chatType = ctx.botType;
  const isHusbando = chatType === ChatType.HUSBANDO;

  const model = isHusbando
    ? {
        count: () => prisma.characterHusbando.count(),
        findMany: (args: any) => prisma.characterHusbando.findMany(args),
      }
    : {
        count: () => prisma.characterWaifu.count(),
        findMany: (args: any) => prisma.characterWaifu.findMany(args),
      };

  const total = await getOrSet(
    rankingCache,
    isHusbando ? "count:husbando" : "count:waifu",
    () => model.count(),
  );

  const include = isHusbando
    ? { HusbandoEvent: { include: { Event: true } }, HusbandoRarity: { include: { Rarity: true } } }
    : { WaifuEvent: { include: { Event: true } }, WaifuRarity: { include: { Rarity: true } } };

  const [pers] = await Promise.all([
    model.findMany({
      include,
      take: LIMIT,
      orderBy: { id: "desc" },
      skip: offset,
    }),
  ]);

  if (!pers) return;

  const results = pers.map((per: any) =>
    createResult({
      character: per,
      t: ctx.t,
      rawEmoji: true,
      chatType,
    }),
  );

  const next_offset = offset + LIMIT < total ? String(offset + LIMIT) : undefined;

  await showResults({
    ctx,
    results,
    next_offset,
    text: `${ctx.t('Logo_bt')} : ${total}`,
  });
}
