from pyrogram import *
from pyrogram.types import *
from DB.models import PersonagemHusbando, PersonagemWaifu
from DB.database import DATABASE, Session
from settings import Settings
from teste import create_prelist
from types_ import COMMAND_LIST_DB, TipoCategoria, TipoEvento, TipoMidia, TipoRaridade
from uteis import check_admin_group, dynamic_command_filter, format_personagem_caption, send_media_by_chat_id




@Client.on_message(
    filters.create(
        name=f"comand{''.join(COMMAND_LIST_DB.ADDCHAR.value)}",
        func=dynamic_command_filter,
        command=COMMAND_LIST_DB.ADDCHAR.value,
    )
)
@Client.on_message(filters.command(COMMAND_LIST_DB.ADDCHAR.value) & filters.private)
async def addchar_command(client: Client, message: Message):
    print('ok')
   
    base_per: PersonagemHusbando | PersonagemWaifu = (
        PersonagemHusbando
        if client.genero == TipoCategoria.HUSBANDO
        else PersonagemWaifu
    )
    if await check_admin_group(client,user_id= message.from_user.id)==False:
        await message.reply("❌ Comando disponível apenas em chats admin .", quote=True)
        return

    if message.reply_to_message and (
        message.reply_to_message.photo or message.reply_to_message.video
    ):
        fileid = (
            message.reply_to_message.photo.file_id
            if message.reply_to_message.photo
            else message.reply_to_message.video.file_id
        )
        tipo_midia: TipoMidia = (
            TipoMidia.IMAGEM_FILEID
            if message.reply_to_message.photo
            else TipoMidia.VIDEO_FILEID
        )
        nome, anime, *res = (
            message.text.strip().replace(f"{message.text.split()[0]}", "").split(",")
        )
        # nome  obrigatorio
        # anime  obrigatorio
        # raridade  esperada e r0, r1, r2, r3, r4, r5, r6
        # evento  esperada e e0, e1, e2, e3, e4, e5, e6 or null
        pre_evento = create_prelist(TipoEvento, "e")
        pre_raridade = create_prelist(TipoRaridade, "r")
        enum_evento: TipoEvento | None = None
        enum_raridade: TipoRaridade | None = None
        for t in res:
            if t.lower().startswith("e"):
                enum_evento: TipoEvento = pre_evento.get(
                    t.lower(), TipoEvento.SEM_EVENTO
                )
            elif t.lower().startswith("r"):
                enum_raridade: TipoRaridade = pre_raridade.get(t.lower())

        pre = base_per(
            nome_personagem=nome.strip(),
            nome_anime=anime.strip(),
            evento=enum_evento or TipoEvento.SEM_EVENTO,
            raridade=enum_raridade or TipoRaridade.COMUM,
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

        # Salvar no banco de dados primeiro para obter o ID
    
     
        try:
            pre= await DATABASE.add_object_comit(pre)
            await message.reply(
                f"✅ Personagem '{pre.nome_personagem}' adicionado com sucesso ao banco de dados com ID {pre.id}!"
            )  # Atualiza o objeto com o ID gerado   
                        
            await send_media_by_chat_id(
                client=client,
                chat_id=Settings().GROUP_DATABASE_ID,
                personagem=pre,
                caption=format_personagem_caption(pre,mention=message.from_user.mention),
                reply_markup=None,
            )

        except Exception as e:
            await message.reply_text(f"❌ Erro ao adicionar personagem: {e}")
    else:
        rs = []
        es = []

        for key, value in create_prelist(TipoRaridade, "r").items():
            rs.append(f"{key} ({value.name})")
        for key, value in create_prelist(TipoEvento, "e").items():
            es.append(f"{key} ({value.name})")

        raridades = "\n".join(rs)
        eventos = "\n".join(es)

        await message.reply_text(
            f"❌ Por favor, responda a uma foto ou vídeo com o comando no formato: "
            f"/addchar nome, anime, r-<raridade>, e-<evento> "
            f"<exemplo: /addchar Rem, Re:Zero, r5, e2>,\n"
            f"Raridades disponíveis:\n{raridades}\n"
            f"Eventos disponíveis:\n{eventos}"
        )