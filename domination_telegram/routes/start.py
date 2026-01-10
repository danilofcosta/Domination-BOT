from aiogram import Router
from aiogram.types import Message
from aiogram.filters import CommandStart
from sqlalchemy import select
from database.models.Character import CharacterWaifu, CharacterHusbando
from database.connection import engine
from sqlalchemy import func

from database.session import AsyncSessionLocal
from domination_telegram.enuns import GeneroEnum
from domination_telegram.uteis.send_media import send_media
router = Router(
    name="start"
)


@router.message(CommandStart())
async def start_cmd(message: Message):
    botname = message.bot._me.first_name.strip()
    genero = message.bot.genero

    character = select(CharacterWaifu if genero == GeneroEnum.Waifu.value else CharacterHusbando).order_by(
        func.random()).limit(1)

    async with AsyncSessionLocal() as session:
        async with session.begin():
            result = await session.execute(character)
            character = result.scalars().first()

    md = (
        f"🍃 *Saudações, eu sou {botname}*,\n prazer em conhecer você\\!\n\n"
        "*⦾ O que eu faço:*\n"
        "Eu faço aparecer waifus no seu chat para os usuários capturarem\\.\n\n"
        "*⦾ Como me usar:*\n"
        "Adicione\\-me ao seu grupo e toque no botão de ajuda para ver os detalhes\\.\n"
    )

    await send_media(character, caption=md, message=message)
