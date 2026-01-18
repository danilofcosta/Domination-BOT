from database.models.Character import CharacterHusbando, CharacterWaifu
from aiogram.types import *
from database.models._types import MediaType
from domination_telegram.uteis.create_caption_character import create_caption_show_character


def create_results(list_of_results: list[CharacterWaifu | CharacterHusbando],genero,user:tuple = None):

    results = []
    last = None
    for i in list_of_results:
        
        if i.media_type in [MediaType.IMAGE_URL]:
            results.append(
                InlineQueryResultPhoto(
                    id=str(i.id),
                    photo_url=i.data,
                    thumbnail_url=i.data,
                    title=f"{i.character_name}",
                    caption=create_caption_show_character(character=i,genero=genero,user=user),
                    #  reply_markup=InlineKeyboardMarkup().add(InlineKeyboardButton("Add to favorites",callback_data="favorite")))
                )
            )

        elif i.media_type == MediaType.IMAGE_FILEID:
            results.append(
                InlineQueryResultCachedPhoto(
                    id=str(i.id),
                    photo_file_id=i.data,
                    title=f"{i.character_name}",
                    caption=create_caption_show_character(character=i,genero=genero,user=user),
                   # reply_markup=InlineKeyboardMarkup().add(InlineKeyboardButton("Add to favorites", callback_data="favorite"))
                )
            )
        elif i.media_type == MediaType.VIDEO_FILEID:
            results.append(
                InlineQueryResultCachedVideo(
                    id=str(i.id),
                    video_file_id=i.data,
                    title=f"{i.character_name}",
                    caption=create_caption_show_character(character=i,genero=genero,user=user),
                  #  reply_markup=InlineKeyboardMarkup().add(InlineKeyboardButton("Add to favorites", callback_data="favorite"))
                )
            )
        elif i.media_type == MediaType.VIDEO_URL:
            results.append(
                InlineQueryResultVideo(
                    id=str(i.id),
                    video_url=i.data,
                    thumbnail_url=i.data,
                    mime_type='video/mp4',
                    title=f"{i.character_name}",
                    caption=create_caption_show_character(character=i,genero=genero,user=user),
                 #   reply_markup=InlineKeyboardMarkup().add(InlineKeyboardButton("Add to favorites", callback_data="favorite"))
                )
            )

    return results
