from sqlalchemy import select
from aiogram import Router
from aiogram.filters import Command
from aiogram.types import Message, CallbackQuery, InlineKeyboardButton
from aiogram.filters.callback_data import CallbackData
from aiogram.utils.keyboard import InlineKeyboardBuilder

from database.models.Character.Character import CharacterHusbando, CharacterWaifu
from database.session import AsyncSessionLocal
from domination_telegram.enuns import Commands_Bot, GeneroEnum


# =========================
# TEXTOS
# =========================
TEXTS = {
    "select_letter": "📚 Escolha a letra inicial do anime:",
    "no_anime_found": "Nenhum anime encontrado com essa letra.",
    "no_character_found": "Nenhum personagem encontrado.",
    "previous": "⬅️ Anterior",
    "next": "➡️ Próximo",
    "back": "🔙 Voltar",
    "animes_starting_with": "🎌 Animes que começam com {letter} ({cont})",
    "characters_from_anime": "👤 Personagens de {anime_name}",
}


# =========================
# CALLBACK DATA (REFATORADO)
# =========================
class AnimeLetterCallback(CallbackData, prefix="anime_letter"):
    letter: str


class AnimePageCallback(CallbackData, prefix="anime_page"):
    letter: str
    page: int


class AnimeSelectCallback(CallbackData, prefix="anime_select"):
    anime_id: int
    letter: str


class CharacterPageCallback(CallbackData, prefix="character_page"):
    anime_id: int
    letter: str
    page: int


# =========================
# MODELOS POR GÊNERO
# =========================
def get_models(genero: str):
    return CharacterHusbando if genero == GeneroEnum.Husbando.value else CharacterWaifu


# =========================
# TECLADO GENÉRICO PAGINADO
# =========================
async def create_paginated_keyboard(
    items,
    page,
    per_page,
    build_button,
    prev_callback,
    next_callback,
    back_callback=None,
    columns=1
):
    builder = InlineKeyboardBuilder()

    start = (page - 1) * per_page
    end = start + per_page
    sliced = items[start:end]

    for item in sliced:
        build_button(builder, item)

    builder.adjust(columns)

    total_pages = (len(items) + per_page - 1) // per_page
    nav = []

    if page > 1:
        nav.append(
            InlineKeyboardButton(
                text=TEXTS["previous"],
                callback_data=prev_callback(page - 1)
            )
        )

    if page < total_pages:
        nav.append(
            InlineKeyboardButton(
                text=TEXTS["next"],
                callback_data=next_callback(page + 1)
            )
        )

    if back_callback:
        nav.append(
            InlineKeyboardButton(
                text=TEXTS["back"],
                callback_data=back_callback
            )
        )

    if nav:
        builder.row(*nav)

    return builder.as_markup()


