import { MediaType } from "../../../../generated/prisma/client.js";
import { createCaption } from "../../../utils/buildCaption/createCaption.js";
import type { MyContext } from "../../../utils/customTypes.js";

function getMediaType(mediaType: MediaType): "photo" | "video" {
  switch (mediaType) {
    case MediaType.IMAGE_FILEID:
    case MediaType.IMAGE_URL:
      return "photo";
    case MediaType.VIDEO_FILEID:
    case MediaType.VIDEO_URL:
      return "video";
    default:
      return "photo";
  }
}


export function createTradeTable(Info:any) {
  return `
<tr>
  <td>Id</td>
  <td>Nome</td>
  <td>Anime</td>
  <td>Raridade</td>
  <td>Evento</td>
  <td>Criado</td>
</tr>

<tr>
  <td>${Info?.characterData?.id ?? ""}</td>
  <td>${Info?.characterData?.name ?? ""}</td>
  <td>${Info?.characterData?.origem ?? ""}</td>
  <td>${Info?.characterData?.WaifuRarity?.[0]?.Rarity.code ?? ""}</td>
  <td>${Info?.characterData?.WaifuEvent?.[0]?.Event.code ?? "N/A"}</td>
  <td>
    <tg-time
      unix="${Math.floor(new Date(Info?.characterData?.createdAt ?? 0).getTime() / 1000)}"
      format="wDT"
    />
  </td>
</tr>
`;
}
export function buildCharacterMedia(ctx: MyContext, data: any) {
  const characterData = data?.Character;

  if (!characterData) return null;

  const type = getMediaType(characterData.mediaType);
  const isImage = type === "photo";

  const link = `<${isImage ? "img" : "video"} src="tg://photo?id=personagem${characterData.id}"/> `;
  const caption = createCaption({
    t: ctx.t,
    chatType: ctx.botType,
    character: characterData,
    rawEmoji: false
  });
  const id = `personagem${characterData.id}`;

  return { id, link, type, caption, characterData };
}
