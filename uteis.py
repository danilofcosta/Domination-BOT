from ctypes import Union
import json
from typing import Optional
from pyrogram.types import *
from pyrogram import Client, filters
from pyrogram.enums import *
from sqlalchemy import select
from DB.database import DATABASE
from DB.models import (
    ColecaoUsuarioHusbando,
    ColecaoUsuarioWaifu,
    PersonagemHusbando,
    PersonagemWaifu,
    Usuario,
)
from types_ import TipoCategoria, TipoEvento, TipoMidia
from enum import Enum as PyEnum
from domination.logger import log_info, log_error, log_debug
from pyrogram.enums import ChatType, ChatMemberStatus

PREXIFOS = ["/", ".", "!"]


def create_bts_y_or_n(
    prefix: str,
    callback_data_true: str,
    callback_data_false: str,
    text_tru="✅",
    text_false="❌",
):
    keyboard = [
        [
            InlineKeyboardButton(
                text_tru, callback_data=f"{prefix}_{callback_data_true}"
            ),
            InlineKeyboardButton(
                text_false, callback_data=f"{prefix}_{callback_data_false}"
            ),
        ]
    ]
    return InlineKeyboardMarkup(keyboard)


def format_personagem_caption(
    personagem: PersonagemWaifu | PersonagemHusbando, user=None, mention: str = None
):
    """Gera legenda do personagem com limite de 1024 caracteres"""
    nome: str = personagem.nome_personagem.capitalize()
    anime: str = personagem.nome_anime.capitalize()

    # Raridade
    if personagem.raridade_full:
        raridade = f"{personagem.raridade_full.emoji or ''} {personagem.raridade_full.cod.value.capitalize()}"
    else:
        raridade = (
            personagem.raridade.value.capitalize()
            if personagem.raridade
            else "Desconhecida"
        )

    # Evento
    if personagem.evento_full and personagem.evento != TipoEvento.SEM_EVENTO:
        evento = f"{personagem.evento_full.emoji or ''} {scriptify(personagem.evento_full.nome_traduzido.value.capitalize())} {personagem.evento_full.emoji or ''}"
    else:
        evento = (
            scriptify(personagem.evento.value.capitalize())
            if personagem.evento and personagem.evento != TipoEvento.SEM_EVENTO
            else ""
        )
    e = "essa" if personagem.genero == TipoCategoria.WAIFU else "esse"
    head = (
        f"Wow! veja {e} {personagem.genero.value.capitalize()}\n\n"
        if not user
        else f"Wow! Confira {e}  {personagem.genero.value.capitalize()} de {user}\n\n"
    )
    mention = f"\n➼ ᴀᴅᴅ: {mention}" if mention else ""
    caption = (
        f"{head}"
        f"<b>{anime.capitalize()}</b>\n"
        f"<b>{personagem.id}</b> : {nome.capitalize()}\n"
        f"<b>{raridade}</b>\n\n"
        f"{evento}"
        f"{mention}"
    )

    # log_debug(f"Caption formatado: {caption}", "uteis")
    return "".join(caption)


async def send_media_by_type(
    message: Message, personagem, caption: str, reply_markup=None
):
    """
    Função que verifica o tipo de mídia do personagem e envia de acordo.

    Args:
        client: Cliente do Pyrogram
        message: Mensagem original
        personagem: Objeto do personagem com data e tipo_midia
        caption: Legenda da mensagem
        reply_markup: Teclado inline (opcional)
    """
    try:
        if personagem.tipo_midia == TipoMidia.IMAGEM_URL:
            return await message.reply_photo(
                photo=personagem.data,
                caption=caption,
                reply_markup=reply_markup,
                quote=True,
            )
        elif personagem.tipo_midia == TipoMidia.IMAGEM_FILEID:
            return await message.reply_photo(
                photo=personagem.data,
                caption=caption,
                reply_markup=reply_markup,
                quote=True,
            )
        elif personagem.tipo_midia == TipoMidia.IMAGEM_BYTES:
            return await message.reply_photo(
                photo=personagem.data,
                caption=caption,
                reply_markup=reply_markup,
                quote=True,
            )
        elif personagem.tipo_midia == TipoMidia.IMAGEM_ARQUIVO:
            return await message.reply_photo(
                photo=personagem.data,
                caption=caption,
                reply_markup=reply_markup,
                quote=True,
            )
        elif personagem.tipo_midia == TipoMidia.IMAGEM_BASE64:
            return await message.reply_photo(
                photo=personagem.data,
                caption=caption,
                reply_markup=reply_markup,
                quote=True,
            )
        elif personagem.tipo_midia == TipoMidia.VIDEO_BYTES:
            return await message.reply_video(
                video=personagem.data,
                caption=caption,
                reply_markup=reply_markup,
                quote=True,
            )
        elif personagem.tipo_midia == TipoMidia.VIDEO_BASE64:
            return await message.reply_video(
                video=personagem.data,
                caption=caption,
                reply_markup=reply_markup,
                quote=True,
            )
        elif personagem.tipo_midia == TipoMidia.VIDEO_ARQUIVO:
            return await message.reply_video(
                video=personagem.data,
                caption=caption,
                reply_markup=reply_markup,
                quote=True,
            )
        elif personagem.tipo_midia == TipoMidia.VIDEO_URL:
            return await message.reply_video(
                video=personagem.data,
                caption=caption,
                reply_markup=reply_markup,
                quote=True,
            )
        elif personagem.tipo_midia == TipoMidia.VIDEO_FILEID:
            return await message.reply_video(
                video=personagem.data,
                caption=caption,
                reply_markup=reply_markup,
                quote=True,
            )
        else:
            return await message.reply_photo(
                photo=personagem.data,
                caption=caption,
                reply_markup=reply_markup,
                quote=True,
            )
    except Exception as e:
        return await message.reply(
            # f"{caption}\n\n📎 Mídia: {personagem.tipo_midia.value}",
            e,
            reply_markup=reply_markup,
            quote=True,
        )


