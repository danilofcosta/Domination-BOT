from sqlalchemy import select
from database.models.Character import CharacterWaifu, CharacterHusbando
from sqlalchemy import func

from database.session import AsyncSessionLocal
from domination_telegram.enuns import GeneroEnum

async def get_random_character(genero):
    print(genero == GeneroEnum.Waifu.value )
    character = select(CharacterWaifu if genero == GeneroEnum.Waifu.value else CharacterHusbando).order_by(
        func.random()).limit(1)

    async with AsyncSessionLocal() as session:
        async with session.begin():
            result = await session.execute(character)
            character = result.scalars().first()
    
    return character