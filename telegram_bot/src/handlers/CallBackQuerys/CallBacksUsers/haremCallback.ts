import { prisma } from "../../../lib/prisma.js";
import type { MyContext } from "../../../uteis/CustomTypes.js";
import { ProfileType } from "../../../../generated/prisma/client.js";
import { info, warn, error } from "../../../uteis/log.js";
import { getHarem, setHarem, permissionCache } from "../../../cache/cache.js";
import { getUserRole, roleWeights } from "../../../uteis/permissions.js";
import { Build_btn_harem } from "../../../uteis/buildButtons/GenerateButtonharems.js";
import { CreateButtunConfirmation } from "../../../uteis/buildButtons/createButtonConfirmation.js";

type HaremAction =
  | { type: "close" }
  | { type: "delete" }
  | { type: "del"; decision: "yes" | "no" }
  | { type: "opensetup" }
  | { type: "prev" | "next" | "page" | "jump"; page: number; jump: number };

function parseCallbackData(
  data: string,
): { userId: number; action: HaremAction } | null {
  const nav = data.match(
    /^harem_user_(\d+)_(prev|next|jump|page)_(\d+)_?(\d*)$/,
  );
  if (nav) {
    const [, uid, action, pageRaw, jumpRaw] = nav;
    return {
      userId: Number(uid),
      action: {
        type: action as HaremAction["type"],
        page: Number(pageRaw),
        jump: jumpRaw ? Number(jumpRaw) : 2,
      } as HaremAction,
    };
  }

  const simple = data.match(/^harem_user_(\d+)_(close|delete)$/);
  if (simple) {
    const [, uid, action] = simple;
    return {
      userId: Number(uid),
      action: { type: action as "close" | "delete" },
    };
  }

  const del = data.match(/^harem_user_(\d+)_del_(yes|no)$/);
  if (del) {
    const [, uid, decision] = del;
    return {
      userId: Number(uid),
      action: { type: "del", decision: decision as "yes" | "no" },
    };
  }

  const setup = data.match(/^harem_btn_(\d+)_opensetup$/);
  if (setup) {
    return { userId: Number(setup[1]), action: { type: "opensetup" } };
  }

  return null;
}

export async function haremCallback(ctx: MyContext) {
  const raw = ctx.callbackQuery?.data;
  if (!raw) return;

  const parsed = parseCallbackData(raw);
  if (!parsed) return;

  const { userId } = parsed;
  const action = parsed.action;

  const callerRole = await getUserRole(ctx.from?.id ?? 0);
  const isSuperAdmin =
    roleWeights[callerRole] >= roleWeights[ProfileType.SUPER_ADMIN];

  if (ctx.from?.id !== userId && !isSuperAdmin) {
    warn("haremCallback - usuário não autorizado", {
      expected: userId,
      actual: ctx.from?.id,
    });
    await ctx.answerCallbackQuery(ctx.t("error-action-not-authorized-by-id"));
    return;
  }

  if (action.type === "close") {
    await ctx.deleteMessage().catch(() => {});
    await ctx.answerCallbackQuery();
    return;
  }

  if (action.type === "delete") {
    if (roleWeights[callerRole] < roleWeights[ProfileType.SUPER_ADMIN]) {
      await ctx.answerCallbackQuery(ctx.t("harem_delete_no_permission"));
      return;
    }

    const confirm = CreateButtunConfirmation(
      ctx,
      `harem_user_${userId}_del_yes`,
      `harem_user_${userId}_del_no`,
    );

    await ctx.reply(ctx.t("harem_delete_confirm"), { reply_markup: confirm });
    await ctx.answerCallbackQuery();
    return;
  }

  if (action.type === "del") {
    if (action.decision === "yes") {
      const targetRole = await getUserRole(userId);
      if (roleWeights[targetRole] >= roleWeights[ProfileType.ADMIN]) {
        await ctx.deleteMessage().catch(() => {});
        await ctx.reply(ctx.t("harem_delete_cannot_admin"));
        await ctx.answerCallbackQuery();
        return;
      }

      try {
        await prisma.$transaction([
          prisma.husbandoCollection.deleteMany({
            where: { userId: BigInt(userId) },
          }),
          prisma.waifuCollection.deleteMany({
            where: { userId: BigInt(userId) },
          }),
          prisma.telegramUser.upsert({
            where: { telegramId: BigInt(userId) },
            update: { profileType: ProfileType.BANNED },
            create: {
              telegramId: BigInt(userId),
              profileType: ProfileType.BANNED,
              telegramData: {},
              waifuConfig: {},
              husbandoConfig: {},
            },
          }),
        ]);

        permissionCache.delete(String(userId));
        setHarem(userId, null);

        await ctx.deleteMessage().catch(() => {});
        await ctx.reply(ctx.t("harem_delete_success"));
      } catch (e) {
        error("haremCallback - erro ao deletar harem", e);
        await ctx.answerCallbackQuery(ctx.t("error-generic"));
        return;
      }
    }

    await ctx.answerCallbackQuery();
    return;
  }

  if (action.type === "opensetup") {
    await ctx.answerCallbackQuery(ctx.t("error-not-implemented"));
    return;
  }

  const cached = getHarem(userId);
  if (!cached) {
    warn("haremCallback - harém não encontrado no cache", { userId });
    await ctx.answerCallbackQuery();
    return;
  }

  const { pages, forceopen } = cached;
  const total = pages.length;
  let page = action.page;

  if (action.type === "prev") page--;
  else if (action.type === "next") page++;
  else if (action.type === "jump") page += action.jump;
  else if (action.type === "page") page = 0;

  const clamped = Math.max(0, Math.min(page, total - 1));

  if (clamped === action.page) {
    await ctx.answerCallbackQuery();
    return;
  }

  page = clamped;

  const nextJump = action.type === "jump" ? action.jump * 2 : 4;

  info("haremCallback - navegando", { userId, page, action: action.type });

  const pageContent = pages[page];
  if (!pageContent) {
    warn("haremCallback - página inválida", { userId, page, total });
    await ctx.answerCallbackQuery();
    return;
  }

  const keyboard = Build_btn_harem({
    ctx,
    current_page: page,
    total_page: total,
    userId,
    nextJump,
    btn_delete: !!forceopen,
  });

  try {
    await ctx.editMessageCaption({
      caption: pageContent,
      reply_markup: keyboard,
      parse_mode: "HTML",
    });
  } catch (e: any) {
    if (e?.description?.includes("there is no caption")) {
      await ctx.editMessageText(pageContent, {
        reply_markup: keyboard,
        parse_mode: "HTML",
      });
    } else {
      error("haremCallback - erro ao editar", e);
    }
  }

  await ctx.answerCallbackQuery();
}
