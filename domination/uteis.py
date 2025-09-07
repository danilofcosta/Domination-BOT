
from pyrogram.types import *
from pyrogram import Client,filters

from DB.models import PersonagemHusbando, PersonagemWaifu
from types_ import TipoCategoria, TipoEvento, TipoMidia
from enum import Enum as PyEnum

PREXIFOS = ["/", ".", "!"]


def create_bts_y_or_n(prefix: str, callback_data_true: str, callback_data_false: str):
    keyboard = [
        [
            InlineKeyboardButton("✅", callback_data=f"{prefix}_{callback_data_true}"),
            InlineKeyboardButton("❌", callback_data=f"{prefix}_{callback_data_false}"),
        ]
    ]
    return InlineKeyboardMarkup(keyboard)


def format_personagem_caption(
    personagem: PersonagemWaifu | PersonagemHusbando, user=None
):
    """Gera legenda do personagem com limite de 1024 caracteres"""
    nome: str = personagem.nome_personagem
    anime: str = personagem.nome_anime

    # Raridade
    if personagem.raridade_full:
        raridade = f"{personagem.raridade_full.emoji or ''} {personagem.raridade_full.cod.value.capitalize()}"
    else:
        raridade = (
            personagem.raridade.value.capitalize()
            if personagem.raridade
            else "Desconhecida"
        )

    # Evento
    if personagem.evento_full:
        evento = f"{personagem.evento_full.emoji or ''} {personagem.evento_full.cod.value.capitalize()} {personagem.evento_full.emoji or ''}"
    else:
        evento = (
            personagem.evento.value.capitalize()
            if personagem.evento and personagem.evento != TipoEvento.SEM_EVENTO
            else ""
        )
    e = "essa" if personagem.genero == TipoCategoria.WAIFU else "esse"
    head = (
        f"Wow veja {e} {personagem.genero.value.capitalize()}\n\n"
        if not user
        else f"Wow! Confira {e}  {personagem.genero.value.capitalize()} de {user}\n\n"
    )
    caption = (
        f"{head}"
        f"<b>{anime.capitalize()}</b>\n"
        f"<b>{personagem.id}</b> :{nome.capitalize()}\n"
        f"<b>{raridade.capitalize()}</b>\n\n"
        f"{evento}"
    )
    # print(caption)
    return "".join(caption)


async def send_media_by_type(
    client: Client, message: Message, personagem, caption: str, reply_markup=None
):
    """
    Função que verifica o tipo de mídia do personagem e envia de acordo.

    Args:
        client: Cliente do Pyrogram
        message: Mensagem original
        personagem: Objeto do personagem com data e tipo_midia
        caption: Legenda da mensagem
        reply_markup: Teclado inline (opcional)
    """
    try:
        if personagem.tipo_midia == TipoMidia.IMAGEM_URL:
            return await message.reply_photo(
                photo=personagem.data,
                caption=caption,
                reply_markup=reply_markup,
                quote=True,
            )
        elif personagem.tipo_midia == TipoMidia.IMAGEM_FILEID:
            return await message.reply_photo(
                photo=personagem.data,
                caption=caption,
                reply_markup=reply_markup,
                quote=True,
            )
        elif personagem.tipo_midia == TipoMidia.IMAGEM_BYTES:
            return await message.reply_photo(
                photo=personagem.data,
                caption=caption,
                reply_markup=reply_markup,
                quote=True,
            )
        elif personagem.tipo_midia == TipoMidia.IMAGEM_ARQUIVO:
            return await message.reply_photo(
                photo=personagem.data,
                caption=caption,
                reply_markup=reply_markup,
                quote=True,
            )
        elif personagem.tipo_midia == TipoMidia.IMAGEM_BASE64:
            return await message.reply_photo(
                photo=personagem.data,
                caption=caption,
                reply_markup=reply_markup,
                quote=True,
            )
        elif personagem.tipo_midia == TipoMidia.VIDEO_BYTES:
            return await message.reply_video(
                video=personagem.data,
                caption=caption,
                reply_markup=reply_markup,
                quote=True,
            )
        elif personagem.tipo_midia == TipoMidia.VIDEO_BASE64:
            return await message.reply_video(
                video=personagem.data,
                caption=caption,
                reply_markup=reply_markup,
                quote=True,
            )
        elif personagem.tipo_midia == TipoMidia.VIDEO_ARQUIVO:
            return await message.reply_video(
                video=personagem.data,
                caption=caption,
                reply_markup=reply_markup,
                quote=True,
            )
        elif personagem.tipo_midia == TipoMidia.VIDEO_URL:
            return await message.reply_video(
                video=personagem.data,
                caption=caption,
                reply_markup=reply_markup,
                quote=True,
            )
        elif personagem.tipo_midia == TipoMidia.VIDEO_FILEID:
            return await message.reply_video(
                video=personagem.data,
                caption=caption,
                reply_markup=reply_markup,
                quote=True,
            )
        else:
            return await message.reply_photo(
                photo=personagem.data,
                caption=caption,
                reply_markup=reply_markup,
                quote=True,
            )
    except Exception as e:
        return await message.reply(
            f"{caption}\n\n📎 Mídia: {personagem.tipo_midia.value}",
            reply_markup=reply_markup,
            quote=True,
        )


def dynamic_command_filter(filter, client: Client, message: Message) -> bool:

    comandos_esperados = []
    if not message.text:
        return False
    # Pega o que você passou em filters.create(..., commands="fav")
    comando = getattr(filter, "command", None)

    if comando:
        if type(comando) is list:
            comandos_esperados.extend(
                [f"{client.genero.value[0].lower()}{c.lower()}" for c in comando]
            )
        else:
            comandos_esperados.append(f"{client.genero.value[0].lower()}{comando}")

    text_lower_f = message.text.lower()
    for comando in comandos_esperados:
        for pre in PREXIFOS:
            text_lower = text_lower_f.split()[0].split("@")[0]
            if text_lower == f"{pre}{comando}":
                print(text_lower)
                excluido_prefixo = text_lower_f.replace(pre, "", 1).split(" ")
                message.command = excluido_prefixo
                print(excluido_prefixo)
                return True
        # if text_lower.startswith(f"{pre}{comando}") :
        #    excluido_prefixo = text_lower.replace(pre, "", 1).split(" ")
        #   message.command = excluido_prefixo  # ['fav', '506']
        #    return True

    return False


async def get_first_photo_file_id(app: Client, user_id: int) -> str | None:
    """Retorna o file_id da primeira foto do usuário/chat."""
    async for photo in app.get_chat_photos(user_id):
        return photo.file_id
    return None


def re_linhas(lista: list, tamanho: int = 3) -> list:
    return [lista[i : i + tamanho] for i in range(0, len(lista), tamanho)]


def create_bt_clear() -> InlineKeyboardButton:
    return InlineKeyboardButton(f"🗑", callback_data=f"clear_msg")


@Client.on_callback_query(filters.regex(r"^clear_msg"))
async def apagar_harem(client: Client, callback_query: CallbackQuery):

    try:
        await callback_query.message.delete()
    except:
        pass
