from DB.database import DATABASE
from DB.models import ColecaoUsuarioHusbando, ColecaoUsuarioWaifu, PersonagemHusbando, PersonagemWaifu, Usuario
from domination.message import MESSAGE
from types_ import COMMAND_LIST_ADMIN, TipoCategoria
from uteis import add_per_coletion, check_admin_group, check_mentions, create_bts_y_or_n, dynamic_command_filter, format_personagem_caption, send_media_by_chat_id
from pyrogram import Client, filters
from pyrogram.types import *

@Client.on_message(
    filters.create(
        name=f"comand{' '.join(COMMAND_LIST_ADMIN.ADD_CHAR.value)}",
        func=dynamic_command_filter,
        command=COMMAND_LIST_ADMIN.ADD_CHAR.value,
    )
)
async def adchar_harem(client: Client, message: Message):
    if await check_admin_group(client, user_id=message.from_user.id) == False:
        return await message.reply(
            MESSAGE.get_text("pt", "erros", "not_admin_bot"), quote=True
        )

    else:
        id_chat: List[int] = None
        receive: int | List[int] = None

        if len(message.command) > 2:
            return await message.reply(
                MESSAGE.get_text("pt", "erros", "error_id_required"), quote=True
            )

        else:
            if message.reply_to_message:
                if message.reply_to_message.from_user.id == client.me.id:
                    pass  # ainda n implementado
                elif not message.reply_to_message.from_user.is_bot:
                    receive = message.reply_to_message.from_user.id
                    # remove o comando do começo
                    args = message.command[1:]  # tudo depois do comando
                    if args:
                        id_chat = args[-1]  # último argumento
            else:
                # Ex: /add_char 12 @dog244
                mentioned_ids = await check_mentions(client=client, message=message)
                if mentioned_ids:
                    receive = mentioned_ids  # quem vai receber
                    # pega o "id" ou argumento que não é menção
                    args = [
                        arg for arg in message.command[1:] if not arg.startswith("@")
                    ]
                    if args:
                        id_chat = args[-1]  # o argumento restante

            # Teste final
            if id_chat and receive:
                personagem_cls = (
                    PersonagemWaifu
                    if client.genero == TipoCategoria.WAIFU
                    else PersonagemHusbando
                )
                print(f"id_chat: {id_chat}, receive: {receive}")
                existe_prer = await DATABASE.get_id_primary(
                    model_class=personagem_cls, id_value=id_chat
                )

                if existe_prer:

                    ma = create_bts_y_or_n(
                        prefix=f"{COMMAND_LIST_ADMIN.ADD_CHAR.value}",
                        callback_data_true=f"y_{message.from_user.id}_{receive}_{id_chat}",
                        callback_data_false=f"n_{message.from_user.id}_{receive}_{id_chat}",
                    )

                    await send_media_by_chat_id(
                        client=client,
                        chat_id=message.chat.id,
                        personagem=existe_prer,
                        reply_markup=ma,
                        caption=f"Adicionar ao coleçao de {message.reply_to_message.from_user.mention or None}\n{format_personagem_caption(existe_prer)}",
                    )
                else:
                    return message.reply(f"id {id_chat} não encontrado")


@Client.on_callback_query(filters.regex(f"^{COMMAND_LIST_ADMIN.ADD_CHAR.value}_"))
async def call_add_char(client: Client, query: CallbackQuery):
    try:
        _, action, sent, receive, id_chat = query.data.split("_")
        receive = int(receive)
        sent = int(sent)
        id_chat = int(id_chat)
    except (ValueError, IndexError) as e:
        await query.answer("Erro ao processar callback", show_alert=True)
        return

    # Verifica se quem enviou o comando original é admin
    if await check_admin_group(client, user_id=sent) == False:
        await query.answer(
            MESSAGE.get_text("pt", "erros", "not_admin_bot"), show_alert=True
        )
        return

    if action == "y":
        try:
            # Busca informações do usuário que vai receber o personagem
            user_info = await client.get_users(receive)

            # Cria o usuário com as informações corretas
            user = Usuario(
                telegram_id=receive,  # ID de quem vai receber
                telegram_from_user={
                    "id": user_info.id,
                    "NAME": user_info.first_name,
                    "first_name": user_info.first_name,
                    "last_name": user_info.last_name,
                    "username": user_info.username,
                    "is_bot": user_info.is_bot,
                    'metion':user_info.mention
                },
                fav_h_id=   None
                    if client.genero == TipoCategoria.WAIFU else id_chat
                ,fav_w_id=   None
                    if client.genero == TipoCategoria.HUSBANDO else id_chat
            )
            # Adiciona o personagem para o usuário correto
            if not await add_per_coletion(
                from_user_id=receive,  # ID de quem vai receber
                id_char=id_chat,
                colecao_class=(
                    ColecaoUsuarioHusbando
                    if client.genero == TipoCategoria.HUSBANDO
                    else ColecaoUsuarioWaifu
                ),
                user=user,
            ):
                await query.answer("Erro ao adicionar personagem", show_alert=True)
                return

            await query.answer("Personagem adicionado com sucesso!", show_alert=True)
            await query.message.edit_text("✅ Personagem adicionado com sucesso!")

        except Exception as e:
            await query.answer(f"Erro: {str(e)}", show_alert=True)
    else:
        try:
            await query.message.delete()
        except:
            pass

