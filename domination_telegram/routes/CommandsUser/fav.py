from sqlalchemy import select, and_

from aiogram import Router, F
from aiogram.filters import Command
from aiogram.types import Message, CallbackQuery
from aiogram.filters.callback_data import CallbackData

from database.models.Character.Character import CharacterHusbando, CharacterWaifu
from database.models.Colecao import HusbandoCollection, WaifuCollection
from database.models.user import User
from database.session import AsyncSessionLocal

from domination_telegram.enuns import Commands_Bot, GeneroEnum
from domination_telegram.uteis import send_media
from domination_telegram.uteis.create_bt import true_or_false
import re


class FavCallback(CallbackData, prefix="fav"):
    character_id: int
    user_id: int
    genero: str
    confirm: bool


def get_router(genero: str):
    router = Router(name=__name__)

    # =========================
    # Handler do comando /fav
    # =========================
    @router.message(
        Command(
            commands=Commands_Bot.create_dynamic_command(
                Commands_Bot.fav, prefix_str=genero
            ),
            prefix=Commands_Bot.prefixs,
        )
    )
    async def fav(message: Message):
        genero = message.bot.genero

        if (
            message.chat.type != "private"
            and message.text.split()[0].lstrip(Commands_Bot.prefixs) == Commands_Bot.fav
        ):
            return

        if message.reply_to_message:
            m = re.search(r"(\d+)\s*:", message.reply_to_message.caption)
            if m:
                fav_id = m.group(1)
            else:
                return await message.answer("Não encontrei o ID na mensagem.")
        else:
            # Pega o ID do personagem♦
            parts = message.text.split(" ", 1)
            fav_id = parts[1] if len(parts) > 1 else None

        if not fav_id or not fav_id.isdigit():
            return await message.answer(
                "Me dê o ID também: `/fav 00`\nConfira seu Harem com /harem"
            )

        fav_id = int(fav_id)

        # Escolhe o modelo correto
        is_husbando = genero == GeneroEnum.Husbando.value
        Model = CharacterHusbando if is_husbando else CharacterWaifu
        Collection = HusbandoCollection if is_husbando else WaifuCollection

        # Busca no banco
        stmt = (
            select(Model)
            .join(Collection)
            .where(
                and_(
                    Collection.telegram_id == message.from_user.id,
                    Model.id == fav_id,
                )
            )
        )
        try:

            async with AsyncSessionLocal() as session:
                result = await session.execute(stmt)
                character = result.scalars().first()
        except Exception as e:
            print(f"Erro ao buscar personagem: {e}")
            return await message.answer("Ocorreu um erro ao acessar o banco de dados.")

        if not character:
            return await message.answer("Não encontrei esse ID no seu harem.")

        # Envia mídia com botões estruturados
        await send_media.send_media(
            message=message,
            character=character,
            caption=f"{message.from_user.first_name}, tornar {character.character_name} seu favorito?",
            reply_markup=true_or_false(
                callback_data_true=FavCallback(
                    character_id=fav_id,
                    user_id=message.from_user.id,
                    genero=genero,
                    confirm=True,
                ).pack(),
                callback_data_false=FavCallback(
                    character_id=fav_id,
                    user_id=message.from_user.id,
                    genero=genero,
                    confirm=False,
                ).pack(),
            ),
        )

    # =========================
    # Handler do Callback
    # =========================
    @router.callback_query(FavCallback.filter())
    async def fav_callback_handler(
        callback: CallbackQuery,
        callback_data: FavCallback,
    ):
        # Segurança: só o dono do botão pode usar
        if callback.from_user.id != callback_data.user_id:
            return await callback.answer(
                "Esse botão não é para você.", show_alert=True
            )

        # Cancelado
        if not callback_data.confirm:
            await callback.message.delete()
            return await callback.answer("Cancelado")

        is_husbando = callback_data.genero == GeneroEnum.Husbando.value

        async with AsyncSessionLocal() as session:
            # Busca o usuário
            stmt = select(User).where(
                User.telegram_id == callback_data.user_id)
            result = await session.execute(stmt)
            user = result.scalars().first()

            if not user:
                return await callback.answer(
                    "Usuário não encontrado no banco.", show_alert=True
                )

            # Define o favorito correto
            if is_husbando:
                user.favorite_husbando_id = callback_data.character_id
            else:
                user.favorite_waifu_id = callback_data.character_id

            await session.commit()

            # Busca o personagem só para mostrar o nome depois
            Model = CharacterHusbando if is_husbando else CharacterWaifu
            stmt = select(Model).where(Model.id == callback_data.character_id)
            result = await session.execute(stmt)
            character = result.scalars().first()

        if not character:
            return await callback.answer(
                "Personagem não encontrado.", show_alert=True
            )

        await callback.message.edit_caption(
            inline_message_id=callback.inline_message_id, caption=f"{character.character_name} agora é seu favorito! \n confira /{genero[0]}{Commands_Bot.Harem.value}"
        )
        await callback.answer("Favorito definido com sucesso!")

    return router
