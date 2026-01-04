import asyncio
from database.teste import test_connection, create_database, drop_database, list_databases


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
    try:
        await create_database('domination_db_teste')
    except Exception as e:
        print(f"    (Error: {type(e).__name__}: {str(e)[:100]})")
    
    print("\n[5] Final database list...")
    await list_databases()


if __name__ == "__main__":
    asyncio.run(main())
