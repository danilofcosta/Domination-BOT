from pyrogram import Client, filters
from pyrogram.enums import ParseMode, ChatType
from pyrogram.types import *
from sqlalchemy import select, desc
from DB.models import (
    ColecaoUsuarioHusbando,
    ColecaoUsuarioWaifu,
    PersonagemWaifu,
    PersonagemHusbando,
    Usuario,
)
from domination.uteis import format_personagem_caption, send_media_by_type
from types_ import TipoCategoria, TipoMidia, TipoEvento
from domination.message import MESSAGE
from domination.lang_utils import obter_mensagem_chat


async def create_results(
    client,
    chat_id,
    paginated,
    offset=0,
    user=None,
    reply_markup: bool = False,
):
    results = []
    for i, p in enumerate(paginated):
        # Não passar user como nome na caption
        caption = format_personagem_caption(p, user=user)

        # Criar botão "quem capturou"
        reply_markup = (
            InlineKeyboardMarkup(
                [
                    [
                        InlineKeyboardButton(
                            await obter_mensagem_chat(client, chat_id, "inline", "who_captured_button"), callback_data=f"who_captured_{p.id}"
                        )
                    ]
                ]
            )
            if reply_markup
            else None
        )

        # Para imagens
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
                    description=await obter_mensagem_chat(client, chat_id, "inline", "anime_description", anime=p.nome_anime),
                    caption=caption,
                    reply_markup=reply_markup,
                )
            )
        elif p.tipo_midia == TipoMidia.IMAGEM_FILEID:
            results.append(
                InlineQueryResultCachedPhoto(
                    id=str(offset + i),
                    photo_file_id=p.data,
                    caption=caption,
                    description=await obter_mensagem_chat(client, chat_id, "inline", "anime_description", anime=p.nome_anime),
                    reply_markup=reply_markup,
                )
            )
        # Para vídeos
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
                    description=await obter_mensagem_chat(client, chat_id, "inline", "anime_description", anime=p.nome_anime),
                    caption=caption,
                    reply_markup=reply_markup,
                )
            )
        elif p.tipo_midia == TipoMidia.VIDEO_FILEID:
            results.append(
                InlineQueryResultCachedVideo(
                    id=str(offset + i),
                    video_file_id=p.data,
                    caption=caption,
                    description=await obter_mensagem_chat(client, chat_id, "inline", "anime_description", anime=p.nome_anime),
                    reply_markup=reply_markup,
                )
            )
        # Fallback para tipos não reconhecidos - tenta como foto
        else:
            results.append(
                InlineQueryResultPhoto(
                    id=str(offset + i),
                    photo_url=p.data,
                    thumb_url=p.data,
                    title=p.nome_personagem,
                    description=await obter_mensagem_chat(client, chat_id, "inline", "anime_description", anime=p.nome_anime),
                    caption=caption,
                    reply_markup=reply_markup,
                )
            )
    return results


async def show_result(
    client,
    chat_id,
    inline_query: InlineQuery,
    results: list,
    offset: int,
    limit: int,
    switch_pm_text=None,
    is_personal: bool = None,
):
    if switch_pm_text is None:
        switch_pm_text = await obter_mensagem_chat(client, chat_id, "inline", "switch_pm_text")
    next_offset = str(offset + limit) if len(results) == limit else ""
    """Mostra resultados de inline query"""
    await inline_query.answer(
        results=results,
        next_offset=next_offset,
        is_gallery=True,
        cache_time=0,
        is_personal=is_personal,
        switch_pm_text=switch_pm_text,
        switch_pm_parameter=await obter_mensagem_chat(client, chat_id, "inline", "switch_pm_parameter"),
    )


