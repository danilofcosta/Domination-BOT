import asyncio
from pyrogram import Client, filters
from pyrogram.types import *
from sqlalchemy import func, select
from datetime import datetime
from DB.models import (
    PersonagemHusbando,
    PersonagemWaifu,
    Usuario,
    ColecaoUsuarioHusbando,
    ColecaoUsuarioWaifu,
)
from types_ import TipoCategoria, TipoPerfil
import json
from domination.uteis import format_personagem_caption, send_media_by_type
from domination.message import MESSAGE
from domination.lang_utils import obter_mensagem_chat
from domination.uteis import COMMAND_LIST

message_counter: dict[str, dict[int, dict]] = {}


async def create_secret_caption(
    client, personagem, genero: TipoCategoria, chat_id: int
):
    tasks = [
        obter_mensagem_chat(
            client,
            chat_id,
            "contador",
            "character_appeared",
            raridade=personagem.raridade_full.emoji,
            genero=genero.value.capitalize(),
        ),
        obter_mensagem_chat(client, chat_id, "contador", "add_to_harem"),
        obter_mensagem_chat(client, chat_id, "contador", "dominar_command"),
    ]
    results = await asyncio.gather(*tasks)
    return "\n".join(
        [results[0], results[1], f"/{COMMAND_LIST.DOMINAR.value} {results[2]}"]
    )


@Client.on_message(
    filters.group
    & (filters.voice | filters.text | filters.media)
    & ~(filters.text & filters.regex(r"^[/!.]")),
    group=1,
)
async def handle_group_messages(client: Client, message: Message):

    g = client.genero.value
    group_id = message.chat.id

    # Inicializa dict
    grp_counter = message_counter.setdefault(g, {}).setdefault(
        group_id,
        {"cont": 0, "id_mens": None, "per": None, "datetime": None, "keyboard": None},
    )

    grp_counter["cont"] += 1

    if group_id == -1001528803759:
        grp_counter["cont"] = 98 if grp_counter["cont"] < 98 else grp_counter["cont"]

    cont = grp_counter["cont"]
    print(cont, group_id == -1001528803759)

    # Função interna para pegar personagem aleatório
    async def get_random_character():
        async with await client.get_reusable_session() as session:
            base = (
                PersonagemHusbando
                if client.genero == TipoCategoria.HUSBANDO
                else PersonagemWaifu
            )
            result = await session.execute(
                select(base).order_by(func.random()).limit(1)
            )
            return result.scalars().first()

    # A cada 100 mensagens, envia personagem
    if cont % 100 == 0:
        personagem = await get_random_character()
        if not personagem:
            return

        msg_res: Message = await send_media_by_type(
            client,
            message,
            personagem,
            caption=await create_secret_caption(
                client, personagem, client.genero, group_id
            ),
        )
        # Atualiza contador
        message_counter[g][group_id] = {
            "cont": cont,
            "id_mens": msg_res.id,
            "per": personagem,
            "datetime": datetime.now(),
        }
        print(f"Saiu: {personagem.nome_personagem}")

    # A cada 20 mensagens, deleta a mensagem atual
    elif cont % 20 == 0:
        try:
            per= message_counter[g][group_id]["per"]
            view_text = await obter_mensagem_chat(
                client, group_id, "contador", "view_character"
            )
            keyboard = InlineKeyboardMarkup(
                [
                    [
                        InlineKeyboardButton(
                            view_text, callback_data=f"view_character_{per.id}"
                        )
                    ]
                ]
            )

            await client.delete_messages(
                message.chat.id, message_counter[g][group_id].get("id_mens")
            )
            view_text = await obter_mensagem_chat(
                client,
                group_id,
                "contador",
                "caption",
                nome=per.nome_personagem,
                anime=per.nome_anime,
            )
            await client.send_message(message.chat.id, view_text, reply_markup=keyboard)
            message_counter[g][group_id] = None

        except Exception as e:

            print("Erro ao deletar mensagem:", e)


@Client.on_callback_query(filters.regex(r"^view_character_\d+$"))
async def view_character_callback(client: Client, query: CallbackQuery):
    try:
        character_id = int(query.data.split("_")[-1])
        async with await client.get_reusable_session() as session:
            base = (
                PersonagemHusbando
                if client.genero == TipoCategoria.HUSBANDO
                else PersonagemWaifu
            )
            personagem = (
                (await session.execute(select(base).where(base.id == character_id)))
                .scalars()
                .first()
            )

        if not personagem:
            return await query.answer("❌ Personagem não encontrado!", show_alert=True)

        character_info, clicked_text = await asyncio.gather(
            obter_mensagem_chat(
                client,
                query.message.chat.id,
                "contador",
                "character_info",
                character_name=personagem.nome_personagem,
                anime_name=personagem.nome_anime,
                rarity=f"{personagem.raridade_full.emoji} {personagem.raridade_full.nome}",
            ),
            obter_mensagem_chat(
                client,
                query.message.chat.id,
                "contador",
                "character_clicked_by",
                user_mention=query.from_user.mention,
                character_info=format_personagem_caption(personagem),
            ),
        )

        await client.send_photo(
            chat_id=query.message.chat.id,
            photo=personagem.data,
            caption=clicked_text,
            reply_to_message_id=query.message.id,
        )
        await query.message.delete()

        await query.answer("✅ Personagem enviado!")

    except Exception as e:
        print(f"Erro ao visualizar personagem: {e}")
        await query.answer("❌ Erro ao carregar personagem!", show_alert=True)
