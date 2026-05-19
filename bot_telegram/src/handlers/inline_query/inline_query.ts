import { ChatType, type MyContext } from "../../utils/customTypes.js";

import { showResults } from "./show_results_inline.js";
import { createResult } from "./create_inline_result.js";
import { prisma } from "../../lib/prisma.js";
import { log } from "../../utils/log.js";
import { bts_yes_or_no } from "../../utils/btns.js";
import { charCountCache, getOrSet } from "../../cache/cache.js";
const LIMIT = 20;

// busca um personagem em modo inline
export async function getCharacters(ctx: MyContext) {
  if (!ctx.inlineQuery) return;
  const query = ctx.inlineQuery.query;
   let _chatType = Get_chatType(ctx);

  const per =
    _chatType === ChatType.HUSBANDO
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
  // console.log("Result:", per);
  if (!per) return;
  const result = createResult({
    character: per,
    ctx,
    noformat: true,
    chatType: _chatType,
  });

  // console.log("Result:", result);

  await showResults({
    ctx: ctx,
    results: [result],
  });
}


export async function QueryCharacet(ctx: MyContext) {
  if (!ctx.inlineQuery) return;
  const query = ctx.inlineQuery.query.trim();
  const offset = Number(ctx.inlineQuery.offset || "0");
  const chatType = Get_chatType(ctx);
  const isHusbando = chatType === ChatType.HUSBANDO;

  const model = isHusbando
    ? { count: (args: any) => prisma.characterHusbando.count(args), findMany: (args: any) => prisma.characterHusbando.findMany(args) }
    : { count: (args: any) => prisma.characterWaifu.count(args), findMany: (args: any) => prisma.characterWaifu.findMany(args) };
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

  const results = characters.map((char) =>
      
    createResult({ character: char, ctx, noformat: true, chatType  ,reply_markup:    bts_yes_or_no(
      ctx,
      `random-character-yes-${char.id}-${3}`,
      `random-character-no-${char.id}-${2}`,
      char.likes.toString(),
      char.dislikes.toString(),
      "5289772607556568230",
      "5318868949402667784",
    )
})
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

// busca todos os personagens em modo inline
export async function getCharactersall(ctx: MyContext) {
  let chatType = Get_chatType(ctx);
  // if (!ctx.inlineQuery) return;
  const offset = Number(ctx.inlineQuery?.offset) || 0;


  // buscar os personagens em ordem crescente de id, limitando a quantidade de resultados e pulando os já mostrados
  const model = chatType === ChatType.HUSBANDO
    ? { count: () => prisma.characterHusbando.count(), findMany: (args: any) => prisma.characterHusbando.findMany(args) }
    : { count: () => prisma.characterWaifu.count(), findMany: (args: any) => prisma.characterWaifu.findMany(args) };

  const total = await getOrSet(
    charCountCache,
    chatType === ChatType.HUSBANDO ? "count:husbando" : "count:waifu",
    () => model.count(),
  );

  const [pers] = await Promise.all([
    model.findMany({
      include: chatType === ChatType.HUSBANDO
        ? { HusbandoEvent: { include: { Event: true } }, HusbandoRarity: { include: { Rarity: true } } }
        : { WaifuEvent: { include: { Event: true } }, WaifuRarity: { include: { Rarity: true } } },
      take: LIMIT,
      //asc ,desc
      orderBy: { id: "desc" },
      skip: offset,
    })
  ]);

  if (!pers) return;

  // criar os resultados para cada personagem
  const results = pers.map((per) =>
    createResult({
      character: per,
      ctx: ctx,
      noformat: true,
      chatType: chatType,
    }),
  );
  // mostrar os resultados

  const next_offset =
    offset + LIMIT < total ? String(offset + LIMIT) : undefined;

  await showResults({
    ctx: ctx,
    results: results,
    next_offset: next_offset,
    text: `${ctx.t('Logo_bt')} : ${total}`,
  });
}



function Get_chatType(
  ctx: MyContext
){
  let chatType: ChatType | undefined;

    try {
    chatType = ctx.session.settings.genero
  } catch (e) {
    log("erro ao buscar chat type");
    process.env.TYPE_BOT?.toLowerCase() === ChatType.WAIFU
      ? (chatType = ChatType.WAIFU)
      : (chatType = ChatType.HUSBANDO);
  }

  return chatType

}
