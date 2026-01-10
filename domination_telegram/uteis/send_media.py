from database.models.Character import CharacterWaifu, CharacterHusbando
from database.models._types import MediaType
from aiogram.types import Message

async def send_media(Character: CharacterWaifu | CharacterHusbando, caption: str, message:Message = None, bot=None):

    if Character.media_type in [MediaType.IMAGE_URL, MediaType.IMAGE_FILEID, MediaType.IMAGE_BYTES, MediaType.IMAGE_FILE]:
        if message:
            await message.answer_photo(photo=Character.data, caption=caption)
        elif bot:
            await bot.send_photo(photo=Character.data, caption=caption)

    elif Character.media_type in [MediaType.VIDEO_BYTES, MediaType.VIDEO_FILE, MediaType.VIDEO_URL, MediaType.VIDEO_FILEID]:
        if message:
            await message.answer_video(video=Character.data, caption=caption)
        elif bot:
            await bot.send_video(video=Character.data, caption=caption)