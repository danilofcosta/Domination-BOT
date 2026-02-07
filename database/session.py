from sqlalchemy.orm import sessionmaker
from .connection import engine
from sqlalchemy.ext.asyncio import    AsyncSession
AsyncSessionLocal: AsyncSession = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)




async def get_session():
    async with AsyncSession(engine, expire_on_commit=False) as session:
        yield session