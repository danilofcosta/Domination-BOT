from pyrogram import Client, filters
from pyrogram.types import *
from sqlalchemy import func, select
from pyrogram.enums import ChatType
from domination.uteis import COMMAND_LIST
from DB.models import (
    PersonagemHusbando,
    PersonagemWaifu,
    Usuario,
    ColecaoUsuarioHusbando,
    ColecaoUsuarioWaifu,
)
from domination.uteis import (
    dynamic_command_filter,
    format_personagem_caption,
    create_bts_y_or_n,
    send_media_by_type,
)
from types_ import TipoCategoria, TipoPerfil, TipoMidia
from domination.lang_utils import obter_mensagem_chat
from domination.message import MESSAGE




@Client.on_message(
    filters.create(
        name=f"comand{' '.join(COMMAND_LIST.FAV.value)}",
        func=dynamic_command_filter,
        command=COMMAND_LIST.FAV.value,
    )
)
@Client.on_message(filters.command(COMMAND_LIST.FAV.value) & filters.private)
async def ComandoFav(client: Client, message: Message):
   
    if len(message.command) < 2:
        return await message.reply(
            await obter_mensagem_chat(client, message.chat.id, "erros", "error_id_required",genero=client.genero.value.lower()), quote=True
        )

    # Determinar qual tabela de coleção usar
    ColecaoClasse = (
        ColecaoUsuarioHusbando
        if client.genero == TipoCategoria.HUSBANDO
        else ColecaoUsuarioWaifu
    )

    try:
        session = await client.get_reusable_session()

        # Buscar o personagem na coleção do usuário
        result = await session.execute(
            select(ColecaoClasse).where(
                ColecaoClasse.telegram_id == message.from_user.id,
                ColecaoClasse.id_global == int(message.command[1]),
            )
        )

        colecao = result.scalar_one_or_none()

        if not colecao:

            return await message.reply(
                await obter_mensagem_chat(client, message.chat.id, "erros", "error_not_registered"),
                quote=True,
            )

        # Buscar o personagem completo
        personagem = colecao.character

        if not personagem:
            return await message.reply(
                await obter_mensagem_chat(client, message.chat.id, "erros", "error_character_not_found_id_fav"), quote=True
            )

        # Criar callback data com informações necessárias
        callback_data_true = (
            f"{message.from_user.id}_{personagem.id}_{client.genero.value}"
        )
        callback_data_false = f"cancel_{message.from_user.id}"

        # Debug: imprimir callback data
        print(f"DEBUG - Callback data true: {callback_data_true}")
        print(f"DEBUG - Callback data false: {callback_data_false}")

        keyboard = create_bts_y_or_n(
            prefix="setfav",
            callback_data_true=callback_data_true,
            callback_data_false=callback_data_false,
        )

        await send_media_by_type(
            client=client,
            message=message,
            personagem=personagem,
            caption=await obter_mensagem_chat(client, message.chat.id, "favorito", "confirm_favorite", character_info=format_personagem_caption(personagem)),
            reply_markup=keyboard,
        )

    except ValueError:
        await message.reply(await obter_mensagem_chat(client, message.chat.id, "erros", "error_invalid_id"), quote=True)
    except Exception as e:
        await message.reply(await obter_mensagem_chat(client, message.chat.id, "general", "error", error=str(e)), quote=True)


@Client.on_callback_query(
    filters.create(lambda _, __, query: query.data.startswith("setfav_"))
)
async def handle_fav_callback(client: Client, query: CallbackQuery):
    # Responder ao callback IMEDIATAMENTE para evitar timeout
    # print(query)

    try:
        # Debug: imprimir callback data recebido
        print(f"DEBUG - Callback recebido: {query.data}")

        # Verificar se é cancelar
        if "cancel" in query.data:
            # Processar cancelamento
            parts = query.data.split("_")
            if len(parts) >= 3:
                user_id = int(parts[2])

                # Verificar se é o usuário correto
                if query.from_user.id != user_id:
                    await query.edit_message_caption(
                        caption=await obter_mensagem_chat(client, query.message.chat.id, "erros", "error_cannot_use_button")
                    )
                    return

                await query.edit_message_caption(caption=await obter_mensagem_chat(client, query.message.chat.id, "favorito", "operation_cancelled"))
                print("DEBUG - Operação cancelada")
            else:
                await query.edit_message_caption(caption=await obter_mensagem_chat(client, query.message.chat.id, "general", "error", error="Dados inválidos"))
            return

        # Processar confirmação de favorito
        # Extrair dados do callback - formato: fav_userId_personagemId_genero
        parts = query.data.split("_")

        if len(parts) < 4:
            await query.edit_message_caption(caption=await obter_mensagem_chat(client, query.message.chat.id, "general", "error", error="Dados inválidos"))
            return

        user_id = int(parts[1])
        personagem_id = int(parts[2])
        genero = parts[3]

        # Verificar se é o usuário correto
        if query.from_user.id != user_id:
            await query.edit_message_caption(caption=await obter_mensagem_chat(client, query.message.chat.id, "erros", "error_cannot_use_button"))
            return

        # Usar uma nova sessão para evitar problemas de transação
        session = await client.get_session()

        try:
            
            # Buscar o usuário
            user_result = await session.execute(
                select(Usuario).where(Usuario.telegram_id == user_id)
            )
            usuario = user_result.scalar_one_or_none()

            if not usuario:
                await query.edit_message_caption(caption=await obter_mensagem_chat(client, query.message.chat.id, "erros", "error_not_registered"))
                return

            # Atualizar favorito baseado no gênero
            if genero == TipoCategoria.HUSBANDO.value:
                usuario.fav_h_id = personagem_id
                print(f"DEBUG - Atualizando fav_h_id para: {personagem_id}")
            elif genero == TipoCategoria.WAIFU.value:
                usuario.fav_w_id = personagem_id
                print(f"DEBUG - Atualizando fav_w_id para: {personagem_id}")
            else:
                await query.edit_message_caption(caption=await obter_mensagem_chat(client, query.message.chat.id, "general", "error", error="Gênero inválido"))
                return

            # Adicionar à sessão e fazer commit
            session.add(usuario)
            await session.commit()
            character_info = "\n".join(query.message.caption.split("\n")[1:])
            await query.edit_message_caption(
                caption=await obter_mensagem_chat(client, query.message.chat.id, "favorito", "favorite_set_success",
                    info=character_info,
                    prefix=client.genero.value[0].lower(),
                    harem_command=COMMAND_LIST.HAREM.value
                )
            )

        finally:
            await session.close()

    except ValueError as e:
        print(f"ValueError: {e}")
        await query.edit_message_caption(caption=await obter_mensagem_chat(client, query.message.chat.id, "general", "error", error=f"Erro de dados: {str(e)}"))
    except Exception as e:
        print(f"Exception: {e}")
        await query.edit_message_caption(caption=await obter_mensagem_chat(client, query.message.chat.id, "general", "error", error=str(e)))
