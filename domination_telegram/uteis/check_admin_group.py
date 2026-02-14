import os
from aiogram import Bot
from aiogram.types import ChatMemberAdministrator, ChatMemberOwner

from dotenv import load_dotenv
load_dotenv()
async def check_admin_group(bot: Bot, chat_id: int = None, user_id: int = None) -> bool:
    if chat_id is None:
        try:
            chat_id = int(os.getenv("GROUP_ADMINS_ID"))
        except Exception as e:
            raise RuntimeError(f"Erro ao obter ID do grupo ADMIN: {e}")

    try:
        member = await bot.get_chat_member(chat_id, user_id)
    except Exception as e:
        print(f"Erro ao verificar admin no grupo {chat_id} para {user_id}: {e}")
        return False

    return isinstance(member, (ChatMemberAdministrator, ChatMemberOwner))
