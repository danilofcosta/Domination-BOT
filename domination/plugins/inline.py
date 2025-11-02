from pyrogram import Client, filters
from pyrogram.enums import *
import pyrogram
from pyrogram.types import *
from sqlalchemy import select, desc
from DB.models import (
    ColecaoUsuarioHusbando,
    ColecaoUsuarioWaifu,
    PersonagemWaifu,
    PersonagemHusbando,
    Usuario,
)
from domination.logger import log_error
from uteis import format_personagem_caption, send_media_by_type
from types_ import TipoCategoria, TipoMidia
from domination.message import MESSAGE
from DB.database import DATABASE


async def create_results(
    chat_id,
    paginated,
    offset=0,
    user=None,
    reply_markup: bool = False,
):
    results = []
    txt_bt = MESSAGE.get_text("pt", "inline", "who_captured_button")

    for i, p in enumerate(paginated):
        caption = format_personagem_caption(p, user=user)
        p: PersonagemWaifu | PersonagemHusbando = p  # personagem

        kb = (
            InlineKeyboardMarkup(
                [
                    [
                        InlineKeyboardButton(
                            txt_bt, callback_data=f"who_captured_{p.id}_{chat_id}"
                        )
                    ]
                ]
            )
            if reply_markup
            else None
        )

        if p.tipo_midia in [
            TipoMidia.IMAGEM_URL,
            TipoMidia.IMAGEM_BYTES,
            TipoMidia.IMAGEM_ARQUIVO,
            TipoMidia.IMAGEM_BASE64,
        ]:
            results.append(
                InlineQueryResultPhoto(
                    id=str(offset + i),
                    photo_url=p.data,
                    thumb_url=p.data,
                    title=p.nome_personagem,
                    description=caption,
                    caption=caption,
                    reply_markup=kb,
                )
            )
        elif p.tipo_midia == TipoMidia.IMAGEM_FILEID:
            results.append(
                InlineQueryResultCachedPhoto(
                    id=str(offset + i),
                    photo_file_id=p.data,
                    caption=caption,
                    description=caption,
                    reply_markup=kb,
                )
            )
        elif p.tipo_midia in [
            TipoMidia.VIDEO_URL,
            TipoMidia.VIDEO_BYTES,
            TipoMidia.VIDEO_ARQUIVO,
            TipoMidia.VIDEO_BASE64,
        ]:
            results.append(
                InlineQueryResultVideo(
                    id=str(offset + i),
                    video_url=p.data,
                    thumb_url=p.data,
                    title=p.nome_personagem,
                    description=caption,
                    caption=caption,
                    reply_markup=kb,
                )
            )
        elif p.tipo_midia == TipoMidia.VIDEO_FILEID:
            results.append(
                InlineQueryResultCachedVideo(
                    id=str(offset + i),
                    video_file_id=p.data,
                    title=p.nome_personagem,
                    caption=caption,
                    description=caption,
                    reply_markup=kb,
                )
            )
        else:
            results.append(
                InlineQueryResultPhoto(
                    id=str(offset + i),
                    photo_url=p.data,
                    thumb_url=p.data,
                    title=p.nome_personagem,
                    description=MESSAGE.get_text(
                        "pt", "inline", "media_type_not_supported"
                    ),
                    caption=caption,
                    reply_markup=kb,
                )
            )
    return results


async def show_result(
    inline_query: InlineQuery,
    results: list,
    offset: int,
    limit: int,
    switch_pm_text: str = None,
    is_personal: bool = None,
    has_more: bool = False,
):
    if switch_pm_text is None:
        switch_pm_text = MESSAGE.get_text("pt", "inline", "switch_pm_text")

    next_offset = str(offset + limit) if has_more else ""
    try:
        await inline_query.answer(
            results=results,
            next_offset=next_offset,
            is_gallery=True,
            cache_time=5,
            is_personal=is_personal,
            switch_pm_text=switch_pm_text,
            switch_pm_parameter="start",
        )

    except Exception as e:
        log_error(
            f"Erro ao responder inline query: {e}", module="inline", exc_info=True
        )


