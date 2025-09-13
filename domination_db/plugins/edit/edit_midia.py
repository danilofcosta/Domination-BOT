from pyrogram import Client, filters
from pyrogram.types import (
    Message,
    CallbackQuery,
    InlineKeyboardMarkup,
    InlineKeyboardButton,
    InputMediaPhoto,
    InputMediaVideo,
)
from types_ import COMMAND_LIST_DB, TipoMidia
from domination_db.plugins.edit.uteis_edit import bts_edit, create_cap_edit_Show


# ---------------- Callback para iniciar edição de mídia ----------------
@Client.on_callback_query(
    filters.regex(rf"^{COMMAND_LIST_DB.EDITCHAR.value}_midia_(\d+)$")
)
async def editar_midia_callback(client: Client, callback_query: CallbackQuery):
    """Inicia o processo de edição de mídia"""
    _, _, id_str = callback_query.data.split("_")
    user_id = callback_query.from_user.id
    char_id = int(id_str)

    user_cache = Client.edit_cache.get(user_id, {})
    genero_cache = user_cache.get(client.genero.value, {})
    personagem_data = genero_cache.get(char_id)

    if not personagem_data:
        return await callback_query.answer(
            "Personagem não encontrado no cache!", show_alert=True
        )

    personagem_data["edit"] = "midia"

    buttons = [
        [
            InlineKeyboardButton(
                "📷 Foto",
                callback_data=f"{COMMAND_LIST_DB.EDITCHAR.value}_tipo_imagem_{id_str}",
            ),
            InlineKeyboardButton(
                "🎥 Vídeo",
                callback_data=f"{COMMAND_LIST_DB.EDITCHAR.value}_tipo_video_{id_str}",
            ),
        ],
        [
            InlineKeyboardButton(
                "⬅ Voltar",
                callback_data=f"{COMMAND_LIST_DB.EDITCHAR.value}_back_{id_str}",
            )
        ],
    ]

    await callback_query.edit_message_caption(
        caption="<b>Editar Mídia</b>\n\nEscolha o tipo de mídia que deseja enviar:",
        reply_markup=InlineKeyboardMarkup(buttons),
    )
    await callback_query.answer()


# ---------------- Callback para escolher tipo ----------------
@Client.on_callback_query(
    filters.regex(rf"^{COMMAND_LIST_DB.EDITCHAR.value}_tipo_(imagem|video)_(\d+)$")
)
async def escolher_tipo_midia(client: Client, callback_query: CallbackQuery):
    _, _, tipo, id_str = callback_query.data.split("_")
    user_id = callback_query.from_user.id
    char_id = int(id_str)

    user_cache = Client.edit_cache.get(user_id, {})
    genero_cache = user_cache.get(client.genero.value, {})
    personagem_data = genero_cache.get(char_id)

    if not personagem_data:
        return await callback_query.answer(
            "Personagem não encontrado no cache!", show_alert=True
        )

    personagem_data["tipo_midia_escolhido"] = tipo

    tipo_texto = "foto" if tipo == "imagem" else "vídeo"
    emoji = "📷" if tipo == "imagem" else "🎥"

    buttons = [
        [
            InlineKeyboardButton(
                "⬅ Voltar",
                callback_data=f"{COMMAND_LIST_DB.EDITCHAR.value}_midia_{id_str}",
            )
        ]
    ]

    await callback_query.edit_message_caption(
        caption=f"<b>Editar Mídia</b>\n\n{emoji} Envie a nova {tipo_texto} para o personagem:",
        reply_markup=InlineKeyboardMarkup(buttons),
    )
    await callback_query.answer()


# ---------------- Filtro para esperar mídia ----------------
def waiting_for_media(_, __, message: Message):
    user_cache = getattr(Client, "edit_cache", {}).get(message.from_user.id, {})
    for gen_cache in user_cache.values():
        for per_cache in gen_cache.values():
            if per_cache.get("edit") == "midia":
                return True
    return False


# ---------------- Processar nova mídia ----------------
@Client.on_message(filters.create(waiting_for_media) & (filters.photo | filters.video))
async def processar_nova_midia(client: Client, message: Message):
    user_id = message.from_user.id
    user_cache = Client.edit_cache.get(user_id, {})
    genero_cache = user_cache.get(client.genero.value, {})

    personagem_data = None
    char_id = None
    for per_id, per_cache in genero_cache.items():
        if per_cache.get("edit") == "midia":
            personagem_data = per_cache
            char_id = per_id
            break

    if not personagem_data:
        return

    personagem_edit = personagem_data["per_edit"]
    tipo_escolhido = personagem_data.get("tipo_midia_escolhido")

    personagem_data.pop("edit", None)
    personagem_data.pop("tipo_midia_escolhido", None)

    try:
        if message.photo and tipo_escolhido == "imagem":
            personagem_edit.data = message.photo.file_id
            personagem_edit.tipo_midia = TipoMidia.IMAGEM_FILEID
            media = InputMediaPhoto(
                media=message.photo.file_id,
                caption="\n".join(create_cap_edit_Show(personagem_edit)),
            )

        elif message.video and tipo_escolhido == "video":
            personagem_edit.data = message.video.file_id
            personagem_edit.tipo_midia = TipoMidia.VIDEO_FILEID
            media = InputMediaVideo(
                media=message.video.file_id,
                caption="\n".join(create_cap_edit_Show(personagem_edit)),
            )
        else:
            return await message.reply(
                f"❌ Tipo de mídia incorreto! Esperava {tipo_escolhido}, mas recebeu {'foto' if message.photo else 'vídeo' if message.video else 'outro tipo'}."
            )

        personagem_data["per_edit"] = personagem_edit

        msg_id = personagem_data.get("id_msg_edit")
        if msg_id:
            await client.edit_message_media(
                chat_id=message.chat.id,
                message_id=msg_id,
                media=media,
                reply_markup=InlineKeyboardMarkup(bts_edit(personagem_edit.id)),
            )

        await message.reply("✅ Mídia atualizada com sucesso!")

    except Exception as e:
        await message.reply(f"❌ Erro ao processar mídia: {str(e)}")


# ---------------- Tratamento de envio inválido ----------------
@Client.on_message(filters.create(waiting_for_media) & filters.text)
async def midia_invalida(client: Client, message: Message):
    await message.reply("❌ Por favor, envie uma foto ou vídeo para atualizar a mídia do personagem.")




