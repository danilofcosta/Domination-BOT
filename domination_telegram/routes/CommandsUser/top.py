from sqlalchemy import select
from aiogram import Router
from aiogram.filters import Command
from aiogram.types import Message, CallbackQuery, InlineKeyboardButton
from aiogram.filters.callback_data import CallbackData
from aiogram.utils.keyboard import InlineKeyboardBuilder

from database.models.Character.Character import CharacterHusbando, CharacterWaifu
from database.session import AsyncSessionLocal
from domination_telegram.enuns import Commands_Bot, GeneroEnum

# =========================
# MODELOS POR GÊNERO
# =========================
def get_models(genero: str):
    return CharacterHusbando if genero == GeneroEnum.Husbando.value else CharacterWaifu



# =========================
# ROUTER
# =========================
def get_router(genero: str):
    router = Router(name=__name__)

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
    async def list_anime(message: Message):
        return
      
    return router
