import asyncio
from typing import List
from pyrogram import Client, filters
from pyrogram.types import (
    Message,
    InlineKeyboardMarkup,
    InlineKeyboardButton,
    CallbackQuery,
)
from pyrogram.enums import ChatType
from types_ import TipoCategoria
from sqlalchemy import select, func, desc
from DB.models import ColecaoUsuarioHusbando, ColecaoUsuarioWaifu
from uteis import dynamic_command_filter, get_first_photo_file_id, send_media_by_type
from types_ import COMMAND_LIST
from domination.plugins.lang_utils import obter_mensagem_chat

import asyncio
from pyrogram.types import InlineKeyboardMarkup, InlineKeyboardButton

# Helper para obter mensagens com categoria 'myinfos'
async def msg(client, chat_id, key, **kwargs):
    return await obter_mensagem_chat(client, chat_id, "myinfos", key, **kwargs)

@Client.on_message(
    filters.create(
        name=f"comand{' '.join(COMMAND_LIST.MYINFO.value)}",
        func=dynamic_command_filter,
        command=COMMAND_LIST.MYINFO.value,
    )
)
@Client.on_message(filters.command(COMMAND_LIST.MYINFO.value) & filters.private)
async def myinfos(client: Client, message:Message):
    user_id = message.from_user.id
    chat_id = message.chat.id

    # Seleciona a tabela correta
    base = ColecaoUsuarioWaifu if client.genero == TipoCategoria.WAIFU else ColecaoUsuarioHusbando

    # Pega membros do grupo se for grupo
    membros = (
        [m.user.id async for m in client.get_chat_members(chat_id)]
        if message.chat.type in ["group", "supergroup"]
        else [user_id]
    )

    async with await client.get_reusable_session() as session:
        # Ranking global
        ranking_global = (await session.execute(
            select(base.telegram_id, func.count(base.id_local).label("quantidade"))
            .group_by(base.telegram_id)
            .order_by(desc("quantidade"))
        )).all()
        posicao_global = next((i + 1 for i, (tid, _) in enumerate(ranking_global) if tid == user_id), "-")

        # Ranking do grupo
        ranking_grupo = (await session.execute(
            select(base.telegram_id, func.count(base.id_local).label("quantidade"))
            .where(base.telegram_id.in_(membros))
            .group_by(base.telegram_id)
            .order_by(desc("quantidade"))
        )).all()
        posicao_grupo = next((i + 1 for i, (tid, _) in enumerate(ranking_grupo) if tid == user_id), "-") if ranking_grupo else "-"

        # Totais
        total_dominados = (await session.execute(
            select(func.count(base.id_local)).where(base.telegram_id == user_id)
        )).scalar() or 0
        total_geral = (await session.execute(select(func.count(base.id_local)))).scalar() or 1

        # Barra de progresso
        porcentagem_harem = (total_dominados / total_geral) * 100
        barra = "▰" * min(10, int((total_dominados / total_geral) * 10))
        barra += "▱" * (10 - len(barra))

        # Cria todas as mensagens em paralelo
        keys = [
            ("title", {}),
            ("user_mention", {"user_mention": message.from_user.mention}),
            ("global_position", {"position": posicao_global}),
            ("group_position", {"position": posicao_grupo}),
            ("user_id", {"user_id": user_id}),
            ("progress", {"user_id": user_id, "barra": barra, "porcentagem": porcentagem_harem}),
            ("dominated", {"genero": client.genero.name.title(), "total_dominados": total_dominados, "total_geral": total_geral}),
        ]
        tasks = [msg(client, chat_id, k, **v) for k, v in keys]
        results = await asyncio.gather(*tasks)
        caption = "\n".join(results)

    # Envia a foto do usuário se existir
    file_id = await get_first_photo_file_id(client, user_id)
    keyboard = InlineKeyboardMarkup(
        [[InlineKeyboardButton(await msg(client, chat_id, "delete_button"), callback_data="ranking_trash")]]
    )
    if file_id:
        await message.reply_photo(file_id, caption=caption, reply_markup=keyboard)
    else:
        await message.reply_text(caption, reply_markup=keyboard)
