from typing import List
from pyrogram import Client, filters
from pyrogram.types import (
    Message,
    InlineKeyboardMarkup,
    InlineKeyboardButton,
    CallbackQuery,
    InputMediaPhoto,
)
from types_ import TipoCategoria, TipoMidia
from domination.lang_utils import obter_mensagem_chat
from sqlalchemy import select, func, desc
from DB.models import (
    ColecaoUsuarioHusbando,
    ColecaoUsuarioWaifu,
    Usuario,
    PersonagemHusbando,
    PersonagemWaifu,
)
from domination.uteis import dynamic_command_filter, send_media_by_type, COMMAND_LIST
from domination.message import MESSAGE


def format_user(info: dict | None) -> str:
    if not info:
        return "Desconhecido"
    if username := info.get("username"):
        return f"@{username}"
    return info.get("NAME", "Desconhecido")


async def build_top_text(session, base, ids: list[int] | None, limit: int = 10):
    stmt = (
        select(base.telegram_id, func.count(base.id_local).label("quantidade"))
        .group_by(base.telegram_id)
        .order_by(desc("quantidade"))
        .limit(limit)
    )
    if ids is not None:
        stmt = stmt.where(base.telegram_id.in_(ids))

    result = await session.execute(stmt)
    top_list = result.all()
    if not top_list:
        return None, None

    telegram_ids = [tid for tid, _ in top_list]
    users_stmt = select(Usuario.telegram_id, Usuario.telegram_from_user).where(
        Usuario.telegram_id.in_(telegram_ids)
    )
    users_result = await session.execute(users_stmt)
    users_dict = {tid: info for tid, info in users_result.all()}

    top_text = "\n".join(
        f"{i+1}. {format_user(users_dict.get(tid))} — {quantidade}"
        for i, (tid, quantidade) in enumerate(top_list)
    )
    return top_list, top_text


async def get_random_personagem(session, genero: TipoCategoria):
    if genero == TipoCategoria.HUSBANDO:
        result = await session.execute(
            select(PersonagemHusbando).order_by(func.random()).limit(1)
        )
    else:
        result = await session.execute(
            select(PersonagemWaifu).order_by(func.random()).limit(1)
        )
    return result.scalars().first()


async def ranking_keyboard(client, chat_id: int, scope: str):
    """scope = 'top' (global) ou 'chat' (chat)"""
    buttons_text = await obter_mensagem_chat(client, chat_id, "top", "buttons")
    buttons = [
        [
            InlineKeyboardButton(
                buttons_text["refresh"],
                callback_data="ranking_refresh",
            )
        ],
        [
            InlineKeyboardButton(
                (
                    buttons_text["global"]
                    if scope == "chat"
                    else buttons_text["chat"]
                ),
                callback_data="ranking_global" if scope == "chat" else "ranking_chat",
            )
        ],
        [
            InlineKeyboardButton(
                buttons_text["position"],
                callback_data="ranking_posicao",
            )
        ],
        [
            InlineKeyboardButton(
                buttons_text["delete"],
                callback_data="ranking_trask",
            )
        ],
    ]
    return InlineKeyboardMarkup(buttons)


# ====================================================
# Comando: TOP GLOBAL
# ====================================================


@Client.on_message(
    filters.create(
        name=f"comand{' '.join(COMMAND_LIST.TOP.value)}",
        func=dynamic_command_filter,
        command=COMMAND_LIST.TOP.value,
    )
)
@Client.on_message(filters.command(COMMAND_LIST.TOP.value) & filters.private)
# @Client.on_message(filters.command("top") & filters.group)
async def ComandoTop_global(client: Client, message: Message):
    base = (
        ColecaoUsuarioWaifu
        if client.genero == TipoCategoria.WAIFU
        else ColecaoUsuarioHusbando
    )

    async with await client.get_reusable_session() as session:
        top_list, top_text = await build_top_text(session, base, ids=None)
        if not top_list:
            await message.reply_text(
                await obter_mensagem_chat(client, message.chat.id, "top", "no_data"), parse_mode="HTML"
            )
            return

        personagem = await get_random_personagem(session, client.genero)

    if personagem:
        await send_media_by_type(
            client=client,
            message=message,
            personagem=personagem,
            caption=f"{await obter_mensagem_chat(client, message.chat.id, 'top', 'global_title')}\n\n{top_text}",
            reply_markup=await ranking_keyboard(client, message.chat.id, "top"),
        )
    else:
        await message.reply_text(
            f"{await obter_mensagem_chat(client, message.chat.id, 'top', 'global_title')}\n\n{top_text}",
            reply_markup=await ranking_keyboard(client, message.chat.id, "top"),
        )


# ====================================================
# Comando: TOP CHAT
# ====================================================


