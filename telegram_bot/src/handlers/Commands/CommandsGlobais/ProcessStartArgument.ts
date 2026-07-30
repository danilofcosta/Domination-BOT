import { ProfileType } from "../../../../generated/prisma/client.js";
import type { MyContext } from "../../../uteis/CustomTypes.js";
import { onlyRoleBotAdmin } from "../../../uteis/permissions.js";
import { createAccountWeb } from "./web/createAccountWeb.js";

export async function ProcessStartArgument(ctx: MyContext) {
  if (ctx.match) {
    switch (ctx.match) {
      // case "help": {
      //     helpCommand(ctx);
      //     return;
      //   }
      //   case "backup": {
      //     Backup_harem(ctx);
      //   }
      case "createaccountweb": {
        return await onlyRoleBotAdmin(ProfileType.ADMIN,)(ctx, async () => {
          await createAccountWeb(ctx);
        });

        break;
      }
      default:
        return;
    }
  }
}

