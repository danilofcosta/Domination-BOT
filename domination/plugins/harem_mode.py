from pyrogram import Client, filters
from pyrogram.types import (
    Message,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    CallbackQuery,
)
from sqlalchemy import select, func
from DB.models import Usuario, PersonagemWaifu, PersonagemHusbando, Evento_Midia, Raridade_Midia
from types_ import ModoHarem, TipoCategoria, TipoEvento, TipoRaridade,COMMAND_LIST
from uteis import  create_bt_clear, dynamic_command_filter, re_linhas, send_media_by_type
from domination.message import MESSAGE
from domination.logger import log_info, log_error, log_debug


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
                MESSAGE.get_text("pt", "erros", "error_not_registered"),
            )
            return

        # Configurações do usuário
        configs = (
            usuario.configs_h
            if client.genero == TipoCategoria.HUSBANDO
            else usuario.configs_w
        )
        log_debug(f"Configs lidos do banco na função harem_mode: {configs}", "harem_mode")
        modo_harem = (
            configs.get("modo_harem", ModoHarem.PADRAO.value)
            if configs
            else ModoHarem.PADRAO.value
        )
        log_debug(f"Modo harém detectado: {modo_harem}", "harem_mode")

        # Cria botões inline (cada botão em uma linha)
        bts = []
        for cmd in ModoHarem:
            check = (
                MESSAGE.get_text("pt", "harem_mode", "check_mark")
                if modo_harem.split("_")[0] == cmd.value
                else ""
            )
            bts.append(
                
                    InlineKeyboardButton(
                        f"{cmd.value} {check}",
                        callback_data=f"setmodoharem_{cmd.value if check == '' else modo_harem}",
                    )
                
            )

        # Seleciona personagem aleatório
        if client.genero == TipoCategoria.HUSBANDO:
            stmt = select(PersonagemHusbando).order_by(func.random()).limit(1)
        else:
            stmt = select(PersonagemWaifu).order_by(func.random()).limit(1)

        result = await session.execute(stmt)
        personagem = result.scalars().first()

        response_text = MESSAGE.get_text("pt", "harem_mode", "choose_option")

        await send_media_by_type(
            client=client,
            message=message,
            personagem=personagem,
            caption=response_text,
            reply_markup=InlineKeyboardMarkup( re_linhas(bts)),
        )


# -----------------------------
# Callback para alterar o modo do harém
# -----------------------------
@Client.on_callback_query(filters.regex(r"^setmodoharem_.*$"))
async def setmodoharem(client: Client, query: CallbackQuery):

    await query.answer()
    user_id = query.from_user.id
    setmodoharem, modo_selecionado, *res = query.data.split("_")

    if (
        modo_selecionado in [ModoHarem.RARIDADE.value, ModoHarem.EVENTO.value]
        and "set" not in res
    ):
        buttons = []
        # Buscar do banco para ter emojis dos modelos
        async with await client.get_reusable_session() as session:
            if modo_selecionado == ModoHarem.EVENTO.value:
                result = await session.execute(select(Evento_Midia))
                for ev in result.scalars().all():
                    label = f"{(ev.emoji or '').strip()}"
                    buttons.append(
                        InlineKeyboardButton(
                            label,
                            callback_data=f"setmodoharem_{modo_selecionado}_{ev.cod.value}_set",
                        )
                    )
            else:
                result = await session.execute(select(Raridade_Midia))
                for ra in result.scalars().all():
                    label = f"{(ra.emoji or '').strip()} {ra.cod.value}".strip()
                    buttons.append(
                        InlineKeyboardButton(
                            label,
                            callback_data=f"setmodoharem_{modo_selecionado}_{ra.cod.value}_set",
                        )
                    )

        bts = re_linhas(buttons)
        bts.append([create_bt_clear()])

        return await query.message.edit_caption(
            caption=f"escolha o {modo_selecionado.capitalize()}",
            reply_markup=InlineKeyboardMarkup(bts),
        )

    if "set" in res:
        modo_selecionado = modo_selecionado +'_'+ res[0]

    async with await client.get_reusable_session() as session:
        # Busca o usuário
        stmt = select(Usuario).where(Usuario.telegram_id == user_id)
        result = await session.execute(stmt)
        usuario: Usuario = result.scalar_one_or_none()

        if not usuario:
            await query.message.edit_text(
                MESSAGE.get_text("pt", "erros", "error_not_registered")
            )
            return

        # Atualiza as configurações do harém
        if client.genero == TipoCategoria.HUSBANDO:
            configs = usuario.configs_h or {}
            log_debug(f"configs_h antes da mudança: {configs}", "harem_mode")
        else:
            configs = usuario.configs_w or {}
            log_debug(f"configs_w antes da mudança: {configs}", "harem_mode")

        configs["modo_harem"] = modo_selecionado
        log_debug(f"Configs após mudança: {configs}", "harem_mode")

        if client.genero == TipoCategoria.HUSBANDO:
            usuario.configs_h = configs
            log_debug(f"usuario.configs_h definido como: {usuario.configs_h}", "harem_mode")
        else:
            usuario.configs_w = configs
            log_debug(f"usuario.configs_w definido como: {usuario.configs_w}", "harem_mode")

        # Força o SQLAlchemy a detectar a mudança
        from sqlalchemy.orm.attributes import flag_modified

        if client.genero == TipoCategoria.HUSBANDO:
            flag_modified(usuario, "configs_h")
        else:
            flag_modified(usuario, "configs_w")

        session.add(usuario)

        try:
            await session.commit()
            log_info(f"Modo harém atualizado para: {modo_selecionado}", "harem_mode")
        except Exception as e:
            await session.rollback()
            log_error(f"Erro ao salvar modo do harém: {e}", "harem_mode", exc_info=True)
            await query.message.edit_text(
                MESSAGE.get_text("pt", "harem_mode", "error_saving_mode")
            )
            return

    # Atualiza os botões inline com o check correto
    try:
        log_debug(f"Atualizando botões inline com: {modo_selecionado}", "harem_mode")
        await query.message.edit_caption(
            caption=f"definido {modo_selecionado} : {res[0]}" if len (res)>0 else f"definido {modo_selecionado}"
            ,reply_markup=None
        )
        log_info("Botões inline atualizados com sucesso", "harem_mode")
    except Exception as e:
        log_error(f"Erro ao atualizar botões inline: {e}", "harem_mode", exc_info=True)
        return


