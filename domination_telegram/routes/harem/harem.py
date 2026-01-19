from aiogram import Router
from aiogram.filters import Command
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from aiogram.types import Message

from domination_telegram.enuns import Commands_Bot, GeneroEnum
from database.models.user import User
from database.session import AsyncSessionLocal
from domination_telegram.routes.harem.create_page import classificar_personagens, create_harem_pages_ref
from domination_telegram.uteis.send_media import send_media

from collections import defaultdict
from typing import List, Union
from cachetools import TTLCache

from aiogram import Router, F
from aiogram.filters import Command
from aiogram.types import (
    Message,
    CallbackQuery,
    InlineKeyboardMarkup,
    InlineKeyboardButton
)

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from domination_telegram.enuns import Commands_Bot, GeneroEnum
from database.models.user import User
from database.session import AsyncSessionLocal
from database.models.Colecao import WaifuCollection, HusbandoCollection
from domination_telegram.uteis.send_media import send_media


# ==========================================================
# CACHE GLOBAL DE PAGINAÇÃO
# ==========================================================
message_counter: dict[str, TTLCache[int, dict]] = {
    "waifu": TTLCache(maxsize=1000, ttl=3600),
    "husbando": TTLCache(maxsize=1000, ttl=3600),
}


# ==========================================================
# TECLADO DE PAGINAÇÃO
# ==========================================================
def get_pagination_keyboard(genero: str, user_id: int, label: str = "Harem"):
    return InlineKeyboardMarkup(
        inline_keyboard=[

            [

                InlineKeyboardButton(
                    text="⬅️",
                    callback_data=f"harem_prev:{genero}:{user_id}"
                ), InlineKeyboardButton(
                    text=label,

                ),
                InlineKeyboardButton(
                    text="➡️",
                    callback_data=f"harem_next:{genero}:{user_id}"
                )
            ],
            [
                InlineKeyboardButton(
                    text="🌐",
                    switch_inline_query_current_chat=f"User_harem_{user_id}"
                )
            ]
        ]
    )


# ==========================================================
# ROUTER COM PAGINAÇÃO
# ==========================================================
def get_router(genero: str):
    router = Router(name=__name__)

    # ---------------------------
    # COMANDO /harem
    # ---------------------------
    @router.message(Command(commands=Commands_Bot.create_dynamic_command(
        Commands_Bot.Harem, prefix_str=genero)))
    async def start_cmd(message: Message):
        genero_local = message.bot.genero
        user_id = message.from_user.id

        collection_attr = (
            "husbando_collection"
            if genero_local == GeneroEnum.Husbando.value
            else "waifu_collection"
        )

        favorite_attr = (
            "favorite_husbando"
            if genero_local == GeneroEnum.Husbando.value
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
            await message.answer("vc ainda nao esta registrado.")
            return

        collection: list = getattr(user, collection_attr)
        favorite = getattr(user, favorite_attr)

        if not collection:
            await message.answer("vc nao tem personagens na coleção.")
            return

        if not favorite:
            await message.answer("vc nao tem favorito definido.")
            return

        dados = classificar_personagens(collection)
        pages = create_harem_pages_ref(dados)

        message_counter[genero_local.value][user_id] = {
            "pages": pages,
            "index": 0
        }

        await send_media(
            character=favorite,
            message=message,
            caption=pages[0],
            reply_markup=get_pagination_keyboard(
                genero_local.value, user_id,   f'{1}/{len(pages)}')
        )

    # ---------------------------
    # CALLBACK NEXT
    # ---------------------------
    @router.callback_query(F.data.startswith("harem_next"))
    async def next_page(callback: CallbackQuery):
        _, genero_local, user_id = callback.data.split(":")
        user_id = int(user_id)

        data = message_counter[genero_local].get(user_id)
        if not data:
            await callback.answer("Sessão expirada.")
            return

        pages = data["pages"]
        old_index = data["index"]
        data["index"] = (old_index + 1) % len(pages)

        new_caption = pages[data["index"]]
        new_markup = get_pagination_keyboard(
            genero_local,
            user_id,
            f'{data["index"] + 1}/{len(pages)}'
        )

        # evita o erro "message is not modified"
        if (callback.message.caption != new_caption or
                callback.message.reply_markup != new_markup):
            await callback.message.edit_caption(
                caption=new_caption,
                reply_markup=new_markup
            )

        await callback.answer()

    # ---------------------------
    # CALLBACK PREV
    # ---------------------------

    @router.callback_query(F.data.startswith("harem_prev"))
    async def prev_page(callback: CallbackQuery):
        _, genero_local, user_id = callback.data.split(":")
        user_id = int(user_id)

        data = message_counter[genero_local].get(user_id)
        if not data:
            await callback.answer("Sessão expirada.")
            return

        pages = data["pages"]
        old_index = data["index"]
        data["index"] = (old_index - 1) % len(pages)

        new_caption = pages[data["index"]]
        new_markup = get_pagination_keyboard(
            genero_local,
            user_id,
            f'{data["index"] + 1}/{len(pages)}'
        )

        if (callback.message.caption != new_caption or
                callback.message.reply_markup != new_markup):
            await callback.message.edit_caption(
                caption=new_caption,
                reply_markup=new_markup
            )

        await callback.answer()
    return router

