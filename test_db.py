import asyncio

from sqlalchemy import func, select
from database.models.Character.Character import CharacterHusbando
from database.session import AsyncSessionLocal
from database.teste import test_connection, create_database, drop_database, list_databases
from database import MIGRACAO_MANUAL

async def main():
    # print("[1] Testing database connection...")
    # await test_connection()
    
    # print("\n[2] Listing existing databases...")
    # await list_databases()
    
    # print("\n[3] Dropping 'teste' database if exists...")
    # try:
    #     await drop_database('domination_db_teste')
    # except Exception as e:
    #     print(f"    (Database doesn't exist or error: {type(e).__name__})")
    
    # print("\n[4] Creating 'teste' database...")
    # try:
    #     await create_database('domination_db_teste')
    # except Exception as e:
    #     print(f"    (Error: {type(e).__name__}: {str(e)[:100]})")
    
    print("\n[5] Final database list...")
    await list_databases()
    # g=select(CharacterHusbando).order_by(
    #             func.random()).limit(1)

    # async with AsyncSessionLocal() as session:
        # async with session.begin():
        #     result = await session.execute(g)
        #     character = result.scalars()
        #     print(character.all())


if __name__ == "__main__":
   #  asyncio.run(MIGRACAO_MANUAL.main_migracao_manual())
    asyncio.run(main())
