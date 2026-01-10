from domination_telegram import Domination
from domination_telegram.enuns import GeneroEnum
from domination_telegram.routes import start


from dotenv import load_dotenv
import os
import logging
import asyncio
import os

from domination_telegram.routes.harem import harem


async def main():
    bot = Domination(
        bot_token=os.getenv("BOT_TOKEN_WAIFU"),
        genero=GeneroEnum.Waifu,
    )

    bot.dp.include_router(start.router)
    bot.dp.include_router(harem.router)
    
    

    await bot.start()


if __name__ == "__main__":
    asyncio.run(main())