# =========================
# ROUTER
# =========================
def get_router(genero: str):
    router = Router(name=__name__)

    # =========================
    # /list_anime
    # =========================
    @router.message(
        Command(
            commands=Commands_Bot.create_dynamic_command(
                Commands_Bot.list_annime, prefix_str=genero
            ),
            prefix=Commands_Bot.prefixs,
        )
    )
    async def list_anime(message: Message):
        alphabet = [chr(i) for i in range(65, 91)]
        builder = InlineKeyboardBuilder()

        for letter in alphabet:
            builder.button(
                text=letter,
                callback_data=AnimeLetterCallback(letter=letter).pack()
            )

        builder.adjust(3)

        await message.answer(
            TEXTS["select_letter"],
            reply_markup=builder.as_markup()
        )

    # =========================
    # CALLBACK LETRA → LISTA DE ANIMES
    # =========================
    @router.callback_query(AnimeLetterCallback.filter())
    async def anime_letter_callback(
        callback: CallbackQuery,
        callback_data: AnimeLetterCallback
    ):
        Model = get_models(callback.bot.genero)
        letter = callback_data.letter.lower()

        stmt = (
            select(Model.origem)
            .distinct()
            .where(Model.origem.ilike(f"{letter}%"))
            .order_by(Model.origem)
        )

        async with AsyncSessionLocal() as session:
            result = await session.execute(stmt)
            animes = [row[0] for row in result.all()]

        if not animes:
            return await callback.answer(TEXTS["no_anime_found"], show_alert=True)

        keyboard = await create_paginated_keyboard(
            items=list(enumerate(animes)),
            page=1,
            per_page=14,
            columns=2,
            build_button=lambda b, item: b.button(
                text=item[1],
                callback_data=AnimeSelectCallback(
                    anime_id=item[0],
                    letter=letter
                ).pack()
            ),
            prev_callback=lambda p: AnimePageCallback(letter=letter, page=p).pack(),
            next_callback=lambda p: AnimePageCallback(letter=letter, page=p).pack(),
            back_callback="back_alphabet"
        )

        await callback.message.edit_text(
            TEXTS["animes_starting_with"].format(
                letter=letter.upper(),
                cont=len(animes)
            ),
            reply_markup=keyboard
        )

    # =========================
    # CALLBACK PAGINAÇÃO ANIMES
    # =========================
    @router.callback_query(AnimePageCallback.filter())
    async def anime_page_callback(
        callback: CallbackQuery,
        callback_data: AnimePageCallback
    ):
        Model = get_models(callback.bot.genero)
        letter = callback_data.letter.lower()
        page = callback_data.page

        stmt = (
            select(Model.origem)
            .distinct()
            .where(Model.origem.ilike(f"{letter}%"))
            .order_by(Model.origem)
        )

        async with AsyncSessionLocal() as session:
            result = await session.execute(stmt)
            animes = [row[0] for row in result.all()]

        keyboard = await create_paginated_keyboard(
            items=list(enumerate(animes)),
            page=page,
            per_page=14,
            columns=2,
            build_button=lambda b, item: b.button(
                text=item[1],
                callback_data=AnimeSelectCallback(
                    anime_id=item[0],
                    letter=letter
                ).pack()
            ),
            prev_callback=lambda p: AnimePageCallback(letter=letter, page=p).pack(),
            next_callback=lambda p: AnimePageCallback(letter=letter, page=p).pack(),
            back_callback="back_alphabet"
        )

        await callback.message.edit_reply_markup(reply_markup=keyboard)

    # =========================
    # VOLTAR AO ALFABETO
    # =========================
    @router.callback_query(lambda c: c.data == "back_alphabet")
    async def back_alphabet(callback: CallbackQuery):
        alphabet = [chr(i) for i in range(65, 91)]
        builder = InlineKeyboardBuilder()

        for letter in alphabet:
            builder.button(
                text=letter,
                callback_data=AnimeLetterCallback(letter=letter).pack()
            )

        builder.adjust(3)

        await callback.message.edit_text(
            TEXTS["select_letter"],
            reply_markup=builder.as_markup()
        )

    # =========================
    # CALLBACK SELEÇÃO DO ANIME → PERSONAGENS
    # =========================
    @router.callback_query(AnimeSelectCallback.filter())
    async def anime_select_callback(
        callback: CallbackQuery,
        callback_data: AnimeSelectCallback
    ):
        Model = get_models(callback.bot.genero)
        anime_id = callback_data.anime_id
        letter = callback_data.letter

        # Reconstrói a lista de animes
        stmt = (
            select(Model.origem)
            .distinct()
            .where(Model.origem.ilike(f"{letter}%"))
            .order_by(Model.origem)
        )

        async with AsyncSessionLocal() as session:
            result = await session.execute(stmt)
            animes = [row[0] for row in result.all()]

        anime = animes[anime_id]

        stmt = (
            select(Model.character_name)
            .distinct()
            .where(Model.origem == anime)
            .order_by(Model.character_name)
        )

        async with AsyncSessionLocal() as session:
            result = await session.execute(stmt)
            personagens = [row[0] for row in result.all()]

        if not personagens:
            return await callback.answer(TEXTS["no_character_found"], show_alert=True)

        keyboard = await create_paginated_keyboard(
            items=personagens,
            page=1,
            per_page=10,
            columns=1,
            build_button=lambda b, item: b.button(
                text=f"👤 {item}",
                switch_inline_query_current_chat=f"character:{item}"
            ),
            prev_callback=lambda p: CharacterPageCallback(
                anime_id=anime_id, letter=letter, page=p
            ).pack(),
            next_callback=lambda p: CharacterPageCallback(
                anime_id=anime_id, letter=letter, page=p
            ).pack(),
            back_callback=AnimePageCallback(letter=letter, page=1).pack()
        )

        await callback.message.edit_text(
            TEXTS["characters_from_anime"].format(anime_name=anime),
            reply_markup=keyboard
        )

    # =========================
    # CALLBACK PAGINAÇÃO PERSONAGENS
    # =========================
    @router.callback_query(CharacterPageCallback.filter())
    async def character_page_callback(
        callback: CallbackQuery,
        callback_data: CharacterPageCallback
    ):
        Model = get_models(callback.bot.genero)
        anime_id = callback_data.anime_id
        letter = callback_data.letter
        page = callback_data.page

        stmt = (
            select(Model.origem)
            .distinct()
            .where(Model.origem.ilike(f"{letter}%"))
            .order_by(Model.origem)
        )

        async with AsyncSessionLocal() as session:
            result = await session.execute(stmt)
            animes = [row[0] for row in result.all()]

        anime = animes[anime_id]

        stmt = (
            select(Model.character_name)
            .distinct()
            .where(Model.origem == anime)
            .order_by(Model.character_name)
        )

        async with AsyncSessionLocal() as session:
            result = await session.execute(stmt)
            personagens = [row[0] for row in result.all()]

        keyboard = await create_paginated_keyboard(
            items=personagens,
            page=page,
            per_page=10,
            columns=1,
            build_button=lambda b, item: b.button(
                text=f"👤 {item}",
                switch_inline_query_current_chat=f"character:{item}"
            ),
            prev_callback=lambda p: CharacterPageCallback(
                anime_id=anime_id, letter=letter, page=p
            ).pack(),
            next_callback=lambda p: CharacterPageCallback(
                anime_id=anime_id, letter=letter, page=p
            ).pack(),
            back_callback=AnimePageCallback(letter=letter, page=1).pack()
        )

        await callback.message.edit_reply_markup(reply_markup=keyboard)

    return router
