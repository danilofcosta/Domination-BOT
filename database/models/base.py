from sqlalchemy.orm import DeclarativeBase
from ..connection import engine


class Base(DeclarativeBase):
    pass




def create_tables():
    Base.metadata.create_all(engine)
