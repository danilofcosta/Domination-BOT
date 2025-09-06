from typing import List
from pyrogram import Client, filters
from pyrogram.types import Message, InlineKeyboardMarkup, InlineKeyboardButton, CallbackQuery
from sqlalchemy import select, func
from DB.models import Usuario, PersonagemWaifu, PersonagemHusbando
from domination.lang_utils import obter_mensagem_chat
from domination.uteis import dynamic_command_filter,COMMAND_LIST
from types_ import TipoCategoria, ModoHarem
from collections import defaultdict

# Inicializa cache de páginas no Client
if not hasattr(Client, "pages_cache"):
    Client.pages_cache = {}


async def create_harem_pages_ref(session, colecoes, genero):
    """
    Cria páginas do harém com contagem correta do banco.
    """
    db_model = PersonagemHusbando if genero == TipoCategoria.HUSBANDO else PersonagemWaifu
    anime_groups = defaultdict(lambda: {"personagens": [], "total_colecao": 0, "total_banco": 0})
    personagem_counts = defaultdict(int)

    for colecao in colecoes:
        personagem_counts[colecao.character.id] += 1

    personagens_vistos = set()
    for colecao in colecoes:
        char_id = colecao.character.id
        anime = colecao.character.nome_anime
        if char_id in personagens_vistos:
            continue
        personagens_vistos.add(char_id)

        anime_groups[anime]["personagens"].append({
            "id": char_id,
            "nome": colecao.character.nome_personagem,
            "raridade": colecao.character.raridade_full.emoji,
            "evento": f"[{colecao.character.evento_full.emoji}]" if colecao.character.evento_full else "",
            "count": personagem_counts[char_id],
        })
        anime_groups[anime]["total_colecao"] += 1

    for anime in anime_groups.keys():
        stmt = select(func.count(db_model.id)).where(db_model.nome_anime == anime)
        result = await session.execute(stmt)
        total = result.scalar() or 1
        anime_groups[anime]["total_banco"] = total

    sorted_animes = sorted(anime_groups.keys())
    pages, current_page, current_length, max_length = [], [], 0, 1000

    for anime in sorted_animes:
        anime_data = anime_groups[anime]
        header = f"☛ {anime} {anime_data['total_colecao']}/{anime_data['total_banco']}\n" + "✧" * 16 + "\n"
        characters_text = "".join(
            f"➢ ꙳ {char['id']} ꙳ {char['raridade']} ꙳ {char['nome']} {char['evento']} {char['count']}x\n"
            for char in anime_data["personagens"]
        )
        anime_text = header + characters_text + "✧" * 16 + "\n"

        if current_length + len(anime_text) > max_length and current_page:
            pages.append("\n".join(current_page))
            current_page = [anime_text]
            current_length = len(anime_text)
        else:
            current_page.append(anime_text)
            current_length += len(anime_text)

    if current_page:
        pages.append("\n".join(current_page))

    return pages


def build_harem_keyboard(user_id, genero, current_page, total_pages):
    keyboard = []
    if total_pages > 1:
        nav_row = []
        if current_page > 0:
            nav_row.append(InlineKeyboardButton("◀️", callback_data=f"page_{user_id}_{genero}_{current_page-1}"))
        nav_row.append(InlineKeyboardButton(f"{current_page + 1}/{total_pages}", callback_data="page_info"))
        if current_page < total_pages - 1:
            nav_row.append(InlineKeyboardButton("▶️", callback_data=f"page_{user_id}_{genero}_{current_page+1}"))
        keyboard.append(nav_row)

    keyboard.extend([
        [InlineKeyboardButton("🌐", switch_inline_query_current_chat=f"user.harem.{user_id}")],
        [InlineKeyboardButton("🗑", callback_data=f"apagarharem_{user_id}")]
    ])
    return InlineKeyboardMarkup(keyboard)



