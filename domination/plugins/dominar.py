from pyrogram import Client, filters
from pyrogram.types import *
from sqlalchemy import func, select
from datetime import datetime
from DB.models import PersonagemHusbando, PersonagemWaifu,Usuario,ColecaoUsuarioHusbando,ColecaoUsuarioWaifu
from types_ import TipoCategoria, TipoPerfil
import json
from domination.uteis import COMMAND_LIST
from domination.message import MESSAGE
from domination.lang_utils import obter_mensagem_chat

# Estrutura:
# message_counter[g][group_id] = {
#     "cont": int,
#     "id_mens": int | None,
#     "per": PersonagemHusbando | PersonagemWaifu | None,
#     "datetime": datetime | None
# }
message_counter = {}


@Client.on_message(filters.group & filters.command(COMMAND_LIST.DOMINAR.value))
async def handle_dominar(client: Client, message: Message):
    group_id = message.chat.id
    g = client.genero.value  # "husbando" ou "waifu"

    # Verifica se há personagem ativo
    if g not in message_counter or group_id not in message_counter[g] or not message_counter[g][group_id]["per"]:
        # await message.reply("❌ Não há nenhum personagem ativo para dominar agora!")
        return

    if len(message.command) < 2:
        await message.reply(await obter_mensagem_chat(client, message.chat.id, "contador", "use_dominar"))
        return

    nome_user = " ".join(message.command[1:]).casefold()
    per = message_counter[g][group_id]["per"]

    if nome_user == per.nome_personagem.casefold():
        # Cabeçalho simplificado
        genero_texto = "husbando" if client.genero == TipoCategoria.HUSBANDO else "waifu"
        cabeçario = await obter_mensagem_chat(client, message.chat.id, "contador", "new_character", 
                                   user_mention=message.from_user.mention, 
                                   genero=genero_texto) + "\n"

        cap = (
            cabeçario,
            await obter_mensagem_chat(client, message.chat.id, "contador", "name", name=per.nome_personagem.title()),
            await obter_mensagem_chat(client, message.chat.id, "contador", "source", source=per.nome_anime.title()),
            await obter_mensagem_chat(client, message.chat.id, "contador", "rarity", 
                           rarity_emoji=per.raridade_full.emoji, 
                           rarity_name=per.raridade_full.nome.capitalize()),
            await obter_mensagem_chat(client, message.chat.id, "contador", "time_spent", 
                           time=tempo_gasto(message_counter[g][group_id]['datetime']))
        )

        # Transformar usuário do Telegram em dict
        telegram_from_user = {
            "id": message.from_user.id,
            "first_name": message.from_user.first_name,
            "last_name": message.from_user.last_name,
            "username": message.from_user.username,
            "is_bot": message.from_user.is_bot
        }
        telegram_from_user_json = json.dumps(telegram_from_user, ensure_ascii=False)

        # Salvar no banco
        session = await client.get_reusable_session()
        result = await session.execute(
            select(Usuario).where(Usuario.telegram_id == message.from_user.id)
        )
        user_exist = result.scalars().first()

        if not user_exist:
            user = Usuario(
                telegram_id=message.from_user.id,
                telegram_from_user=telegram_from_user_json,
                fav_h_id=per.id if client.genero == TipoCategoria.HUSBANDO else None,
                fav_w_id=per.id if client.genero == TipoCategoria.WAIFU else None,
                perfil_status=TipoPerfil.USUARIO
            )
            session.add(user)

        # Adiciona personagem à coleção do usuário
        colecao = (
            ColecaoUsuarioWaifu(
                telegram_id=message.from_user.id,
                id_global=per.id
            ) if client.genero == TipoCategoria.WAIFU else
            ColecaoUsuarioHusbando(
                telegram_id=message.from_user.id,
                id_global=per.id
            )
        )
        session.add(colecao)

        try:
            await session.commit()
        except Exception as e:
            await session.rollback()
            print("Erro ao salvar usuário/coleção:", e)

        await message.reply(
            "\n".join(cap),
            quote=True,
            reply_markup=InlineKeyboardMarkup([

                [InlineKeyboardButton(await obter_mensagem_chat(client, message.chat.id, "contador", "inline_button"), switch_inline_query_current_chat=f"user.harem.{message.from_user.id}")]
            ])
        )
        message_counter[g][group_id] = None  # limpa personagem ativo
    else:
        await message.reply(await obter_mensagem_chat(client, message.chat.id, "contador", "wrong_character"))


def tempo_gasto(start_time: datetime):
    """Calcula tempo decorrido desde 'start_time' e retorna string formatada"""
    if not isinstance(start_time, datetime):
        return "0s"
    total_segundos = int((datetime.now() - start_time).total_seconds())
    horas = total_segundos // 3600
    minutos = (total_segundos % 3600) // 60
    segundos = total_segundos % 60
    if horas > 0:
        return f"{horas}h {minutos}m {segundos}s"
    elif minutos > 0:
        return f"{minutos}m {segundos}s"
    else:
        return f"{segundos}s"
