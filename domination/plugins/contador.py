import asyncio
import random
import time
from cachetools import TTLCache, LRUCache
from pyrogram import Client, filters
from pyrogram.types import *
from sqlalchemy import func, select
from datetime import datetime
from DB.models import ChatTG, PersonagemHusbando, PersonagemWaifu
from domination.uteis.add_group_in_db import add_group_in_db
from types_ import TipoCategoria, COMMAND_LIST
from uteis import format_personagem_caption, send_media_by_type, send_media_by_chat_id
from domination.logger import log_info, log_error, log_debug
from DB.database import DATABASE
from domination.message import MESSAGE
from settings import Settings

# Cache com TTL para contadores de grupos (1 hora)
message_counter: dict[str, TTLCache[int, dict]] = {
    "waifu": TTLCache(maxsize=1000, ttl=3600),
    "husbando": TTLCache(maxsize=1000, ttl=3600),
}

# Cache LRU para personagens aleatórios (evita queries repetidas)
character_cache: LRUCache[str, int] = LRUCache(maxsize=100)

# Configurações de execução
ACTIVE_GROUPS: set[int] | None = None
DROP = 100
UNDROP = DROP + 40


def clear_expired_caches():
    """Limpa caches expirados (TTLCache faz isso automaticamente, mas útil para debug)"""
    for cache in message_counter.values():
        cache.expire()
    character_cache.clear()


async def create_secret_caption(
    client, personagem, genero: TipoCategoria, chat_id: int
):
    text_appeared = MESSAGE.get_text(
        "pt",
        "contador",
        "character_appeared",
        raridade=personagem.raridade_full.emoji,
        genero=genero.value.capitalize(),
    )
    add_to_harem = MESSAGE.get_text("pt", "contador", "add_to_harem")
    dominar_command = MESSAGE.get_text("pt", "contador", "dominar_command")

    return "\n".join(
        [
            text_appeared,
            add_to_harem,
            f"/{COMMAND_LIST.DOMINAR.value} {dominar_command}",
        ]
    )


async def get_random_character(client):
    base = (
        PersonagemHusbando
        if client.genero == TipoCategoria.HUSBANDO
        else PersonagemWaifu
    )

    # Cache key baseado no tipo de personagem
    cache_key = f"{base.__tablename__}_total"

    # Verifica cache para total de personagens
    if cache_key in character_cache:
        total = character_cache[cache_key]
    else:
        total = await DATABASE.get_info_one(select(func.count()).select_from(base))
        if not total:
            return None
        character_cache[cache_key] = total

    # Gera offset aleatório
    random_offset = random.randint(0, max(int(total) - 1, 0))

    # Busca personagem específico
    per = await DATABASE.get_info_one(select(base).offset(random_offset).limit(1))
    return per


@Client.on_message(
    filters.group
    & (filters.media | filters.text)
    & ~(filters.text & filters.regex(r"^[/!.]")),
    group=1,
)
async def handle_group_messages(client: Client, message: Message):
    g = client.genero.value.lower()  # "waifu" ou "husbando"
    group_id = message.chat.id
    grp_counter = message_counter[g].get(group_id)

    if grp_counter is None:
        # Inicializa contador para novo grupo
        grp_counter = {"cont": 0, "id_mens": None, "per": None, "datetime": None}
        message_counter[g][group_id] = grp_counter

    grp_counter["cont"] += 1
    cont = grp_counter["cont"]

    # Salva o contador atualizado de volta no cache
    message_counter[g][group_id] = grp_counter
   # add_group_in_db(message=message)

    # Forçar contador inicial para grupos específicos (mantenha se necessário)
    if (
        group_id
        in [
            -1001528803759,
        ]
        and cont < 97
    ):
        cont = grp_counter["cont"] = 98
        message_counter[g][group_id] = grp_counter

    log_debug(
        f"Contador: {cont}, Grupo: {group_id}, Título: {message.chat.title}", "contador"
    )
    if cont == DROP:
        deb = f"Debug: {g}, {group_id}, {message.chat.title}, cont={cont}, mod100={cont % 100 == 0}"
        # await client.send_message(Settings().GROUP_ADDMS_ID, deb)
        log_info(deb)
        personagem = await get_random_character(client)
        if not personagem:
            grp_counter["cont"] = 80
            return print("personagem n encontado")

        msg_res: Message = await send_media_by_type(
            message,
            personagem,
            caption=await create_secret_caption(
                client, personagem, client.genero, group_id
            ),
        )

        # Atualiza estado do grupo no cache
        grp_counter["id_mens"] = msg_res.id
        grp_counter["per"] = personagem
        grp_counter["datetime"] = datetime.now()

        log_info(f"Personagem saiu: {personagem.nome_personagem}", "contador")

    # Quando o contador chega em 140, apaga a mensagem do personagem
    elif cont == UNDROP and grp_counter["id_mens"]:
        try:
            per = grp_counter["per"]
            if per:
                await client.delete_messages(group_id, grp_counter["id_mens"])
                view_text = MESSAGE.get_text("pt", "contador", "view_character")
                keyboard = InlineKeyboardMarkup(
                    [
                        [
                            InlineKeyboardButton(
                                view_text, callback_data=f"view_character_{per.id}"
                            )
                        ]
                    ]
                )
                caption = MESSAGE.get_text(
                    "pt",
                    "contador",
                    "caption",
                    nome=per.nome_personagem,
                    anime=per.nome_anime,
                    genero=g.capitalize(),
                )
                await client.send_message(group_id, caption, reply_markup=keyboard)
        finally:
            # Limpa estado do grupo após apagar
            grp_counter["cont"] = 0
            grp_counter["id_mens"] = None
            grp_counter["per"] = None
            grp_counter["datetime"] = None


@Client.on_callback_query(filters.regex(r"^view_character_\d+$"))
async def view_character_callback(client: Client, query: CallbackQuery):
    try:
        await query.message.delete()
        character_id = int(query.data.split("_")[-1])
        base = (
            PersonagemHusbando
            if client.genero == TipoCategoria.HUSBANDO
            else PersonagemWaifu
        )
        stmt = select(base).where(base.id == character_id)
        personagem = await DATABASE.get_info_one(stmt)

        if not personagem:
            return await query.answer("❌ Personagem não encontrado!", show_alert=True)

        character_info, clicked_text = (
            MESSAGE.get_text(
                "pt",
                "contador",
                "character_info",
                character_name=personagem.nome_personagem,
                anime_name=personagem.nome_anime,
                rarity=f"{personagem.raridade_full.emoji} {personagem.raridade_full.nome}",
            ),
            MESSAGE.get_text(
                "pt",
                "contador",
                "character_clicked_by",
                user_mention=query.from_user.mention,
                character_info=format_personagem_caption(personagem),
            ),
        )

        await send_media_by_chat_id(
            client=client,
            chat_id=query.message.chat.id,
            personagem=personagem,
            caption=clicked_text,
            reply_to_message_id=query.message.id,
        )

        await query.answer("✅ Personagem enviado!")

    except Exception as e:
        log_error(f"Erro ao visualizar personagem: {e}", "contador", exc_info=True)
        await query.answer("❌ Erro ao carregar personagem!", show_alert=True)


@Client.on_callback_query(filters.regex(r"^clear_msg"))
async def apagar_harem(client: Client, callback_query: CallbackQuery):
    try:
        await callback_query.message.delete()
    except:
        pass
    await callback_query.answer()
