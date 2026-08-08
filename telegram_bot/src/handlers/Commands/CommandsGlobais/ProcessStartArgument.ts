import { ProfileType } from "../../../../generated/prisma/client.js";
import type { MyContext } from "../../../uteis/CustomTypes.js";
import { onlyRoleBotAdmin } from "../../../uteis/permissions.js";
import { changePasswordWeb } from "./web/changePasswordWeb.js";
import { createAccountWeb } from "./web/createAccountWeb.js";


export async function ProcessStartArgument(ctx: MyContext): Promise<void> {
  if (ctx.match) {
    switch (ctx.match) {
      // case "help": {
      //     helpCommand(ctx);
      //     return;
      //   }
      //   case "backup": {
      //     Backup_harem(ctx);
      //   }
      case "guia_back_start": {
        try {
          await ctx.deleteMessage();
        } catch {
          // ignore
        }
        break;
      }
      case "createaccountweb": {
        return await onlyRoleBotAdmin(ProfileType.ADMIN)(ctx, async () => {
          await createAccountWeb(ctx);
        });
      }
      case "changepassword": {
        return await onlyRoleBotAdmin(ProfileType.ADMIN)(ctx, async () => {
          await changePasswordWeb(ctx);
        });
      }
      default:
        try {
          await ctx.deleteMessage();
        } catch {
          // ignore
        }
        break;
    }
  }
}

