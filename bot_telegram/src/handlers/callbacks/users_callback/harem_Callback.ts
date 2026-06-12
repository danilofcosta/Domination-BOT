import { InlineKeyboard, Keyboard } from "grammy";
import { getHarem, setHarem, permissionCache } from "../../../cache/cache.js";
import type { MyContext } from "../../../utils/customTypes.js";
import { ProfileType } from "../../../utils/customTypes.js";
import { info, warn, error, debug } from "../../../utils/log.js";
import {  Harem_setup_dict } from "./harem_setup/build.js";
import { Build_btn_harem, Build_btn_Keyboard, bts_yes_or_no } from "../../../utils/btns.js";
import { prisma } from "../../../lib/prisma.js";
import { getUserRole, roleWeights } from "../../../utils/permissions.js";
// recebe s chamadas do bts do harem via callback
//   camada experada : prefixo ,prefixo2 , id do user , ação , extras 
// harem_user_000000_close
// harem_user_000000_pagenext_2


export async function haremCallback(ctx: MyContext) {
  const match = ctx.match as any;
  const parts =
    (typeof match === "string" ? match : match?.input)?.split("_") ?? [];
  const [tag, userTag, userid, action, pageRaw, jumpRaw] = parts;

  const userId = Number(userid);

  const callerRole = await getUserRole(ctx.from?.id ?? 0);
  const isSuperAdmin = roleWeights[callerRole] >= roleWeights[ProfileType.SUPER_ADMIN];

// autentição dono do hare
  if (ctx.from?.id !== userId && !isSuperAdmin) {
    warn(`haremCallback - usuário não autorizado`, {
      expected: userId,
      actual: ctx.from?.id,
    });
    await ctx.answerCallbackQuery(ctx.t("error-action-not-authorized-by-id"));
    return;
  }


// tenta deleta a mensagem
  if (action === "close") {
    await ctx.deleteMessage().catch(() => {});
    return;
  }

  if (action === "delete") {
    if (roleWeights[callerRole] < roleWeights[ProfileType.SUPER_ADMIN]) {
      await ctx.answerCallbackQuery(ctx.t("harem_delete_no_permission"));
      return;
    }

    return await ctx.reply(ctx.t("harem_delete_confirm"), {
      reply_markup: bts_yes_or_no(
        ctx,
        `harem_user_${userId}_del_yes`,
        `harem_user_${userId}_del_no`,
        ctx.t("harem_delete_yes"),
        ctx.t("harem_delete_no"),
      ),
    });
  }

  if (action === "opensetup") {
    // abre os btns no lugar fo teclado do user 
    
    const keyboard = Build_btn_Keyboard(
      Harem_setup_dict.main
    );

    return await ctx.reply("Escolha uma opção:", {
      reply_markup: keyboard,
    });
  }
  
  // busca paginas salva em cache
  const harem = await getHarem(userId);
  
  if (!harem) {
    warn(`haremCallback - harém não encontrado no cache`, { userId });
    return;
  }

  const total = harem.length;
  let page = Number(pageRaw ?? 0);

  if (isNaN(page)) return;

  if (action === "del") {
    if (pageRaw === "yes") {
      const targetRole = await getUserRole(userId);
      if (roleWeights[targetRole] >= roleWeights[ProfileType.ADMIN]) {
        await ctx.deleteMessage().catch(() => {});
        await ctx.reply(ctx.t("harem_delete_cannot_admin"));
        await ctx.answerCallbackQuery();
        return;
      }

      await prisma.$transaction([
        prisma.husbandoCollection.deleteMany({ where: { userId: BigInt(userId) } }),
        prisma.waifuCollection.deleteMany({ where: { userId: BigInt(userId) } }),
        prisma.user.upsert({
          where: { telegramId: BigInt(userId) },
          update: { profileType: ProfileType.BANNED },
          create: {
            telegramId: BigInt(userId),
            profileType: ProfileType.BANNED,
            telegramData: {},
            favoriteWaifuId: null,
            favoriteHusbandoId: null,
            waifuConfig: {},
            husbandoConfig: {},
          },
        }),
      ]);

      permissionCache.delete(String(userId));
      setHarem(userId, null);

      await ctx.deleteMessage().catch(() => {});
      await ctx.reply(ctx.t("harem_delete_success"));
    } else {
      await ctx.deleteMessage().catch(() => {});
    }

    await ctx.answerCallbackQuery();
    return;
  }

  let jump = Number(jumpRaw ?? 2);
  if (isNaN(jump)) jump = 2;

  if (action === "prev") page--;
  if (action === "next") page++;
  if (action === "jump") page += jump;
  if (action === "page") page = 0;

  if (page < 0) page = 0;
  if (page >= total) page = total - 1;

  const nextJump = jump * 2;

  debug(`haremCallback - navegando harém`, { userId, page, action });
  const keyboard = Build_btn_harem({
    ctx: ctx,
    current_page: page,
    total_page: total,
    userId: userId,
    nextJump: nextJump,
    isadmin: true,
    canDelete: isSuperAdmin,
  });

  try {
    await ctx.editMessageCaption({
      caption: harem[page],
      reply_markup: keyboard,
      parse_mode: "HTML",
    });
  } catch (e: any) {
    if (e?.description?.includes("there is no caption")) {
      await ctx.editMessageText(harem[page], {
        reply_markup: keyboard,
        parse_mode: "HTML",
      });
    } else {
      error(`haremCallback - erro ao editar caption`, e);
    }
  }

  await ctx.answerCallbackQuery();
}

