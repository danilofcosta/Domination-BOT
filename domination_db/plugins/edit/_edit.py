# domination_edit.py
from pyrogram import Client, filters
from pyrogram.types import Message, CallbackQuery, InlineKeyboardMarkup, InlineKeyboardButton
from sqlalchemy import select
import re

from DB.database import DATABASE
from DB.models import (
    PersonagemHusbando,
    PersonagemWaifu,
    Raridade_Midia,
    Evento_Midia,
)
from types_ import COMMAND_LIST_DB, TipoCategoria, TipoEvento, TipoRaridade, TipoMidia
from uteis import (

    dynamic_command_filter,
    send_media_by_chat_id,
    check_admin_group,
    re_linhas,
)
from domination_db.plugins.edit.uteis_edit import bts_edit, create_cap_edit_Show
from settings import Settings
# ------ S---------- Inicializa cache ----------------
if not hasattr(Client, "edit_cache"):
    Client.edit_cache = {}



# ---------------- Comando /editchar ----------------
@Client.on_message(
    filters.create(
        name=f"comand{' '.join(COMMAND_LIST_DB.EDITCHAR.value)}",
        func=dynamic_command_filter,
        command=COMMAND_LIST_DB.EDITCHAR.value,
    )
)
@Client.on_message(filters.command(COMMAND_LIST_DB.EDITCHAR.value)& filters.private)
async def editchar_command(client: Client, message: Message):
    user_id = message.from_user.id
    settings = Settings()

    # Verifica se o usuário é admin
    if not await check_admin_group(client=client, user_id=user_id, chat_id=settings.GROUP_ADDMS_ID):
        return await message.reply("Você não é admin do grupo!")

    # Extrai ID
    char_id = None
    if message.reply_to_message:
        text = message.reply_to_message.caption or message.reply_to_message.text
        if text:
            id_match = re.search(r"ID[:\s]+(\d+)", text)
            if id_match:
                char_id = int(id_match.group(1))
            else:
                numeros = re.findall(r"\d+", text)
                if numeros:
                    char_id = int(numeros[-1])
    elif len(message.command) >= 2:
        try:
            char_id = int(message.command[1])
        except ValueError:
            return await message.reply("ID inválido!")

    if char_id is None:
        return await message.reply(f"Use /{COMMAND_LIST_DB.EDITCHAR.value} <id> ou reply a mensagem")

    # Define base do gênero
    base_per = PersonagemHusbando if client.genero == TipoCategoria.HUSBANDO else PersonagemWaifu
    personagem = await DATABASE.get_id_primary(base_per, char_id)
    if not personagem:
        return await message.reply(f"Personagem {char_id} não encontrado!")

    # Inicializa cache
    user_cache = Client.edit_cache.setdefault(user_id, {})
    gen_cache = user_cache.setdefault(client.genero.value, {})
    gen_cache[char_id] = {"per_edit": personagem, "edit": None}

    # Envia mensagem com botões
    msg = await send_media_by_chat_id(
        client=client,
        personagem=personagem,
        chat_id=message.chat.id,
        caption="\n".join(create_cap_edit_Show(personagem)),
        reply_markup=InlineKeyboardMarkup(bts_edit(personagem.id)),
    )
    gen_cache[char_id]["id_msg_edit"] = msg.id

