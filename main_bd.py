import asyncio
from domination import Domination
from settings import Settings
from pyrogram import idle
from types_ import TipoCategoria
from domination_db import DominationDB

def main():
    var = Settings()
    # bot = Domination(
    #     name="WAIFU",
    #     api_id=var.API_ID,
    #     api_hash=var.API_HASH,
    #     bot_token=var.WAIFU_TK,
    #     genero=TipoCategoria.WAIFU,
    #     group_main=var.GROUP_MAIN,
    # )
    bot = DominationDB(
        name="HUS",
        api_id=var.API_ID,
        api_hash=var.API_HASH,
        bot_token=var.HUSBANDO_TK,
        genero=TipoCategoria.HUSBANDO,
        group_main=var.GROUP_MAIN,
    )

    bot.start()

    bot.send_message(chat_id="dog244", text="Bot  banco iniciado")

    print("rodando bot")

    idle()


if __name__ == "__main__":
    # asyncio.run(main())
    main()
