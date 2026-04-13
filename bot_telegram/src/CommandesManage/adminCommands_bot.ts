import { CommandGroup, LanguageCodes } from "@grammyjs/commands";
import type { MyContext } from "../utils/customTypes.js";
import { botPrefix, options } from "./botConfigCommands.js";
import { ProfileType } from "../../generated/prisma/client.js";
import { Composer } from "grammy";
import { onlyRoleBotAdmin } from "../utils/permissions.js";
import { AddRarityHandler } from "../handlers/Comandos/admin_bot/add_Rarity.js";
import { banHandler, unbanHandler, listBannedHandler } from "../handlers/Comandos/admin_bot/ban_user.js";
import { DeleteRarityHandler } from "../handlers/Comandos/admin_bot/del_rarity.js";
import { EditRarityHandler } from "../handlers/Comandos/admin_bot/edit_rarity.js";
import { reloadAdmsHandler } from "../handlers/Comandos/admin_bot/reload_adms.js";
import { setChatTopicHandler } from "../handlers/Comandos/admin_bot/set_chat_topic.js";
import { AddCharacterHandler } from "../handlers/Comandos/admin_bot/add_charecter.js";
import { debug } from "../utils/log.js";

const adminCommands_bot_dict = {
  addchar: {
    minPermission: ProfileType.ADMIN,
    command: `addchar${botPrefix}`,
    description: {
      en: "Add a character to the database (admin)",
      es: "Agregar un personaje a la base de datos (admin)",
      pt: "Adicionar um personagem ao banco de dados (admin)",
    },
    handler: AddCharacterHandler,
    scope: "all_group_chats" as const,
  },
  addrarity: {
    minPermission: ProfileType.ADMIN,
    command: `addrarity${botPrefix}`,
    description: {
      en: "Add a new rarity (admin)",
      es: "Agregar una nueva rareza (admin)",
      pt: "Adicionar uma nova raridade (admin)",
    },
    handler: AddRarityHandler,
    scope: "all_group_chats" as const,
  },
  editrarity: {
    minPermission: ProfileType.ADMIN,
    command: `editrarity${botPrefix}`,
    description: {
      en: "Edit an existing rarity (admin)",
      es: "Editar una rareza existente (admin)",
      pt: "Editar uma raridade existente (admin)",
    },
    handler: EditRarityHandler,
    scope: "all_group_chats" as const,
  },
  delrarity: {
    minPermission: ProfileType.ADMIN,
    command: `delrarity${botPrefix}`,
    description: {
      en: "Delete a rarity (admin)",
      es: "Eliminar una rareza (admin)",
      pt: "Excluir uma raridade (admin)",
    },
    handler: DeleteRarityHandler,
    scope: "all_group_chats" as const,
  },
  reloadadms: {
    minPermission: ProfileType.SUPER_ADMIN,
    command: `reloadadms${botPrefix}`,
    description: {
      en: "Update all group admins as ADMIN in the database",
      es: "Atualiza todos os admins do grupo como ADMIN no banco",
      pt: "Atualiza todos os admins do grupo como ADMIN no banco",
    },
    handler: reloadAdmsHandler,
    scope: "all_group_chats" as const,
  },
  banuser: {
    minPermission: ProfileType.ADMIN,
    command: `banuser${botPrefix}`,
    description: {
      en: "Ban user",
      es: "Banir usuário",
      pt: "Banir usuário",
    },
    handler: banHandler,
    scope: "all_group_chats" as const,
  },
  unbanuser: {
    minPermission: ProfileType.ADMIN,
    command: `unbanuser${botPrefix}`,
    description: {
      en: "Unban user",
      es: "Desbanir usuário",
      pt: "Desbanir usuário",
    },
    handler: unbanHandler,
    scope: "all_group_chats" as const,
  },
  listbanned: {
    minPermission: ProfileType.ADMIN,
    command: `listbanned${botPrefix}`,
    description: {
      en: "List banned users",
      es: "Listar usuários banidos",
      pt: "Listar usuários banidos",
    },
    handler: listBannedHandler,
    scope: "all_group_chats" as const,
  },
  setchattopic: {
    minPermission: null,
    command: `setchattopic${botPrefix}`,
    description: {
      en: "Define the topic for drop messages",
      es: "Define o topic para mensagens de drop",
      pt: "Define o topic para mensagens de drop",
    },
    handler: setChatTopicHandler,
    scope: "all_group_chats" as const,
  },
} as const;

const adminCommands = new CommandGroup<MyContext>();

for (const [key, value] of Object.entries(adminCommands_bot_dict)) {
  adminCommands.command(value.command, value.description.en, options).addToScope(
    { type: value.scope },
    async (ctx: MyContext) => {
      debug("Comando admin", value.command, "executado por", ctx.from?.username || ctx.from?.id);
      
      const next = async () => {
        await value.handler(ctx);
      };
      
      if (value.minPermission) {
        return await onlyRoleBotAdmin(value.minPermission)(ctx, next);
      }
      
      return await next();
    }
  )
  .localize(LanguageCodes.Spanish, value.command, value.description.es)
  .localize(LanguageCodes.Portuguese, value.command, value.description.pt);
}

export { adminCommands };
