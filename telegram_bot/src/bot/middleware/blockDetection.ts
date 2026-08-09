import type { NextFunction } from "grammy";
import type { MyContext } from "../../utils/customTypes.js";
import { blockedUsers, blockKey } from "./blockedUsers.js";

export async function blockDetection(ctx: MyContext, next: NextFunction) {
  if (!ctx.from) return next();
  const key = blockKey(ctx.chat?.id, ctx.from.id);
  const unblockAt = blockedUsers.get(key);
  if (unblockAt && Date.now() < unblockAt) return;
  if (unblockAt) blockedUsers.delete(key);
  await next();
}
