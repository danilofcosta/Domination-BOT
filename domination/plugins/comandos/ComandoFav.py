from pyrogram import Client, filters
from pyrogram.types import *
from sqlalchemy import  select
from domination.uteis import COMMAND_LIST
from DB.models import (
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
import logging
from types_ import TipoCategoria
from domination.lang_utils import obter_mensagem_chat
logger = logging.getLogger(__name__)

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
            await obter_mensagem_chat(
                client,
                message.chat.id,
                "erros",
                "error_id_required",
                genero=client.genero.value.lower(),
            ),
            quote=True,
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
                await obter_mensagem_chat(
                    client, message.chat.id, "erros", "error_not_registered"
                ),
                quote=True,
            )

        # Buscar o personagem completo
        personagem = colecao.character

        if not personagem:
            return await message.reply(
               text= await obter_mensagem_chat(
                    client=client,
                    chat_id=message.chat.id,
                   categoria= "erros",
                  chave=  "error_character_not_found_id_fav",
                    comadoharem=f"{client.genero.value[0].lower()}{COMMAND_LIST.HAREM.value}"
                ),
                quote=True,
            )

        # Criar callback data com informações necessárias
        callback_data_true = (
            f"{message.from_user.id}_{personagem.id}_{client.genero.value}"
        )
        callback_data_false = f"cancel_{message.from_user.id}"

        keyboard = create_bts_y_or_n(
            prefix="setfav",
            callback_data_true=callback_data_true,
            callback_data_false=callback_data_false,
        )

        await send_media_by_type(
            client=client,
            message=message,
            personagem=personagem,
            caption=await obter_mensagem_chat(
                client,
                message.chat.id,
                "favorito",
                "confirm_favorite",
                character_info=format_personagem_caption(personagem),
            ),
            reply_markup=keyboard,
        )

    except ValueError:
        await message.reply(
            await obter_mensagem_chat(
                client, message.chat.id, "erros", "error_invalid_id"
            ),
            quote=True,
        )
    except Exception as e:
        await message.reply(
            await obter_mensagem_chat(
                client, message.chat.id, "general", "error", error=str(e)
            ),
            quote=True,
        )


def parse_callback_data(data: str):
    """
    Formatos esperados:
      - cancel_{user_id}
      - setfav_{user_id}_{personagem_id}_{genero}
    """
    parts = data.split("_")
    if data.startswith("cancel_") and len(parts) == 2:
        return {"action": "cancel", "user_id": int(parts[1])}
    if data.startswith("setfav_") and len(parts) == 4:
        return {
            "action": "setfav",
            "user_id": int(parts[1]),
            "personagem_id": int(parts[2]),
            "genero": parts[3],
        }
    return None


async def edit_with_error(client, query, category, key, **kwargs):
    """Helper para reduzir repetição de mensagens de erro"""
    return await query.edit_message_caption(
        caption=await obter_mensagem_chat(client, query.message.chat.id, category, key, **kwargs)
    )


@Client.on_callback_query(filters.create(lambda _, __, q: q.data.startswith(("setfav_", "cancel_"))))
async def handle_fav_callback(client: Client, query: CallbackQuery):
    try:
        data = parse_callback_data(query.data)
        if not data:
            return await edit_with_error(client, query, "general", "error", error="Dados inválidos")

        # --- Cancelamento ---
        if data["action"] == "cancel":
            if query.from_user.id != data["user_id"]:
                return await edit_with_error(client, query, "erros", "error_cannot_use_button")

            return await edit_with_error(client, query, "favorito", "operation_cancelled")

        # --- Confirmação ---
        if query.from_user.id != data["user_id"]:
            return await edit_with_error(client, query, "erros", "error_cannot_use_button")

        async with await client.get_session() as session:
            usuario = await session.scalar(select(Usuario).where(Usuario.telegram_id == data["user_id"]))
            if not usuario:
                return await edit_with_error(client, query, "erros", "error_not_registered")

            if data["genero"] == TipoCategoria.HUSBANDO.value:
                usuario.fav_h_id = data["personagem_id"]
                logger.debug(f"Atualizando fav_h_id para {data['personagem_id']}")
            elif data["genero"] == TipoCategoria.WAIFU.value:
                usuario.fav_w_id = data["personagem_id"]
                logger.debug(f"Atualizando fav_w_id para {data['personagem_id']}")
            else:
                return await edit_with_error(client, query, "general", "error", error="Gênero inválido")

            await session.commit()

            # Pega info do personagem do caption antigo (sem a primeira linha)
            character_info = "\n".join(query.message.caption.split("\n")[1:])
            await query.edit_message_caption(
                caption=await obter_mensagem_chat(
                    client,
                    query.message.chat.id,
                    "favorito",
                    "favorite_set_success",
                    info=character_info,
                    prefix=f"/{client.genero.value[0].lower()}",
                    harem_command=COMMAND_LIST.HAREM.value,
                )
            )

    except ValueError as e:
        logger.warning(f"ValueError em handle_fav_callback: {e}")
        await edit_with_error(client, query, "general", "error", error=f"Erro de dados: {e}")
    except Exception as e:
        logger.exception("Erro inesperado em handle_fav_callback")
        await edit_with_error(client, query, "general", "error", error=str(e))