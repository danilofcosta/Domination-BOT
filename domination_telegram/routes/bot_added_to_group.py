from aiogram import Router, Bot
from aiogram.types import ChatMemberUpdated
from aiogram.enums import ChatType

from database.models.GroupTg import TelegramGroup
from database.models._types import Language
from database.session import AsyncSessionLocal


def get_router():
    router = Router(name=__name__)

    @router.chat_member()
    async def bot_added_to_group(event: ChatMemberUpdated, bot: Bot):
        # Verifica se quem entrou foi o próprio bot
        if event.new_chat_member.user.id != (await bot.me()).id:
            return

        chat = event.chat
        adder = event.from_user

        # Pega @ do grupo se existir, senão usa o nome
        if chat.username:
            group_display = f"@{chat.username}"
        else:
            group_display = chat.title or "Grupo sem nome"

        # Conta membros
        try:
            member_count = await bot.get_chat_member_count(chat.id)
        except Exception as e:
            print(f"Erro ao pegar quantidade de membros: {e}")
            return

        # Sai de grupos pequenos
        if member_count < 20:
            text = "O grupo deve ter mais de 20 membros, saindo..."
            try:
                await bot.send_message(chat.id, text)
                await bot.leave_chat(chat.id)
            except Exception as e:
                print(f"Erro ao sair do grupo pequeno: {e}")
            return

        # Salva no banco
        chat_obj = TelegramGroup(
            id_grupo=chat.id,
            name=chat.title,
            idioma=Language.PT,
            configs={
                "chat_id": chat.id,
                "chat_type": chat.type,
                "chat_title": chat.title,
                "chat_username": chat.username,
                "chat_description": chat.description,
            },
        )

        try:
            async with AsyncSessionLocal() as session:
                session.add(chat_obj)
                await session.commit()
        except Exception as e:
            print(f"Erro ao salvar grupo no banco de dados: {e}")

      

        # Mensagem privada para quem adicionou o bot
        if adder:
            try:
                private_text = (
                    f"♡ Obrigado por me adicionar no grupo {group_display}!\n\n"
                    f"📌 ID do grupo: `{chat.id}`\n"
                    f"👥 Membros atuais: {member_count}\n\n"
                    f"Continue apoiando  ♡"
                )

                await bot.send_message(
                    adder.id,
                    private_text,
                    parse_mode="Markdown"
                )
            except Exception as e:
                # Isso pode falhar se o usuário nunca iniciou conversa com o bot
                print(f"Não foi possível enviar mensagem privada ao usuário: {e}")

    return router
