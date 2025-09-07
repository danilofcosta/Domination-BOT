from typing import List
from pyrogram import Client, filters
from pyrogram.types import Message, InputMediaPhoto
from sqlalchemy import select
from DB.models import (
    ColecaoUsuarioHusbando, ColecaoUsuarioWaifu, Usuario,
    PersonagemHusbando, PersonagemWaifu
)
from types_ import TipoCategoria
from uteis import create_bts_y_or_n, dynamic_command_filter
from domination.message import MESSAGE
from domination.plugins.lang_utils import obter_mensagem_chat
from types_ import COMMAND_LIST




@Client.on_message(
    filters.create(
        name=f"comand{' '.join(COMMAND_LIST.TRADE.value)}",
        func=dynamic_command_filter,
        command=COMMAND_LIST.TRADE.value,
    )
)
@Client.on_message(filters.command(COMMAND_LIST.TRADE.value) & filters.private)
async def trade_command(client: Client, message: Message):
    base = ColecaoUsuarioWaifu if client.genero == TipoCategoria.WAIFU else ColecaoUsuarioHusbando
    personagem_cls = PersonagemWaifu if client.genero == TipoCategoria.WAIFU else PersonagemHusbando

    if not message.reply_to_message or message.reply_to_message.from_user.is_bot:
        return await message.reply(await obter_mensagem_chat(client, message.chat.id, "trade", "reply_required"), quote=True)

    if len(message.command) < 3:
        return await message.reply(await obter_mensagem_chat(client, message.chat.id, "trade", "usage"), quote=True)

    try:
        my_char_id = int(message.command[1])
        other_char_id = int(message.command[2])
    except ValueError:
        return await message.reply(await obter_mensagem_chat(client, message.chat.id, "trade", "invalid_ids"), quote=True)

    giver_id = message.from_user.id
    receiver_id = message.reply_to_message.from_user.id

    async with await client.get_reusable_session() as session:
        # Verifica personagens
        my_char = await session.get(personagem_cls, my_char_id)
        other_char = await session.get(personagem_cls, other_char_id)
        if not my_char or not other_char:
            return await message.reply(await obter_mensagem_chat(client, message.chat.id, "trade", "character_not_exists"), quote=True)

        # Cria usuários se não existirem
        for uid, user_obj in [(giver_id, message.from_user), (receiver_id, message.reply_to_message.from_user)]:
            stmt_user = select(Usuario).where(Usuario.telegram_id == uid)
            user = (await session.execute(stmt_user)).scalars().first()
            if not user:
                user_info = {"id": uid, "NAME": user_obj.first_name, "username": user_obj.username}
                session.add(Usuario(telegram_id=uid, telegram_from_user=user_info))
        await session.flush()

        # Verifica se ambos possuem os personagens
        stmt_giver = select(base).where(base.telegram_id == giver_id, base.id_global == my_char_id)
        stmt_receiver = select(base).where(base.telegram_id == receiver_id, base.id_global == other_char_id)

        giver_item = (await session.execute(stmt_giver)).scalars().first()
        receiver_item = (await session.execute(stmt_receiver)).scalars().first()

        if not giver_item:
            return await message.reply(await obter_mensagem_chat(client, message.chat.id, "trade", "you_dont_have"), quote=True)
        if not receiver_item:
            return await message.reply(await obter_mensagem_chat(client, message.chat.id, "trade", "other_dont_have"), quote=True)

    # Envia um álbum com os dois personagens
    media = [
        InputMediaPhoto(my_char.data, caption=f"ID {my_char.id}: {my_char.nome_personagem} ({my_char.nome_anime})"),
        InputMediaPhoto(other_char.data, caption=f"ID {other_char.id}: {other_char.nome_personagem} ({other_char.nome_anime})"),
  
    ]
    await client.send_media_group(message.chat.id, media)
  

    # Pergunta ao receptor se aceita a troca
    caption = await obter_mensagem_chat(client, message.chat.id, "trade", "trade_proposal",
        giver_mention=message.from_user.mention,
        my_char_id=my_char.id,
        my_char_name=my_char.nome_personagem,
        other_char_id=other_char.id,
        other_char_name=other_char.nome_personagem,
        receiver_mention=message.reply_to_message.from_user.mention
    )
    await message.reply(
        caption,
        reply_markup=create_bts_y_or_n(
            prefix=f"trade_{giver_id}_{receiver_id}_{my_char_id}_{other_char_id}",
            callback_data_true="accept",
            callback_data_false="reject"
        ),
        quote=True
    )

@Client.on_callback_query(filters.regex(r"^trade_\d+_\d+_\d+_\d+_.*$"))
async def trade_callback(client: Client, query):
    parts = query.data.split("_")
    _, giver_id, receiver_id, my_char_id, other_char_id, action = parts
    giver_id = int(giver_id)
    receiver_id = int(receiver_id)
    my_char_id = int(my_char_id)
    other_char_id = int(other_char_id)

    # Apenas o receptor pode aceitar ou recusar
    if query.from_user.id != receiver_id:
        return await query.answer(await obter_mensagem_chat(client, query.message.chat.id, "trade", "only_receiver_accept"), show_alert=True)

    base = ColecaoUsuarioWaifu if client.genero == TipoCategoria.WAIFU else ColecaoUsuarioHusbando

    async with await client.get_reusable_session() as session:
        if action == "accept":
            # Remove itens atuais
            stmt_remove_giver = select(base).where(base.telegram_id == giver_id, base.id_global == my_char_id)
            stmt_remove_receiver = select(base).where(base.telegram_id == receiver_id, base.id_global == other_char_id)

            giver_item = (await session.execute(stmt_remove_giver)).scalars().first()
            receiver_item = (await session.execute(stmt_remove_receiver)).scalars().first()

            if giver_item and receiver_item:
                await session.delete(giver_item)
                await session.delete(receiver_item)

                # Troca os personagens
                session.add(base(telegram_id=giver_id, id_global=other_char_id))
                session.add(base(telegram_id=receiver_id, id_global=my_char_id))
                await session.commit()

                await query.edit_message_text(await obter_mensagem_chat(client, query.message.chat.id, "trade", "trade_success"))
            else:
                await query.edit_message_text(await obter_mensagem_chat(client, query.message.chat.id, "trade", "trade_failed"))
        else:
            await query.edit_message_text(await obter_mensagem_chat(client, query.message.chat.id, "trade", "trade_rejected"))
