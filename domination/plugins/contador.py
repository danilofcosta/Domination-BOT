import asyncio
from pyrogram import Client, filters
from pyrogram.types import *
from sqlalchemy import func, select
from datetime import datetime
from DB.models import PersonagemHusbando, PersonagemWaifu
from types_ import TipoCategoria, COMMAND_LIST
from uteis import format_personagem_caption, send_media_by_type, send_media_by_chat_id
from domination.logger import log_info, log_error, log_debug
from DB.database import DATABASE
from domination.message import MESSAGE

# Estrutura: {genero: {group_id: {...}}}
message_counter: dict[str, dict[int, dict]] = {}


async def create_secret_caption(client, personagem, genero: TipoCategoria, chat_id: int):
    text_appeared =  MESSAGE.get_text(
        "pt", "contador", "character_appeared",
        raridade=personagem.raridade_full.emoji,
        genero=genero.value.capitalize(),
    )
    add_to_harem =  MESSAGE.get_text("pt", "contador", "add_to_harem")
    dominar_command =  MESSAGE.get_text("pt", "contador", "dominar_command")

    return "\n".join(
        [text_appeared, add_to_harem, f"/{COMMAND_LIST.DOMINAR.value} {dominar_command}"]
    )


async def get_random_character(client):
    base = PersonagemHusbando if client.genero == TipoCategoria.HUSBANDO else PersonagemWaifu
    per = await DATABASE.get_info_one(
        select(base).order_by(func.random()).limit(1)
    )
    return per


@Client.on_message(
    filters.group
    & (filters.voice | filters.text | filters.media)
    & ~(filters.text & filters.regex(r"^[/!.]")),
    group=1,
)
async def handle_group_messages(client: Client, message: Message):
    g = client.genero.value
    group_id = message.chat.id

    # Inicializa contador do grupo
    grp_counter = message_counter.setdefault(g, {}).setdefault(
        group_id,
        {"cont": 0, "id_mens": None, "per": None, "datetime": None},
    )

    grp_counter["cont"] += 1
    cont = grp_counter["cont"]

    # Forçar contador inicial em grupo específico
    if group_id == -1001528803759 and cont < 98:
        cont = grp_counter["cont"] = 98

    log_debug(f"Contador: {cont}, Grupo: {group_id}, Título: {message.chat.title}", "contador")
    print(group_id, message.chat.title, cont, cont % 100 == 0)

    # A cada 100 mensagens, envia personagem
    if cont % 100 == 0:
        personagem = await get_random_character(client)
        if not personagem:
            return 

        msg_res: Message = await send_media_by_type(
            message,
            personagem,
            caption=await create_secret_caption(client, personagem, client.genero, group_id),
        )

        # Atualiza estado do grupo
        message_counter[g][group_id] = {
            "cont": cont,
            "id_mens": msg_res.id,
            "per": personagem,
            "datetime": datetime.now(),
        }
        log_info(f"Personagem saiu: {personagem.nome_personagem}", "contador")

    # 20 mensagens depois, deleta personagem
    elif grp_counter["id_mens"] and cont == grp_counter["cont"] + 20:
        try:
            per = grp_counter["per"]
            if not per:
                return

            view_text = await MESSAGE.get_text("pt", "contador", "view_character")
            keyboard = InlineKeyboardMarkup(
                [[InlineKeyboardButton(view_text, callback_data=f"view_character_{per.id}")]]
            )

            await client.delete_messages(group_id, grp_counter["id_mens"])

            caption = await MESSAGE.get_text(
                "pt", "contador", "caption",
                nome=per.nome_personagem, anime=per.nome_anime,
            )
            await client.send_message(group_id, caption, reply_markup=keyboard)

            # Limpa estado
            message_counter[g][group_id] = {"cont": cont, "id_mens": None, "per": None, "datetime": None}

        except Exception as e:
            log_error(f"Erro ao deletar mensagem: {e}", "contador", exc_info=True)


@Client.on_callback_query(filters.regex(r"^view_character_\d+$"))
async def view_character_callback(client: Client, query: CallbackQuery):
    try:
        character_id = int(query.data.split("_")[-1])
        base = PersonagemHusbando if client.genero == TipoCategoria.HUSBANDO else PersonagemWaifu
        stmt = select(base).where(base.id == character_id)
        personagem = await DATABASE.get_info_one(stmt)

        if not personagem:
            return await query.answer("❌ Personagem não encontrado!", show_alert=True)

        character_info, clicked_text = await asyncio.gather(
            MESSAGE.get_text(
                "pt", "contador", "character_info",
                character_name=personagem.nome_personagem,
                anime_name=personagem.nome_anime,
                rarity=f"{personagem.raridade_full.emoji} {personagem.raridade_full.nome}",
            ),
            MESSAGE.get_text(
                "pt", "contador", "character_clicked_by",
                user_mention=query.from_user.mention,
                character_info=format_personagem_caption(personagem),
            ),
        )

        await send_media_by_chat_id(
            client=client,
            chat_id=query.message.chat.id,
            personagem=personagem,
            caption=clicked_text,
            reply_to_message_id=query.message.id,
        )
        await query.message.delete()
        await query.answer("✅ Personagem enviado!")

    except Exception as e:
        log_error(f"Erro ao visualizar personagem: {e}", "contador", exc_info=True)
        await query.answer("❌ Erro ao carregar personagem!", show_alert=True)


@Client.on_callback_query(filters.regex(r"^clear_msg"))
async def apagar_harem(client: Client, callback_query: CallbackQuery):
    try:
        await callback_query.message.delete()
    except:
        pass
    await callback_query.answer()