@Client.on_inline_query()
async def inline_personagem_search(client: Client, inline_query, limite: int = 15):
    query_text: str = inline_query.query.strip()
    offset = int(inline_query.offset) if inline_query.offset else 0

    base_cls: PersonagemWaifu | PersonagemHusbando = (
        PersonagemWaifu if client.genero == TipoCategoria.WAIFU else PersonagemHusbando
    )

    # Busca por ID
    if query_text.isdigit():
        personagem_id = int(query_text)

        personagem: PersonagemWaifu | PersonagemHusbando = (
            await DATABASE.get_id_primary(base_cls, personagem_id)
        )
        if personagem:
            results = await create_results(
                inline_query.from_user.id, [personagem], reply_markup=True
            )
            await show_result(
                inline_query,
                results,
                offset=offset,
                limit=limite,
                has_more=False,
            )
        else:
            await inline_query.answer([], cache_time=5)
        return

    # Busca harém
    elif query_text.startswith("user.harem."):
        try:
            iduser = int(query_text.split(".")[-1])
        except ValueError:
            return

        stmt = select(Usuario).where(Usuario.telegram_id == iduser)
        user: Usuario | None = await DATABASE.get_info_one(stmt)

        if not user:
            return

        colecoes = (
            user.colecoes_waifu
            if client.genero == TipoCategoria.WAIFU
            else user.colecoes_husbando
        )
        colecoes_ordenadas = sorted(colecoes, key=lambda x: x.id_local, reverse=True)

        paginated = colecoes_ordenadas[offset : offset + limite]

        # garante unicidade sem quebrar paginação
        seen_ids = set()
        unique_characters = []
        for q in paginated:
            if q.character.id not in seen_ids:
                seen_ids.add(q.character.id)
                unique_characters.append(q.character)

        user_name = (
            user.telegram_from_user.get("NAME")
            or user.telegram_from_user.get("User")
            or user.telegram_from_user.get("first_name")
            or "Usuário"
        )

        user_mention = (
            f'<a href="tg://user?id={int(user.telegram_id)}">{user_name} </a>'
        )

        results = await create_results(
            inline_query.from_user.id,
            unique_characters,
            offset,
            user=user_mention,
        )

        has_more = offset + limite < len(colecoes_ordenadas)
        await show_result(
            inline_query,
            results=results,
            switch_pm_text=f"{client.genero.capitalize()} {len(colecoes)}",
            offset=offset,
            limit=limite,
            has_more=has_more,
        )

    # Busca geral sem query
    elif not query_text:
        stmt = select(base_cls).order_by(desc(base_cls.id)).limit(limite).offset(offset)

        pers = await DATABASE.get_info_all(stmt)

        results = await create_results(
            inline_query.from_user.id, pers, offset, reply_markup=False
        )

        has_more = len(pers) == limite
        await show_result(
            inline_query,
            results=results,
            offset=offset,
            limit=limite,
            has_more=has_more,
        )
        return

    elif query_text.startswith("list_anime_"):
        search_condition = base_cls.nome_anime.ilike(
            f"%{query_text.replace('list_anime_', '')}%"
        )

        personagens: list[PersonagemWaifu | PersonagemHusbando] = (
            await DATABASE.get_info_all(select(base_cls).where(search_condition))
        )
        # Busca por anime

        if not personagens:
            return await inline_query.answer([], cache_time=5)

        paginated = personagens[offset : offset + limite]

        results = await create_results(
            inline_query.from_user.id, paginated, offset, reply_markup=True
        )

        has_more = offset + limite < len(personagens)
        await show_result(
            inline_query,
            results,
            offset=offset,
            limit=limite,
            has_more=has_more,
            switch_pm_text=f"{query_text.replace('list_anime_','').capitalize()} :  {len(personagens)}",
        )
        return


@Client.on_callback_query(filters.regex(r"^who_captured_"))
async def who_captured_callback(client: Client, query: CallbackQuery):
    """Callback para mostrar quem capturou o personagem"""

    who, captured, personagem_id, chat_id = query.data.split("_")
    # Define classe base de coleção
    base_cls = (
        ColecaoUsuarioWaifu
        if client.genero == TipoCategoria.WAIFU
        else ColecaoUsuarioHusbando
    )

    # Buscar quem tem o personagem na coleção
    stmt = select(base_cls).where(base_cls.id_global == int(personagem_id))
    colecoes = await DATABASE.get_info_all(stmt)

    if not colecoes:
        await query.answer(
            MESSAGE.get_text("pt", "erros", "error_no_one_captured"),
            show_alert=True,
        )
        return

    # Buscar informações dos usuários
    user_ids = [c.telegram_id for c in colecoes]
    stmt_users = select(Usuario).where(Usuario.telegram_id.in_(user_ids))

    usuarios = await DATABASE.get_info_all(stmt_users)

    # Criar dicionário de usuários
    users_dict = {u.telegram_id: u for u in usuarios}

    # Criar lista de nomes
    nomes_capturadores = []
    for colecao in colecoes:
        user = users_dict.get(colecao.telegram_id)
        if user:
            user_name = (
                user.telegram_from_user.get("NAME")
                or user.telegram_from_user.get("User")
                or f"Usuário {user.telegram_id}"
            )
            nomes_capturadores.append(
                MESSAGE.get_text(
                    "pt",
                    "inline",
                    "who_captured_item",
                    user_name=user_name,
                    user_id=user.telegram_id,
                )
            )

    # Criar nova caption com lista de capturadores
    nova_caption = (
        MESSAGE.get_text(
            "pt",
            "inline",
            "who_captured_title",
            user_name=query.from_user.first_name,
            user_id=query.from_user.id,
            count=len(nomes_capturadores),
        )
        + "\n"
        + "\n".join(nomes_capturadores)
    )
    # Atualizar a mensagem
    try:
        await query.edit_message_caption(
            caption=nova_caption, parse_mode=ParseMode.HTML
        )
    except Exception as e:
        await query.answer(
            MESSAGE.get_text("pt", "erros", "error_update_failed", error=str(e)),
            show_alert=True,
        )
