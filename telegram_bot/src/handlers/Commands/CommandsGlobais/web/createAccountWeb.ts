import crypto from "crypto";
import { InlineKeyboard } from "grammy";
import type { MyContext } from "../../../../uteis/CustomTypes.js";
import { prisma } from "../../../../lib/prisma.js";

export async function createAccountWeb(ctx: MyContext) {
    const telegramUserId = ctx.from!.id;
    const token = crypto.randomUUID();
    const webUrl = process.env.WEB_UI_URL;

    const existingUser = await prisma.user.findUnique({
        where: { email: `${telegramUserId}@telegram.domination` },
    });

    if (existingUser) {
        await ctx.reply(
            "⚠️ Você já possui uma conta vinculada.\n\n" +
            `Usuário: <b>${existingUser.name}</b>\n\n` +
            "Para gerenciar sua conta, acesse o site pelo navegador.",
            { parse_mode: "HTML" },
        );
        return;
    }

    await prisma.verification.create({
        data: {
            id: crypto.randomUUID(),
            identifier: String(telegramUserId),
            value: token,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    });

    // Sem URL web
    if (!webUrl) {
        await ctx.reply(
            ` Seu token de login:\n\n<code>${token}</code>\n\n Expira em 5 minutos.`,

            {
                parse_mode: "HTML",
            },
        );

        return;
    }

    // Com URL web
    const link = `${webUrl}/auth/telegram?token=${token}`;

    const keyboard = new InlineKeyboard().url(
        "Fazer login no site",
        link,
    );

    await ctx.reply(
        ` <b>Login via Telegram</b>\n\n` +
        `use o token abaixo para fazer login no site ou clicar no botão.\n\n` +
        `⏱ Link expira em <b>5 minutos</b>.\n` +
        `⚠️ Válido apenas uma vez.`,
        {
            parse_mode: "HTML",
            reply_markup: keyboard,
        },
    );
};