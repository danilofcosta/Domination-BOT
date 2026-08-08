import bcrypt from "bcryptjs";
import type { MyContext } from "../../../../uteis/CustomTypes.js";
import { prisma } from "../../../../lib/prisma.js";
import { setListener } from "../../../../cache/listenerStore.js";
import { info, error } from "../../../../uteis/log.js";

const MIN_PASSWORD_LENGTH = 6;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function applyNewPassword(username: string, newPassword: string) {
  const webUser = await prisma.user.findUnique({
    where: { username },
    include: { account: true },
  });

  if (!webUser) return { ok: false as const };

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  const emailAccount = webUser.account.find(
    (account) => account.providerId === "email",
  );

  if (emailAccount) {
    await prisma.account.update({
      where: { id: emailAccount.id },
      data: { password: hashedPassword, updatedAt: new Date() },
    });
  } else {
    await prisma.account.create({
      data: {
        id: crypto.randomUUID(),
        accountId: webUser.id,
        providerId: "email",
        userId: webUser.id,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  if (webUser.telegramUserId) {
    await prisma.telegramUser.update({
      where: { id: webUser.telegramUserId },
      data: { webPassword: hashedPassword },
    });
  }

  info("changePassword - senha alterada", {
    username,
    targetUserId: webUser.id,
  });

  return { ok: true as const, username };
}

function isCancel(value: string): boolean {
  return ["cancel", "cancelar"].includes(value.toLowerCase());
}

export async function changePasswordWeb(ctx: MyContext): Promise<void> {
  const userId = ctx.from?.id;
  const chatId = ctx.chat?.id;

  if (ctx.chat?.type !== "private") {
    await ctx.reply("⚠️ Use este comando em uma conversa privada com o bot.");
    return;
  }
  if (!userId || !chatId) return;

  const makePasswordAction = (username: string) => {
    return async (passCtx: MyContext) => {
      const newPassword = passCtx.message?.text?.trim();
      if (!newPassword || newPassword.startsWith("/")) return;
      if (isCancel(newPassword)) {
        await passCtx.reply("Operação cancelada.");
        return;
      }

      if (newPassword.length < MIN_PASSWORD_LENGTH) {
        await passCtx.reply(
          `❌ A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.\n` +
            "Envie a nova senha novamente ou <i>/cancel</i>.",
          { parse_mode: "HTML" },
        );
        setListener(userId, chatId, {
          type: "text",
          action: makePasswordAction(username),
        });
        return;
      }

      try {
        const result = await applyNewPassword(username, newPassword);
        if (!result.ok) {
          await passCtx.reply("❌ Erro ao alterar a senha. Tente novamente.");
          return;
        }
        await passCtx.reply(
          `✅ <b>Senha alterada com sucesso!</b>\n\n` +
            `Usuário: <b>${escapeHtml(result.username)}</b>\n\n` +
            "Sessões antigas continuam válidas; a nova senha valerá no próximo login.",
          { parse_mode: "HTML" },
        );
      } catch (e) {
        error("changePassword - erro ao alterar senha", e);
        await passCtx.reply(
          "❌ Erro interno ao alterar a senha. Tente novamente.",
        );
      }
    };
  };

  const askPassword = async (msgCtx: MyContext, username: string) => {
    await msgCtx.reply(
      `🔑 Usuário <b>${escapeHtml(username)}</b> encontrado.\n\n` +
        `Agora envie a <b>nova senha</b> (mínimo de ${MIN_PASSWORD_LENGTH} caracteres):`,
      { parse_mode: "HTML" },
    );

    setListener(userId, chatId, {
      type: "text",
      action: makePasswordAction(username),
    });
  };

  const askUsername = async (msgCtx: MyContext) => {
    const username = msgCtx.message?.text?.trim();
    if (!username || username.startsWith("/")) return;
    if (isCancel(username)) {
      await msgCtx.reply("Operação cancelada.");
      return;
    }

    const webUser = await prisma.user.findUnique({ where: { username } });

    if (!webUser) {
      await msgCtx.reply(
        `❌ Não existe conta web com o usuário <b>${escapeHtml(username)}</b>.\n` +
          "Envie o usuário novamente ou <i>/cancel</i>.",
        { parse_mode: "HTML" },
      );
      setListener(userId, chatId, { type: "text", action: askUsername });
      return;
    }

    await askPassword(msgCtx, username);
  };

  await ctx.reply(
    "🔑 <b>Trocar senha da conta web</b>\n\n" +
      "Envie o <b>usuário (username)</b> da conta cuja senha será alterada.\n\n" +
      "Envie <i>/cancel</i> a qualquer momento para cancelar.",
    { parse_mode: "HTML" },
  );

  setListener(userId, chatId, { type: "text", action: askUsername });
}
