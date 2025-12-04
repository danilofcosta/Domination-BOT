from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
import asyncio
from settings import Settings

engine = create_async_engine(
    Settings().DATABASE_URL,
    echo=False,
    future=True,
    pool_pre_ping=True,
)

Session = async_sessionmaker(
    bind=engine,
    expire_on_commit=False,
    class_=AsyncSession
)


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
            async with Session() as session:
                async with session.begin():
                    session.add(obj)
            return obj
        except Exception as e:
            print(f"Erro ao adicionar objeto ao banco: {e}")
            return None

    @staticmethod
    async def delete_object(obj: object):
        async with Session() as session:
            async with session.begin():
                await session.delete(obj)
        return obj

    @staticmethod
    async def delete_object_by_id(model, obj_id: int):
        async with Session() as session:
            async with session.begin():
                obj = await session.get(model, obj_id)
                if obj:
                    await session.delete(obj)
                    return obj
            return None

    @staticmethod
    async def get_info_one(search_query):
        async with Session() as session:
            result = await session.execute(search_query)
            return result.scalar_one_or_none()

    @staticmethod
    async def get_id_primary(model_class, id_value):
        async with Session() as session:
            return await session.get(model_class, int(id_value))

    @staticmethod
    async def get_info_all(search_query):
        async with Session() as session:
            result = await session.execute(search_query)
            return result.scalars().all()

    @staticmethod
    async def get_info_all_objects(search_query):
        async with Session() as session:
            result = await session.execute(search_query)
            return result.all()

    @staticmethod
    async def update_obj(obj: object):
        async with Session() as session:
            async with session.begin():
                updated = await session.merge(obj)
                return updated
