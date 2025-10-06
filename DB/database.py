from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
import asyncio
from settings import Settings

engine = create_async_engine(
    Settings().DATABASE_URL,
    echo=False,
    future=True,
    pool_size=5,
    max_overflow=10,
    pool_timeout=30,
    pool_recycle=1800,
    pool_pre_ping=True,
)

Session = async_sessionmaker(bind=engine, expire_on_commit=False, class_=AsyncSession)




class DATABASE:
    @staticmethod
    async def add_object_commit(obj):
        async with Session() as session:
            async with session.begin():
                if isinstance(obj, list):
                    session.add_all(obj)
                else:
                    session.add(obj)
            if isinstance(obj, list):
                await asyncio.gather(*(session.refresh(o) for o in obj))
            else:
                await session.refresh(obj)
        return obj
    @staticmethod
    async def add_object(obj: object) -> object:
        try:
            """Adiciona um objeto ao banco de dados e retorna o objeto com ID atualizado"""
            async with Session() as session:  # VS Code reconhece AsyncSession
                async with session.begin():  # commit automático
                    session.add(obj)
            return obj  # Retorna o objeto com ID atualizado
        except Exception as e:
            print(f"Erro ao adicionar objeto ao banco: {e}")
            return None

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
            result = await session.get(model_class, int(id_value))
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
        return obj  # Retorna o objeto atualizado