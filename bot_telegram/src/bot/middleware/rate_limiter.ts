import { limit } from "@grammyjs/ratelimiter";
import type { MyContext } from "../../utils/customTypes.js";
import { mentionUser } from "../../utils/mention_user.js";
import { blockedUsers } from "./blocked_users.js";
import { BLOCK_DURATION_MS, LIMIT, TIMEFAME } from "./constants.js";
import redis from "../../cache/redis.js";

export const rateLimiter = limit({
  timeFrame: TIMEFAME,
  limit: LIMIT,
  onLimitExceeded: async (ctx) => {
    const myCtx = ctx as unknown as MyContext;
    if (myCtx.from) {
      blockedUsers.set(myCtx.from.id, Date.now() + BLOCK_DURATION_MS);
      const name = myCtx.from.first_name || myCtx.from.username || "User";
      const userMention = mentionUser(name, myCtx.from.id);
      await myCtx.reply(myCtx.t("use-onLimitExceeded", { mentionUser: userMention }), {
        parse_mode: "HTML",
      });
    }
  },
  storageClient: redis,
});
