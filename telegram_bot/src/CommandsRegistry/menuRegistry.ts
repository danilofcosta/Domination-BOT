import { CommandGroup } from "@grammyjs/commands";
import type { MyContext } from "../utils/customTypes.js";
import { admGroupScope } from "./botConfigCommands.js";
import { addGlobalCommandsToMenu } from "./CommandsRegistryGlobais.js";
import { addUserCommandsToMenu } from "./CommandsRegistryUser.js";
import { addAdminBotCommandsToMenu } from "./CommandsRegistryAdminBot.js";

/**
 * DONO UNICO do menu de comandos do bot.
 *
 * Regra critica: o Telegram guarda UMA lista por combinacao
 * (escopo x language_code) e `setMyCommands` SUBSTITUI a lista inteira do
 * bucket. Portanto TODOS os comandos visiveis no menu devem ser registrados
 * AQUI, e `setCommands()` deve ser chamado EXATAMENTE UMA vez no startup.
 *
 * Buckets produzidos:
 * - all_group_chats        -> globais (start/help) + nomes principais de user
 * - all_private_chats      -> globais + aliases privados (commandPrivate)
 * - chat_administrators@GROUP_ADM -> comandos admin-bot (so para admins)
 * - default                -> vazio (nada registrado aqui)
 */
export const menuRegistry = new CommandGroup<MyContext>();

addGlobalCommandsToMenu(menuRegistry);
addUserCommandsToMenu(menuRegistry);

const admScope = admGroupScope();
if (admScope) {
  addAdminBotCommandsToMenu(menuRegistry, admScope);
}
