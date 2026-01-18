from database.models.Character import CharacterWaifu, CharacterHusbando
from database.models._types import MediaType
from aiogram.types import Message

async def send_media(
    caption: str,
        
    character: CharacterWaifu | CharacterHusbando=None,
    message: Message = None,
    bot=None,
    chat_id: int | None = None
    ,reply_markup=None,

):
    """
    Envia mídia usando message (reply) ou bot + chat_id.
    Se chat_id for informado, tenta enviar a mensagem para esse chat.
    """

    if not message and not (bot and chat_id):
        raise ValueError("You must provide either message or bot with chat_id.")

    # Caso não tenha personagem, só envia o texto
    if not character:
        if caption:
            if message:
               return await message.answer(caption)
            else:
              return  await bot.send_message(chat_id=chat_id, text=caption, reply_markup=reply_markup)
        return

    # Funções auxiliares para evitar duplicação
    async def send_photo():
        if message:
          return  await message.answer_photo(photo=character.data, caption=caption, reply_markup=reply_markup)
        else:
           return await bot.send_photo(chat_id=chat_id, photo=character.data, caption=caption, reply_markup=reply_markup)

    async def send_video():
        if message:
            return await message.answer_video(video=character.data, caption=caption, reply_markup=reply_markup)
        else:
            return    await bot.send_video(chat_id=chat_id, video=character.data, caption=caption, reply_markup=reply_markup)

    # Envio conforme tipo de mídia
    if character.media_type in [
        MediaType.IMAGE_URL,
        MediaType.IMAGE_FILEID,
        MediaType.IMAGE_BYTES,
        MediaType.IMAGE_FILE
    ]:
      return  await send_photo()

    elif character.media_type in [
        MediaType.VIDEO_BYTES,
        MediaType.VIDEO_FILE,
        MediaType.VIDEO_URL,
        MediaType.VIDEO_FILEID
    ]:
      return  await send_video()
