import { userCommandsRegistry, userCommandsRegistryDict } from "../../../../../CommandsRegistry/CommandsRegistryUser.js";
import { createButtonEditCharacter } from "../../../../../uteis/buildButtons/createButtonEditCharacter.js";
import type { MyContext, PreCharacter } from "../../../../../uteis/CustomTypes.js";
import { SendMensageCustom } from "../../../../../uteis/sendMensageCustom.js";


export async function EditUI(ctx: MyContext, CharacterCache: PreCharacter, cacheid: number | string, actionType: "edit" | "add" = "add") {
  if (!ctx || !CharacterCache) return;
  const { nome, anime, genero, mediatype, media, rarities, events, sourceType } = CharacterCache;

  const idLine = actionType === "edit" && CharacterCache.editId
    ? `<b>ID:</b> ${CharacterCache.editId}`
    : "";

const extraLine = actionType === "edit" && CharacterCache.editId
  ? `\n\n O cache de consultas inline está configurado entre 500s (8 minutos) e 7200s (2 horas), dependendo do tipo de consulta. Alterações recentes podem não aparecer imediatamente. Para obter os dados atualizados, use a busca direta por ID: <code>/${userCommandsRegistryDict.Random?.command} ${CharacterCache.editId}</code>`
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
${extraLine}
`.trim();

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