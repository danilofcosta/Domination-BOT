import { createButtonEditCharacter } from "../../../../uteis/buildButtons/createButtonEditCharacter.js";
import type { MyContext, PreCharacter } from "../../../../uteis/CustomTypes.js";
import { SendMensageCustom } from "../../../../uteis/sendMensageCustom.js";


export async function EditUI(ctx: MyContext, CharacterCache: PreCharacter, cacheid: number | string, actionType: "edit" | "add" = "add") {
  if (!ctx || !CharacterCache) return;
  const { nome, anime, genero, mediatype, media, rarities, events, sourceType } = CharacterCache;

  const idLine = actionType === "edit" && CharacterCache.editId
    ? `<b>ID:</b> ${CharacterCache.editId}`
    : "";
  //as mudanças ainda nao refretidas no canal
  const caption = `
<b>Fun:</b>  ${actionType}
${idLine}
<b>Nome:</b> ${nome}
<b>Anime:</b> ${anime}
<b>Gênero:</b> ${genero}
<b>Origem:</b> ${sourceType ?? "ANIME"}
<b>Raridades:</b> ${rarities?.join(", ") || "Nenhuma"}
<b>Eventos:</b> ${events?.join(", ") || "Nenhum"}
<i>caso raridade não seja especificada será usada a padrão (comum)</i>
`;

  const buttons = createButtonEditCharacter({
    cacheid,
    action: actionType,
  });

  await SendMensageCustom({
    ctx: ctx,
    caption,
    character: {
      media: CharacterCache.media,
      mediaType: CharacterCache.mediatype,
    },
    reply_markup: buttons,
  });
}