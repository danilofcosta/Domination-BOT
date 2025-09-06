from pyrogram import Client, filters
from pyrogram.types import (
    Message,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    CallbackQuery,
)
from sqlalchemy import select, func
from DB.models import Usuario, PersonagemWaifu, PersonagemHusbando
from types_ import ModoHarem, TipoCategoria
from domination.uteis import COMMAND_LIST, dynamic_command_filter, send_media_by_type
from domination.message import MESSAGE
from domination.lang_utils import obter_mensagem_chat


# -----------------------------
# Comando Harem Mode
# -----------------------------
@Client.on_message(
    filters.create(
        name=f"comand{' '.join(COMMAND_LIST.HAREMMODE.value)}",
        func=dynamic_command_filter,
        command=COMMAND_LIST.HAREMMODE.value,
    )
)
@Client.on_message(filters.command(COMMAND_LIST.HAREMMODE.value) & filters.private)
async def harem_mode(client: Client, message: Message):
    user_id = message.from_user.id

    # Força uma nova sessão para garantir dados frescos
    async with await client.get_session() as session:
        # Força leitura direta do banco com uma nova query
        stmt = select(Usuario).where(Usuario.telegram_id == user_id)
        result = await session.execute(stmt)
        usuario: Usuario = result.scalar_one_or_none()
        if not usuario:
            await message.reply_text(
                await obter_mensagem_chat(client, message.chat.id, "erros", "error_not_registered"),
            )
            return

        # Configurações do usuário
        configs = (
            usuario.configs_h
            if client.genero == TipoCategoria.HUSBANDO
            else usuario.configs_w
        )
        print(f"Configs lidos do banco na função harem_mode: {configs}")
        modo_harem = (
            configs.get("modo_harem", ModoHarem.PADRAO.value)
            if configs
            else ModoHarem.PADRAO.value
        )
        print(f"Modo harém detectado: {modo_harem}")

        # Cria botões inline (cada botão em uma linha)
        bts = []
        for cmd in ModoHarem:
            check = (
                await obter_mensagem_chat(client, message.chat.id, "harem_mode", "check_mark")
                if modo_harem == cmd.value
                else ""
            )
            bts.append(
                [
                    InlineKeyboardButton(
                        f"{cmd.value} {check}",
                        callback_data=f"setmodoharem_{cmd.value}",
                    )
                ]
            )

        # Seleciona personagem aleatório
        if client.genero == TipoCategoria.HUSBANDO:
            stmt = select(PersonagemHusbando).order_by(func.random()).limit(1)
        else:
            stmt = select(PersonagemWaifu).order_by(func.random()).limit(1)

        result = await session.execute(stmt)
        personagem = result.scalars().first()

        response_text = await obter_mensagem_chat(client, message.chat.id, "harem_mode", "choose_option")

        await send_media_by_type(
            client=client,
            message=message,
            personagem=personagem,
            caption=response_text,
            reply_markup=InlineKeyboardMarkup(bts),
        )


# -----------------------------
# Callback para alterar o modo do harém
# -----------------------------
@Client.on_callback_query(filters.regex(r"^setmodoharem_.*$"))
async def setmodoharem(client: Client, query: CallbackQuery):
    await query.answer()
    user_id = query.from_user.id
    modo_selecionado = query.data.split("_")[-1]

    async with await client.get_reusable_session() as session:
        # Busca o usuário
        stmt = select(Usuario).where(Usuario.telegram_id == user_id)
        result = await session.execute(stmt)
        usuario: Usuario = result.scalar_one_or_none()

        if not usuario:
            await query.message.edit_text(
                await obter_mensagem_chat(client, query.message.chat.id, "erros", "error_not_registered")
            )
            return

        # Atualiza as configurações do harém
        if client.genero == TipoCategoria.HUSBANDO:
            configs = usuario.configs_h or {}
            print(f"configs_h antes da mudança: {configs}")
        else:
            configs = usuario.configs_w or {}
            print(f"configs_w antes da mudança: {configs}")

        configs["modo_harem"] = modo_selecionado
        print(f"Configs após mudança: {configs}")

        if client.genero == TipoCategoria.HUSBANDO:
            usuario.configs_h = configs
            print(f"usuario.configs_h definido como: {usuario.configs_h}")
        else:
            usuario.configs_w = configs
            print(f"usuario.configs_w definido como: {usuario.configs_w}")

        # Força o SQLAlchemy a detectar a mudança
        from sqlalchemy.orm.attributes import flag_modified

        if client.genero == TipoCategoria.HUSBANDO:
            flag_modified(usuario, "configs_h")
        else:
            flag_modified(usuario, "configs_w")

        session.add(usuario)

        try:
            await session.commit()
            print(
                await obter_mensagem_chat(
                    client, query.message.chat.id, "harem_mode", "mode_updated", mode=modo_selecionado
                )
            )
        except Exception as e:
            await session.rollback()
            print("Erro ao salvar modo do harém:", e)
            await query.message.edit_text(
                await obter_mensagem_chat(client, query.message.chat.id, "harem_mode", "error_saving_mode")
            )
            return

    # Atualiza os botões inline com o check correto
    bts = []
    for cmd in ModoHarem:
        check = (
            await obter_mensagem_chat(client, query.message.chat.id, "harem_mode", "check_mark")
            if cmd.value == modo_selecionado
            else ""
        )
        bts.append(
            [
                InlineKeyboardButton(
                    f"{cmd.value} {check}", callback_data=f"setmodoharem_{cmd.value}"
                )
            ]
        )
    try:
        print(f"Atualizando botões inline com: {modo_selecionado}")
        await query.message.edit_reply_markup(InlineKeyboardMarkup(bts))
        print(await obter_mensagem_chat(client, query.message.chat.id, "harem_mode", "buttons_updated"))
    except Exception as e:
        print(
            await obter_mensagem_chat(client, query.message.chat.id, "harem_mode", "error_updating_buttons", error=str(e))
        )
        return
