from domination_telegram import Domination
from domination_telegram.enuns import GeneroEnum
from domination_telegram.uteis import send_media

from dotenv import load_dotenv
import os
import asyncio

load_dotenv()


async def main():
    bot1 = Domination(
        bot_token=os.getenv("BOT_TOKEN_WAIFUteste"),
        genero=GeneroEnum.Waifu,
    )


    chat_id = os.getenv('GROUP_TEST')

  
    await  send_media.send_media(
            caption="Bot test",
            bot=bot1.bot,
            chat_id=chat_id
        )


    await asyncio.gather(
        bot1.start(),   # ou bot1.run(), depende da sua implementação
     
    )


if __name__ == "__main__":
    asyncio.run(main())
