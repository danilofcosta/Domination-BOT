from pyrogram import Client, filters
from pyrogram.types import CallbackQuery, InlineKeyboardMarkup, InlineKeyboardButton
from sqlalchemy import select
from DB.database import DATABASE
from DB.models import Evento_Midia, PersonagemHusbando, PersonagemWaifu, Raridade_Midia
from domination_db.plugins.edit.uteis_edit import bts_edit, create_cap_edit_Show
from types_ import COMMAND_LIST_DB, TipoEvento, TipoRaridade
from uteis import format_personagem_caption
from datetime import datetime


@Client.on_callback_query(
    filters.regex(rf"^{COMMAND_LIST_DB.EDITCHAR.value}_salvar_(\d+)$")
)
async def salvar_edicao(client: Client, callback_query: CallbackQuery):
    _, _, id_str = callback_query.data.split("_")
    user_id = callback_query.from_user.id
    char_id = int(id_str)

    user_cache = Client.edit_cache.get(user_id, {})
    genero_cache = user_cache.get(client.genero.value, {})
    personagem_data = genero_cache.get(char_id)

    if not personagem_data:
        return await callback_query.answer(
            "❌ Personagem não encontrado no cache!", show_alert=True
        )

    try:
        from datetime import datetime

        per = personagem_data["per_edit"]
        per.updated_at = datetime.now()
        # Atualiza no banco de dados
        await DATABASE.update_obj(per)

        # Remove do cache (edição concluída)
        del genero_cache[char_id]

        # Atualiza mensagem final com botão de compartilhar
        msg_id = personagem_data.get("id_msg_edit")
        if msg_id:

            await client.edit_message_caption(
                chat_id=callback_query.message.chat.id,
                message_id=msg_id,
                caption=f"{format_personagem_caption(personagem_data["per_edit"])}",
                reply_markup=InlineKeyboardMarkup(
                    [
                        [
                            InlineKeyboardButton(
                                text="🌐 ✅",
                                switch_inline_query_current_chat=str(char_id),
                            )
                        ]
                    ]
                ),
            )

        await callback_query.answer("✅ Personagem salvo com sucesso!", show_alert=True)

    except Exception as e:
        await callback_query.answer(f"❌ Erro ao salvar: {str(e)}", show_alert=True)
