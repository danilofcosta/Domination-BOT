from typing import List
from pyrogram import Client, filters
from pyrogram.types import (
    Message,
    InlineKeyboardMarkup,
    InlineKeyboardButton,
    CallbackQuery,
)
from pyrogram import errors
from types_ import TipoCategoria
from sqlalchemy import select, func, desc
from DB.models import (
    ColecaoUsuarioHusbando,
    ColecaoUsuarioWaifu,
    Usuario,
    PersonagemHusbando,
    PersonagemWaifu,
)
from uteis import dynamic_command_filter, send_media_by_type
from types_ import COMMAND_LIST
from DB.database import DATABASE
from domination.message import MESSAGE


def format_user(info: dict | None) -> str:
    if not info:
        return "Desconhecido"
    if username := info.get("username"):
        return f"@{username}"
    return info.get("NAME", "Desconhecido")


async def build_top_text(base, ids: list[int] | None, limit: int = 10):
    stmt = (
        select(base.telegram_id, func.count(base.id_local).label("quantidade"))
        .group_by(base.telegram_id)
        .order_by(desc("quantidade"))
        .limit(limit)
    )
    if ids is not None:
        stmt = stmt.where(base.telegram_id.in_(ids))

    top_list = await DATABASE.get_info_all_objects(stmt)
    if not top_list:
        return None, None

    telegram_ids = [tid for tid, _ in top_list]
    users_stmt = select(Usuario.telegram_id, Usuario.telegram_from_user).where(
        Usuario.telegram_id.in_(telegram_ids)
    )

    users_dict = {
        tid: info for tid, info in await DATABASE.get_info_all_objects(users_stmt)
    }

    top_text = "\n".join(
        f"{i+1}. {format_user(users_dict.get(tid))} — {quantidade}"
        for i, (tid, quantidade) in enumerate(top_list)
    )
    return top_list, top_text


async def get_random_personagem(genero: TipoCategoria):
    if genero == TipoCategoria.HUSBANDO:
        smtr = select(PersonagemHusbando).order_by(func.random()).limit(1)

    else:
        smtr = select(PersonagemWaifu).order_by(func.random()).limit(1)

    return await DATABASE.get_info_one(smtr)


