import type { NextFunction } from "grammy";
import type { MyContext } from "../../utils/customTypes.js";
import { blockedUsers } from "./blocked_users.js";

export async function blockDetection(ctx: MyContext, next: NextFunction) {
  if (!ctx.from) return next();
  const unblockAt = blockedUsers.get(ctx.from.id);
  if (unblockAt && Date.now() < unblockAt) return;
  if (unblockAt) blockedUsers.delete(ctx.from.id);
  await next();
}
