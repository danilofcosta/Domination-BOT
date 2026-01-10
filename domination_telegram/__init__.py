from aiogram import Bot, Dispatcher
from aiogram.enums import ParseMode
from aiogram.client.default import DefaultBotProperties
from pathlib import Path
import os
from dotenv import load_dotenv

from domination_telegram.enuns import GeneroEnum

load_dotenv()
class Domination:
    def __init__(
        self,
        bot_token: str,
        genero: GeneroEnum = GeneroEnum.Husbando,
        parse_mode: ParseMode = ParseMode.MARKDOWN,
    ):
        self.genero = genero
        self.me = None

        self.bot = Bot(
            token=bot_token,
            default=DefaultBotProperties(parse_mode=parse_mode),
        )

        self.bot.genero = genero

        self.dp = Dispatcher()

    async def start(self):
        self.me = await self.bot.get_me()
        print(f"🤖 Bot iniciado: @{self.me.username}")

        await self.dp.start_polling(self.bot)
