import type { MyContext } from "../../../utils/customTypes.js";
import { changePasswordWeb } from "./web/changePasswordWeb.js";
import { createAccountWeb } from "./web/createAccountWeb.js";
import { sendMessageCustom } from "../../../utils/sendMessageCustom.js";
import { debug } from "../../../utils/log.js";


async function getGroupAdminsMentions(ctx: MyContext): Promise<string[]> {
  const groupAdm = process.env.GROUP_ADM;
  if (!groupAdm) return [];
  try {
    const admins = await ctx.api.getChatAdministrators(Number(groupAdm));
    return admins
      .map((member) => member.user.username)
      .filter((username): username is string => !!username)
      .map((username) => `@${username}`);
  } catch {
    return [];
  }
}

export async function processStartArgument(ctx: MyContext): Promise<void> {
  debug("processStartArgument - match:", ctx.match);
  if (ctx.match) {
    switch (ctx.match) {
      // case "help": {
      //     helpCommand(ctx);
      //     return;
      //   }
      case "creditos": {
        try {
          await ctx.deleteMessage();
          const admins = await getGroupAdminsMentions(ctx);
          await sendMessageCustom({
            ctx,
            caption: ctx.t("start_creditos", { admins: admins.join(", ") }),
          });
          return;
        } catch {
          // ignore
        }
        break;
      }
      case "guia_back_start": {
        try {
          await ctx.deleteMessage();
        } catch {
          // ignore
        }
        break;
      }
      case "createaccountweb": {
        return await createAccountWeb(ctx);
      }
      case "changepassword": {
        return await changePasswordWeb(ctx);
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

