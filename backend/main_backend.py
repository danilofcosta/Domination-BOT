import os
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
load_dotenv()

from domination_telegram import Domination
from domination_telegram.enuns import GeneroEnum
from domination_telegram.uteis import send_media


# Inicializa bots fora do lifespan (evita recriar em reloads)
bot1 = Domination(
    bot_token=os.getenv("BOT_TOKEN_WAIFU"),
    genero=GeneroEnum.Waifu,
)

bot2 = Domination(
    bot_token=os.getenv("BOT_TOKEN_HUSBANDO"),
    genero=GeneroEnum.Husbando,
)

chat_id = os.getenv("GROUP_TEST")


@asynccontextmanager
async def lifespan(app: FastAPI):
    print(" → Iniciando aplicação FastAPI + BOTS…")

    # Envia mensagens iniciais
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

    # Inicia bots em background
    task1 = asyncio.create_task(bot1.start())
    task2 = asyncio.create_task(bot2.start())

    print(" → Bots iniciados!")

    # Entrega o controle ao FastAPI
    yield

    print(" → Encerrando bots…")

    # Cancela corretamente no shutdown
    task1.cancel()
    task2.cancel()

    print(" → Bots finalizados. Encerrando API…")


app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get("/")
async def root():

    return {"status": "Bots rodando com Lifespan!"}

@app.get("/status")
async def status():
    return {"status": "Bots rodando com Lifespan!"}