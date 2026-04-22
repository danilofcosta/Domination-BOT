import { ProfileType } from '../../../../../generated/prisma/client.js';
import { prisma } from '../../../../../lib/prisma.js';
import type { MyContext } from '../../../../utils/customTypes.js';
import { debug, error } from '../../../../utils/log.js';

async function extractUserId(ctx: MyContext): Promise<number | null> {
  const message = ctx.message;
  const reply = message?.reply_to_message;

  if (reply?.from) {
    return reply.from.id;
  }

  if (reply?.forward_origin?.type === 'user') {
    const forwardUser = reply.forward_origin as any;
    return forwardUser.sender_user?.id || null;
  }

  const entities = (reply as any).entities || [];
  for (const entity of entities) {
    if (entity.type === 'text_mention' && entity.user) {
      return entity.user.id;
    }
  }

  const args = ctx.match;
  if (!args) return null;

  const arg = typeof args === 'string' ? args.trim() : args[1];
  if (!arg) return null;

  if (arg.startsWith('@')) {
    try {
      const chat = await ctx.api.getChat('@' + arg.slice(1));
      return chat.id ? Number(chat.id) : null;
    } catch {
      return null;
    }
  }

  const numericId = parseInt(arg);
  return isNaN(numericId) ? null : numericId;
}

interface TelegramUserData {
  first_name?: string;
  username?: string;
  date?: string;
}

interface UserStatusResult {
  id: number;
  profileType: ProfileType;
  coins: number;
  createdAt: Date;
  telegramData: any;
  HusbandoCollection: { id: number }[];
  WaifuCollection: { id: number }[];
}

async function getUserStatus(userId: number, userData?: TelegramUserData) {
  const user = await prisma.user.findUnique({
    where: { telegramId: BigInt(userId) },
  }) as UserStatusResult | null;

  if (!user) return null;

  const statusEmoji = {
    [ProfileType.SUPREME]: '👑',
    [ProfileType.SUPER_ADMIN]: '⭐',
    [ProfileType.ADMIN]: '🛡️',
    [ProfileType.MODERATOR]: '🔧',
    [ProfileType.USER]: '👤',
    [ProfileType.BANNED]: '🚫',
  }[user.profileType] || '👤';

  const statusText = {
    [ProfileType.SUPREME]: 'Supremo',
    [ProfileType.SUPER_ADMIN]: 'Super Admin',
    [ProfileType.ADMIN]: 'Administrador',
    [ProfileType.MODERATOR]: 'Moderador',
    [ProfileType.USER]: 'Membro',
    [ProfileType.BANNED]: 'Banido',
  }[user.profileType] || 'Desconhecido';

  const telegramData = user.telegramData as TelegramUserData | null;
  const name = userData?.first_name || telegramData?.first_name || 'Desconhecido';
  const username = userData?.username || telegramData?.username || null;
  const createdAt = user.createdAt;
  const memberCount = (user.HusbandoCollection?.length || 0) + (user.WaifuCollection?.length || 0);

  let entryDate = '';
  if (createdAt) {
    const d = new Date(createdAt);
    const day = d.getDate();
    const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    entryDate = day + ' de ' + months[d.getMonth()] + '. de ' + d.getFullYear() + ', ' +
      d.getHours().toString().padStart(2, '0') + ':' +
      d.getMinutes().toString().padStart(2, '0');
  }

  return {
    userId,
    name,
    username,
    statusEmoji,
    statusText,
    coins: user.coins,
    entryDate,
    memberCount,
  };
}

export async function statusUserHandler(ctx: MyContext) {
  const targetId = await extractUserId(ctx);

  if (!targetId) {
    await ctx.reply('Use: /statususer <opcao>\n\nOpcoes:\n- ID numerico\n- @username\n- Responder mensagem do usuario');
    return;
  }

  try {
    debug('statusUserHandler - buscando info do usuario', targetId);

    const status = await getUserStatus(targetId);

    if (!status) {
      await ctx.reply('Usuario #' + targetId + ' nao encontrado no sistema.\n\nEste usuario nunca interagiu com o bot.');
      return;
    }

    let message = '#id' + targetId + '\n\n';
    message += '🆔 ID: ' + targetId + ' #' + targetId + '\n';
    message += '👱 Nome: ' + status.name + '\n';

    if (status.username) {
      message += '🌐 Nome de usuario: @' + status.username + '\n';
    }

    message += '👀 Situacao: ' + status.statusEmoji + ' ' + status.statusText + '\n';
    message += '💰 Moedas: ' + status.coins + '\n';
    message += '📦 Colecao: ' + status.memberCount + ' personagens\n';

    if (status.entryDate) {
      message += '⤵️ Entrada: ' + status.entryDate + '\n';
    }

    await ctx.reply(message);
  } catch (err) {
    error('statusUserHandler - erro', err);
    await ctx.reply('Erro ao buscar informacoes do usuario.');
  }
}