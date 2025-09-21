from pyrogram import Client, filters
from pyrogram.types import Message, CallbackQuery, InlineKeyboardMarkup
from types_ import COMMAND_LIST_DB
from uteis import create_one_bt
from domination_db.plugins.edit.uteis_edit import bts_edit, create_cap_edit_Show
from DB.models import PersonagemHusbando
from domination.logger import log_error

@Client.on_callback_query(
    filters.regex(rf"^{COMMAND_LIST_DB.EDITCHAR.value}_(nome|anime)_(\d+)$")
)
async def editchar_callback(client: Client, callback_query: CallbackQuery):
    match = callback_query.data.split("_")
    if len(match) < 3:
        return await callback_query.answer("Callback inválido!", show_alert=True)

    _, campo, id_str = match
    user_id = callback_query.from_user.id
    char_id = int(id_str)

    # Puxa do cache
    user_cache = Client.edit_cache.get(user_id, {})
    genero_cache = user_cache.get(client.genero.value, {})
    personagem_data = genero_cache.get(char_id)

    if not personagem_data:
        return await callback_query.answer(
            "Personagem não encontrado no cache!", show_alert=True
        )

    if campo in ["anime", "nome"]:
        # Marca qual campo será editado
        personagem_data["edit"] = campo

        # Edita a mensagem do bot pedindo input
        reply_markup = InlineKeyboardMarkup(
            [
                [
                    create_one_bt(
                        text="⬅ Voltar",
                        callback_data=f"{COMMAND_LIST_DB.EDITCHAR.value}_back_{id_str}",
                    )
                ]
            ]
        )
        await callback_query.edit_message_caption(
            f"Envie o novo valor  para <b>{campo}</b>:\n anterior:<code> {personagem_data['per_edit'].nome_personagem if campo == 'nome' else personagem_data['per_edit'].nome_anime  }</code>\n ",
            reply_markup=reply_markup,
        )
        await callback_query.answer()


# ---------------- Handler de texto para atualizar personagem ----------------


def waiting_for_input(_, __, message: Message):
    """Filtro para mensagens de usuários que estão no fluxo de edição de texto"""
    try:
        user_cache = getattr(Client, "edit_cache", {}).get(message.from_user.id, {})
        for gen_cache in user_cache.values():
            for per_cache in gen_cache.values():
                if per_cache.get("edit") in ["nome", "anime"]:
                    return True
        return False
    except Exception as e:
        log_error(e)
        

@Client.on_message(filters.create(waiting_for_input) & filters.text)
async def edit_text(client: Client, message: Message):
    user_id = message.from_user.id
    user_cache = Client.edit_cache.get(user_id, {})
    genero_cache = user_cache.get(client.genero.value, {})

    # Encontra personagem aguardando edição
    personagem_data = None
    for per_id, per_cache in genero_cache.items():
        if per_cache.get("edit"):
            personagem_data = per_cache
            char_id = per_id
            break

    if not personagem_data:
        return

    personagem_edit = personagem_data["per_edit"]
    campo = personagem_data.pop("edit")  # remove a flag edit

    # Atualiza apenas nome ou anime
    if campo == "nome":
        personagem_edit.nome_personagem = message.text.strip()
    elif campo == "anime":
        personagem_edit.nome_anime = message.text.strip()

    # Atualiza o cache
    personagem_data["per_edit"] = personagem_edit

    # Atualiza a mensagem do bot
    msg_id = personagem_data.get("id_msg_edit")
    if msg_id:
        await client.edit_message_caption(
            chat_id=message.chat.id,
            message_id=msg_id,
            caption="\n".join(create_cap_edit_Show(personagem_edit)),
            reply_markup=InlineKeyboardMarkup(bts_edit(personagem_edit.id)),
        )


@Client.on_callback_query(
    filters.regex(rf"^{COMMAND_LIST_DB.EDITCHAR.value}_back_(\d+)$")
)
async def voltar_edicao(client: Client, callback_query: CallbackQuery):
    """Volta para a tela de edição principal"""
    match = callback_query.data.split("_")
    if len(match) < 3:
        return await callback_query.answer("Callback inválido!", show_alert=True)

    _, _, id_str = match
    user_id = callback_query.from_user.id
    char_id = int(id_str)

    # Puxa do cache
    user_cache = Client.edit_cache.get(user_id, {})
    genero_cache = user_cache.get(client.genero.value, {})
    personagem_data = genero_cache.get(char_id)

    if not personagem_data:
        return await callback_query.answer(
            "Personagem não encontrado no cache!", show_alert=True
        )

    # Remove a flag de edição
    personagem_data.pop("edit", None)

    # Atualiza a mensagem
    msg_id = personagem_data.get("id_msg_edit")
    if msg_id:
        await client.edit_message_caption(
            chat_id=callback_query.message.chat.id,
            message_id=msg_id,
            caption="\n".join(create_cap_edit_Show(personagem_data["per_edit"])),
            reply_markup=InlineKeyboardMarkup(bts_edit(personagem_data["per_edit"].id)),
        )

    await callback_query.answer()
