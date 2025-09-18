from typing import List
from pyrogram import Client, filters
from pyrogram.types import (
    Message,
    InlineKeyboardMarkup,
    InlineKeyboardButton,
    CallbackQuery,
)
from DB.database import DATABASE
from sqlalchemy import select, func
from DB.models import Usuario, PersonagemWaifu, PersonagemHusbando
from uteis import dynamic_command_filter, send_media_by_type
from types_ import TipoCategoria, ModoHarem, COMMAND_LIST
from domination.plugins.harem_pages import (
    create_harem_pages_ref,
    build_recent_pages,
    build_anime_mode_pages,
    build_delete_mode_pages,
)
from domination.message import MESSAGE

# Inicializa cache de páginas no Client
if not hasattr(Client, "pages_cache"):
    print(" cache de páginas no Client ")
    Client.pages_cache = {}


def build_harem_keyboard(user_id, genero, current_page, total_pages):
    keyboard = []

    keyboard = [
        [
            InlineKeyboardButton(
                "◀️",
                callback_data=(
                    f"page_{user_id}_{genero}_{current_page-1}"
                    if current_page > 0
                    else "noop"
                ),
            ),
            InlineKeyboardButton(
                f"{current_page + 1}/{total_pages}", callback_data="page_info"
            ),
            InlineKeyboardButton(
                "▶️",
                callback_data=(
                    f"page_{user_id}_{genero}_{current_page+1}"
                    if current_page < total_pages - 1
                    else "noop"
                ),
            ),
        ]
    ]

    # Row: inline + x2 forward
    keyboard.append(
        [
            InlineKeyboardButton(
                "🌐", switch_inline_query_current_chat=f"user.harem.{user_id}"
            ),
            InlineKeyboardButton(
                "⏩²",
                callback_data=(
                    f"page_{user_id}_{genero}_{min(current_page + 2, total_pages - 1)}"
                    if current_page < total_pages - 1
                    else "noop"
                ),
            ),
        ]
    )
    # Row: delete
    keyboard.append([InlineKeyboardButton("🗑", callback_data=f"apagarharem_{user_id}")])
    return InlineKeyboardMarkup(keyboard)


