from typing import List
from pyrogram import Client, filters
from pyrogram.types import Message, CallbackQuery
from pyrogram.enums import ChatType
from types_ import TipoCategoria, COMMAND_LIST
from sqlalchemy import select
from DB.models import (
    ColecaoUsuarioHusbando,
    ColecaoUsuarioWaifu,
    Usuario,
    PersonagemHusbando,
    PersonagemWaifu,
)
from uteis import (
    create_bts_y_or_n,
    dynamic_command_filter,
    send_media_by_type,
)

from domination.plugins.lang_utils import obter_mensagem_chat

# Função para criar botões de confirmação


@Client.on_message(
    filters.create(
        name=f"comand{''.join(COMMAND_LIST.GIFT.value)}",
        func=dynamic_command_filter,
        command=COMMAND_LIST.GIFT.value,
    )
)
async def gift_personagem(client: Client, message: Message):
    if message.chat.type == ChatType.PRIVATE:
        return await message.reply(
            await obter_mensagem_chat(client, message.chat.id, "gift", "not_group")
        )

    base = (
        ColecaoUsuarioWaifu
        if client.genero == TipoCategoria.WAIFU
        else ColecaoUsuarioHusbando
    )
    personagem_cls = (
        PersonagemWaifu if client.genero == TipoCategoria.WAIFU else PersonagemHusbando
    )
    # Verifica se é resposta a outro usuário válido
    if (
        not message.reply_to_message
        or message.reply_to_message.from_user.is_bot
        or message.reply_to_message.from_user.id == message.from_user.id
    ):
        return await message.reply(
            await obter_mensagem_chat(
                client, message.chat.id, "gift", "reply_required"
            ),
            quote=True,
        )

    # Verifica se o ID do personagem foi enviado
    if len(message.command) < 2:
        return await message.reply(
            await obter_mensagem_chat(
                client,
                message.chat.id,
                "gift",
                "id_required",
                genero=client.genero.value,
            ),
            quote=True,
        )

    try:
        personagem_id = int(message.command[1])
    except ValueError:
        return await message.reply(
            await obter_mensagem_chat(
                client, message.chat.id, "erros", "error_invalid_id"
            ),
            quote=True,
        )

    async with await client.get_reusable_session() as session:
        # Checa se o personagem existe
        personagem = await session.get(personagem_cls, personagem_id)
        if not personagem:
            return await message.reply(
                await obter_mensagem_chat(
                    client,
                    message.chat.id,
                    "erros",
                    "error_character_not_found_id",
                    genero=client.genero.value,
                    personagem_id=personagem_id,
                ),
                quote=True,
            )

        # Checa se o doador possui o personagem
        stmt = select(base).where(
            base.telegram_id == message.from_user.id, base.id_global == personagem_id
        )
        result = await session.execute(stmt)
        colecao = result.scalars().first()
        if not colecao:
            return await message.reply(
                await obter_mensagem_chat(
                    client, message.chat.id, "erros", "error_character_not_owned"
                ),
                quote=True,
            )

    # Mensagem de confirmação para o doador enviar
    caption = await obter_mensagem_chat(
        client,
        message.chat.id,
        "gift",
        "confirmation_message",
        giver_mention=message.from_user.mention,
        character_name=personagem.nome_personagem,
        receiver_mention=message.reply_to_message.from_user.mention,
    )
    await send_media_by_type(
        client=client,
        message=message,
        personagem=personagem,
        caption=caption,
        reply_markup=create_bts_y_or_n(
            prefix=f"gift_{message.from_user.id}_{message.reply_to_message.from_user.id}_{personagem_id}",
            callback_data_true="send",
            callback_data_false="cancel",
        ),
    )


# Callback para o doador confirmar ou cancelar
@Client.on_callback_query(filters.regex(r"^gift_\d+_\d+_\d+_.*$"))
async def gift_callback(client: Client, query: CallbackQuery):
    parts = query.data.split("_")
    _, giver_id, receiver_id, personagem_id, action = parts
    giver_id = int(giver_id)
    receiver_id = int(receiver_id)
    personagem_id = int(personagem_id)

    # Só o doador pode confirmar
    if query.from_user.id not in [giver_id, receiver_id]:

        return await query.answer(
            await obter_mensagem_chat(
                client, query.message.chat.id, "erros", "error_only_giver_confirm"
            ),
            show_alert=True,
        )

    base = (
        ColecaoUsuarioWaifu
        if client.genero == TipoCategoria.WAIFU
        else ColecaoUsuarioHusbando
    )
    personagem_cls = (
        PersonagemWaifu if client.genero == TipoCategoria.WAIFU else PersonagemHusbando
    )

    async with await client.get_reusable_session() as session:
        personagem = await session.get(personagem_cls, personagem_id)
        if not personagem:
            return await query.answer(
                await obter_mensagem_chat(
                    client, query.message.chat.id, "erros", "error_character_not_found"
                ),
                show_alert=True,
            )

        if action == "send":
            # Remove da coleção do doador
            stmt_remove = select(base).where(
                base.telegram_id == giver_id, base.id_global == personagem_id
            )
            result = await session.execute(stmt_remove)
            item = result.scalars().first()
            if item:
                await session.delete(item)

            # Verifica se o receptor existe no banco, se não cria
            stmt_user = select(Usuario).where(Usuario.telegram_id == receiver_id)
            user = (await session.execute(stmt_user)).scalars().first()
            if not user:
                user_info = {
                    "id": receiver_id,
                    "NAME": query.message.chat.get_member(receiver_id).user.first_name,
                    "username": None,
                }
                user = Usuario(telegram_id=receiver_id, telegram_from_user=user_info)
                session.add(user)
                await session.flush()

            # Adiciona o personagem na coleção do receptor
            nova_entrada = base(telegram_id=receiver_id, id_global=personagem_id)
            session.add(nova_entrada)

            await session.commit()
            await query.edit_message_caption(
                await obter_mensagem_chat(
                    client,
                    query.message.chat.id,
                    "gift",
                    "success_sent",
                    character_name=personagem.nome_personagem,
                    giver_mention=query.from_user.mention,
                    receiver_mention=query.message.reply_to_message.from_user.mention,
                )
            )

        else:
            await query.edit_message_caption(
                await obter_mensagem_chat(
                    client, query.message.chat.id, "gift", "cancelled"
                )
            )
