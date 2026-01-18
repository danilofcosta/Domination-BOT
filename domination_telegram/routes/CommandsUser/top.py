from sqlalchemy import func, select, desc
from aiogram import F, Router
from aiogram.filters import Command
from aiogram.types import Message, CallbackQuery
from aiogram.utils.keyboard import InlineKeyboardBuilder

from database.models.user import User
from database.models.Character.Character import CharacterHusbando, CharacterWaifu
from database.models.Colecao import HusbandoCollection, WaifuCollection
from database.session import AsyncSessionLocal

from domination_telegram.enuns import Commands_Bot, GeneroEnum
from domination_telegram.uteis import metion_user
from domination_telegram.uteis.random_character import get_random_character
from domination_telegram.uteis.send_media import send_media


# =========================
# HELPERS
# =========================

def get_collection_model(genero: str):
    return HusbandoCollection if genero == GeneroEnum.Husbando.value else WaifuCollection


def get_character_model(genero: str):
    return CharacterHusbando if genero == GeneroEnum.Husbando.value else CharacterWaifu


def get_character_id_column(collection_model):
    if hasattr(collection_model, "character_id"):
        return collection_model.character_id
    if hasattr(collection_model, "waifu_id"):
        return collection_model.waifu_id
    if hasattr(collection_model, "husbando_id"):
        return collection_model.husbando_id
    raise AttributeError("Não foi possível identificar a coluna do personagem.")


def format_my_position_text(posicao, telegram_data, total):
    nome = metion_user.metion_user(
        telegram_data.get("NAME", "user"),
        telegram_data.get("ID", 0),
    )

    return (
        "📊 *Sua posição no ranking*\n\n"
        f"{nome}\n"
        f"Posição: *{posicao}*\n"
        f"Total de personagens únicos: *{total}*"
    )


def build_top_stmt(collection_model, character_id_col):
    return (
    
         
            select(
                User.telegram_id.label("user_id"),
                User.telegram_user_data.label("telegram_user_data"),
                func.count(func.distinct(character_id_col)).label("total"),
            )
            .join(collection_model, collection_model.telegram_id == User.telegram_id)
            .group_by(User.id)
            .order_by(desc("total"))
            
        )
    


# =========================
# ROUTER
# =========================

def get_router(genero: str):
    router = Router(name=f"top_{genero}")

    # =========================
    # /top
    # =========================
    @router.message(
        Command(
            commands=Commands_Bot.create_dynamic_command(
                Commands_Bot.top, prefix_str=genero
            ),
            prefix=Commands_Bot.prefixs,
        )
    )
    async def top(message: Message):
        collection_model = get_collection_model(genero)
        character_id_col = get_character_id_column(collection_model)

        stmt = (
            select(
                User.id.label("user_id"),
                User.telegram_user_data.label("telegram_user_data"),
                func.count(func.distinct(character_id_col)).label("total"),
            )
            .join(collection_model, collection_model.telegram_id == User.telegram_id)
            .group_by(User.id)
            .order_by(desc("total"))
            .limit(10)
        )

        async with AsyncSessionLocal() as session:
            result = await session.execute(stmt)
            top_users = result.all()

        if not top_users:
            await message.answer("Ainda não há dados para o TOP.")
            return

        titulo = "🏆 *TOP GLOBAL*\n"
        subtitulo = "Husbando\n\n" if genero == GeneroEnum.Husbando.value else "Waifu\n\n"
        texto = titulo + subtitulo

        for index, (_, telegram_data, total) in enumerate(top_users, start=1):
            nome = metion_user.metion_user(
                telegram_data.get("NAME", "user"),
                telegram_data.get("ID", 0)
            )
            texto += f"{index} - {nome} - {total}\n"

        character = await get_random_character(genero)

        kb = InlineKeyboardBuilder()
        kb.button(
            text="𝗠𝗶𝗻𝗵𝗮 𝗣𝗼𝘀𝗶𝗰̧𝗮̃𝗼",
            callback_data=f"myposition:{genero}",
        )
        kb.adjust(1)

        markup = kb.as_markup() 

        await send_media(
            character=character,
            caption=texto,
            message=message,
            reply_markup=markup
        )

    # =========================
    # CALLBACK: Minha posição
    # =========================
    @router.callback_query(F.data.startswith("myposition:"))
    async def my_position_callback(callback: CallbackQuery):
        _, genero_cb = callback.data.split(":")

        collection_model = get_collection_model(genero_cb)
        character_id_col = get_character_id_column(collection_model)

        stmt = build_top_stmt(collection_model, character_id_col)

        async with AsyncSessionLocal() as session:
            result = await session.execute(stmt)
            ranking = result.all()

        posicao = None
        user_total = 0
        telegram_data = None

        for index, (telegram_id, tdata, total) in enumerate(ranking, start=1):
            
            if telegram_id == callback.from_user.id:
                posicao = index
                user_total = total
                telegram_data = tdata
                break

        if posicao is None:
            await callback.answer(
                "Você ainda não aparece no ranking.", show_alert=True
            )
            return

        texto = format_my_position_text(posicao, telegram_data, user_total)

        await callback.answer(texto, show_alert=True)
        await callback.answer()

    return router
