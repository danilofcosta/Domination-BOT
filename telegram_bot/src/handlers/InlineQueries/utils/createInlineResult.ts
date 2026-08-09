import type { InlineQueryResultCachedPhoto, InlineQueryResultCachedVideo, InlineQueryResultPhoto, InlineQueryResultVideo, ParseMode } from "grammy/types";
import { MediaType } from "../../../../generated/prisma/enums.js";
import type { Character, ChatType, Collection } from "../../../utils/customTypes.js";
import { error, warn } from "../../../utils/log.js";
import { createCaption, type CreateCaptionParams } from "../../../utils/buildCaption/createCaption.js";



export function createInlineResult(params: CreateCaptionParams) {
  let character = params.character as Character;
  const capiton = createCaption(params);

  if (
    params.character &&
    typeof params.character === "object" &&
    "characterId" in params.character
  ) {
    character = (params.character as any).Character as Character;
  }

  switch (character.mediaType) {
    case MediaType.IMAGE_URL:
      //   console.log("Creating result for character with mediaType IMAGE_URL:", {
      //     id: character.id,
      //     name: character.name,
      //     media: character.media,
      //   });
      return {
        type: "photo",
        id: `${character.id}`,
        photo_url: character.media,
        thumbnail_url: character.media,
        title: character.name,
        caption_entities: [],
        input_message_content: params.input_message_content,
        reply_markup: params.reply_markup,

        description: character.origem,
        caption: capiton,
        parse_mode: "HTML" as ParseMode,
      } as InlineQueryResultPhoto;
    case MediaType.IMAGE_FILEID:
      return {
        type: "photo",
        id: "fileid" + `${character.id}`,
        photo_file_id: character.media,
        title: character.name,
        reply_markup: params.reply_markup,

        description: character.origem,
        caption: capiton,
        input_message_content: params.input_message_content,
        parse_mode: "HTML" as ParseMode,
      } as InlineQueryResultCachedPhoto;

    case MediaType.VIDEO_URL:
      return {
        type: "video",
        id: "url" + `${character.id}`,
        title: character.name,
        mime_type: "video/mp4",
        input_message_content: params.input_message_content,
        reply_markup: params.reply_markup,
        description: character.origem,
        video_url: character.media,
        thumbnail_url: character.media,
        caption: capiton,
        parse_mode: "HTML" as ParseMode,
      } as InlineQueryResultVideo;
    case MediaType.VIDEO_FILEID:
      return {
        type: "video",
        id: "fileid" + `${character.id}`,
        mime_type: "video/mp4",
        reply_markup: params.reply_markup,

        video_file_id: character.media,
        caption: capiton,
        title: character.name,

        description: character.origem,

        input_message_content: params.input_message_content,
        parse_mode: "HTML" as ParseMode,
      } as InlineQueryResultCachedVideo;

    default:
      warn(`createInlineResult - mediaType desconhecido, usando fallback`, {
        charId: character.id,
        mediaType: character.mediaType,
      });
      const url = process.env.DEFAULT_IMAGE_URL;
      if (!url || url.trim() === "" || character.mediaType === MediaType.IMAGE_LOCAL || character.mediaType === MediaType.VIDEO_LOCAL) {
        error(`createInlineResult - DEFAULT_IMAGE_URL não configurada`, {
          charId: character.id,
        });

        // params.ctx.api.sendMessage(
        //   process.env.CHAT_ID_DEV as string,
        //   `
        //   createInlineResult - DEFAULT_IMAGE_URL não configurada

        //   ${character.id}
        //   ${character.mediaType}
        //   `,
        // );       

        return {
          type: "text",
          id: "txt" + `${character.id}`,

          title: character.name,
          input_message_content: {
            message_text: capiton,
            parse_mode: "HTML" as ParseMode,
          },
        };
      }
      return {
        type: "photo",
        id: "url" + `${character.id}`,
        photo_url: url,
        thumbnail_url: url,
        caption: capiton,
        parse_mode: "HTML" as ParseMode,
        reply_markup: params.reply_markup,
      };
  }
}
