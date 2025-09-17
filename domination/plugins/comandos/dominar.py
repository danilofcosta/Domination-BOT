import asyncio
import json
from datetime import datetime
from typing import List

from pyrogram import Client, filters
from pyrogram.types import InlineKeyboardMarkup, InlineKeyboardButton, Message
from sqlalchemy import select

from DB.database import DATABASE
from DB.models import (
    PersonagemHusbando,
    PersonagemWaifu,
    Usuario,
    ColecaoUsuarioHusbando,
    ColecaoUsuarioWaifu,
)
from domination.message import MESSAGE
from types_ import TipoCategoria, TipoPerfil, COMMAND_LIST

from domination.logger import log_info, log_error, log_debug
from uteis import add_per_coletion


# ==============================
# Função auxiliar: valida nome
# ==============================
def _validar_nome_personagem(nome_personagem: str, argumentos: List[str]) -> bool:
    """
    Retorna True se todos os argumentos válidos (>=3 caracteres) estiverem presentes no nome do personagem.
    Comparação case-insensitive.
    """
    nome_lower = nome_personagem.casefold().split()
    argumentos_validos = [arg.casefold() for arg in argumentos if len(arg) >= 3]

    if not argumentos_validos:
        return False

    return all(arg in nome_lower for arg in argumentos_validos)


# ==============================
# Função auxiliar: calcula tempo
# ==============================
def tempo_gasto(start_time: datetime) -> str:
    if not isinstance(start_time, datetime):
        return "0s"
    total_segundos = int((datetime.now() - start_time).total_seconds())
    horas = total_segundos // 3600
    minutos = (total_segundos % 3600) // 60
    segundos = total_segundos % 60
    if horas > 0:
        return f"{horas}h {minutos}m {segundos}s"
    elif minutos > 0:
        return f"{minutos}m {segundos}s"
    else:
        return f"{segundos}s"


# ==============================
# Handler principal
# ==============================
@Client.on_message(filters.group & filters.command(COMMAND_LIST.DOMINAR.value))
async def handle_dominar(client: Client, message: Message):
    from domination.plugins.contador import message_counter

    group_id = message.chat.id
    g = client.genero.value  # husbando ou waifu

    # Verifica personagem ativo
    if (
        g not in message_counter
        or group_id not in message_counter[g]
        or not message_counter[g][group_id]["per"]
    ):
        return

    if len(message.command) < 2:
        await message.reply(MESSAGE.get_text("pt", "contador", "use_dominar"))
        return

    nome_user = " ".join(message.command[1:])
    per = message_counter[g][group_id]["per"]
    per_n: str = per.nome_personagem

    # Valida o nome
    if not _validar_nome_personagem(per_n, nome_user.split()):
        msg = await message.reply(MESSAGE.get_text("pt", "contador", "wrong_character"))
        await asyncio.sleep(20)

        # deleta a mensagem de aviso
        await msg.delete()
        return

    # Cabeçalho e infos do personagem
    genero_texto = client.genero.value.capitalize()
    cabeçario_task = MESSAGE.get_text(
        "pt",
        "contador",
        "new_character",
        user_mention=message.from_user.mention,
        genero=genero_texto,
    )
    name_task = MESSAGE.get_text(
        "pt", "contador", "name", name=per.nome_personagem.title()
    )
    source_task = MESSAGE.get_text(
        "pt", "contador", "source", source=per.nome_anime.title()
    )
    rarity_task = MESSAGE.get_text(
        "pt",
        "contador",
        "rarity",
        rarity_emoji=per.raridade_full.emoji,
        rarity_name=per.raridade_full.nome.capitalize(),
    )
    time_task = MESSAGE.get_text(
        "pt",
        "contador",
        "time_spent",
        time=tempo_gasto(message_counter[g][group_id]["datetime"]),
    )

    cabeçario, name_text, source_text, rarity_text, time_text = (
        cabeçario_task,
        name_task,
        source_task,
        rarity_task,
        time_task,
    )

    cap = "\n".join([f"{cabeçario}\n", name_text, source_text, rarity_text, time_text])

    # Serializa usuário Telegram
    telegram_from_user_json = json.dumps(
        {
            "id": message.from_user.id,
            "first_name": message.from_user.first_name,
            "last_name": message.from_user.last_name,
            "username": message.from_user.username,
            "is_bot": message.from_user.is_bot,
        },
        ensure_ascii=False,
    )

    # ==============================
    # Salva usuário/coleção no banco
    # ==============================
    fav_id = per.id
    user = Usuario(
        telegram_id=message.from_user.id,
        telegram_from_user=telegram_from_user_json,
        fav_h_id=fav_id if client.genero == TipoCategoria.HUSBANDO else None,
        fav_w_id=fav_id if client.genero == TipoCategoria.WAIFU else None,
        perfil_status=TipoPerfil.USUARIO,
    )

    if not await add_per_coletion(
        from_user_id=user.telegram_id,
        id_char=fav_id,
        colecao_class=(
            ColecaoUsuarioHusbando
            if client.genero == TipoCategoria.HUSBANDO
            else ColecaoUsuarioWaifu
        ),
        user=user,
    ):
        return message.reply("erro ao add per ")

    # ==============================
    # Envia mensagem com botão inline
    # ==============================
    inline_button_text = MESSAGE.get_text("pt", "contador", "inline_button")
    await message.reply(
        cap,
        quote=True,
        reply_markup=InlineKeyboardMarkup(
            [
                [
                    InlineKeyboardButton(
                        inline_button_text,
                        switch_inline_query_current_chat=f"user.harem.{message.from_user.id}",
                    )
                ]
            ]
        ),
    )

    # Reseta contador de forma segura
    message_counter[g][group_id] = {
        "cont": 0,
        "id_mens": None,
        "per": None,
        "datetime": None,
        "keyboard": None,
    }