async def send_media_by_chat_id(
    client: Client, chat_id: int, personagem, caption: str, reply_markup=None, **kwargs
):
    """
    Função que verifica o tipo de mídia do personagem e envia de acordo
    diretamente para um chat_id (sem depender de reply_to_message).

    Args:
        client: Cliente do Pyrogram
        chat_id: ID do chat onde será enviada a mídia
        personagem: Objeto do personagem com data e tipo_midia
        caption: Legenda da mensagem
        reply_markup: Teclado inline (opcional)
    """
    try:
        if personagem.tipo_midia in [
            TipoMidia.IMAGEM_URL,
            TipoMidia.IMAGEM_FILEID,
            TipoMidia.IMAGEM_BYTES,
            TipoMidia.IMAGEM_ARQUIVO,
            TipoMidia.IMAGEM_BASE64,
        ]:
            return await client.send_photo(
                chat_id=chat_id,
                photo=personagem.data,
                caption=caption,
                reply_markup=reply_markup,
                **kwargs,
            )
        elif personagem.tipo_midia in [
            TipoMidia.VIDEO_URL,
            TipoMidia.VIDEO_FILEID,
            TipoMidia.VIDEO_BYTES,
            TipoMidia.VIDEO_ARQUIVO,
            TipoMidia.VIDEO_BASE64,
        ]:
            return await client.send_video(
                chat_id=chat_id,
                video=personagem.data,
                caption=caption,
                reply_markup=reply_markup,
                **kwargs,
            )
        else:
            # fallback para imagem caso não seja reconhecido
            return await client.send_photo(
                chat_id=chat_id,
                photo=personagem.data,
                caption=caption,
                reply_markup=reply_markup,
                **kwargs,
            )
    except Exception as e:
        # fallback: envia só o texto com info da mídia
        return await client.send_message(
            chat_id=chat_id,
            text=f"{caption}\n\n📎 Mídia: {personagem.tipo_midia.value}",
            reply_markup=reply_markup,
            **kwargs,
        )


def dynamic_command_filter(filter, client: Client, message: Message) -> bool:

    comandos_esperados = []
    if not message.text:
        return False
    # Pega o que você passou em filters.create(..., commands="fav")
    comando = getattr(filter, "command", None)
    if comando:
        if type(comando) is list:
            comandos_esperados.extend(
                [f"{client.genero.value[0].lower()}{c.lower()}" for c in comando]
            )
        else:
            comandos_esperados.append(f"{client.genero.value[0].lower()}{comando}")

    text_lower_f = message.text.lower()
    for comando in comandos_esperados:
        for pre in PREXIFOS:
            text_lower = text_lower_f.split()[0].split("@")[0]
            if text_lower == f"{pre}{comando}":
                log_debug(f"Texto em lowercase: {text_lower}", "uteis")
                excluido_prefixo = text_lower_f.replace(pre, "", 1).split(" ")
                message.command = excluido_prefixo
                log_debug(f"Comando processado: {excluido_prefixo}", "uteis")
                return True
        # if text_lower.startswith(f"{pre}{comando}") :
        #    excluido_prefixo = text_lower.replace(pre, "", 1).split(" ")
        #   message.command = excluido_prefixo  # ['fav', '506']
        #    return True

    return False


async def get_first_photo_file_id(app: Client, user_id: int) -> str | None:
    """Retorna o file_id da primeira foto do usuário/chat."""
    async for photo in app.get_chat_photos(user_id):
        return photo.file_id
    return None


def re_linhas(lista: list, tamanho: int = 3) -> list:
    return [lista[i : i + tamanho] for i in range(0, len(lista), tamanho)]


def create_bt_clear() -> InlineKeyboardButton:
    return InlineKeyboardButton(f"🗑", callback_data=f"clear_msg")


