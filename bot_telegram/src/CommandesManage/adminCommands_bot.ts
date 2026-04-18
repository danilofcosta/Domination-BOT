import { CommandGroup, LanguageCodes } from "@grammyjs/commands";
import type { MyContext } from "../utils/customTypes.js";
import { botPrefix, options } from "./botConfigCommands.js";
import { ProfileType } from "../../generated/prisma/client.js";
import { onlyRoleBotAdmin } from "../utils/permissions.js";
import { AddCharacterHandler } from "../handlers/Comandos/admin_bot/manager_character/add/add_charecter.js";
import { debug, warn } from "../utils/log.js";
import { getUserRole, roleWeights } from "../utils/permissions.js";
import { add_in_colletion } from "../handlers/Comandos/admin_bot/manage_users/add_in_colletion.js";

type AdminCommand = {
  minPermission: ProfileType;
  command: string;
  description: { en: string; pt: string };
  handler: (ctx: MyContext) => Promise<any>;
  scope: "all_group_chats";
  botAdminOnly?: boolean;
};

export const adminCommands_bot_dict: Record<string, AdminCommand> = {
  addchar: {
    minPermission: ProfileType.ADMIN,
    command: `addchar${botPrefix}`,
    description: {
      en: "Add a character to the database (admin)",

      pt: "Adicionar um personagem ao banco de dados (admin)",
    },
    handler: AddCharacterHandler,
    scope: "all_group_chats" as const,
  },
  add_in_colletion: {
    minPermission: ProfileType.ADMIN,
    command: `addcolleton${botPrefix}`,
    description: {
      en: "Add a character to the colletion user (admin)",
      pt: "Adicionar um personagem ao harem de um user (admin)",
    },

    handler: add_in_colletion,
    scope: "all_group_chats" as const,
  },
} as const;

const adminCommands = new CommandGroup<MyContext>();

for (const [key, value] of Object.entries(adminCommands_bot_dict)) {
  adminCommands
    .command(value.command, value.description.en, options)
    .addToScope({ type: value.scope }, async (ctx: MyContext) => {
      const userId = ctx.from?.id;
      debug(
        "Comando admin",
        value.command,
        "executado por",
        ctx.from?.username || ctx.from?.id,
      );

      if (value.botAdminOnly) {
        const userRole = await getUserRole(userId!);
        if (roleWeights[userRole] < roleWeights[value.minPermission!]) {
          warn(
            `[Permissions] Acesso negado (bot admin only): usuário ${userId} tentou usar ${value.command}`,
          );
          await ctx.reply(
            "❌ Apenas administradores do bot podem usar este comando.",
          );
          return;
        }
        debug(
          `[Permissions] Bot admin verificado: usuário ${userId} tem role ${userRole}`,
        );
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
    })
    .localize(LanguageCodes.English, value.command, value.description.en)
    .localize(LanguageCodes.Portuguese, value.command, value.description.pt);
}

export { adminCommands };
