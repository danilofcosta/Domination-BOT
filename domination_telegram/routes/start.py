from aiogram import Router
from aiogram.types import Message
from aiogram.filters import CommandStart

from domination_telegram.uteis.get_router import getRouter
from domination_telegram.uteis.random_character import get_random_character
from domination_telegram.uteis.send_media import send_media
from aiogram.types import (
    Message,
    CallbackQuery,
    InlineKeyboardMarkup,
    InlineKeyboardButton
)


def get_keyboard(username

                 ):
    return InlineKeyboardMarkup(
        inline_keyboard=[

            [

                InlineKeyboardButton(
                    text="Aᴅᴅ+",
                    url=f"https://t.me/{username}?startgroup=true",
                )
            ],
            [
                InlineKeyboardButton(
                    text="Hᴇʟᴘ",
                    callback_data="help_bot"
                ), InlineKeyboardButton(
                    text="ᴅᴀᴛᴀʙᴀsᴇ",
                    url="https://t.me/Domination_Database"
                )
            ]
        ]
    )


def get_router():
    router = Router(name=__name__)

    @router.message(CommandStart())
    async def start_cmd(message: Message):
        botname = message.bot._me.first_name.strip()
        genero = message.bot.genero

        character = await get_random_character(genero)

        md = (
            f"🍃 *Saudações, Eu sou {botname}*,\n prazer em conhecer você\\!\n\n"
            "*⦾ O que eu faço:*\n"
            "Eu faço aparecer waifus no seu chat para os usuários capturarem\\.\n\n"
            "*⦾ Como me usar:*\n"
            "Adicione\\-me ao seu grupo e toque no botão de ajuda para ver os detalhes\\.\n"
        )

        await send_media(character=character, caption=md, message=message, reply_markup=get_keyboard(message.bot._me.username))
    return router
