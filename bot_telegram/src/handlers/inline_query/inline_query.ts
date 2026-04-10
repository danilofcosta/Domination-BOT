import { ChatType, type MyContext } from "../../utils/customTypes.js";

import { showResults } from "./show_results_inline.js";
import { createResult } from "./create_inline_result.js";
import { prisma } from "../../../lib/prisma.js";
const LIMIT = 25;

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


// busca todos os personagens em modo inline
export async function getCharactersall(ctx: MyContext) {
  let chatType = Get_chatType(ctx);
  // if (!ctx.inlineQuery) return;
  const offset = Number(ctx.inlineQuery?.offset) || 0;


  // buscar os personagens em ordem crescente de id, limitando a quantidade de resultados e pulando os já mostrados
  const model = chatType === ChatType.HUSBANDO
    ? { count: () => prisma.characterHusbando.count(), findMany: (args: any) => prisma.characterHusbando.findMany(args) }
    : { count: () => prisma.characterWaifu.count(), findMany: (args: any) => prisma.characterWaifu.findMany(args) };

  const [pers, total] = await Promise.all([
    model.findMany({
      include: chatType === ChatType.HUSBANDO
        ? { HusbandoEvent: { include: { Event: true } }, HusbandoRarity: { include: { Rarity: true } } }
        : { WaifuEvent: { include: { Event: true } }, WaifuRarity: { include: { Rarity: true } } },
      take: LIMIT,
      orderBy: { id: "desc" },
      skip: offset,
    }),
    model.count(),
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
    console.log("erro ao buscar chat type");
    process.env.TYPE_BOT?.toLowerCase() === ChatType.WAIFU
      ? (chatType = ChatType.WAIFU)
      : (chatType = ChatType.HUSBANDO);
  }

  return chatType

}
