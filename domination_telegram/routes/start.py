from aiogram import Router
from aiogram.types import Message
from aiogram.filters import CommandStart

from domination_telegram.uteis.get_router import getRouter
from domination_telegram.uteis.random_character import get_random_character
from domination_telegram.uteis.send_media import send_media



def get_router():
    router = Router(name=__name__)
    @router.message(CommandStart())
    async def start_cmd(message: Message):
        botname = message.bot._me.first_name.strip()
        genero = message.bot.genero

        character = await get_random_character(genero)

        md = (
            f"🍃 *Saudações, eu sou {botname}*,\n prazer em conhecer você\\!\n\n"
            "*⦾ O que eu faço:*\n"
            "Eu faço aparecer waifus no seu chat para os usuários capturarem\\.\n\n"
            "*⦾ Como me usar:*\n"
            "Adicione\\-me ao seu grupo e toque no botão de ajuda para ver os detalhes\\.\n"
        )

        await send_media(character= character, caption=md, message=message)
    return  router