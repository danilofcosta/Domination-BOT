import re
from pyrogram import *
from pyrogram.types import *

from DB.database import DATABASE
from DB.models import PersonagemHusbando, PersonagemWaifu
from types_ import COMMAND_LIST_DB, TipoCategoria
from uteis import (
    check_admin_group,
    dynamic_command_filter,
    send_media_by_chat_id,
    format_personagem_caption,
    create_bts_y_or_n,
)


# ==========================
# Comando de deletar personagem
# ==========================

@Client.on_message(
    filters.create(
        name=f"comand{' '.join(COMMAND_LIST_DB.DELCHAR.value)}",
        func=dynamic_command_filter,
        command=COMMAND_LIST_DB.DELCHAR.value,
    )
)
@Client.on_message(filters.command(COMMAND_LIST_DB.DELCHAR.value) & filters.private)
async def delete_char(client: Client, message: Message):
    # Define base de personagem conforme gênero do bot
    base_per = (
        PersonagemHusbando
        if client.genero == TipoCategoria.HUSBANDO
        else PersonagemWaifu
    )

    # Checa se usuário é admin
    if not await check_admin_group(client, user_id=message.from_user.id):
        await message.reply("❌ Comando disponível apenas para administradores.", quote=True)
        return

    # Extrai ID do reply ou do comando
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
        return await message.reply(f"Use /{COMMAND_LIST_DB.DELCHAR.value} <id> ou reply a mensagem")

    # Busca personagem no banco
    personagem = await DATABASE.get_id_primary(base_per, char_id)
    if not personagem:
        return await message.reply(f"Personagem {char_id} não encontrado!")

    # Cria botões de confirmação
    bts = create_bts_y_or_n(
        f"{COMMAND_LIST_DB.DELCHAR.value}",
        callback_data_true=f"{COMMAND_LIST_DB.DELCHAR.value}_yes_{char_id}",
        callback_data_false=f"{COMMAND_LIST_DB.DELCHAR.value}_no_{char_id}",
    )

    # Envia mídia com botão de confirmação
    await send_media_by_chat_id(
        client=client,
        personagem=personagem,
        chat_id=message.chat.id,
        caption=f"Deseja excluir?\n{format_personagem_caption(personagem)}",
        reply_markup=bts,
    )

# ==========================
# Callback de confirmação
# ==========================

@Client.on_callback_query(
    filters.regex(rf"^{COMMAND_LIST_DB.DELCHAR.value}_(yes|no)_(\d+)$")
)
async def delete_char_confirm(client: Client, query: CallbackQuery):
    _, action, char_id = query.data.split("_")

    # Checa se usuário é admin
    if not await check_admin_group(client, user_id=query.message.from_user.id):
        return await query.answer("❌ Apenas administradores podem usar este botão.", show_alert=True)

    # Define base de personagem conforme gênero do bot
    base_per = (
        PersonagemHusbando
        if client.genero == TipoCategoria.HUSBANDO
        else PersonagemWaifu
    )

    if action == "yes":
        deleted = await DATABASE.delete_object_by_id(base_per, int(char_id))
        if deleted:
            await query.message.edit_text(f"✅ Personagem {char_id} deletado com sucesso!")
        else:
            await query.message.edit_text(f"❌ Personagem {char_id} não encontrado!")
    else:
        await query.message.delete()