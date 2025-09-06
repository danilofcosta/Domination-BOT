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
from domination.uteis import dynamic_command_filter, send_media_by_type, COMMAND_LIST
from domination.message import MESSAGE
from domination.lang_utils import obter_mensagem_chat


async def get_first_photo_file_id(app: Client, user_id: int) -> str | None:
    """Retorna o file_id da primeira foto do usuário/chat."""
    async for photo in app.get_chat_photos(user_id):
        return photo.file_id
    return None


@Client.on_message(
    filters.create(
        name=f"comand{' '.join(COMMAND_LIST.MYINFO.value)}",
        func=dynamic_command_filter,
        command=COMMAND_LIST.MYINFO.value,
    )
)
@Client.on_message(filters.command(COMMAND_LIST.MYINFO.value) & filters.private)
async def myinfos(client: Client, message: Message):

    user_id = message.from_user.id
    chat_id = message.chat.id

    # Seleciona a tabela correta
    base = (
        ColecaoUsuarioWaifu
        if client.genero == TipoCategoria.WAIFU
        else ColecaoUsuarioHusbando
    )

    # Pega membros do grupo se for grupo
    membros = (
        [m.user.id async for m in client.get_chat_members(chat_id)]
        if message.chat.type in ["group", "supergroup"]
        else [user_id]
    )

    async with await client.get_reusable_session() as session:
        # Ranking global
        ranking_global = (
            await session.execute(
                select(base.telegram_id, func.count(base.id_local).label("quantidade"))
                .group_by(base.telegram_id)
                .order_by(desc("quantidade"))
            )
        ).all()
        posicao_global = next(
            (i + 1 for i, (tid, _) in enumerate(ranking_global) if tid == user_id), "-"
        )

        # Ranking do grupo (mesma lógica do /top_chat)
        stmt_grupo = (
            select(base.telegram_id, func.count(base.id_local).label("quantidade"))
            .where(base.telegram_id.in_(membros))
            .group_by(base.telegram_id)
            .order_by(desc("quantidade"))
        )
        ranking_grupo = (await session.execute(stmt_grupo)).all()
        posicao_grupo = (
            next(
                (i + 1 for i, (tid, _) in enumerate(ranking_grupo) if tid == user_id),
                "-",
            )
            if ranking_grupo
            else "-"
        )

        # Total dominados pelo usuário
        total_dominados = (
            await session.execute(
                select(func.count(base.id_local)).where(base.telegram_id == user_id)
            )
        ).scalar() or 0

        # Total geral
        total_geral = (
            await session.execute(select(func.count(base.id_local)))
        ).scalar() or 1

        # Barra de progresso
        porcentagem_harem = (total_dominados / total_geral) * 100
        barra_preenchida = min(10, int((total_dominados / total_geral) * 10))
        barra = "▰" * barra_preenchida + "▱" * (10 - barra_preenchida)

    # Monta a legenda
    caption = (
        f"{await obter_mensagem_chat(client, message.chat.id, 'myinfos', 'title')}\n\n"
        f"{await obter_mensagem_chat(client, message.chat.id, 'myinfos', 'user_mention', user_mention=message.from_user.mention)}\n"
        f"{await obter_mensagem_chat(client, message.chat.id, 'myinfos', 'global_position', position=posicao_global)}\n"
        f"{await obter_mensagem_chat(client, message.chat.id, 'myinfos', 'group_position', position=posicao_grupo)}\n"
        f"{await obter_mensagem_chat(client, message.chat.id, 'myinfos', 'user_id', user_id=user_id)}\n"
        f"{await obter_mensagem_chat(client, message.chat.id, 'myinfos', 'progress', user_id=user_id, barra=barra, porcentagem=porcentagem_harem)}\n"
        f"{await obter_mensagem_chat(client, message.chat.id, 'myinfos', 'dominated', genero=client.genero.name.title(), total_dominados=total_dominados, total_geral=total_geral)}\n"
    )

    # Envia a foto do usuário se existir
    file_id = await get_first_photo_file_id(client, user_id)
    if file_id:
        await message.reply_photo(
            file_id,
            caption=caption,
            reply_markup=InlineKeyboardMarkup(
                [
                    [
                        InlineKeyboardButton(
                            await obter_mensagem_chat(
                                client, message.chat.id, "myinfos", "delete_button"
                            ),
                            callback_data="ranking_trash",
                        )
                    ]
                ]
            ),
            ttl_seconds=10,
        )
    else:
        await message.reply_text(caption)


@Client.on_callback_query(filters.regex(r"^ranking_trash(\d+)$"))
async def apagar_harem(client: Client, callback_query: CallbackQuery):
    try:
        await callback_query.message.delete()
    except:
        pass
