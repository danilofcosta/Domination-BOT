import type { NextFunction } from "grammy";
import type { MyContext } from "../../utils/customTypes.js";
import { isUserBanned } from "../../utils/permissions.js";

export async function banCheck(ctx: MyContext, next: NextFunction) {
  if (!ctx.from) return;
  const banned = await isUserBanned(ctx.from.id);
  if (banned) return;
  await next();
}
