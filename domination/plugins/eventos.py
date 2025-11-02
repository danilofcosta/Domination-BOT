from pyrogram import Client, filters
from pyrogram.types import *
from DB.models import ChatTG
from domination.logger import log_error
from domination.uteis.add_group_in_db import add_group_in_db
from types_ import Idioma
from domination.message import MESSAGE
from DB.database import DATABASE
from settings import Settings


async def is_small_group(client: Client, chat_id: int, min_members: int = 20) -> bool:
    """Verifica se o grupo tem menos membros que o mínimo necessário."""
    count = await client.get_chat_members_count(chat_id)
    return count < min_members


@Client.on_message(filters.new_chat_members)
async def bot_added_to_group(client: Client, message: Message):
    for member in message.new_chat_members:
        # Se o novo membro for o próprio bot
        if member.id != client.me.id:
            # print("Outro membro adicionado, ignorando...")
            continue

        # Quem adicionou o bot
        adder = message.from_user
        adder_info = f"{adder.mention} [ID: {adder.id}]" if adder else "Desconhecido"

        # Quantidade de membros no grupo
        member_count = await client.get_chat_members_count(message.chat.id)

        # Sai de grupos pequenos
        if member_count < 20:
            text = MESSAGE.get_text("pt", "eventos", "small_group_leaving")
            try:
                await client.send_message(message.chat.id, text=text)
                await client.leave_chat(message.chat.id)
            except Exception as e:
                # Logar erro se quiser
                print(f"Erro ao sair do grupo pequeno: {e}")
            return

        # Adiciona o grupo no banco de dados
        chat_obj = ChatTG(
            id_grupo=message.chat.id,
            name=message.chat.title,
            idioma=Idioma.PT,
            configs={
                "chat_id": message.chat.id,
                "chat_type": message.chat.type.value,
                "chat_title": message.chat.title,
                "chat_username": getattr(message.chat, "username", None),
                "chat_description": getattr(message.chat, "description", None),
            },
        )
        try:
            add_group_in_db(chat_obj)
        except Exception as e:
            print(f"Erro ao adicionar grupo ao banco: {e}")
            log_error(
                f"Erro ao adicionar objeto ao banco: {e}",
                module="eventos",
                exc_info=True,
            )

        # Monta a mensagem de log
        log_msg = MESSAGE.get_text(
            "pt",
            "eventos",
            "bot_added_to_group",
            group_title=message.chat.title,
            group_id=message.chat.id,
            adder_info=adder_info,
            member_count=member_count,
        )

        # Envia para o grupo de logs

        try:
            await client.send_message(Settings().GROUP_ADDMS_ID, log_msg)
        except Exception as e:
            print(f"Erro ao enviar log para grupo principal: {e}")
