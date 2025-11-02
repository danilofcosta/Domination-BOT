from mailbox import Message

from sqlalchemy import select

from DB.database import DATABASE
from DB.models import ChatTG
from domination.logger import log_error


async def add_group_in_db(message: Message | ChatTG):
    try:
        id_grupo:int = message.chat.id if message is not ChatTG else message.id_grupo

        existing_chat: ChatTG | None = await DATABASE.get_info_one(
            select(ChatTG).where(ChatTG.id_grupo == id_grupo)
        )
        if not existing_chat:
            grp = (
                ChatTG(
                    name=message.chat.title,
                    id_grupo=message.chat.id,
                    configs={
                        "title": message.chat.title,
                        "bio": message.chat.bio,
                        "has_protected_content": message.chat.has_protected_content,
                        "type": message.chat.type.value,
                        "username": message.chat.username,
                    },
                )
                if message is not ChatTG
                else message
            )
            await DATABASE.add_object(grp)
            return True
    except Exception as e:
        log_error(e)
