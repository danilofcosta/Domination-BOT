import json
from pyrogram import Client, filters
from pyrogram.types import *
from types_ import COMMAND_LIST_ADMIN
from uteis import (
    check_admin_group,
    dynamic_command_filter,
)
from domination.message import MESSAGE
from domination.plugins.harem import harem


@Client.on_message(
    filters.create(
        name=f"comand{' '.join(COMMAND_LIST_ADMIN.OPEN_PROFILE.value)}",
        func=dynamic_command_filter,
        command=COMMAND_LIST_ADMIN.OPEN_PROFILE.value,
    )
)
async def open(client: Client, message: Message):
    if await check_admin_group(client, user_id=message.from_user.id) == False:
        return await message.reply(
            MESSAGE.get_text("pt", "erros", "not_admin_bot"), quote=True
        )

    else:
        if message.reply_to_message:

            await harem(
                client=client,
                message=message.reply_to_message,
                user_id=message.from_user.id,
            )

        else:
            message.reply(MESSAGE.get_text("pt", "alerts", "reply_to_message"))