@Client.on_message(
    filters.create(
        name=f"comand{' '.join(COMMAND_LIST.HAREM.value)}",
        func=dynamic_command_filter,
        command=COMMAND_LIST.HAREM.value,
    )
)
@Client.on_message(filters.command(COMMAND_LIST.HAREM.value) & filters.private)
async def harem(client: Client, message: Message,user_id=None):
    user_id =user_id or  message.from_user.id
    genero = client.genero

    stmt = select(Usuario).where(Usuario.telegram_id == message.from_user.id)
    usuario: Usuario = await DATABASE.get_info_one(stmt)

    if not usuario:
        await message.reply_text(MESSAGE.get_text("pt", "alerts", "not_profile"))
        return

    configs = (
        usuario.configs_h if genero == TipoCategoria.HUSBANDO else usuario.configs_w
    )
    modo_harem = (
        configs.get("modo_harem", ModoHarem.PADRAO.value)
        if configs
        else ModoHarem.PADRAO.value
    )

    has_fav = usuario.fav_h_id if genero == TipoCategoria.HUSBANDO else usuario.fav_w_id
    if not has_fav:
        await message.reply_text("❌ Você ainda não tem um personagem favorito!")
        return

    fav_info = (
        usuario.fav_h_character
        if genero == TipoCategoria.HUSBANDO
        else usuario.fav_w_character
    )
    colecoes = (
        usuario.colecoes_husbando
        if genero == TipoCategoria.HUSBANDO
        else usuario.colecoes_waifu
    )

    if "_" in modo_harem:
        modo_harem, submodo = modo_harem.split("_")

    if modo_harem == ModoHarem.PADRAO.value:
        pages = await create_harem_pages_ref(colecoes, genero)
        if not pages:
            await message.reply_text("❌ Nenhum personagem encontrado na sua coleção!")
            return

        # Armazena as páginas no client
        if user_id not in client.pages_cache:
            client.pages_cache[user_id] = {}
        client.pages_cache[user_id][genero.value] = pages

        current_page = 0
        caption = f"{message.from_user.mention} ๛Harem ツ\n\n{pages[current_page]}"
        reply_markup = build_harem_keyboard(
            user_id, genero.value, current_page, len(pages)
        )

    elif modo_harem == ModoHarem.RECENTE.value:
        colecoes_sorted = sorted(
            colecoes,
            key=lambda c: getattr(c, "id_local", 0),
            reverse=True,
        )
        pages = build_recent_pages(colecoes_sorted)
        if not pages:
            await message.reply_text("❌ Nenhum personagem encontrado na sua coleção!")
            return

        if user_id not in client.pages_cache:
            client.pages_cache[user_id] = {}
        client.pages_cache[user_id][genero.value] = pages

        current_page = 0
        caption = f"{message.from_user.mention} ๛Harem ツ\n\n{pages[current_page]}"
        reply_markup = build_harem_keyboard(
            user_id, genero.value, current_page, len(pages)
        )

    elif modo_harem == ModoHarem.ANIME.value:
        pages = await build_anime_mode_pages(colecoes, genero)
        if not pages:
            await message.reply_text("❌ Nenhum personagem encontrado na sua coleção!")
            return

        if user_id not in client.pages_cache:
            client.pages_cache[user_id] = {}
        client.pages_cache[user_id][genero.value] = pages

        current_page = 0
        caption = f"{message.from_user.mention} ๛Harem ツ\n\n{pages[current_page]}"
        reply_markup = build_harem_keyboard(
            user_id, genero.value, current_page, len(pages)
        )

    elif modo_harem == ModoHarem.DETALHE.value:
        pages = await build_delete_mode_pages(colecoes, genero)
        if not pages:
            await message.reply_text("❌ Nenhum personagem encontrado na sua coleção!")
            return

        if user_id not in client.pages_cache:
            client.pages_cache[user_id] = {}
        client.pages_cache[user_id][genero.value] = pages

        current_page = 0
        caption = f"{message.from_user.mention} ๛Harem ツ\n\n{pages[current_page]}"
        reply_markup = build_harem_keyboard(
            user_id, genero.value, current_page, len(pages)
        )

    elif modo_harem == ModoHarem.RARIDADE.value:

        # Filtrar coleção pela raridade selecionada
        colecoes_filtradas = [
            c for c in colecoes if c.character.raridade.value == submodo
        ]
        if not colecoes_filtradas:
            pages = ["— harem vazio para esta raridade  —"]
        else:
            # Reutiliza o layout do PADRAO para agrupar por anime e listar personagens
            pages = await create_harem_pages_ref(colecoes_filtradas, genero)
            if not pages:
                pages = ["— harem vazio para esta raridade —"]

        if user_id not in client.pages_cache:
            client.pages_cache[user_id] = {}
        client.pages_cache[user_id][genero.value] = pages

        current_page = 0
        caption = f"{message.from_user.mention} ๛Harem ツ\n\n{pages[current_page]}"
        reply_markup = build_harem_keyboard(
            user_id, genero.value, current_page, len(pages)
        )

    elif modo_harem == ModoHarem.EVENTO.value:
        colecoes_filtradas = [
            c for c in colecoes if c.character.evento.value == submodo
        ]
        if not colecoes_filtradas:
            pages = ["— harem vazio para este evento —"]
        else:
            pages = await create_harem_pages_ref(colecoes_filtradas, genero)
            if not pages:
                pages = ["— harem vazio para este evento —"]

        if user_id not in client.pages_cache:
            client.pages_cache[user_id] = {}
        client.pages_cache[user_id][genero.value] = pages

        current_page = 0
        caption = f"{message.from_user.mention} ๛Harem ツ\n\n{pages[current_page]}"
        reply_markup = build_harem_keyboard(
            user_id, genero.value, current_page, len(pages)
        )
    try:
        await send_media_by_type(
            message, fav_info, caption=caption, reply_markup=reply_markup
        )
    except Exception as e:
        await message.reply_text(f"❌ Erro ao enviar mídia: {e}")


@Client.on_callback_query(filters.regex(r"^page_(\d+)_(\w+)_(\d+)$"))
async def navigate_harem_page(client: Client, callback_query: CallbackQuery):
    user_id = int(callback_query.matches[0].group(1))
    genero = callback_query.matches[0].group(2)
    new_page = int(callback_query.matches[0].group(3))

    if callback_query.from_user.id != user_id:
        await callback_query.answer("❌ Você não pode usar este botão!")
        return

    pages = client.pages_cache.get(user_id, {}).get(genero)
    if not pages:
        await callback_query.answer("❌ Páginas expiradas!")
        return

    new_page = max(0, min(new_page, len(pages) - 1))
    caption = f"๛Harem ツ\n\n{pages[new_page]}"
    reply_markup = build_harem_keyboard(user_id, genero, new_page, len(pages))

    try:
        await callback_query.edit_message_caption(
            caption=caption, reply_markup=reply_markup
        )
    except Exception as e:
        await callback_query.answer(f"❌ Erro: {e}")


@Client.on_callback_query(filters.regex(r"^apagarharem_(\d+)$"))
async def apagar_harem(client: Client, callback_query: CallbackQuery):
    user_id = int(callback_query.matches[0].group(1))
    if callback_query.from_user.id != user_id:
        await callback_query.answer(
            MESSAGE.get_text("pt", "erros", "error_cannot_use_button")
        )
        return

    try:
        await callback_query.message.delete()
        await callback_query.answer(MESSAGE.get_text("pt", "harem", "deleted"))
        # Remove do cache
        if user_id in client.pages_cache:
            client.pages_cache.pop(user_id)
    except Exception as e:
        await callback_query.answer(MESSAGE.get_text("pt", "general", "error"))


@Client.on_callback_query(filters.regex(r"^page_info$"))
async def page_info(client: Client, callback_query: CallbackQuery):
    await callback_query.answer(
        MESSAGE.get_text("pt", "harem", "navigation")["page_info"]
    )


@Client.on_callback_query(filters.regex(r"^noop$"))
async def noop_handler(client: Client, callback_query: CallbackQuery):
    await callback_query.answer()
