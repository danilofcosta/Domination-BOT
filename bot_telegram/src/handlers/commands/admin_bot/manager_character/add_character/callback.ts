import { getCharacter } from "../../../../../cache/cache.js";
import type { MyContext } from "../../../../../utils/customTypes.js";
import { confirmCharacterAdd } from "./confirm.js";
import { addCharacterEditMenu } from "./edit.ui.js";

export async function addCharacterCallbackData(ctx: MyContext) {
  if (!ctx.callbackQuery?.data) return;

  const [command, action, ...rest] = ctx.callbackQuery.data.split("_");
  const id_cached = rest.join("_");

  const character = getCharacter(Number(id_cached));

  if (!character) {
    await ctx.answerCallbackQuery(ctx.t("error-character-not-found"));
    return;
  }

  if (action === "confirm") {
    await confirmCharacterAdd(ctx, Number(id_cached));
    return;
  }

  if (action === "cancel") {
    await ctx.deleteMessage().catch(() => {});
    return;
  }

  if (action === "edit") {
    await addCharacterEditMenu(ctx, id_cached);
    return;
  }
}
