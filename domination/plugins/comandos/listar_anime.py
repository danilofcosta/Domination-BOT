from typing import List
from pyrogram import Client, filters
from pyrogram.types import InlineKeyboardMarkup, InlineKeyboardButton, CallbackQuery
from sqlalchemy import select
from DB.models import PersonagemWaifu, PersonagemHusbando
from domination.uteis import dynamic_command_filter
from types_ import TipoCategoria,COMMAND_LIST
from domination.plugins.lang_utils import obter_mensagem_chat

# Dicionários temporários para armazenar estados de callback
anime_lookup = {}
personagem_lookup = {}


# ===============================
# Função para criar teclado paginado
# ===============================
async def create_keyboard(
    client,
    chat_id,
    items,
    page=1,
    per_page=14,
    prefix="item",
    back_data=None,
    is_character_list=False,
):
    start = (page - 1) * per_page
    end = start + per_page

    if is_character_list:
        # Para lista de personagens, criar botões com "Ver Personagem"
        view_text = await obter_mensagem_chat(
            client, chat_id, "listanime", "view_character"
        )
        buttons = []
        for i in items[start:end]:
            # Botão com nome do personagem e callback para ver detalhes
            buttons.append([InlineKeyboardButton(i, callback_data=f"view_char_{i}")])
    else:
        # Para lista de animes, usar inline query
        buttons = [
            [
                InlineKeyboardButton(
                    i, switch_inline_query_current_chat=f"list_anime_{i}"
                )
            ]
            for i in items[start:end]
        ]

    nav = []
    total_pages = (len(items) + per_page - 1) // per_page
    if page > 1:
        previous_text = await obter_mensagem_chat(
            client, chat_id, "listanime", "previous"
        )
        nav.append(
            InlineKeyboardButton(previous_text, callback_data=f"{prefix}_page_{page-1}")
        )
    if page < total_pages:
        next_text = await obter_mensagem_chat(client, chat_id, "listanime", "next")
        nav.append(
            InlineKeyboardButton(next_text, callback_data=f"{prefix}_page_{page+1}")
        )
    if back_data:
        back_text = await obter_mensagem_chat(client, chat_id, "listanime", "back")
        nav.append(InlineKeyboardButton(back_text, callback_data=back_data))
    if nav:
        buttons.append(nav)
    return InlineKeyboardMarkup(buttons)


# ===============================
# Comando /list_anime → alfabeto
# ===============================


@Client.on_message(
    filters.create(
        name=f"comand{' '.join(COMMAND_LIST.LISTANIME.value)}",
        func=dynamic_command_filter,
        command=COMMAND_LIST.LISTANIME.value,
    )
)
@Client.on_message(filters.command(COMMAND_LIST.LISTANIME.value) & filters.private)
async def list_anime(client: Client, message):
    alphabet = [chr(i) for i in range(65, 91)]  # A-Z
    # criar botões 3 por linha
    buttons = [alphabet[i : i + 3] for i in range(0, len(alphabet), 3)]
    keyboard = InlineKeyboardMarkup(
        [
            [
                InlineKeyboardButton(letter, callback_data=f"anime_letter_{letter}")
                for letter in row
            ]
            for row in buttons
        ]
    )
    select_text = await obter_mensagem_chat(
        client, message.chat.id, "listanime", "select_letter"
    )
    await message.reply(select_text, reply_markup=keyboard)


# ===============================
# Callback: Letra inicial do anime
# ===============================
@Client.on_callback_query(filters.regex(r"^anime_letter_"))
async def anime_letter_callback(client: Client, query: CallbackQuery):
    letter = query.data.replace("anime_letter_", "")
    base_cls = (
        PersonagemWaifu if client.genero == TipoCategoria.WAIFU else PersonagemHusbando
    )

    async with await client.get_reusable_session() as session:
        # Convert letter to lowercase for case-insensitive search
        letter_lower = letter.lower()
        stmt = (
            select(base_cls.nome_anime)
            .distinct()
            .where(base_cls.nome_anime.startswith(letter_lower))
        )
        result = await session.execute(stmt)
        animes = [row[0] for row in result.all()]

    if not animes:
        no_anime_text = await obter_mensagem_chat(
            client, query.message.chat.id, "listanime", "no_anime_found"
        )
        return await query.answer(no_anime_text, show_alert=True)

    # armazenar lookup
    for anime in animes:
        key = anime[:25]  # corta para callback_data
        anime_lookup[key] = anime

    keyboard = await create_keyboard(
        client,
        query.message.chat.id,
        [anime[:25].capitalize() for anime in animes],
        page=1,
        per_page=14,
        prefix=f"anime_{letter}",
        back_data="back_alphabet",
    )
    animes_text = await obter_mensagem_chat(
        client,
        query.message.chat.id,
        "listanime",
        "animes_starting_with",
        letter=letter,
        cont=len(animes),
    )
    await query.edit_message_text(animes_text, reply_markup=keyboard)


