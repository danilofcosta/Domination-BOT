#!/usr/bin/env python3
import asyncio
from pyrogram import Client
from settings import Settings
from pyrogram.types import Message

var = Settings()

API_ID = var.API_ID
API_HASH = var.API_HASH
BOT_TOKEN = var.BOT_TOKEN_TESTE  # pegue do settings.py

app = Client(
    "ryo",
    api_id=API_ID,
    api_hash=API_HASH,
    workdir="sessions",
)

chat_id = "gods_gods"  # username ou ID do grupo


async def main():
    await app.start()
    msgs = []
    async for msg in app.get_chat_history(chat_id):
        msg: Message = msg
        msgs.append(msg.id)

    print(f"Total de mensagens encontradas: {len(msgs)}")

    if msgs:
        total = len(msgs)
        for i in range(0, total, 100):
            batch = msgs[i : i + 100]
            await app.delete_messages(chat_id=chat_id, message_ids=batch)

            # Barra de progresso simples
            progresso = int((i + len(batch)) / total * 50)  # tamanho da barra
            barra = "█" * progresso + "-" * (50 - progresso)
            print(f"\r[{barra}] {((i+len(batch))/total*100):.1f}%", end="")



if __name__ == "__main__":

    asyncio.run(main())
