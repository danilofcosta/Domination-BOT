from pyrogram import Client, filters
from pyrogram.types import *
from sqlalchemy import func, select
from datetime import datetime
from DB.models import PersonagemHusbando, PersonagemWaifu,Usuario,ColecaoUsuarioHusbando,ColecaoUsuarioWaifu
from types_ import TipoCategoria, TipoPerfil
import json
from domination.uteis import send_media_by_type
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

# Handler de mensagens comuns (exclui comandos)
@Client.on_message(
    filters.group
    & (filters.voice | filters.text | filters.media)
    & ~(filters.text & filters.regex(r"^[/!.]")),  # exclui linhas que começam com / ! .
    group=1
)
async def handle_group_messages(client: Client, message: Message):
    group: Chat = message.chat
    group_id = group.id
    g = client.genero.value  # "husbando" ou "waifu"
    
    # Inicializa níveis do dicionário
    if g not in message_counter:
        message_counter[g] = {}
    if group_id not in message_counter[g]:
        message_counter[g][group_id] = {
            "cont": 0 if group_id != -1001528803759 else 99,
            "id_mens": None,
            "per": None,
            "datetime": None,
        }

    # Incrementa contador
    message_counter[g][group_id]["cont"] += 1
   # print(f"[{group.title}] {group_id} Mensagens: {message_counter[g][group_id]['cont']} ({client.genero})")

    # Solta personagem a cada 100 mensagens
    if message_counter[g][group_id]["cont"] % 100 == 0:
        session = await client.get_reusable_session()

        if client.genero == TipoCategoria.HUSBANDO:
            result = await session.execute(
                select(PersonagemHusbando).order_by(func.random()).limit(1)
            )
        else:
            result = await session.execute(
                select(PersonagemWaifu).order_by(func.random()).limit(1)
            )

        personagem = result.scalars().first()

        async def upload_progress(current, total):
            print(f"Upload: {current * 100 / total:.1f}%")

        # Criar botão "Ver Personagem"
        view_text = await obter_mensagem_chat(client, group.id, "contador", "view_character")
        keyboard = InlineKeyboardMarkup([[
            InlineKeyboardButton(view_text, callback_data=f"view_character_{personagem.id}")
        ]])
        
        res: Message = await client.send_photo(
            chat_id=group.id,
            photo=personagem.data,
            caption=await create_secret_caption(client, personagem, client.genero, group.id),
            progress=upload_progress,
        )

        # Reseta contador e guarda personagem + datetime
        message_counter[g][group_id] = {
            "cont": 0,
            "id_mens": getattr(res, "id", getattr(res, "message_id", None)),
            "per": personagem,
            "datetime": datetime.now(),
        }
        print(f"Saiu: {personagem.nome_personagem}")

    # Deleta mensagem a cada 20 contagens
    elif message_counter[g][group_id]["cont"] % 20 == 0 and message_counter[g][group_id] :
        try:
            await message.delete()
            message_counter[g][group_id] = None
            await send_media_by_type(client, message, personagem, await create_secret_caption(client, personagem, client.genero, group.id),reply_markup=keyboard)
            


        except Exception as e:
            print("Erro ao deletar mensagem:", e)
            return
            


async def create_secret_caption(client, personagem, genero: TipoCategoria, chat_id: int):
    cap = (
        await obter_mensagem_chat(client, chat_id, "contador", "character_appeared", 
                        raridade=personagem.raridade_full.emoji, 
                        genero=genero.value.capitalize()),
        await obter_mensagem_chat(client, chat_id, "contador", "add_to_harem"),
        await obter_mensagem_chat(client, chat_id, "contador", "dominar_command"),
    )
    return "\n".join(cap)

# ===============================
# Callback: Ver Personagem
# ===============================
@Client.on_callback_query(filters.regex(r"^view_character_\d+$"))
async def view_character_callback(client: Client, query: CallbackQuery):
    try:
        # Extrair ID do personagem do callback_data
        character_id = int(query.data.replace("view_character_", ""))
        
        # Buscar personagem no banco
        session = await client.get_reusable_session()
        
        if client.genero == TipoCategoria.HUSBANDO:
            result = await session.execute(
                select(PersonagemHusbando).where(PersonagemHusbando.id == character_id)
            )
        else:
            result = await session.execute(
                select(PersonagemWaifu).where(PersonagemWaifu.id == character_id)
            )
        
        personagem = result.scalars().first()
        
        if not personagem:
            await query.answer("❌ Personagem não encontrado!", show_alert=True)
            return
        
        # Criar informações do personagem
        character_info = await obter_mensagem_chat(
            client, query.message.chat.id, "contador", "character_info",
            character_name=personagem.nome_personagem,
            anime_name=personagem.nome_anime,
            rarity=personagem.raridade_full.emoji + " " + personagem.raridade_full.nome
        )
        
        # Criar mensagem com informações de quem clicou
        clicked_text = await obter_mensagem_chat(
            client, query.message.chat.id, "contador", "character_clicked_by",
            user_mention=query.from_user.mention,
            character_info=character_info
        )
        
        # Enviar foto do personagem com as informações
        await client.send_photo(
            chat_id=query.message.chat.id,
            photo=personagem.data,
            caption=clicked_text,
            reply_to_message_id=query.message.id,
          
        )
        
        await query.answer("✅ Personagem enviado!")
        
    except Exception as e:
        print(f"Erro ao visualizar personagem: {e}")
        await query.answer("❌ Erro ao carregar personagem!", show_alert=True)
