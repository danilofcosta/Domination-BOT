import { prisma } from "../../../lib/prisma.js";
import type { MyContext } from "../../utils/customTypes.js";
import { ChatType, type Character } from "../../utils/types.js";
import { createResult } from "./create_inline_result.js";
import { showResults } from "./show_results_inline.js";

const LIMIT = 10;

async function get_harem_collection(ctx: MyContext, telegramId: number, offset: number) {
    const genero = process.env.TYPE_BOT as ChatType;
    const db = genero === ChatType.HUSBANDO ? prisma.husbandoCollection : prisma.waifuCollection;
    const collection = await (db as any).findMany({
        where: {
            userId: telegramId,
        },
        orderBy: {
            createdAt: "desc",
        },
        take: LIMIT,
        skip: offset,
        include: {
            user: true,
            character: {
                include: {
                    events: { include: { event: true } },
                    rarities: { include: { rarity: true } },
                },
            },
        },
    });
    return collection;
}

export async function Harem_iniline_query(ctx: MyContext) {
    if (!ctx.inlineQuery) return;

    const query = ctx.inlineQuery.query;
    const userId = query.split("harem_user_")[1];
    if (!userId) return;

    const telegramId = Number(userId.trim());
    const offset = parseInt(ctx.inlineQuery.offset || "0", 10);

    const coletiton = await get_harem_collection(ctx, telegramId, offset);
    if (!coletiton || !coletiton.length) return;

    const results = coletiton.map((item: any) => {
        return createResult({
            ctx: ctx,
            character: item,
            chatType: process.env.TYPE_BOT as ChatType,
            noformat: true
        });
    });
    const userData =
        (coletiton[0].user.telegramData) || {};
    console.log(userData)   

    await showResults({
        ctx,
        results,
        next_offset: (offset + LIMIT).toString(),
        text: `𝕯𝖔𝖒𝖎𝖓𝖆𝖙𝖎𝖔𝖓𝕾 : ${userData.first_name || 'Domination'}`,
    });
}