from pyrogram import Client, filters
from pyrogram.types import CallbackQuery, InlineKeyboardMarkup, InlineKeyboardButton
from sqlalchemy import select
from DB.database import DATABASE
from DB.models import Evento_Midia, PersonagemHusbando, PersonagemWaifu, Raridade_Midia
from domination_db.plugins.edit.uteis_edit import bts_edit, create_cap_edit_Show
from types_ import COMMAND_LIST_DB, TipoEvento, TipoRaridade
from uteis import re_linhas
from datetime import datetime

# ---------------- Escolher editar raridade ou evento ----------------
@Client.on_callback_query(
    filters.regex(rf"^{COMMAND_LIST_DB.EDITCHAR.value}_(raridade|evento)_(\d+)$")
)
async def escolher_raridade_evento(client: Client, callback_query: CallbackQuery):
    _, campo, id_str = callback_query.data.split("_")
    user_id = callback_query.from_user.id
    char_id = int(id_str)

    user_cache = Client.edit_cache.get(user_id, {})
    genero_cache = user_cache.get(client.genero.value, {})
    personagem_data = genero_cache.get(char_id)

    if not personagem_data:
        return await callback_query.answer(
            "❌ Personagem não encontrado no cache!", show_alert=True
        )

    # Busca opções de raridade ou evento
    registros = (
        await DATABASE.get_info_all(select(Raridade_Midia))
        if campo == "raridade"
        else await DATABASE.get_info_all(select(Evento_Midia))
    )

    # Gera botões
    buttons = []
    personagem_atual = personagem_data["per_edit"]

    for num, ev in enumerate(registros):

        # Verifica se é o valor atual do personagem
        valor_atual = (
            personagem_atual.raridade
            if campo == "raridade"
            else personagem_atual.evento
        )
        check = "✅" if ev.cod == valor_atual else ""
        if num == 0 and campo != "raridade":

            label = f"{TipoEvento.SEM_EVENTO} {check}"

            buttons.append(
                InlineKeyboardButton(
                    label[:25].capitalize(),
                    callback_data=f"{COMMAND_LIST_DB.EDITCHAR.value}_set_{campo}_{TipoEvento.SEM_EVENTO.value}_{id_str}",
                )
            )

        label = f"{(ev.cod or '').strip()} | {ev.emoji} {check}"
        buttons.append(
            InlineKeyboardButton(
                label[:25].capitalize(),
                callback_data=f"{COMMAND_LIST_DB.EDITCHAR.value}_set_{campo}_{ev.cod.value}_{id_str}",
            )
        )

    # Adiciona botão de voltar
    from uteis import create_one_bt

    buttons.append(
        create_one_bt(
            text="⬅ Voltar",
            callback_data=f"{COMMAND_LIST_DB.EDITCHAR.value}_back_{id_str}",
        )
    )

    cap = f"<b>{campo.capitalize()}</b>: selecione para editar"
    await callback_query.edit_message_caption(
        caption=cap,
        reply_markup=InlineKeyboardMarkup(re_linhas(buttons)),
    )
    await callback_query.answer()


# ---------------- Definir raridade ou evento ----------------
@Client.on_callback_query(
    filters.regex(
        rf"^{COMMAND_LIST_DB.EDITCHAR.value}_set_(raridade|evento)_(\w+)_(\d+)$"
    )
)
async def definir_raridade_evento(client: Client, callback_query: CallbackQuery):
    _, _, campo, cod, id_str = callback_query.data.split("_")
    user_id = callback_query.from_user.id
    char_id = int(id_str)

    user_cache = Client.edit_cache.get(user_id, {})
    genero_cache = user_cache.get(client.genero.value, {})
    personagem_data = genero_cache.get(char_id)

    if not personagem_data:
        return await callback_query.answer(
            "❌ Personagem não encontrado no cache!", show_alert=True
        )

    # Atualiza no objeto em cache
    if campo == "evento":
        personagem_data["per_edit"].evento = TipoEvento(cod)
    elif campo == "raridade":
        personagem_data["per_edit"].raridade = TipoRaridade(cod)

    # Atualiza cache explicitamente
    genero_cache[char_id] = personagem_data

    # Atualiza mensagem
    msg_id = personagem_data.get("id_msg_edit")
    if msg_id:
        await client.edit_message_caption(
            chat_id=callback_query.message.chat.id,
            message_id=msg_id,
            caption="\n".join(create_cap_edit_Show(personagem_data["per_edit"])),
            reply_markup=InlineKeyboardMarkup(bts_edit(personagem_data["per_edit"].id)),
        )
    await callback_query.answer("✅ Alteração aplicada no cache!")
