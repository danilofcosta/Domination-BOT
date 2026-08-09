import { typeBot } from "../../../CommandsRegistry/botConfigCommands.js";
import { create_caption } from "../../../uteis/buildCapion/create_caption.js";
import { ChatType, type MyContext } from "../../../uteis/CustomTypes.js";
import { GetCharacterById } from "../../../uteis/extras/GetCharacterById.js";
import { SendMensageCustom } from "../../../uteis/sendMensageCustom.js";

// callback: showcharacter_{id}

export async function ShowCharacterCallback(ctx: MyContext) {
  const data = ctx.callbackQuery?.data;
  if (!data) return;
  const gener = typeBot === "husbando" ? ChatType.WAIFU : ChatType.WAIFU
  const [_, characterid] = data.split("_");
  const character = await GetCharacterById(
  gener  ,
    Number(characterid),
  );

  if (!character){
    SendMensageCustom(
      {
        ctx,caption:'persogem não encontado'
      }
    )
  }

 await SendMensageCustom({
    ctx,character:character,caption:  create_caption({
          character: character,
          chatType: gener,
          t: ctx.t,
        })
  })
}
