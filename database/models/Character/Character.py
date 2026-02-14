from datetime import datetime
from typing import Optional
from sqlalchemy import Enum, ForeignKey, JSON, String, func,BINARY
from sqlalchemy.orm import Mapped, mapped_column, relationship, declared_attr

from .._types import EventType, RarityType, MediaType
from ..base import table_registry
from .Event import Event
from .Rarity import Rarity


@table_registry.mapped_as_dataclass
class BaseCharacter:
    __abstract__ = True

    id: Mapped[int] = mapped_column(primary_key=True, init=False, autoincrement=True)
    character_name: Mapped[str] = mapped_column(String(100), nullable=False) # nome do personagem
    origem: Mapped[str] = mapped_column(String(100), nullable=False)# o nome do anime,game,manga,etc...
    tipo_fonte: Mapped[str] = mapped_column(String(500), nullable=False) #anime ,game ,manga ,etc...
    
    event_code: Mapped[EventType] = mapped_column(
        Enum(EventType), ForeignKey("events.code"), nullable=False, index=True
    )
    rarity_code: Mapped[RarityType] = mapped_column(
        Enum(RarityType), ForeignKey("rarities.code"), nullable=False, index=True
    )
    
    @declared_attr
    def event(cls) -> Mapped[Event]:
        return relationship(
            Event, foreign_keys=[cls.event_code], init=False, lazy="selectin"
        )

    @declared_attr
    def rarity(cls) -> Mapped[Rarity]:
        return relationship(
            Rarity, foreign_keys=[cls.rarity_code], init=False, lazy="selectin"
        )

    data: Mapped[str] = mapped_column(nullable=False, unique=True) # dados do personagem (url da imagem, video, etc...)
  #  bytes: Mapped[BINARY] = mapped_column(nullable=True) # bytes da midia (imagem, video, gif, etc...)
    media_type: Mapped[MediaType] = mapped_column(Enum(MediaType), nullable=False) # tipo de midia (imagem, video, gif, etc...)
    extras: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True) # campo para dados extras em formato JSON

    created_at: Mapped[datetime] = mapped_column(init=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        init=False, server_default=func.now(), onupdate=func.now()
    )


@table_registry.mapped_as_dataclass(kw_only=True)
class CharacterWaifu(BaseCharacter):
    __tablename__ = "characters_waifu"
    __allow_unmapped__ = True


@table_registry.mapped_as_dataclass(kw_only=True)
class CharacterHusbando(BaseCharacter):
    __tablename__ = "characters_husbando"
    __allow_unmapped__ = True

