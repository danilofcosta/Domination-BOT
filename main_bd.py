import asyncio
from settings import Settings
from pyrogram import idle
from types_ import TipoCategoria
from domination_db import DominationDB


def main():
    var = Settings()
    botw = DominationDB(
        name=f"{TipoCategoria.WAIFU.value}_test_db",
        api_id=var.API_ID,
        api_hash=var.API_HASH,
        bot_token=var.WAIFU_TK,
        genero=TipoCategoria.WAIFU,
        group_main=var.GROUP_MAIN,
    ).start()
    both = DominationDB(
        name=f"{TipoCategoria.HUSBANDO.value}_test_db",
        api_id=var.API_ID,
        api_hash=var.API_HASH,
        bot_token=var.HUSBANDO_TK,
        genero=TipoCategoria.HUSBANDO,
        group_main=var.GROUP_MAIN,
    ).start()



   # bot.send_message(chat_id="dog244", text="Bot  banco iniciado")

    #print(f"rodando bot {bot.me.first_name}")

    idle()


if __name__ == "__main__":
    # asyncio.run(main())
    main()
