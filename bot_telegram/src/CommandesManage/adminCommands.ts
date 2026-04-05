import { CommandGroup } from "@grammyjs/commands";
import type { MyContext } from "../utils/customTypes.js";
import { AddCharacterHandler } from "../handlers/Comandos/admin/add_charecter.js";
import { botPrefix } from "./conts.js";
import { ProfileType } from "../../generated/prisma/client.js";
import { onlyRole } from "../utils/permissions.js";
import { Composer } from "grammy";

import { AddRarityHandler } from "../handlers/Comandos/admin/add_Rarity.js";
import { EditRarityHandler } from "../handlers/Comandos/admin/edit_rarity.js";
import { DeleteRarityHandler } from "../handlers/Comandos/admin/del_rarity.js";

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

// We can add more admin commands here following the same pattern
// adminCommands.command(
//   `manageuser${botPrefix}`,
//   "Manage users (OWNER only)",
//   onlyRole(ProfileType.OWNER),
//   ManageUserHandler,
// );

export { adminCommands };
