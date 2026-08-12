import bcrypt from "bcryptjs";
import type { MyContext } from "../../../../utils/customTypes.js";
import { prisma } from "../../../../lib/prisma.js";
import { setListener } from "../../../../cache/listenerStore.js";
import { info, error } from "../../../../utils/log.js";

const MIN_PASSWORD_LENGTH = 6;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isCancel(value: string): boolean {
  return ["cancel", "cancelar"].includes(value.toLowerCase());
}

async function applyNewPassword(webUserId: string, newPassword: string) {
  const webUser = await prisma.user.findUnique({
    where: { id: webUserId },
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
    webUserId: webUser.id,
    targetUserId: webUser.id,
  });

  return {
    ok: true as const,
    displayName: webUser.username ?? webUser.name ?? webUser.email ?? webUser.id,
  };
}

export async function changePasswordWeb(ctx: MyContext): Promise<void> {
  const userId = ctx.from?.id || 0;
  const chatId = ctx.chat?.id;

  if (ctx.chat?.type !== "private") {
    await ctx.reply("⚠️ Use este comando em uma conversa privada com o bot.");
    return;
  }
  if (!userId || !chatId) return;

  const telegramUser = await prisma.telegramUser.findUnique({
    where: { telegramId: BigInt(userId) },
  });

  if (!telegramUser) {
    await ctx.reply(
      "❌ Sua conta Telegram não está vinculada a nenhuma conta web.",
    );
    return;
  }

  const webUser = await prisma.user.findFirst({
    where: { telegramUserId: telegramUser.id },
  });

  if (!webUser) {
    await ctx.reply(
      "❌ Sua conta Telegram não está vinculada a nenhuma conta web.",
    );
    return;
  }

  const displayName =
    webUser.username ?? webUser.name ?? webUser.email ?? webUser.id;

  const makePasswordAction = (webUserId: string) => {
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
          action: makePasswordAction(webUserId),
        });
        return;
      }

      try {
        const result = await applyNewPassword(webUserId, newPassword);
        if (!result.ok) {
          await passCtx.reply("❌ Erro ao alterar a senha. Tente novamente.");
          return;
        }
        await passCtx.reply(
          `✅ <b>Senha alterada com sucesso!</b>\n\n` +
            `Usuário: <b>${escapeHtml(result.displayName)}</b>\n\n` +
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

  await ctx.reply(
    `🔑 <b>Trocar senha da conta web</b>\n\n` +
      `Conta vinculada: <b>${escapeHtml(displayName)}</b>\n\n` +
      `Envie a <b>nova senha</b> (mínimo de ${MIN_PASSWORD_LENGTH} caracteres):\n\n` +
      "Envie <i>/cancel</i> a qualquer momento para cancelar.",
    { parse_mode: "HTML" },
  );

  setListener(userId, chatId, {
    type: "text",
    action: makePasswordAction(webUser.id),
  });
}
