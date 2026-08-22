import { InlineKeyboard } from "grammy";
import type { MyContext } from "../../../utils/customTypes.js";
import { category_user, category_admin_group, category_admin_bot } from "../../../CommandsRegistry/botConfigCommands.js";
import { userCommandsRegistryDict } from "../../../CommandsRegistry/CommandsRegistryUser.js";
import { AdminGroupCommandsRegistryDict } from "../../../CommandsRegistry/CommandsRegistryAdminGroup.js";
import {  AdminBotCommandsRegistryDict } from "../../../CommandsRegistry/CommandsRegistryAdminBot.js";
import { editOrSendText } from "../../../utils/telegram/editOrSendText.js";
import { StartHandler } from "../../Commands/CommandsGlobal/start.js";
import { error } from "../../../utils/log.js";

const userCategories: Array<{ key: category_user; label: string; callbackId: string }> = [
  { key: category_user.Main, label: "Principais", callbackId: "Main" },
  { key: category_user.Collection, label: "Coleção", callbackId: "Collection" },
  { key: category_user.EconomyTrade, label: "Economia e Troca", callbackId: "EconomyTrade" },
  { key: category_user.InfoPersonalization, label: "Info e Personalização", callbackId: "InfoPersonalization" },
  { key: category_user.Hidden, label: "Ocultos", callbackId: "Hidden" },
];

const adminGroupCategories: Array<{ key: category_admin_group; label: string; callbackId: string }> = [
  { key: category_admin_group.main, label: "Admin do Grupo", callbackId: "main" },
];

const adminBotCategories: Array<{ key: category_admin_bot; label: string; callbackId: string }> = [
  { key: category_admin_bot.main, label: "Admin do Bot", callbackId: "main" },
  { key: category_admin_bot.Characters, label: "Personagens", callbackId: "Characters" },
  { key: category_admin_bot.Admins, label: "Administração", callbackId: "Admins" },
];

function getCommandsByCategory(cat: category_user | category_admin_group | category_admin_bot): string[] {
  const userCat = userCategories.find((c) => c.key === cat);
  if (userCat) {
    return Object.values(userCommandsRegistryDict)
      .filter((c) => c.category_user === userCat.key)
      .map((c) => `/${c.command} - ${c.description.pt}`);
  }
  const adminGroupCat = adminGroupCategories.find((c) => c.key === cat);
  if (adminGroupCat) {
    return Object.values(AdminGroupCommandsRegistryDict)
      .map((c) => `/${c.command} - ${c.description.pt}`);
  }
  const adminBotCat = adminBotCategories.find((c) => c.key === cat);
  if (adminBotCat) {
    return Object.values( AdminBotCommandsRegistryDict)
      .filter((c) => c.category_admin_bot === adminBotCat.key)
      .map((c) => `/${c.command} - ${c.description.pt}`);
  }
  return [];
}

function getCategoryLabel(cat: category_user | category_admin_group | category_admin_bot): string {
  const userCat = userCategories.find((c) => c.key === cat);
  if (userCat) return userCat.label;
  const adminGroupCat = adminGroupCategories.find((c) => c.key === cat);
  if (adminGroupCat) return adminGroupCat.label;
  const adminBotCat = adminBotCategories.find((c) => c.key === cat);
  if (adminBotCat) return adminBotCat.label;
  return String(cat);
}

function buildGuideText(cat: category_user | category_admin_group | category_admin_bot): string {
  const lines = getCommandsByCategory(cat).join("\n");
  const label = getCategoryLabel(cat);

  const header =
    cat === category_user.Main
      ? "<b>📖 Bem-vindo ao guia</b>\n\n<b>Principais comandos do usuário:</b>"
      : `<b>📖 Guia</b>\n\n<b>Comandos de ${label}:</b>`;

  return `${header}\n\n-----------------------------------------\n${lines}\n-----------------------------------------\n\nEscolha uma categoria abaixo:`;
}

function buildGuideKeyboard(): InlineKeyboard {
  const keyboard = new InlineKeyboard();

  userCategories.forEach((cat, i) => {
    if (i > 0 && i % 3 === 0) keyboard.row();
    keyboard.text(cat.label, `guia_cat_${cat.callbackId}`);
  });

  adminGroupCategories.forEach((cat, i) => {
    if (i % 3 === 0) keyboard.row();
    keyboard.text(cat.label, `guia_cat_${cat.callbackId}`);
  });

  adminBotCategories.forEach((cat, i) => {
    if (i % 3 === 0) keyboard.row();
    keyboard.text(cat.label, `guia_cat_${cat.callbackId}`);
  });

  keyboard.row().text("⬅️ Voltar ao menu", "guia_back_start");
  return keyboard;
}

function resolveCategory(name: string): category_user | category_admin_group | category_admin_bot | null {
  const userCat = userCategories.find((c) => c.callbackId === name);
  if (userCat) return userCat.key;
  const adminGroupCat = adminGroupCategories.find((c) => c.callbackId === name);
  if (adminGroupCat) return adminGroupCat.key;
  const adminBotCat = adminBotCategories.find((c) => c.callbackId === name);
  if (adminBotCat) return adminBotCat.key;
  return null;
}

export async function guiaHandler(ctx: MyContext) {
  try {
    await editOrSendText({
      ctx,
      caption: buildGuideText(category_user.Main),
      reply_markup: buildGuideKeyboard(),
    });
  } catch (e) {
    error("guia - erro ao renderizar guia", e);
  }
}

export async function guiaCategoryCallback(ctx: MyContext) {
  try {
    const data = ctx.callbackQuery?.data;
    if (!data) return;

    const match = data.match(/^guia_cat_(\w+)$/);
    if (!match) return;

    const name = match[1]!;
    const cat = resolveCategory(name);
    if (!cat) return;

    await editOrSendText({
      ctx,
      caption: buildGuideText(cat),
      reply_markup: buildGuideKeyboard(),
    });
  } catch (e) {
    error("guia - erro ao trocar de categoria", e);
  }
}

export async function guiaBackStart(ctx: MyContext) {
  try {
    await ctx.answerCallbackQuery();
    await StartHandler(ctx);
  } catch (e) {
    error("guia - erro ao voltar ao menu", e);
  }
}