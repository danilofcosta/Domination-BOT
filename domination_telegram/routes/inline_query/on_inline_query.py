from aiogram import Router
from aiogram.types import InlineQuery
from sqlalchemy import select, func

from database.models.Character import CharacterHusbando, CharacterWaifu
from database.models.Colecao import WaifuCollection, HusbandoCollection
from database.session import AsyncSessionLocal
from domination_telegram.enuns import GeneroEnum
from domination_telegram.routes.inline_query.create_result import create_results

LIMIT = 15


def get_router():
    router = Router(name=__name__)

    @router.inline_query()
    async def on_inline_query(inline_query: InlineQuery):
        query_text = inline_query.query.strip()
        genero = inline_query.bot.genero
        offset = int(inline_query.offset) if inline_query.offset else 0
        user = None

        # Modelo principal (Character)
        Model = (
            CharacterHusbando
            if genero == GeneroEnum.Husbando.value
            else CharacterWaifu
        )

        stmt = None
        count_stmt = None

        if query_text.startswith("User_harem_"):
            collection_attr = (
                HusbandoCollection
                if genero == GeneroEnum.Husbando.value
                else WaifuCollection
            )

            id_user = int(query_text.split("_")[-1])

            stmt = (
                select(Model)
                .join(collection_attr)
                .distinct(Model.id)
                .where(collection_attr.telegram_id == id_user)
                .limit(LIMIT)
                .offset(offset)
            )

            count_stmt = (
                select(func.count(func.distinct(Model.id)))
                .select_from(Model)
                .join(collection_attr)
                .where(collection_attr.telegram_id == id_user)
            )
            user = (inline_query.from_user.first_name,
                    inline_query.from_user.first_name)
        elif query_text.startswith("character:"):
            personagem = query_text.replace("character:", "").strip()

            stmt = (
                select(Model)
                .where(Model.character_name.ilike(f"%{personagem}%"))
                .limit(LIMIT)
                .offset(offset)
            )

            count_stmt = (
                select(func.count())
                .select_from(Model)
                .where(Model.character_name.ilike(f"%{personagem}%"))
            )
        elif query_text.startswith("anime:"):
            origem = query_text.replace("anime:", "").strip()

            stmt = (
                select(Model)
                .where(Model.origem.ilike(f"%{origem}%"))
                .limit(LIMIT)
                .offset(offset)
            )

            count_stmt = (
                select(func.count())
                .select_from(Model)
                .where(Model.origem.ilike(f"%{origem}%"))
            )

        elif query_text.isdigit():
            char_id = int(query_text)

            stmt = (
                select(Model)
                .where(Model.id == char_id)
                .limit(LIMIT)
                .offset(offset)
            )

            count_stmt = (
                select(func.count())
                .select_from(Model)
                .where(Model.id == char_id)
            )

        elif query_text == "":
            stmt = select(Model).limit(LIMIT).offset(offset)

            count_stmt = (
                select(func.count())
                .select_from(Model)
            )
        else:
            return await showresults(
                inline_query,
                [],


            )

        async with AsyncSessionLocal() as session:
            result = await session.execute(stmt)
            characters = result.scalars().all()

            total = await session.scalar(count_stmt) if count_stmt is not None else 0

        next_offset = (
            str(offset + LIMIT)
            if offset + LIMIT < total
            else None
        )

        # transforma em InlineQueryResult
        results = create_results(characters, genero=genero, user=user)

        await showresults(
            inline_query=inline_query,
            results=results,
            next_offset=next_offset,
            switch_pm_text=f'{genero.title()} {total}' if count_stmt is not None else None

        )

    return router


async def showresults(
    inline_query: InlineQuery,
    results: list,
    next_offset: str | None = None,
    switch_pm_text: str = "𝕯𝖔𝖒𝖎𝖓𝖆𝖙𝖎𝖔𝖓𝕾"
):
    try:
        await inline_query.answer(
            results=results,
            cache_time=1,
            is_personal=True,
            next_offset=next_offset,
            switch_pm_text=switch_pm_text,
            switch_pm_parameter="start",
            # switch_pm_parameter=f"add_collection_{inline_query.from_user.id}_{inline_query.bot.genero}"
        )
    except Exception as e:
        print(e)
