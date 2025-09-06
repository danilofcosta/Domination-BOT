from pyrogram import Client, filters
from pyrogram.types import Message, InlineKeyboardMarkup, InlineKeyboardButton,CallbackQuery
from pyrogram.enums import ChatType, ChatMemberStatus
from DB.models import ChatTG

from domination.message import MESSAGE
from domination.uteis import COMMAND_LIST, dynamic_command_filter
from domination.lang_utils import obter_Idioma_chat,obter_Idiomas_disponiveis,obter_mensagem_chat,validar_Idioma,obter_enum_Idioma ,definir_Idioma_chat


@Client.on_message(
    filters.create(
        name=f"comand{' '.join(COMMAND_LIST.LANG.value)}",
        func=dynamic_command_filter,
        command=COMMAND_LIST.LANG.value,
    )
)
# @Client.on_message(filters.command(COMMAND_LIST.LANG.value) & filters.group)
async def comando_lang(client: Client, message: Message):
    """Comando para alterar o idioma do chat"""
    if message.chat.type == ChatType.PRIVATE:
        return

    try:
        # Obter informações do chat
        chat_member = await client.get_chat_member(
            message.chat.id, message.from_user.id
        )

        # Verificar se é administrador ou criador do chat
        if chat_member.status not in [
            ChatMemberStatus.OWNER,
            ChatMemberStatus.ADMINISTRATOR,
        ]:
            await message.reply(await obter_mensagem_chat(client, message.chat.id, "lang", "not_admin"), quote=True)
            return

    except Exception as e:
        print(f"Erro ao verificar permissões: {e}")
        await message.reply(
            await obter_mensagem_chat(client, message.chat.id, "lang", "error_checking_permissions"), quote=True
        )
        return

    # Verificar se foi fornecido um idioma
    if len(message.command) < 2:
        # Mostrar idiomas disponíveis
        await mostrar_idiomas_disponiveis(client, message)
        return

    # Obter o idioma solicitado
    idioma_solicitado = message.command[1].lower()

    # Validar idioma
    if not validar_idioma(idioma_solicitado):
        await message.reply(
            await obter_mensagem_chat(
                client, message.chat.id, "lang", "invalid_language"
            ),
            quote=True,
        )
        return

    # Obter o idioma enum
    novo_idioma = obter_enum_idioma(idioma_solicitado)

    # Salvar no banco
    sucesso = await definir_idioma_chat(client, message.chat.id, novo_idioma)

    if sucesso:
        # Obter mensagem no idioma atual do chat
        mensagem = await obter_mensagem_chat(
            client,
            message.chat.id,
            "lang",
            "language_updated",
            language=idioma_solicitado.upper(),
            chat_name=message.chat.title,
        )
        await message.reply(mensagem, quote=True)
    else:
        await message.reply(
            await obter_mensagem_chat(
                client, message.chat.id, "lang", "error_saving_language"
            ),
            quote=True,
        )


async def mostrar_idiomas_disponiveis(client: Client, message: Message):
    """Mostra os idiomas disponíveis"""

    # Obter idioma atual do chat
    idioma_atual = await obter_Idioma_chat(client, message.chat.id)

    # Obter idiomas disponíveis
    idiomas = obter_Idiomas_disponiveis()

    # Criar botões para cada idioma
    botoes = []

    # Criar botões em linhas de 3
    codigos = list(idiomas.keys())
    for i in range(0, len(codigos), 3):
        linha = []
        for j in range(3):
            if i + j < len(codigos):
                codigo = codigos[i + j]
                emoji, nome = idiomas[codigo]
                # Marcar idioma atual
                if codigo == idioma_atual:
                    nome += " ✅"
                linha.append(
                    InlineKeyboardButton(
                        f"{emoji} {nome}", callback_data=f"lang_{codigo}"
                    )
                )
        botoes.append(linha)

    keyboard = InlineKeyboardMarkup(botoes)

    # Obter mensagem no idioma atual do chat
    mensagem = await obter_mensagem_chat(
        client,
        message.chat.id,
        "lang",
        "choose_language",
        current_language=idioma_atual.upper(),
    )

    await message.reply(
        mensagem,
        reply_markup=keyboard,
        quote=True,
    )


@Client.on_callback_query(filters.regex(r"^lang_[a-z]{2}$"))
async def callback_lang(client: Client, query:CallbackQuery):
    """Callback para seleção de idioma"""

    # Verificar se o usuário é administrador
    try:
        chat_member = await client.get_chat_member(
            query.message.chat.id, query.from_user.id
        )

        if chat_member.status  not in [
            ChatMemberStatus.OWNER,
            ChatMemberStatus.ADMINISTRATOR,
        ]:
            await query.answer(
                await obter_mensagem_chat(
                    client, query.message.chat.id, "lang", "not_admin"
                ),
                show_alert=True,
            )
            return

    except Exception as e:
        print(f"Erro ao verificar permissões: {e}")
        await query.answer(
            await obter_mensagem_chat(
                client, query.message.chat.id, "lang", "error_checking_permissions"
            ),
            show_alert=True,
        )
        return

    # Obter idioma selecionado
    idioma_selecionado = query.data.split("_")[1]

    # Validar idioma
    if not validar_Idioma(idioma_selecionado):
        await query.answer(
            await obter_mensagem_chat(
                client, query.message.chat.id, "lang", "invalid_language"
            ),
            show_alert=True,
        )
        return

    # Obter o idioma enum
    novo_idioma = obter_enum_Idioma(idioma_selecionado)

    # Salvar no banco
    sucesso = await definir_Idioma_chat(client, query.message.chat.id, novo_idioma,chat=query.message.chat)

    if sucesso:
        # Obter mensagem no idioma atual do chat
        mensagem = await obter_mensagem_chat(
            client,
            query.message.chat.id,
            "lang",
            "language_updated",
            language=idioma_selecionado.upper(),
            chat_name=query.message.chat.title,
        )
        if not mensagem:
            await query.answer(
                'o idioma escolheido ainda não esta disponivel para este chat',
                show_alert=True,
            )
            return
        await query.edit_message_text(mensagem)
    else:
        await query.answer(
            await obter_mensagem_chat(
                client, query.message.chat.id, "lang", "error_saving_language"
            ),
            show_alert=True,
        )
