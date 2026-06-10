import { prisma } from "../../../../lib/prisma.js";
import { botPrefix } from "../../../../commands/botConfigCommands.js";
import { ProfileType, type MyContext } from "../../../../utils/customTypes.js";
import { info, error, debug, warn } from "../../../../utils/log.js";
import { getUserRole, roleWeights } from "../../../../utils/permissions.js";
import { Extract_id_user } from "../../../../utils/extract_id_user.js";
import { Sendmedia } from "../../../../utils/sendmedia.js";
import { mentionUser } from "../../../../utils/mention_user.js";
import { CreateOneBtn } from "../../../../utils/btns.js";
import { permissionCache } from "../../../../cache/cache.js";

export async function banHandler(ctx: MyContext) {
  const result = await Extract_id_user(ctx);

  if (!result?.id) {
    return await Sendmedia({
      ctx,
      caption: ctx.t("banuser-usage-ban", { prefix: botPrefix }),
    });
  }
  if (result.id === ctx.me.id) {
    return await Sendmedia({ ctx, caption: ctx.t("banuser-try-ban-bot") });
  }

  const targetRole = await getUserRole(result.id);
  if (roleWeights[targetRole] >= roleWeights[ProfileType.ADMIN]) {
    warn("banHandler - tentativa de banir admin", {
      adminId: ctx.from?.id,
      targetId: result.id,
      targetRole,
    });
    await Sendmedia({ ctx, caption: ctx.t("banuser-cannot-ban-admin") });
    return;
  }

   info('banHandler - banindo usuario', { adminId: ctx.from?.id, targetId: result.id });

    const matchText = (ctx.match as string)?.trim() || "";
    let reason = "";
    if (matchText) {
      const idStr = String(result.id);
      if (matchText.startsWith(idStr)) {
        reason = matchText.slice(idStr.length).trim();
      } else if (matchText.startsWith("@")) {
        const spaceIdx = matchText.indexOf(" ");
        reason = spaceIdx > 0 ? matchText.slice(spaceIdx + 1).trim() : "";
      } else {
        reason = matchText;
      }
    }

    const targetBigInt = BigInt(result.id);

    await prisma.$transaction([
      prisma.husbandoCollection.deleteMany({ where: { userId: targetBigInt } }),
      prisma.waifuCollection.deleteMany({ where: { userId: targetBigInt } }),
      prisma.user.upsert({
        where: { telegramId: targetBigInt },
        update: { profileType: ProfileType.BANNED },
        create: {
          telegramId: targetBigInt,
          profileType: ProfileType.BANNED,
          telegramData: (result || {}) as any,
          favoriteWaifuId: null,
          favoriteHusbandoId: null,
          waifuConfig: {},
          husbandoConfig: {},
        },
      }),
    ]);

    permissionCache.delete(String(result.id));

    const banCaption = reason
      ? `${mentionUser(result.first_name, result.id)} foi banido.\nMotivo: ${reason}`
      : `${mentionUser(result.first_name, result.id)} foi banido.`;

    return await Sendmedia({
      ctx,
      caption: banCaption,
      reply_markup: CreateOneBtn({
        text: ctx.t('maneger-user-unban-btn'),
        callback: `maneger_user_unban-${result.id}`,
      }),
    });
  }

  export async function unbanHandler(ctx: MyContext) {
    const result = await Extract_id_user(ctx);

    if (!result?.id) {
    
      return  Sendmedia({
        ctx,caption:ctx.t("banuser-usage-unban", { prefix: botPrefix })
      });
    }

    const targetRole = await getUserRole(result.id);
    if (targetRole && roleWeights[targetRole] >= roleWeights[ProfileType.ADMIN]) {
      warn('unbanHandler - tentativa de desbanir admin', {
        adminId: ctx.from?.id,
        targetId: result.id,
        targetRole
      });
      
        return  Sendmedia({
        ctx,caption:ctx.t("banuser-cannot-unban-admin")
      });
    }

    info('unbanHandler - desbanindo usuario', { adminId: ctx.from?.id, targetId: result.id });

    const user = await prisma.user.findUnique({
      where: { telegramId: BigInt(result.id) },
      select: { telegramData: true },
    });

    if (!user) {
        return  Sendmedia({
        ctx,caption:ctx.t("banuser-not-found")
      });

    }

    await prisma.user.update({
      where: { telegramId: BigInt(result.id) },
      data: { profileType: ProfileType.USER },
    });

    permissionCache.delete(String(result.id));

    const targetData = user.telegramData as Record<string, any> | null;
    const targetName = targetData?.first_name || targetData?.username || result.id.toString();

    return await Sendmedia({
      ctx,
      caption: ctx.t("banuser-success-unban", { name: targetName, id: result.id }),
      reply_markup: CreateOneBtn({
        text: ctx.t("maneger-user-ban-btn"),
        callback: `maneger_user_ban-${result.id}`,
      }),
    });
  }

  export async function listBannedHandler(ctx: MyContext) {
    debug('listBannedHandler - listando usuarios banidos');

    try {
      const banned = await prisma.user.findMany({
        where: { profileType: ProfileType.BANNED },
        select: { telegramId: true, telegramData: true },
        take: 100,
      });

      if (banned.length === 0) {
        await ctx.reply(ctx.t("banuser-list-empty"));
        return;
      }

      const unknownLabel = ctx.t("banuser-unknown");
      const lines = banned.map((user) => {
        const data = user.telegramData as any;
        const name = data?.first_name || data?.username || unknownLabel;
        return user.telegramId + ' - ' + name;
      });

      await ctx.reply(ctx.t("banuser-list-title", { list: lines.join('\n') }));
    } catch (err) {
      error('listBannedHandler - erro ao listar', err);
      await ctx.reply(ctx.t("banuser-list-error"));
    }
}
