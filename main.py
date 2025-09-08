import asyncio
from domination import Domination
from domination_db import DominationDB
from settings import Settings
from pyrogram import idle
from types_ import TipoCategoria


def main():
    var = Settings()
    _waifu = Domination(
        name="WAIFU",
        api_id=var.API_ID,
        api_hash=var.API_HASH,
        bot_token=var.WAIFU_TK,
        genero=TipoCategoria.WAIFU,
        group_main=var.GROUP_MAIN,
    ).start()
    _husbando = Domination(
        name="HUS",
        api_id=var.API_ID,
        api_hash=var.API_HASH,
        bot_token=var.HUSBANDO_TK,
        genero=TipoCategoria.HUSBANDO,
        group_main=var.GROUP_MAIN,
    ).start()
    bot_db = DominationDB(
        name="HUS",
        api_id=var.API_ID,
        api_hash=var.API_HASH,
        bot_token=var.HUSBANDO_TK,
        genero=TipoCategoria.HUSBANDO,
        group_main=var.GROUP_MAIN,
    ).start()
    bot_db2 = DominationDB(
        name="waifu db",
        api_id=var.API_ID,
        api_hash=var.API_HASH,
        bot_token=var.WAIFU_TK,
        genero=TipoCategoria.WAIFU,
        group_main=var.GROUP_MAIN,
    ).start()


    _waifu.send_message(chat_id="dog244", text="Bot iniciado")
    _husbando.send_message(chat_id="dog244", text="Bot iniciado")
    # bot.me= bot.get_me()ienine']
    print("rodando bot")

    idle()


if __name__ == "__main__":
    # asyncio.run(main())
    main()
