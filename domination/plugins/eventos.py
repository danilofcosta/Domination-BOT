from pyrogram import Client, filters
from pyrogram.types import *
from DB.models import ChatTG
from types_ import Idioma
from message import MESSAGE
@Client.on_message(filters.new_chat_members)
async def bot_added_to_group(client: Client, message: Message):
    for member in message.new_chat_members:
        # Verifica se o novo membro é o próprio bot
        if member.id == client.me.id:
            # Pega quem adicionou o bot
            adder = message.from_user  # pode ser None em alguns casos
            adder_info = f"{adder.mention} [ID: {adder.id}]" if adder else "Desconhecido"
            
            # Quantidade de membros no grupo
            member_count = await client.get_chat_members_count(message.chat.id)
            if member_count < 20:
                try:
                    text =MESSAGE.get_text('pt', "eventos", "small_group_leaving")
                    await client.send_message(message.chat.id, text=text)
                    await client.leave_chat(message.chat.id)
                    return
                except:
                    pass
                
            async with await client.get_reusable_session() as session:
                f = ChatTG(
                    id_grupo=message.chat.id,
                    name=message.chat.title,
                    idioma=Idioma.PT,  # Idioma padrão obrigatório
                    configs={
                        "chat_id": message.chat.id,
                        "chat_type": str(message.chat.type),
                        "chat_title": message.chat.title,
                        "chat_username": getattr(message.chat, 'username', None),
                        "chat_description": getattr(message.chat, 'description', None)
                    }
                )
                session.add(f)
                await session.commit()
            
            # Monta a mensagem
       

            cap = await MESSAGE.get_text('pt' "eventos", "bot_added_to_group",
                group_title=message.chat.title,
                group_id=message.chat.id,
                adder_info=adder_info,
                member_count=member_count
            )
            
            # Envia mensagem para o grupo de logs
            await client.send_message(
                client.group_main,
                cap
            )
