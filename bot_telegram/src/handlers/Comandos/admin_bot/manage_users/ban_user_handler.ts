import { ProfileType } from '../../../../../generated/prisma/client.js';
import { prisma } from '../../../../../lib/prisma.js';
import { botPrefix } from '../../../../CommandesManage/botConfigCommands.js';
import type { MyContext } from '../../../../utils/customTypes.js';
import { info, error, debug, warn } from '../../../../utils/log.js';
import { getUserRole, roleWeights } from '../../../../utils/permissions.js';

interface ExtractUserResult {
  userId: number | null;
  userData?: Record<string, any>;
  source: string;
}

async function extractUserId(ctx: MyContext): Promise<ExtractUserResult> {
  const message = ctx.message;
  const reply = message?.reply_to_message;

  if (reply) {
    if (reply.from) {
      return { userId: reply.from.id, userData: reply.from, source: 'reply' };
    }

    if (reply.forward_origin?.type === 'user') {
      const forwardUser = reply.forward_origin as any;
      return {
        userId: forwardUser.sender_user?.id || null,
        source: 'forward_from'
      };
    }

    const text = reply.text || reply.caption || '';
    const entities = (reply as any).entities || [];
    for (const entity of entities) {
      if (entity.type === 'text_mention' && entity.user) {
        return { userId: entity.user.id, userData: entity.user, source: 'text_mention' };
      }
    }

    return { userId: null, source: 'reply_not_found' };
  }

  const args = ctx.match;

  if (!args) {
    return { userId: null, source: 'no_match' };
  }

  const arg = typeof args === 'string' ? args.trim() : args[1];

  if (!arg) {
    return { userId: null, source: 'no_arg' };
  }

  if (arg.startsWith('@')) {
    const username = arg.slice(1).toLowerCase();
    try {
      const chat = await ctx.api.getChat('@' + username);
      if (chat.id) {
        return { userId: Number(chat.id), source: 'username' };
      }
    } catch (e) {
      warn('banHandler - usuario @' + username + ' nao encontrado');
    }
    return { userId: null, source: 'username_not_found' };
  }

  const numericId = parseInt(arg);
  if (!isNaN(numericId)) {
    return { userId: numericId, source: 'numeric_id' };
  }

  return { userId: null, source: 'invalid_format' };
}

export async function banHandler(ctx: MyContext) {
  const result = await extractUserId(ctx);

  if (!result.userId) {
    const usage = 'Use: /banuser' + botPrefix + ' <opcao>\n\nOpcoes:\n- ID numerico (ex: /banuser 123456789)\n- @username (ex: /banuser @usuario)\n- Responder a mensagem do usuario';
    await ctx.reply(usage);
    return;
  }

  const targetRole = await getUserRole(result.userId);
  if (roleWeights[targetRole] >= roleWeights[ProfileType.ADMIN]) {
    warn('banHandler - tentativa de banir admin', {
      adminId: ctx.from?.id,
      targetId: result.userId,
      targetRole
    });
    await ctx.reply('Nao e possivel banir um administrador do bot.');
    return;
  }

  info('banHandler - banindo usuario', { adminId: ctx.from?.id, targetId: result.userId });

  await prisma.user.upsert({
    where: { telegramId: BigInt(result.userId) },
    update: { profileType: ProfileType.BANNED },
    create: {
      telegramId: BigInt(result.userId),
      profileType: ProfileType.BANNED,
      telegramData: result.userData || {},
      favoriteWaifuId: null,
      favoriteHusbandoId: null,
      waifuConfig: {},
      husbandoConfig: {},
    },
  });

  const targetName = result.userData?.first_name || result.userData?.username || result.userId.toString();
  await ctx.reply('Usuario ' + targetName + ' (' + result.userId + ') banido com sucesso!');
}

export async function unbanHandler(ctx: MyContext) {
  const result = await extractUserId(ctx);

  if (!result.userId) {
    const usage = 'Use: /unbanuser' + botPrefix + ' <opcao>\n\nOpcoes:\n- ID numerico (ex: /unbanuser 123456789)\n- @username (ex: /unbanuser @usuario)\n- Responder a mensagem do usuario';
    await ctx.reply(usage);
    return;
  }

  const targetRole = await getUserRole(result.userId);
  if (targetRole && roleWeights[targetRole] >= roleWeights[ProfileType.ADMIN]) {
    warn('unbanHandler - tentativa de desbanir admin', {
      adminId: ctx.from?.id,
      targetId: result.userId,
      targetRole
    });
    await ctx.reply('Nao e possivel desbanir um administrador do bot.');
    return;
  }

  info('unbanHandler - desbanindo usuario', { adminId: ctx.from?.id, targetId: result.userId });

  const user = await prisma.user.findUnique({
    where: { telegramId: BigInt(result.userId) },
    select: { telegramData: true },
  });

  if (!user) {
    await ctx.reply('Usuario nao encontrado no banco de dados.');
    return;
  }

  await prisma.user.update({
    where: { telegramId: BigInt(result.userId) },
    data: { profileType: ProfileType.USER },
  });

  const targetData = user?.telegramData as Record<string, any> | null;
  const targetName = targetData?.first_name || targetData?.username || result.userId.toString();
  await ctx.reply('Usuario ' + targetName + ' (' + result.userId + ') desbanido com sucesso!');
}

export async function listBannedHandler(ctx: MyContext) {
  debug('listBannedHandler - listando usuarios banidos');

  try {
    const banned = await prisma.user.findMany({
      where: { profileType: ProfileType.BANNED },
      select: { telegramId: true, telegramData: true },
    });

    if (banned.length === 0) {
      await ctx.reply('Nenhum usuario banido.');
      return;
    }

    const lines = banned.map((user) => {
      const data = user.telegramData as any;
      const name = data?.first_name || data?.username || 'Desconhecido';
      return user.telegramId + ' - ' + name;
    });

    await ctx.reply('Usuarios banidos:\n' + lines.join('\n'));
  } catch (err) {
    error('listBannedHandler - erro ao listar', err);
    await ctx.reply('Erro ao listar');
  }
}