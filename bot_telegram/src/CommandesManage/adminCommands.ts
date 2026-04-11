import { CommandGroup } from "@grammyjs/commands";
import type { MyContext } from "../utils/customTypes.js";
import { AddCharacterHandler } from "../handlers/Comandos/admin/add_charecter.js";
import { botPrefix } from "./botConfigCommands.js";
import { ProfileType } from "../../generated/prisma/client.js";
import { Composer } from "grammy";

import { AddRarityHandler } from "../handlers/Comandos/admin/add_Rarity.js";
import { EditRarityHandler } from "../handlers/Comandos/admin/edit_rarity.js";
import { DeleteRarityHandler } from "../handlers/Comandos/admin/del_rarity.js";
import { reloadAdmsHandler } from "../handlers/Comandos/admin/reload_adms.js";
import { banHandler, unbanHandler, listBannedHandler } from "../handlers/Comandos/admin/ban_user.js";
import { onlyRole } from "../utils/permissions.js";

const adminCommands = new CommandGroup<MyContext>();

/**
 * Example usage requested by the user:
 * adminCommands.command(
 *   "addchar",
 *   "Add character",
 *   onlyRole(ProfileType.ADMIN),
 *   handler
 * );
 */

// Command to add a character – Restricted to ADMIN or higher (or group admin)
const addCharMiddleware = new Composer<MyContext>();
addCharMiddleware.use(onlyRole(ProfileType.ADMIN));
addCharMiddleware.use(AddCharacterHandler);

adminCommands.command(
  `addchar${botPrefix}`,
  "Add a character to the database (admin)",
  addCharMiddleware,
);

// Rarity Management Commands
const addRarityComposer = new Composer<MyContext>();
addRarityComposer.use(onlyRole(ProfileType.ADMIN));
addRarityComposer.use(AddRarityHandler);

adminCommands.command(
  `addrarity${botPrefix}`,
  "Add a new rarity (admin)",
  addRarityComposer,
);

const editRarityComposer = new Composer<MyContext>();
editRarityComposer.use(onlyRole(ProfileType.ADMIN));
editRarityComposer.use(EditRarityHandler);

adminCommands.command(
  `editrarity${botPrefix}`,
  "Edit an existing rarity (admin)",
  editRarityComposer,
);

const delRarityComposer = new Composer<MyContext>();
delRarityComposer.use(onlyRole(ProfileType.ADMIN));
delRarityComposer.use(DeleteRarityHandler);

adminCommands.command(
  `delrarity${botPrefix}`,
  "Delete a rarity (admin)",
  delRarityComposer,
);

const reloadAdmsComposer = new Composer<MyContext>();
reloadAdmsComposer.use(onlyRole(ProfileType.SUPER_ADMIN));
reloadAdmsComposer.use(reloadAdmsHandler);

adminCommands.command(
  `reloadadms${botPrefix}`,
  "Atualiza todos os admins do grupo como ADMIN no banco",
  reloadAdmsComposer,
);

const banUserComposer = new Composer<MyContext>();
banUserComposer.use(onlyRole(ProfileType.ADMIN));
banUserComposer.use(banHandler);

adminCommands.command(
  `banuser${botPrefix}`,
  "Banir usuário",
  banUserComposer,
);

const unbanUserComposer = new Composer<MyContext>();
unbanUserComposer.use(onlyRole(ProfileType.ADMIN));
unbanUserComposer.use(unbanHandler);

adminCommands.command(
  `unbanuser${botPrefix}`,
  "Desbanir usuário",
  unbanUserComposer,
);

const listBannedComposer = new Composer<MyContext>();
listBannedComposer.use(onlyRole(ProfileType.ADMIN));
listBannedComposer.use(listBannedHandler);

adminCommands.command(
  `listbanned${botPrefix}`,
  "Listar usuários banidos",
  listBannedComposer,
);

// We can add more admin commands here following the same pattern
// adminCommands.command(
//   `manageuser${botPrefix}`,
//   "Manage users (OWNER only)",
//   onlyRole(ProfileType.OWNER),
//   ManageUserHandler,
// );

export { adminCommands };