async def ranking_keyboard(client, chat_id: int, scope: str):
    """scope = 'top' (global) ou 'chat' (chat)"""
    buttons_text = MESSAGE.get_text("pt", "top", "buttons")
    buttons = [
        [
            InlineKeyboardButton(
                buttons_text["refresh"],
                callback_data="ranking_refresh",
            )
        ],
        [
            InlineKeyboardButton(
                (buttons_text["global"] if scope == "chat" else buttons_text["chat"]),
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


# Comando: TOP GLOBAL


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

    top_list, top_text = await build_top_text(base, ids=None)
    if not top_list:
        await message.reply_text(
            MESSAGE.get_text("pt", "top", "no_data"),
        )
        return

    personagem = await get_random_personagem(client.genero)

    if personagem:
        await send_media_by_type(
            message=message,
            personagem=personagem,
            caption=f"{   MESSAGE.get_text('pt', 'top', 'global_title')}\n\n{top_text}",
            reply_markup=await ranking_keyboard(client, message.chat.id, "top"),
        )
    else:
        await message.reply_text(
            f"{   MESSAGE.get_text('pt','top', 'global_title')}\n\n{top_text}",
            reply_markup=await ranking_keyboard(client, message.chat.id, "top"),
        )


# Comando: TOP CHAT


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
    try:
        membros = [m.user.id async for m in client.get_chat_members(group_id)]
    except:
        membros = None
    if not membros:
        await message.reply_text(
            MESSAGE.get_text("pt", "top", "no_members"),
        )
        return

    top_list, top_text = await build_top_text(base, ids=membros)
    if not top_list:
        await message.reply_text(
            MESSAGE.get_text("pt", "top", "no_group_collection"),
        )
        return

    personagem = await get_random_personagem(client.genero)

    if personagem:
        await send_media_by_type(
            message=message,
            personagem=personagem,
            caption=f"{   MESSAGE.get_text('pt','top', 'chat_title', chat_title=message.chat.title)}\n\n{top_text}",
            reply_markup=await ranking_keyboard(client, message.chat.id, "chat"),
        )
    else:
        await message.reply_text(
            f"{   MESSAGE.get_text('pt', 'top', 'chat_title', chat_title=message.chat.title)}\n\n{top_text}",
            reply_markup=await ranking_keyboard(client, message.chat.id, "chat"),
        )


# Callback: Ver posição atual do usuário


@Client.on_callback_query(filters.regex("^ranking_posicao$"))
async def callback_posicao(client: Client, query: CallbackQuery):
    user_id = query.from_user.id
    chat_id = query.message.chat.id
    base = (
        ColecaoUsuarioWaifu
        if client.genero == TipoCategoria.WAIFU
        else ColecaoUsuarioHusbando
    )
    try:
        membros = [m.user.id async for m in client.get_chat_members(chat_id)]
    except:
        return await query.answer(
            show_alert=True, text="não conseguir achar sua posiçao"
        )

    stmt = (
        select(base.telegram_id, func.count(base.id_local).label("quantidade"))
        .where(base.telegram_id.in_(membros))
        .group_by(base.telegram_id)
        .order_by(desc("quantidade"))
    )
    result = await DATABASE.get_info_all_objects(stmt)
    ranking = result

    posicao = next(
        (i + 1 for i, (tid, _) in enumerate(ranking) if tid == user_id), None
    )

    if posicao:
        await query.answer(
            MESSAGE.get_text("pt", "top", "position", position=posicao),
            show_alert=True,
        )
    else:
        await query.answer(
            MESSAGE.get_text("pt", "top", "no_user_collection"),
            show_alert=True,
        )


# Callback: Ranking do Chat


@Client.on_callback_query(filters.regex("^ranking_chat$"))
async def call_ranking_chat(client: Client, query: CallbackQuery):
    base = (
        ColecaoUsuarioWaifu
        if client.genero == TipoCategoria.WAIFU
        else ColecaoUsuarioHusbando
    )
    group_id = query.message.chat.id
    try:
        membros = [m.user.id async for m in client.get_chat_members(group_id)]
    except errors.ChannelInvalid:
        return await query.answer("comando apenas para grupo", show_alert=True)

    top_list, top_text = await build_top_text(base, ids=membros)
    if not top_list:
        try:
            await query.edit_message_caption(
                MESSAGE.get_text("pt", "top", "no_group_collection")
            )
            return
        except:
            pass
    try:
        await query.edit_message_caption(
            caption=f"{   MESSAGE.get_text('pt','top', 'chat_title', chat_title=query.message.chat.title)}\n\n{top_text}",
            reply_markup=await ranking_keyboard(client, query.message.chat.id, "chat"),
        )
    except:
        pass


@Client.on_callback_query(filters.regex("^ranking_global$"))
async def call_ranking_global(client: Client, query: CallbackQuery):
    base = (
        ColecaoUsuarioWaifu
        if client.genero == TipoCategoria.WAIFU
        else ColecaoUsuarioHusbando
    )
    await query.edit_message_caption(MESSAGE.get_text("pt", "top", "no_data"))

    top_list, top_text = await build_top_text(base, ids=None)
    if not top_list:
        await query.edit_message_caption(MESSAGE.get_text("pt", "top", "no_data"))
        return

    await query.edit_message_caption(
        caption=f"{    MESSAGE.get_text('pt', 'top', 'global_title')}\n\n{top_text}",
        reply_markup=await ranking_keyboard(client, query.message.chat.id, "top"),
    )


@Client.on_callback_query(filters.regex("^ranking_refresh$"))
async def ranking_refresh(client: Client, query: CallbackQuery):
    return await client.answer_callback_query(
        query.id,
        text=MESSAGE.get_text("pt", "top", "refresh_text"),
        show_alert=True,
    )


@Client.on_callback_query(filters.regex("^ranking_trask$"))
async def ranking_trask(client: Client, query: CallbackQuery):

    return await query.message.delete()
