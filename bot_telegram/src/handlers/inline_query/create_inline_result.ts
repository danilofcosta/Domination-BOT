import type {
  ParseMode,
  InlineQueryResult,
  InlineQueryResultPhoto,
  InlineQueryResultCachedPhoto,
  InlineQueryResultVideo,
  InlineQueryResultCachedVideo,
} from "grammy/types";

import type { MyContext } from "../../utils/customTypes.js";
import { create_caption } from "../../utils/manege_caption/create_caption.js";
import { MediaType } from "../../../generated/prisma/client.js";
import type {
  Character,
  ChatType,
  Collection,
} from "../../utils/customTypes.ts";
import { warn, error } from "../../utils/log.js";

export interface Params {
  ctx: MyContext | any;
  chatType: ChatType;
  character: Character | Collection;
  noformat: boolean | undefined | null;
  username?: string | undefined;
  user_id?: string | undefined;
  no_format?: boolean | undefined | null;
}

export function createResult(params: Params) {
  let character = params.character as Character;
  const capiton = create_caption(params);

  if (
    params.character &&
    typeof params.character === "object" &&
    "characterId" in params.character
  ) {
    character = (params.character as any).Character as Character;
  }

  switch (character.mediaType) {
    case MediaType.IMAGE_URL:
      return {
        type: "photo",
        id: `${character.id}`,
        photo_url: character.media,
        thumbnail_url: character.media,
        title: character.name,
        caption_entities: [],

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

        description: character.origem,
        caption: capiton,
        parse_mode: "HTML" as ParseMode,
      } as InlineQueryResultCachedPhoto;

    case MediaType.VIDEO_URL:
      return {
        type: "video",
        id: "url" + `${character.id}`,
        title: character.name,
        mime_type: "video/mp4",

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

        video_file_id: character.media,
        caption: capiton,
        title: character.name,

        description: character.origem,

        parse_mode: "HTML" as ParseMode,
      } as InlineQueryResultCachedVideo;

    default:
      warn(`createResult - mediaType desconhecido, usando fallback`, { 
        charId: character.id, 
        mediaType: character.mediaType 
      });
      const url = process.env.DEFAULT_IMAGE_URL;
      if (!url) {
        error(`createResult - DEFAULT_IMAGE_URL não configurada`, { charId: character.id });
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
      };
  }
}
