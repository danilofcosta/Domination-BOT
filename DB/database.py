from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import sessionmaker, declarative_base
from settings import Settings

# Cria engine assíncrona
engine = create_async_engine(
    Settings().DATABASE_URL,
    echo=False,  # deixe True só para debug
    future=True,
    pool_size=5,  # conexões simultâneas
    max_overflow=10,  # conexões extras se precisar
    pool_timeout=30,  # tempo máximo para esperar conexão
    pool_recycle=1800,  # recicla conexões a cada 30min
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


# Cria sessões assíncronas
Session = async_sessionmaker(
    bind=engine,
    expire_on_commit=False,
    class_=AsyncSession,
)


class DATABASE:
    @staticmethod
    async def add_object_commit(obj: object | list[object]) -> object:
        """Adiciona um objeto ao banco de dados e retorna o objeto com ID atualizado"""
        async with Session() as session:
            if isinstance(obj, list):
                session.add_all(obj)
            else:
                session.add(obj)

            await session.commit()   # garante ID gerado
            await session.refresh(obj)  # atualiza atributos (ex: id)

        return obj
    @staticmethod
    async def add_object(obj: object) -> object:
        """Adiciona um objeto ao banco de dados e retorna o objeto com ID atualizado"""
        async with Session() as session:  # VS Code reconhece AsyncSession
            async with session.begin():  # commit automático
                session.add(obj)
        return obj  # Retorna o objeto com ID atualizado

    @staticmethod
    async def delete_object(obj: object) -> object:
        """Adiciona um objeto ao banco de dados e retorna o objeto com ID atualizado"""
        async with Session() as session:  # VS Code reconhece AsyncSession
            async with session.begin():  # commit automático
                session.delete(obj)
        return obj  # Retorna o objeto com ID atualizado
    @staticmethod
    async def delete_object_by_id(model, obj_id: int):
        """Deleta um objeto do banco pelo ID"""
        async with Session() as session:
            async with session.begin():
                obj = await session.get(model, obj_id)  # busca o objeto
                if obj:
                    await session.delete(obj)  # deleta
                    return obj
            return None
    @staticmethod
    async def get_info_one(search_query: object) -> object | None:
        async with Session() as session:
            result = await session.execute(search_query)
            return result.scalar_one_or_none()

    @staticmethod
    async def get_id_primary(model_class, id_value) -> object | None:
        async with Session() as session:
            result = await session.get(model_class, id_value)
            return result

    @staticmethod
    async def get_info_all(search_query: object) -> list[object]:
        async with Session() as session:
            result = await session.execute(search_query)
            return result.scalars().all()

    @staticmethod
    async def get_info_all_objects(search_query: object) -> list[object]:
        async with Session() as session:
            result = await session.execute(search_query)
            return result.all()

    @staticmethod
    async def update_obj(obj: object) -> object:
        """Atualiza um personagem no banco de dados"""
        async with Session() as session:
            async with session.begin():
                # Merge atualiza o objeto se ele já existe, ou cria se não existe
                updated_personagem = await session.merge(obj)
                return updated_personagem