# ===============================
# Callback: Paginação anime
# ===============================
@Client.on_callback_query(filters.regex(r"^anime_.*_page_\d+$"))
async def anime_page_callback(client: Client, query: CallbackQuery):
    parts = query.data.split("_page_")
    prefix = parts[0]  # anime_<letter>
    page = int(parts[1])
    letter = prefix.replace("anime_", "")

    # pegar todos os animes da letra (convert to lowercase for case-insensitive search)
    letter_lower = letter.lower()
    animes = [
        anime.capitalize() for anime in anime_lookup.values() if anime.startswith(letter_lower)
    ]
    keyboard = await create_keyboard(
        client,
        query.message.chat.id,
        [a[:25] for a in animes],
        page=page,
        per_page=14,
        prefix=f"anime_{letter}",
        back_data="back_alphabet",
    )
    animes_text = await obter_mensagem_chat(
        client,
        query.message.chat.id,
        "listanime",
        "animes_starting_with",
        letter=letter,
        cont=len(animes),
    )
    await query.edit_message_text(animes_text, reply_markup=keyboard)


# ===============================
# Callback: Selecionar anime → personagens
# ===============================
@Client.on_callback_query(filters.regex(r"^anime_"))
async def anime_select_callback(client: Client, query: CallbackQuery):
    key = query.data.replace("anime_", "")
    anime_name = anime_lookup.get(key[:25])  # corta para lookup
    if not anime_name:
        anime_not_found_text = await obter_mensagem_chat(
            client, query.message.chat.id, "listanime", "anime_not_found"
        )
        return await query.answer(anime_not_found_text, show_alert=True)

    base_cls = (
        PersonagemWaifu if client.genero == TipoCategoria.WAIFU else PersonagemHusbando
    )

    async with await client.get_reusable_session() as session:
        stmt = select(base_cls).where(base_cls.nome_anime == anime_name)
        result = await session.execute(stmt)
        personagens = result.scalars().all()

    if not personagens:
        no_characters_text = await obter_mensagem_chat(
            client, query.message.chat.id, "listanime", "no_characters_found"
        )
        return await query.answer(no_characters_text, show_alert=True)

    # armazenar lookup de personagens
    for p in personagens:
        personagem_lookup[p.nome_personagem[:25]] = p

    keyboard = await create_keyboard(
        client,
        query.message.chat.id,
        [p.nome_personagem[:25].capitalize() for p in personagens],
        page=1,
        per_page=14,
        prefix=f"personagem_{key}",
        back_data=f"anime_letter_{anime_name[0]}",
        is_character_list=True,
    )
    characters_text = await obter_mensagem_chat(
        client,
        query.message.chat.id,
        "listanime",
        "characters_from_anime",
        anime_name=anime_name,
    )
    await query.edit_message_text(characters_text, reply_markup=keyboard)


# ===============================
# Callback: Paginação personagens
# ===============================
@Client.on_callback_query(filters.regex(r"^personagem_.*_page_\d+$"))
async def personagem_page_callback(client: Client, query: CallbackQuery):
    parts = query.data.split("_page_")
    prefix = parts[0]
    page = int(parts[1])
    key = prefix.replace("personagem_", "")
    # todos os personagens da seleção (convert to lowercase for case-insensitive search)
    key_lower = key[0].capitalize()
    personagens = [
        p.nome_personagem[:25]
        for p in personagem_lookup.values()
        if p.nome_anime.startswith(key_lower)
    ]
    keyboard = await create_keyboard(
        client,
        query.message.chat.id,
        personagens,
        page=page,
        per_page=14,
        prefix=prefix,
        back_data=f"anime_letter_{key[0]}",
        is_character_list=True,
    )
    selection_text = await obter_mensagem_chat(
        client, query.message.chat.id, "listanime", "characters_from_selection"
    )
    await query.edit_message_text(selection_text, reply_markup=keyboard)


# ===============================
# Callback: Voltar para o alfabeto
# ===============================
@Client.on_callback_query(filters.regex(r"^back_alphabet$"))
async def back_alphabet_callback(client: Client, query: CallbackQuery):
    alphabet = [chr(i) for i in range(65, 91)]
    buttons = [alphabet[i : i + 3] for i in range(0, len(alphabet), 3)]
    keyboard = InlineKeyboardMarkup(
        [
            [
                InlineKeyboardButton(letter, callback_data=f"anime_letter_{letter}")
                for letter in row
            ]
            for row in buttons
        ]
    )
    select_text = await obter_mensagem_chat(
        client, query.message.chat.id, "listanime", "select_letter"
    )
    await query.edit_message_text(select_text, reply_markup=keyboard)
