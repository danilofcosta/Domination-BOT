from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Text,
    func
)
from .base import Base




class CharacterBase(Base):
    __abstract__ = True

    id = Column(Integer, primary_key=True)

    nome = Column(String(100), nullable=False)
    origem = Column(String(100), nullable=True)

    raridade_cod = Column(String(50), nullable=False)
    tema_cod = Column(String(50), nullable=False)

    tema = Column(String(100), nullable=True)

    # url | file_id | bytes
    tipo_midia = Column(String(20), nullable=False)
    data = Column(Text, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )


class CharactersWaifu(CharacterBase):
    __tablename__ = "characters_waifu"


class CharactersHusbando(CharacterBase):
    __tablename__ = "characters_husbando"