@Client.on_message(
    filters.create(
        name=f"comand{' '.join(COMMAND_LIST.TOP_CHAT.value)}",
        func=dynamic_command_filter,
        command=COMMAND_LIST.TOP_CHAT.value,
    )
)
@Client.on_message(filters.command(COMMAND_LIST.TOP_CHAT.value) & filters.group)
# @Client.on_message(filters.command("topchat") & filters.group)
async def ComandoTop_chat(client: Client, message: Message):
    base = (
        ColecaoUsuarioWaifu
        if client.genero == TipoCategoria.WAIFU
        else ColecaoUsuarioHusbando
    )
    group_id = message.chat.id

    membros = [m.user.id async for m in client.get_chat_members(group_id)]
    if not membros:
        await message.reply_text(
            await obter_mensagem_chat(client, message.chat.id, "top", "no_members"), parse_mode="HTML"
        )
        return

    async with await client.get_reusable_session() as session:
        top_list, top_text = await build_top_text(session, base, ids=membros)
        if not top_list:
            await message.reply_text(
                await obter_mensagem_chat(client, message.chat.id, "top", "no_group_collection"), parse_mode="HTML"
            )
            return

        personagem = await get_random_personagem(session, client.genero)

    if personagem:
        await send_media_by_type(
            client=client,
            message=message,
            personagem=personagem,
            caption=f"{await obter_mensagem_chat(client, message.chat.id, 'top', 'chat_title', chat_title=message.chat.title)}\n\n{top_text}",
            reply_markup=await ranking_keyboard(client, message.chat.id, "chat"),
        )
    else:
        await message.reply_text(
            f"{await obter_mensagem_chat(client, message.chat.id, 'top', 'chat_title', chat_title=message.chat.title)}\n\n{top_text}",
            reply_markup=await ranking_keyboard(client, message.chat.id, "chat"),
        )


# ====================================================
# Callback: Ver posição atual do usuário
# ====================================================
@Client.on_callback_query(filters.regex("^ranking_posicao$"))
async def callback_posicao(client: Client, query: CallbackQuery):
    user_id = query.from_user.id
    chat_id = query.message.chat.id
    base = (
        ColecaoUsuarioWaifu
        if client.genero == TipoCategoria.WAIFU
        else ColecaoUsuarioHusbando
    )

    membros = [m.user.id async for m in client.get_chat_members(chat_id)]

    async with await client.get_reusable_session() as session:
        stmt = (
            select(base.telegram_id, func.count(base.id_local).label("quantidade"))
            .where(base.telegram_id.in_(membros))
            .group_by(base.telegram_id)
            .order_by(desc("quantidade"))
        )
        result = await session.execute(stmt)
        ranking = result.all()

    posicao = next(
        (i + 1 for i, (tid, _) in enumerate(ranking) if tid == user_id), None
    )

    if posicao:
        await query.answer(
            await obter_mensagem_chat(client, query.message.chat.id, "top", "position", position=posicao), show_alert=True
        )
    else:
        await query.answer(
            await obter_mensagem_chat(client, query.message.chat.id, "top", "no_user_collection"), show_alert=True
        )


# ====================================================
# Callback: Ranking do Chat
# ====================================================
@Client.on_callback_query(filters.regex("^ranking_chat$"))
async def call_ranking_chat(client: Client, query: CallbackQuery):
    base = (
        ColecaoUsuarioWaifu
        if client.genero == TipoCategoria.WAIFU
        else ColecaoUsuarioHusbando
    )
    group_id = query.message.chat.id
    membros = [m.user.id async for m in client.get_chat_members(group_id)]

    async with await client.get_reusable_session() as session:
        top_list, top_text = await build_top_text(session, base, ids=membros)
        if not top_list:
            try:
                await query.edit_message_caption(
                    await obter_mensagem_chat(client, query.message.chat.id, "top", "no_group_collection")
                )
                return
            except:
                pass
    try:
        await query.edit_message_caption(
            caption=f"{await obter_mensagem_chat(client, query.message.chat.id, 'top', 'chat_title', chat_title=query.message.chat.title)}\n\n{top_text}",
            reply_markup=await ranking_keyboard(client, query.message.chat.id, "chat"),
        )
    except:
        pass


# ====================================================
# Callback: Ranking Global
# ====================================================
@Client.on_callback_query(filters.regex("^ranking_global$"))
async def call_ranking_global(client: Client, query: CallbackQuery):
    base = (
        ColecaoUsuarioWaifu
        if client.genero == TipoCategoria.WAIFU
        else ColecaoUsuarioHusbando
    )
    await query.edit_message_caption(await obter_mensagem_chat(client, query.message.chat.id, "top", "no_data"))
    async with await client.get_reusable_session() as session:
        top_list, top_text = await build_top_text(session, base, ids=None)
        if not top_list:
            await query.edit_message_caption(await obter_mensagem_chat(client, query.message.chat.id, "top", "no_data"))
            return

    await query.edit_message_caption(
        caption=f"{await obter_mensagem_chat(client, query.message.chat.id, 'top', 'global_title')}\n\n{top_text}",
        reply_markup=await ranking_keyboard(client, query.message.chat.id, "top"),
    )


@Client.on_callback_query(filters.regex("^ranking_refresh$"))
async def ranking_refresh(client: Client, query: CallbackQuery):
    return await client.answer_callback_query(
        query.id, text=await obter_mensagem_chat(client, query.message.chat.id, "top", "refresh_text"), show_alert=True
    )


@Client.on_callback_query(filters.regex("^ranking_trask$"))
async def ranking_trask(client: Client, query: CallbackQuery):

    return await query.message.delete()
