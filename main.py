import asyncio,logging
from domination import Domination
from domination_db import DominationDB
from settings import Settings
from pyrogram import idle
from types_ import TipoCategoria

logging.basicConfig(level=logging.FATAL,
                    format="%(asctime)s - %(levelname)s - %(message)s")
def main():
    var = Settings()

    # Inicializa bots
    _waifu = Domination(
        name="WA",
        api_id=var.API_ID,
        api_hash=var.API_HASH,
        bot_token=var.WAIFU_TK,
        genero=TipoCategoria.WAIFU,
        group_main=var.GROUP_MAIN,
    ).start()
    _waifu.send_message("dog244", "WAIFU bot iniciado 🚀")

    _husbando = Domination(
        name="HUS",
        api_id=var.API_ID,
        api_hash=var.API_HASH,
        bot_token=var.HUSBANDO_TK,
        genero=TipoCategoria.HUSBANDO,
        group_main=var.GROUP_MAIN,
    ).start()
    _husbando.send_message("dog244", "HUSBANDO bot iniciado 🚀")

    bot_db = DominationDB(
        name="HUS_db",
        api_id=var.API_ID,
        api_hash=var.API_HASH,
        bot_token=var.HUSBANDO_TK,
        genero=TipoCategoria.HUSBANDO,
        group_main=var.GROUP_MAIN,
    ).start()
   # bot_db.send_message("dog244", "HUSBANDO DB iniciado 📚")

    bot_db2 = DominationDB(
        name="waifudb",
        api_id=var.API_ID,
        api_hash=var.API_HASH,
        bot_token=var.WAIFU_TK,
        genero=TipoCategoria.WAIFU,
        group_main=var.GROUP_MAIN,
    ).start(

    )
    #_husbando.send_message(Settings().GROUP_ADDMS_ID,'debug drop')


    print("rodando bots")
    idle(

    )  # Mantém os bots ativos

if __name__ == "__main__":
    try:
        main()
    except:
        main()
