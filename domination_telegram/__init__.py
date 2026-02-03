from aiogram import Bot, Dispatcher
from aiogram.enums import ParseMode
from aiogram.client.default import DefaultBotProperties
from pathlib import Path
import os
from dotenv import load_dotenv

from domination_telegram.enuns import GeneroEnum
from domination_telegram.routes import start, MessageCounter, harem, CommandsUser, inline_query, bot_added_to_group, help, commandsAminSuper 
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
        self.include_routers(genero=self.genero)

    async def start(self):
        self.me = await self.bot.get_me()
        print(f"🤖 Bot iniciado: @{self.me.username}")
        await self.dp.start_polling(self.bot, skip_updates=True)

    def include_routers(self, genero: GeneroEnum):
        self.dp.include_router(bot_added_to_group.get_router())
        self.dp.include_router(start.get_router())
        self.dp.include_router(help.get_router())
        self.dp.include_router(MessageCounter.get_router())
        self.dp.include_router(harem.get_router(genero=genero.value))
        self.dp.include_router(inline_query.get_router())
        CommandsUser.include_router_all(self.dp, genero=genero.value)
        commandsAminSuper.include_router_all(self.dp, genero=genero.value)
