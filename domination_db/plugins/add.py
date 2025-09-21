from pyrogram import *
from pyrogram.types import *
from pyrogram.enums import ChatType
from DB.models import PersonagemHusbando, PersonagemWaifu
from DB.database import DATABASE
from settings import Settings

from types_ import COMMAND_LIST_DB, TipoCategoria, TipoEvento, TipoMidia, TipoRaridade
from uteis import (
    check_admin_group,
    create_prelist,
    dynamic_command_filter,
    format_personagem_caption,
    send_media_by_chat_id,
)


@Client.on_message(
    filters.create(
        name=f"comand{''.join(COMMAND_LIST_DB.ADDCHAR.value)}",
        func=dynamic_command_filter,
        command=COMMAND_LIST_DB.ADDCHAR.value,
    )
)
@Client.on_message(filters.command(COMMAND_LIST_DB.ADDCHAR.value) & filters.private)
async def addchar_command(client: Client, message: Message):
    base_per: PersonagemHusbando | PersonagemWaifu = (
        PersonagemHusbando
        if getattr(client, "genero", TipoCategoria.HUSBANDO) == TipoCategoria.HUSBANDO
        else PersonagemWaifu
    )

    if not await check_admin_group(client, user_id=message.from_user.id):
        await message.reply("❌ Comando disponível apenas em chats admin.", quote=True)
        return

    # 🔹 Detectar mídia
    media_msg = message.reply_to_message or message
    if media_msg.photo:
        fileid = media_msg.photo.file_id
        tipo_midia = TipoMidia.IMAGEM_FILEID
    elif media_msg.video:
        fileid = media_msg.video.file_id
        tipo_midia = TipoMidia.VIDEO_FILEID
    else:
        # Nenhuma mídia → mostra ajuda
        rs = [f"{k} ({v.name})" for k, v in create_prelist(TipoRaridade, "r").items()]
        es = [f"{k} ({v.name})" for k, v in create_prelist(TipoEvento, "e").items()]
        await message.reply_text(
            f"❌ Por favor, envie uma foto ou vídeo junto com o comando no formato:\n"
            f"`/addchar Nome, Anime, r-<raridade>, e-<evento>`\n\n"
            f"Exemplo:\n`/addchar Rem, Re:Zero, r5, e2`\n\n"
            f"*Raridades disponíveis:*\n" + "\n".join(rs) + "\n\n"
            f"*Eventos disponíveis:*\n" + "\n".join(es),
        )
        return

    # 🔹 Parsing do texto / legenda
    text = message.caption or message.text
    try:
        _, args = text.split(maxsplit=1)  # remove o comando /addchar
        parts = [x.strip() for x in args.split(",")]
        nome = parts[0]
        anime = parts[1] if len(parts) > 1 else ""
        res = parts[2:] if len(parts) > 2 else []
    except ValueError:
        await message.reply("❌ Formato inválido. Use: `/addchar Nome, Anime, rX, eY`", parse_mode="Markdown")
        return

    # 🔹 Criar enums
    pre_evento = create_prelist(TipoEvento, "e")
    pre_raridade = create_prelist(TipoRaridade, "r")
    enum_evento = TipoEvento.SEM_EVENTO
    enum_raridade = TipoRaridade.COMUM  # default se não informado

    for t in res:
        t_lower = t.lower()
        if t_lower.startswith("e"):
            enum_evento = pre_evento.get(t_lower, TipoEvento.SEM_EVENTO)
        elif t_lower.startswith("r"):
            enum_raridade = pre_raridade.get(t_lower, TipoRaridade.COMUM)

    # 🔹 Criar objeto do personagem
    pre = base_per(
        nome_personagem=nome,
        nome_anime=anime,
        evento=enum_evento,
        raridade=enum_raridade,
        data=fileid,
        tipo_midia=tipo_midia,
        extras={
            "file_id": fileid,
            "restrito": {
                "id": message.from_user.id,
                "first_name": message.from_user.first_name,
                "username": message.from_user.username,
                "mention": message.from_user.mention,
            },
            "request": {"chat_id": message.chat.id, "message_id": message.id},
            "comand": message.command,
        },
    )

    # 🔹 Salvar no banco
    try:
        pre = await DATABASE.add_object_commit(pre)
        await message.reply(
            f"✅ Personagem '{pre.nome_personagem}' adicionado com sucesso ao banco de dados com ID {pre.id}!"
        )
        await send_media_by_chat_id(
            client=client,
            chat_id=Settings().GROUP_DATABASE_ID,
            personagem=pre,
            caption=format_personagem_caption(pre, mention=message.from_user.mention),
            reply_markup=None,
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        await message.reply_text(f"❌ Erro ao adicionar personagem: {e}")
