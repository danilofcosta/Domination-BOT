import asyncio
from sqlalchemy.ext.asyncio import AsyncSession

from database.connection import engine
from database.models.base import table_registry
from database.models import CharacterWaifu, CharacterHusbando, User, Event, Rarity


async def create_tables():
    """Create all tables in the database"""
    async with engine.begin() as conn:
        await conn.run_sync(table_registry.metadata.create_all)
    print("[OK] All tables created successfully")


async def main():
    await create_tables()


if __name__ == "__main__":
    asyncio.run(main())
