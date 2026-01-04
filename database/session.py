from sqlalchemy.orm import sessionmaker
from .connection import engine
from sqlalchemy.ext.asyncio import    AsyncSession
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_session() :
    async with AsyncSessionLocal() as session:
        yield session