def create_prelist(base_enum, key: str) -> dict:
    prelist = {}
    for num, enum in enumerate(base_enum, start=0):
        prelist[f"{key}{num}"] = enum
    return prelist


def create_one_bt(
    text: str,
    callback_data: str = None,
    url: str = None,
    user_id: int = None,
    switch_inline_query: str = None,
    switch_inline_query_current_chat: str = None,
) -> InlineKeyboardButton:
    return InlineKeyboardButton(
        text=text,
        callback_data=callback_data,
        url=url,
        user_id=user_id,
        switch_inline_query=switch_inline_query,
        switch_inline_query_current_chat=switch_inline_query_current_chat,
    )


async def check_admin_group(client: Client = None, chat_id=None, user_id=None) -> bool:
    if not chat_id:
        try:
            from settings import Settings

            chat_id = int(Settings().GROUP_ADDMS_ID)
        except Exception as e:
            raise f"erro ao obter caht adm {e}"
    try:
        chat_member = await client.get_chat_member(chat_id=chat_id, user_id=user_id)
    except Exception as e:
        log_error(
            f"Erro ao verificar admin no grupo {chat_id} {user_id}: {e}",
            "uteis",
            exc_info=True,
        )
        return False
    if chat_member.status in [
        ChatMemberStatus.OWNER,
        ChatMemberStatus.ADMINISTRATOR,
    ]:
        return True
    else:
        return False


def scriptify(text: str):
    """ """
    # Dicionário para mapear letras minúsculas e maiúsculas para estilo manuscrito Unicode
    script_map = {
        "a": "𝒂",
        "b": "𝒃",
        "c": "𝒄",
        "d": "𝒅",
        "e": "𝒆",
        "f": "𝒇",
        "g": "𝒈",
        "h": "𝒉",
        "i": "𝒊",
        "j": "𝒋",
        "k": "𝒌",
        "l": "𝒍",
        "m": "𝒎",
        "n": "𝒏",
        "o": "𝒐",
        "p": "𝒑",
        "q": "𝒒",
        "r": "𝒓",
        "s": "𝒔",
        "t": "𝒕",
        "u": "𝒖",
        "v": "𝒗",
        "w": "𝒘",
        "x": "𝒙",
        "y": "𝒚",
        "z": "𝒛",
        "A": "𝑨",
        "B": "𝑩",
        "C": "𝑪",
        "D": "𝑫",
        "E": "𝑬",
        "F": "𝑭",
        "G": "𝑮",
        "H": "𝑯",
        "I": "𝑰",
        "J": "𝑱",
        "K": "𝑲",
        "L": "𝑳",
        "M": "𝑴",
        "N": "𝑵",
        "O": "𝑶",
        "P": "𝑷",
        "Q": "𝑸",
        "R": "𝑹",
        "S": "𝑺",
        "T": "𝑻",
        "U": "𝑼",
        "V": "𝑽",
        "W": "𝑾",
        "X": "𝑿",
        "Y": "𝒀",
        "Z": "𝒁",
    }

    # Converte o texto para estilo manuscrito Unicode
    return "".join(script_map.get(char, char) for char in text)


async def check_mentions(client: Client, message: Message) -> Optional[List[int]]:
    if not message.entities:
        return None

    user_ids: List[int] = []

    for entity in message.entities:
        if entity.type == MessageEntityType.MENTION:  # @username
            username = message.text[entity.offset : entity.offset + entity.length]
            try:
                user = await client.get_users(username)
                user_ids.append(user.id)
            except Exception:
                continue

        elif entity.type == MessageEntityType.TEXT_MENTION:  # [Nome](tg://user?id=...)
            if entity.user:
                user_ids.append(entity.user.id)

    return user_ids if user_ids else None


async def add_per_coletion(
    from_user_id: int,
    id_char: int,
    colecao_class: ColecaoUsuarioHusbando | ColecaoUsuarioWaifu,
    user: Usuario | None = None,
):
    objs = []
    # Verifica se usuário existe
    result = select(Usuario).where(Usuario.telegram_id == from_user_id)
    user_exist = await DATABASE.get_info_one(result)
    if not user_exist:
        objs.append(user)

        # await DATABASE.add_object(user)

    objs.append(colecao_class(telegram_id=from_user_id, id_global=id_char))

    try:
        return await DATABASE.add_object_commit(objs)

    except Exception as e:
        log_error(f"Erro ao salvar usuário/coleção: {e}", "dominar", exc_info=True)
        return None


def create_telegram_from_user_json(message: Message) -> dict:
    return json.dumps(
        {
            "id": message.from_user.id,
            "first_name": message.from_user.first_name,
            "last_name": message.from_user.last_name,
            "username": message.from_user.username,
            "is_bot": message.from_user.is_bot,
        },
        ensure_ascii=False,
    )
