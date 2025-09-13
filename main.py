import asyncio,logging
from domination import Domination
from domination_db import DominationDB
from settings import Settings
from pyrogram import idle
from types_ import TipoCategoria

logging.basicConfig(level=logging.CRITICAL,
                    format="%(asctime)s - %(levelname)s - %(message)s")
def main():
    var = Settings()
    _waifu = Domination(
        name="WA",
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
        name="HUS_db",
        api_id=var.API_ID,
        api_hash=var.API_HASH,
        bot_token=var.HUSBANDO_TK,
        genero=TipoCategoria.HUSBANDO,
        group_main=var.GROUP_MAIN,
    ).start()
    bot_db2 = DominationDB(
        name="waifudb",
        api_id=var.API_ID,
        api_hash=var.API_HASH,
        bot_token=var.WAIFU_TK,
        genero=TipoCategoria.WAIFU,
        group_main=var.GROUP_MAIN,
    ).start()




    print("rodando bot")

    idle()


if __name__ == "__main__":
    main()
    
    
