from aiogram import Dispatcher

from . import addCharacter

def include_router_all(bot:Dispatcher,genero:str):
     bot.include_router(addCharacter.get_router(genero=genero))
#      bot.include_router(dominar.get_router())
#      bot.include_router(fav.get_router(genero=genero))
#      bot.include_router(grif.get_router(genero=genero))
#      bot.include_router(listar_anime.get_router(genero=genero))
#      # bot.include_router(top.get_router(genero=genero))
     ...