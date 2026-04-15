import { CommandGroup, LanguageCodes } from "@grammyjs/commands";
import type { MyContext } from "../utils/customTypes.js";
import { botPrefix, options } from "./botConfigCommands.js";
import { ProfileType } from "../../generated/prisma/client.js";
import { Composer } from "grammy";
import { onlyRoleBotAdmin } from "../utils/permissions.js";
import { AddRarityHandler } from "../handlers/Comandos/admin_bot/add_Rarity.js";
import { banHandler, unbanHandler, listBannedHandler } from "../handlers/Comandos/admin_bot/manage_users/ban_user.js";
import { DeleteRarityHandler } from "../handlers/Comandos/admin_bot/del_rarity.js";
import { EditRarityHandler } from "../handlers/Comandos/admin_bot/edit_rarity.js";
import { reloadAdmsHandler } from "../handlers/Comandos/admin_bot/reload_adms.js";
import { AddCharacterHandler } from "../handlers/Comandos/admin_bot/add_charecter.js";
import { debug, warn } from "../utils/log.js";
import { getUserRole, roleWeights } from "../utils/permissions.js";

type AdminCommand = {
  minPermission: ProfileType;
  command: string;
  description: { en: string; es: string; pt: string };
  handler: (ctx: MyContext) => Promise<any>;
  scope: "all_group_chats";
  botAdminOnly?: boolean;
};

const adminCommands_bot_dict: Record<string, AdminCommand> = {
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
    botAdminOnly: true,
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
    botAdminOnly: true,
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
    botAdminOnly: true,
  },
} as const;

const adminCommands = new CommandGroup<MyContext>();

for (const [key, value] of Object.entries(adminCommands_bot_dict)) {
  adminCommands.command(value.command, value.description.en, options).addToScope(
    { type: value.scope },
    async (ctx: MyContext) => {
      const userId = ctx.from?.id;
      debug("Comando admin", value.command, "executado por", ctx.from?.username || ctx.from?.id);

      if (value.botAdminOnly) {
        const userRole = await getUserRole(userId!);
        if (roleWeights[userRole] < roleWeights[value.minPermission!]) {
          warn(`[Permissions] Acesso negado (bot admin only): usuário ${userId} tentou usar ${value.command}`);
          await ctx.reply("❌ Apenas administradores do bot podem usar este comando.");
          return;
        }
        debug(`[Permissions] Bot admin verificado: usuário ${userId} tem role ${userRole}`);
        await value.handler(ctx);
        return;
      }

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
