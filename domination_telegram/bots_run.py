from domination_telegram import Domination
from domination_telegram.enuns import GeneroEnum
from domination_telegram.uteis import send_media

from dotenv import load_dotenv
import os
import asyncio

load_dotenv()


async def main():
    bot1 = Domination(
        bot_token=os.getenv("BOT_TOKEN_WAIFU"),
        genero=GeneroEnum.Waifu,
    )

    bot2 = Domination(
        bot_token=os.getenv("BOT_TOKEN_HUSBANDO"),
        genero=GeneroEnum.Husbando,
    )

    chat_id = os.getenv('GROUP_TEST')

    await asyncio.gather(
        send_media.send_media(
            caption="Bot Waifu iniciado ",
            bot=bot1.bot,
            chat_id=chat_id
        ),
        send_media.send_media(
            caption="Bot Husbando iniciado",
            bot=bot2.bot,
            chat_id=chat_id
        )
    )


    await asyncio.gather(
        bot1.start(),  
        bot2.start()
    )


if __name__ == "__main__":
    asyncio.run(main())
