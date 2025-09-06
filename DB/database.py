from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from settings import Settings

# Cria engine assíncrona
engine = create_async_engine(
    Settings().DATABASE_URL,
    echo=False,                # deixe True só para debug
    future=True,
    pool_size=5,               # conexões simultâneas
    max_overflow=10,           # conexões extras se precisar
    pool_timeout=30,           # tempo máximo para esperar conexão
    pool_recycle=1800,         # recicla conexões a cada 30min
)
# Cria sessões assíncronas
AsyncSessionLocal = sessionmaker(
    bind=engine,
    expire_on_commit=False,
    class_=AsyncSession,
)



# Dependência para frameworks (ex.: FastAPI)
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
