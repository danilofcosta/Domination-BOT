import type { MyContext } from "../../../../utils/customTypes.js";
import { Extract_id_user } from "../../../../utils/extract_id_user.js";
import { Sendmedia } from "../../../../utils/sendmedia.js";
import { HaremHandler } from "../../users/harem.js";

export async function OpenHaremUser(ctx: MyContext) {
  const mentionUser = await Extract_id_user(ctx);

  if (!mentionUser) {
    return await Sendmedia({ ctx, caption: ctx.t("harem-open-id-not-found") });
  }

  await HaremHandler(ctx, mentionUser.id);
}