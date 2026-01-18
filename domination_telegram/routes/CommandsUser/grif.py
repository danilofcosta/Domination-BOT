from sqlalchemy import select, and_

from aiogram import Router
from aiogram.filters import Command
from aiogram.types import Message, CallbackQuery
from aiogram.filters.callback_data import CallbackData

from database.models.Character.Character import CharacterHusbando, CharacterWaifu
from database.models.Colecao import HusbandoCollection, WaifuCollection
from database.session import AsyncSessionLocal

from domination_telegram.enuns import Commands_Bot, GeneroEnum
from domination_telegram.uteis import metion_user, send_media
from domination_telegram.uteis.create_bt import true_or_false
from domination_telegram.uteis.create_caption_character import create_caption_show_character


class GiftCallback(CallbackData, prefix="gift"):
    character_id: int
    from_user_id: int
    to_user_id: int
    to_user_name: str
    genero: str
    confirm: bool


def get_models(genero: str):
    is_husbando = genero == GeneroEnum.Husbando.value
    return (
        CharacterHusbando if is_husbando else CharacterWaifu,
        HusbandoCollection if is_husbando else WaifuCollection,
    )


def get_router(genero: str):
    router = Router(name=__name__)

    # =========================
    # /gift
    # =========================
    @router.message(
        Command(
            commands=Commands_Bot.create_dynamic_command(
                Commands_Bot.gift, prefix_str=genero
            ),
            prefix=Commands_Bot.prefixs,
        )
    )
    async def gift(message: Message):
        genero = message.bot.genero

        if not message.reply_to_message:
            return await message.answer(
                "Use o comando respondendo à mensagem de quem você quer presentear."
            )

        parts = message.text.split(maxsplit=1)
        if len(parts) < 2 or not parts[1].isdigit():
            return await message.answer("Informe o ID do personagem: /gift 12")

        gift_id = int(parts[1])

        Model, Collection = get_models(genero)

        stmt = (
            select(Model)
            .join(Collection)
            .where(
                and_(
                    Collection.telegram_id == message.from_user.id,
                    Model.id == gift_id,
                )
            )
        )

        async with AsyncSessionLocal() as session:
            result = await session.execute(stmt)
            character = result.scalars().first()

        if not character:
            return await message.answer("Esse personagem não está no seu harem.")

        caption = (
            f"{message.from_user.first_name} quer presentear "
            f"{message.reply_to_message.from_user.first_name} com:\n\n"
            f"{create_caption_show_character(character, genero)}"
        )

        await send_media.send_media(
            message=message,
            character=character,
            caption=caption,
            reply_markup=true_or_false(
                callback_data_true=GiftCallback(
                    character_id=gift_id,
                    from_user_id=message.from_user.id,
                    to_user_id=message.reply_to_message.from_user.id,
                    to_user_name=message.reply_to_message.from_user.first_name,
                    genero=genero,
                    confirm=True,
                ).pack(),
                callback_data_false=GiftCallback(
                    character_id=gift_id,
                    from_user_id=message.from_user.id,
                    to_user_id=message.reply_to_message.from_user.id,
                    to_user_name=message.reply_to_message.from_user.first_name,
                    genero=genero,
                    confirm=False,
                ).pack(),
            ),
        )

    # =========================
    # CALLBACK
    # =========================
    @router.callback_query(GiftCallback.filter())
    async def gift_callback_handler(
        callback: CallbackQuery,
        callback_data: GiftCallback,
    ):
        if callback.from_user.id != callback_data.from_user_id:
            return await callback.answer(
                "Você não pode usar este botão.", show_alert=True
            )

        if not callback_data.confirm:
            await callback.message.delete()
            return await callback.answer("Presente cancelado.")

        Model, Collection = get_models(callback_data.genero)

        async with AsyncSessionLocal() as session:
            # Remove do remetente
            stmt = select(Collection).where(
                and_(
                    Collection.telegram_id == callback_data.from_user_id,
                    Collection.character_id == callback_data.character_id,
                )
            )
            result = await session.execute(stmt)
            item = result.scalars().first()

            if not item:
                return await callback.answer(
                    "Esse personagem não está mais no seu harem.", show_alert=True
                )

            await session.delete(item)

            # Adiciona ao destinatário
            new_item = Collection(
                telegram_id=callback_data.to_user_id,
                character_id=callback_data.character_id,
            )
            session.add(new_item)

            await session.commit()

            # Busca personagem
            stmt = select(Model).where(Model.id == callback_data.character_id)
            result = await session.execute(stmt)
            character = result.scalars().first()

        await callback.message.edit_caption(
            caption=(
                f"🎁 Presente enviado com sucesso!\n\n"
                f"{character.character_name} agora pertence a "
                f"{metion_user.metion_user(callback_data.to_user_name, callback_data.to_user_id,)}."
            )
        )
        await callback.answer("Presente entregue com sucesso!")

    print("Rota /gift registrada")
    return router
