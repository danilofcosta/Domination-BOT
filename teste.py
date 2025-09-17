# #!/usr/bin/env python3
# import os
# from pyrogram import Client, filters
# from settings import Settings
# from pyrogram.types import MessageEntity
# from pyrogram.enums import MessageEntityType
# var = Settings()

# API_ID = var.API_ID
# API_HASH = var.API_HASH
# BOT_TOKEN = var.BOT_TOKEN_TESTE  # pegue do settings.py

# app = Client(
#     "echo-bot",
#     api_id=API_ID,
#     api_hash=API_HASH,
#     bot_token=BOT_TOKEN,
#     workdir="sessions",
# )


# # Echo de mensagens de texto
# @app.on_message(filters.text)
# async def echo_text(client, message):
#     print("ddddddddddddddddddd")
#     for entitie in message.entities:
#         entitie: MessageEntity = entitie
#         if entitie.type == MessageEntityType.MENTION:

#     await message.reply_text(message.text)


# # Echo de qualquer outra mídia
# @app.on_message(filters.media | filters.sticker)
# async def echo_media(client, message):

#     await message.copy(message.chat.id)


# if __name__ == "__main__":
#     print("🤖 Bot iniciado. Ctrl+C para parar.")
#     app.run()