@Client.on_inline_query()
async def inline_personagem_search(client: Client, inline_query, limite: int = 10):
    query_text = inline_query.query.strip()
    offset = int(inline_query.offset) if inline_query.offset else 0

    # Define classe base de personagem
    base_cls: PersonagemWaifu | PersonagemHusbando = (
        PersonagemWaifu if client.genero == TipoCategoria.WAIFU else PersonagemHusbando
    )

    # Busca por ID se query for um número
    if query_text.isdigit():
        personagem_id = int(query_text)
        async with await client.get_reusable_session() as session:
            personagem = await session.get(base_cls, personagem_id)
            if personagem:
                results = await create_results(client, inline_query.from_user.id, [personagem], reply_markup=True)
                await show_result(client, inline_query.from_user.id, inline_query, results, offset=offset, limit=limite)
            else:
                await inline_query.answer([], cache_time=0)
        return

    # Busca harém do usuário se query começa com 'user.harem.'
    if query_text.startswith("user.harem."):
        try:
            iduser = int(query_text.split(".")[-1])
        except ValueError:
            return

        async with await client.get_reusable_session() as session:
            stmt = select(Usuario).where(Usuario.telegram_id == iduser)
            result = await session.execute(stmt)
            usuarios = result.scalars().all()

            if not usuarios:
                return

            user = usuarios[0]
            colecoes = (
                user.colecoes_waifu
                if client.genero == TipoCategoria.WAIFU
                else user.colecoes_husbando
            )

            # 最新のアイテムを最初に表示するために、adicionado_emでソート
            colecoes_ordenadas = sorted(
                colecoes, key=lambda x: x.adicionado_em, reverse=True
            )

            paginated = colecoes_ordenadas[offset : offset + limite]
            seen_ids = set()
            unique_characters = [
                q.character
                for q in paginated
                if q.character.id not in seen_ids and not seen_ids.add(q.character.id)
            ]

            user_name = (
                user.telegram_from_user.get("NAME")
                or user.telegram_from_user.get("User")
                or "Usuário"
            )
            user_mention = f'<a href="tg://user?id={user.telegram_id}">{user_name}</a>'

            # print(user_mention)
            results = await create_results(
                client, inline_query.from_user.id, unique_characters, offset, user=user_mention, reply_markup=False
            )

            await show_result(
                client, inline_query.from_user.id, inline_query,
                results=results,
                switch_pm_text=f"{client.genero.capitalize()} {len([
             q.character  for q in colecoes
            ])}",
                offset=offset,
                limit=limite,
            )
        return

    # Busca por nome de anime
    elif not query_text:
        stmt = select(base_cls).order_by(desc(base_cls.id)).limit(10).offset(offset)
        async with await client.get_reusable_session() as session:
            result = await session.execute(stmt)
        pers = result.scalars().all()

        pers = await create_results(client, inline_query.from_user.id, pers, offset, reply_markup=False)
        await show_result(client, inline_query.from_user.id, inline_query, pers, offset=offset, limit=limite)
    elif query_text.startswith("list_anime_"):
        async with await client.get_reusable_session() as session:
            stmt = select(base_cls).where(
                base_cls.nome_anime.ilike(f"%{query_text.replace('list_anime_','')}%")
            )
            result = await session.execute(stmt)
            personagens = result.scalars().all()

        if not personagens:
            return await inline_query.answer([], cache_time=0)

        paginated = personagens[offset : offset + limite]

        results = await create_results(client, inline_query.from_user.id, paginated, offset, reply_markup=True)

        await show_result(client, inline_query.from_user.id, inline_query, results, offset=offset, limit=limite)


@Client.on_callback_query(filters.regex(r"^who_captured_(\d+)$"))
async def who_captured_callback(client: Client, query: CallbackQuery):
    """Callback para mostrar quem capturou o personagem"""
    personagem_id = int(query.matches[0].group(1))

    # Define classe base de coleção
    base_cls = (
        ColecaoUsuarioWaifu
        if client.genero == TipoCategoria.WAIFU
        else ColecaoUsuarioHusbando
    )

    async with await client.get_reusable_session() as session:
        # Buscar quem tem o personagem na coleção
        stmt = select(base_cls).where(base_cls.id_global == personagem_id)
        result = await session.execute(stmt)
        colecoes = result.scalars().all()

        if not colecoes:
            await query.answer(
                await obter_mensagem_chat(client, query.message.chat.id, "erros", "error_no_one_captured"), show_alert=True
            )
            return

        # Buscar informações dos usuários
        user_ids = [c.telegram_id for c in colecoes]
        stmt_users = select(Usuario).where(Usuario.telegram_id.in_(user_ids))
        result_users = await session.execute(stmt_users)
        usuarios = result_users.scalars().all()

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
                    await obter_mensagem_chat(client, query.message.chat.id, "inline", "who_captured_item", user_name=user_name, user_id=user.telegram_id)
                )

        # Criar nova caption com lista de capturadores
        nova_caption = (
            await obter_mensagem_chat(client, query.message.chat.id, "inline", "who_captured_title", 
                           user_name=query.from_user.first_name, 
                           user_id=query.from_user.id, 
                           count=len(nomes_capturadores))
            + "\n"
            + "\n".join(nomes_capturadores)
        )
        # Atualizar a mensagem
        try:
            await query.edit_message_caption(
                caption=nova_caption, parse_mode=ParseMode.MARKDOWN
            )
        except Exception as e:
            await query.answer(await obter_mensagem_chat(client, query.message.chat.id, "erros", "error_update_failed", error=str(e)), show_alert=True)
