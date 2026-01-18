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

    chat_id = -1001528803759

   # Envia mensagem com os dois bots quase ao mesmo tempo
    await asyncio.gather(
        send_media.send_media(
            caption="Bot Waifu iniciado",
            bot=bot1.bot,
            chat_id=chat_id
        ),
        send_media.send_media(
            caption="Bot Husbando iniciado",
            bot=bot2.bot,
            chat_id=chat_id
        )
    )

    # Se seus bots precisarem rodar continuamente (polling, webhook, etc),
    # você provavelmente precisa de algo assim:
    await asyncio.gather(
        bot1.start( ),   # ou bot1.run(), depende da sua implementação
        bot2.start()
    )


if __name__ == "__main__":
    asyncio.run(main())
