import { typeBot } from "../../../CommandsRegistry/botConfigCommands.js";
import { createCaption } from "../../../utils/buildCaption/createCaption.js";
import { ChatType, type MyContext } from "../../../utils/customTypes.js";
import { getCharacterById } from "../../../utils/extras/getCharacterById.js";
import { sendMessageCustom } from "../../../utils/sendMessageCustom.js";

// callback: showcharacter_{id}

export async function showCharacterCallback(ctx: MyContext) {
  const data = ctx.callbackQuery?.data;
  if (!data) return;
  const gener = typeBot === "husbando" ? ChatType.WAIFU : ChatType.WAIFU
  const [_, characterid] = data.split("_");
  const character = await getCharacterById(
  gener  ,
    Number(characterid),
  );

  if (!character){
    sendMessageCustom(
      {
        ctx,caption:'persogem não encontado'
      }
    )
  }

 await sendMessageCustom({
    ctx,character:character,caption:  createCaption({
          character: character,
          chatType: gener,
          t: ctx.t,
        })
  })
}
