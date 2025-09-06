import asyncio
from domination import Domination
from settings import Settings
from pyrogram import idle
from types_ import TipoCategoria


def main():
    var = Settings()
    bot = Domination(
        name="teste_w",
        api_id=var.API_ID,
        api_hash=var.API_HASH,
        bot_token=var.WAIFU_TK,
        genero=TipoCategoria.WAIFU,group_main=var.GROUP_MAIN
   
        # start=True,
    )
    bot2 = Domination(
        name="teste_h",
        api_id=var.API_ID,
        api_hash=var.API_HASH,
        bot_token=var.HUSBANDO_TK,
        genero=TipoCategoria.HUSBANDO,group_main=var.GROUP_MAIN

        # start=True,
    )

    # Inicializar o bot de forma assíncrona
    # await bot.initialize()
    # print(bot)
    bot.start()
    bot2.start()

    bot.me = bot.get_me()  # Definir bot.me aqui
    bot2.me = bot2.get_me()  # Definir bot.me aqui
    bot.send_message(chat_id="dog244", text="Bot iniciado")
    bot2.send_message(chat_id="dog244", text="Bot iniciado")
    # bot.me= bot.get_me()ienine']
    print('rodando bot')

    
    idle()


if __name__ == "__main__":
    # asyncio.run(main())
    main()