@Client.on_message(
    filters.create(
        name=f"comand{' '.join(COMMAND_LIST.HAREM.value)}",
        func=dynamic_command_filter,
        command=COMMAND_LIST.HAREM.value,
    )
)
@Client.on_message(filters.command(COMMAND_LIST.HAREM.value) & filters.private)
async def harem(client: Client, message: Message):
    user_id = message.from_user.id
    genero = client.genero

    async with await client.get_reusable_session() as session:
        stmt = select(Usuario).where(Usuario.telegram_id == user_id)
        result = await session.execute(stmt)
        usuario: Usuario = result.scalar_one_or_none()

        if not usuario:
            await message.reply_text("❌ Você ainda não está registrado!\nUse o comando /myinfos para se registrar.")
            return

        configs = usuario.configs_h if genero == TipoCategoria.HUSBANDO else usuario.configs_w
        modo_harem = configs.get("modo_harem", ModoHarem.PADRAO.value) if configs else ModoHarem.PADRAO.value

        has_fav = usuario.fav_h_id if genero == TipoCategoria.HUSBANDO else usuario.fav_w_id
        if not has_fav:
            await message.reply_text("❌ Você ainda não tem um personagem favorito!")
            return

        fav_info = usuario.fav_h_character if genero == TipoCategoria.HUSBANDO else usuario.fav_w_character
        colecoes = usuario.colecoes_husbando if genero == TipoCategoria.HUSBANDO else usuario.colecoes_waifu

        if modo_harem == ModoHarem.PADRAO.value:
            pages = await create_harem_pages_ref(session, colecoes, genero)
            if not pages:
                await message.reply_text("❌ Nenhum personagem encontrado na sua coleção!")
                return

            # Armazena as páginas no client
            if user_id not in client.pages_cache:
                client.pages_cache[user_id] = {}
            client.pages_cache[user_id][genero.value] = pages

            current_page = 0
            caption = f"{message.from_user.mention} ๛Harem ツ\n\n{pages[current_page]}"
            reply_markup = build_harem_keyboard(user_id, genero.value, current_page, len(pages))
            await message.reply_photo(fav_info.data, caption=caption, reply_markup=reply_markup)
        else:
            await message.reply_photo(fav_info.data, f"h{len(colecoes)}")


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

    new_page = max(0, min(new_page, len(pages)-1))
    caption = f"๛Harem ツ\n\n{pages[new_page]}"
    reply_markup = build_harem_keyboard(user_id, genero, new_page, len(pages))

    try:
        await callback_query.edit_message_caption(caption=caption, reply_markup=reply_markup)
    except Exception as e:
        await callback_query.answer(f"❌ Erro: {e}")

@Client.on_callback_query(filters.regex(r"^page_(\d+)_(\w+)_(\d+)$"))
async def navigate_harem_page(client: Client, callback_query: CallbackQuery):
    user_id = int(callback_query.matches[0].group(1))
    genero = callback_query.matches[0].group(2)
    new_page = int(callback_query.matches[0].group(3))

    if callback_query.from_user.id != user_id:
        await callback_query.answer(await obter_mensagem_chat(client, callback_query.message.chat.id, "erros", "error_cannot_use_button"))
        return

    pages = client.pages_cache.get(user_id, {}).get(genero)
    if not pages:
        await callback_query.answer(await obter_mensagem_chat(client, callback_query.message.chat.id, "erros", "error_pages_expired"))
        return

    new_page = max(0, min(new_page, len(pages)-1))
    caption = f"{await obter_mensagem_chat(client, callback_query.message.chat.id, 'harem', 'title')}\n\n{pages[new_page]}"
    reply_markup = await build_harem_keyboard(client, callback_query.message.chat.id, user_id, genero, new_page, len(pages))

    try:
        await callback_query.edit_message_caption(caption=caption, reply_markup=reply_markup)
    except Exception as e:
        await callback_query.answer(await obter_mensagem_chat(client, callback_query.message.chat.id, "general", "error", error=e))


@Client.on_callback_query(filters.regex(r"^apagarharem_(\d+)$"))
async def apagar_harem(client: Client, callback_query: CallbackQuery):
    user_id = int(callback_query.matches[0].group(1))
    if callback_query.from_user.id != user_id:
        await callback_query.answer(await obter_mensagem_chat(client, callback_query.message.chat.id, "erros", "error_cannot_use_button"))
        return

    try:
        await callback_query.message.delete()
        await callback_query.answer(await obter_mensagem_chat(client, callback_query.message.chat.id, "harem", "deleted"))
        # Remove do cache
        if user_id in client.pages_cache:
            client.pages_cache.pop(user_id)
    except Exception as e:
        await callback_query.answer(await obter_mensagem_chat(client, callback_query.message.chat.id, "general", "error", error=e))


@Client.on_callback_query(filters.regex(r"^page_info$"))
async def page_info(client: Client, callback_query: CallbackQuery):
    await callback_query.answer((await obter_mensagem_chat(client, callback_query.message.chat.id, "harem", "navigation"))["page_info"])
