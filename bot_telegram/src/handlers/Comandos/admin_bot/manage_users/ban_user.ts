import { ProfileType } from "../../../../../generated/prisma/client.js";
import { prisma } from "../../../../../lib/prisma.js";
import { botPrefix } from "../../../../CommandesManage/botConfigCommands.js";
import type { MyContext } from "../../../../utils/customTypes.js";
import { info, error, debug, warn } from "../../../../utils/log.js";
import { getUserRole, roleWeights } from "../../../../utils/permissions.js";

interface ExtractUserResult {
  userId: number | null;
  userData?: Record<string, any>;
  source: string;
}

async function extractUserId(ctx: MyContext): Promise<ExtractUserResult> {
  if (ctx.message?.reply_to_message) {
    const reply = ctx.message.reply_to_message;
    
    if (reply.from) {
      return { userId: reply.from.id, userData: reply.from, source: "reply" };
    }
    
    if (reply.forward_origin?.type === "user") {
      const forwardUser = reply.forward_origin as any;
      return { 
        userId: forwardUser.sender_user?.id || null, 
        source: "forward_from" 
      };
    }
    
    const text = reply.text || reply.caption || "";
    const entities = (reply as any).entities || [];
    for (const entity of entities) {
      if (entity.type === "text_mention" && entity.user) {
        return { userId: entity.user.id, userData: entity.user, source: "text_mention" };
      }
    }
    
    return { userId: null, source: "reply_not_found" };
  }

const args = ctx.match;

if (!args) {
  return { userId: null, source: "no_match" };
}

const arg = typeof args === "string" ? args.trim() : args[1];

if (!arg) {
  return { userId: null, source: "no_arg" };
}

  if (arg.startsWith("@")) {
    const username = arg.slice(1).toLowerCase();
    try {
      const chat = await ctx.api.getChat(`@${username}`);
      if (chat.id) {
        return { userId: Number(chat.id), source: "username" };
      }
    } catch (e) {
      warn(`banHandler - usuário @${username} não encontrado`);
    }
    return { userId: null, source: "username_not_found" };
  }

  const numericId = parseInt(arg);
  if (!isNaN(numericId)) {
    return { userId: numericId, source: "numeric_id" };
  }

  return { userId: null, source: "invalid_format" };
}

async function banUser(ctx: MyContext, userId: number, userData?: Record<string, any>) {
  const targetRole = await getUserRole(userId);
  if (roleWeights[targetRole] >= roleWeights[ProfileType.ADMIN]) {
    warn(`banHandler - tentativa de banir admin`, { 
      adminId: ctx.from?.id, 
      targetId: userId, 
      targetRole 
    });
    await ctx.reply("❌ Não é possível banir um administrador do bot.");
    return false;
  }

  info(`banHandler - banindo usuário`, { adminId: ctx.from?.id, targetId: userId });

  await prisma.user.upsert({
    where: { telegramId: BigInt(userId) },
    update: { profileType: ProfileType.BANNED },
    create: {
      telegramId: BigInt(userId),
      profileType: ProfileType.BANNED,
      telegramData: userData || {},
      favoriteWaifuId: null,
      favoriteHusbandoId: null,
      waifuConfig: {},
      husbandoConfig: {},
    },
  });
  
  const targetName = userData?.first_name || userData?.username || userId.toString();
  await ctx.reply(`✅ <b>${targetName}</b> (${userId}) banido com sucesso!`);
  return true;
}

async function unbanUser(ctx: MyContext, userId: number) {
  const targetRole = await getUserRole(userId);
  if (roleWeights[targetRole] >= roleWeights[ProfileType.ADMIN]) {
    warn(`unbanHandler - tentativa de desbanir admin`, { 
      adminId: ctx.from?.id, 
      targetId: userId, 
      targetRole 
    });
    await ctx.reply("❌ Não é possível desbanir um administrador do bot.");
    return false;
  }

  info(`unbanHandler - desbanindo usuário`, { adminId: ctx.from?.id, targetId: userId });

  const user = await prisma.user.findUnique({
    where: { telegramId: BigInt(userId) },
    select: { telegramData: true },
  });

  await prisma.user.update({
    where: { telegramId: BigInt(userId) },
    data: { profileType: ProfileType.USER },
  });
  
  const targetData = user?.telegramData as Record<string, any> | null;
  const targetName = targetData?.first_name || targetData?.username || userId.toString();
  await ctx.reply(`✅ <b>${targetName}</b> (${userId}) desbanido com sucesso!`);
  return true;
}

export async function banHandler(ctx: MyContext) {
  const result = await extractUserId(ctx);

  if (!result.userId) {
    let usage = `Use: /banuser${botPrefix} <opção>\n\nOpções:\n`;
    usage += "• ID numérico (ex: /banuser 123456789)\n";
    usage += "• @username (ex: /banuser @usuario)\n";
    usage += "• Responder a mensagem do usuário";
    await ctx.reply(usage);
    return;
  }

  try {
    const success = await banUser(ctx, result.userId, result.userData);
    if (!success) return;
  } catch (err) {
    error(`banHandler - erro ao banir usuário ${result.userId}`, err);
    await ctx.reply("❌ Erro ao banir");
  }
}

export async function unbanHandler(ctx: MyContext) {
  const result = await extractUserId(ctx);

  if (!result.userId) {
    let usage = "Use: /unbanuser <opção>\n\nOpções:\n";
    usage += "• ID numérico (ex: /unbanuser 123456789)\n";
    usage += "• @username (ex: /unbanuser @usuario)\n";
    usage += "• Responder a mensagem do usuário";
    await ctx.reply(usage);
    return;
  }

  try {
    const success = await unbanUser(ctx, result.userId);
    if (!success) return;
  } catch (err) {
    error(`unbanHandler - erro ao desbanir usuário ${result.userId}`, err);
    await ctx.reply("❌ Erro ao desbanir");
  }
}

export async function listBannedHandler(ctx: MyContext) {
  debug(`listBannedHandler - listando usuários banidos`);

  try {
    const banned = await prisma.user.findMany({
      where: { profileType: ProfileType.BANNED },
      select: { telegramId: true, telegramData: true },
    });

    if (banned.length === 0) {
      await ctx.reply("Nenhum usuário banido.");
      return;
    }

    let text = "📋 Usuários banidos:\n\n";
    for (const user of banned) {
      const data = user.telegramData as any;
      const name = data?.first_name || data?.username || "Desconhecido";
      text += `• ${user.telegramId} - ${name}\n`;
    }

    await ctx.reply(text);
  } catch (err) {
    error(`listBannedHandler - erro ao listar`, err);
    await ctx.reply("❌ Erro ao listar");
  }
}