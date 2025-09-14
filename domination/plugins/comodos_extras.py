from pyrogram import *
from pyrogram.types import *


@Client.on_message(filters.command("id"))
async def harem_mode(client: Client, message: Message):
    chatid = message.chat.id
    return await client.send_message(
        chat_id=chatid, text=f"id chat: <code>{chatid}</code>"
    )
