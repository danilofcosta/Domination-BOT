from aiogram import Router
from aiogram.filters import Command
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from aiogram.types import Message

from domination_telegram.enuns import GeneroEnum
from database.models.user import User
from database.session import AsyncSessionLocal
from domination_telegram.uteis.send_media import send_media




def get_router():
    router = Router(name=__name__)

    @router.message(Command("harem"))
    async def start_cmd(message: Message):
        genero = message.bot.genero
        user_id = message.from_user.id

        collection_attr = (
            "husbando_collection"
            if genero == GeneroEnum.Husbando.value
            else "waifu_collection"
        )

        favorite_attr = (
            "favorite_husbando"
            if genero == GeneroEnum.Husbando.value
            else "favorite_waifu"
        )

        async with AsyncSessionLocal() as session:
            result = await session.execute(
                select(User)
                .options(selectinload(getattr(User, collection_attr)))
                .where(User.telegram_id == user_id)
            )
            user = result.scalars().first()

        if not user:
            await message.answer("vc ainda nao esta registrado. Use /start para conhecer o bot.")
            return

        favorite = getattr(user, favorite_attr)
        collection: list = getattr(user, collection_attr)

        if not collection:
            await message.answer("vc nao tem nenhum personagem na colecao. Use /add para adicionar um personagem.")
            return

        if not favorite:
            await message.answer("vc nao tem um favorito ainda. Use /add_favorite ou /fav para adicionar um favorito.")
            return

        await send_media(character=favorite, message=message, caption=f"Your favorite character is {favorite.character_name}! vc tem {len(collection)} personagens na sua coleção .")

    return router   