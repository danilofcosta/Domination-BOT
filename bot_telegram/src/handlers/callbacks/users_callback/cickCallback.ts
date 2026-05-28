import { GetCharacterById } from "../../../utils/character/get_by_id.js";
import type { Character, MyContext } from "../../../utils/customTypes.js";
import { debug } from "../../../utils/log.js";
import { create_caption } from "../../../utils/manage_captures/create_caption.js";
import { mentionUser } from "../../../utils/mention_user.js";
import { Sendmedia } from "../../../utils/sendmedia.js";
//click_id
export async function ClickByDetail_Callback(ctx: MyContext) {
  const [_, id] = ctx.match ? (ctx.match as any).input.split("_") : [];

  const character = await GetCharacterById(
    ctx.botType,
    Number(id),
  );
  if (!character) {
    debug(" character n encontadp-");
    return;
  }

  let caption = create_caption({
    t: ctx.t,
    character: character,
    chatType: ctx.botType,
    noformat: false,
  });

  caption = `${caption}\n\n Click : ${mentionUser(ctx.from?.first_name || "", ctx.from?.id || 0)}`;

  try {
    await ctx.deleteMessage();
  } catch (e) {
    debug("erro ao deletar mensagem", e);
  }
  await Sendmedia({
    ctx,
    per: character,
    caption,
  });
}
