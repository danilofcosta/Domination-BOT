from datetime import datetime
from typing import Optional
from sqlalchemy import Enum, JSON, BigInteger, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ._types import ProfileType, HaremMode, Language
from .base import table_registry
from .Character.Character import CharacterHusbando, CharacterWaifu


@table_registry.mapped_as_dataclass
class User:
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, init=False, autoincrement=True)
    telegram_id: Mapped[int] = mapped_column(
        BigInteger, unique=True, nullable=False, index=True
    )
    telegram_user_data: Mapped[dict] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(init=False, server_default=func.now())

    waifu_collection: Mapped[list["CharacterWaifu"]] = relationship(
        back_populates="user",
        init=False,
        cascade="all, delete-orphan",
    )
    favorite_waifu_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey(f"{CharacterWaifu.__tablename__}.id"), nullable=True, index=True
    )
    favorite_waifu: Mapped[Optional["CharacterWaifu"]] = relationship(
        foreign_keys=[favorite_waifu_id], init=False, lazy="selectin"
    )

    husbando_collection: Mapped[list["CharacterHusbando"]] = relationship(
        back_populates="user",
        init=False,
        cascade="all, delete-orphan",
    )
    favorite_husbando_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("characters_husbando.id"), nullable=True, index=True
    )
    favorite_husbando: Mapped[Optional["CharacterHusbando"]] = relationship(
        foreign_keys=[favorite_husbando_id], init=False, lazy="selectin"
    )

    profile_status: Mapped[Optional[ProfileType]] = mapped_column(
        Enum(ProfileType), default=ProfileType.USER
    )

    waifu_config: Mapped[dict] = mapped_column(
        JSON,
        nullable=False,
        default_factory=lambda: {"harem_mode": HaremMode.DEFAULT.value},
    )
    husbando_config: Mapped[dict] = mapped_column(
        JSON,
        nullable=False,
        default_factory=lambda: {"harem_mode": HaremMode.DEFAULT.value},
    )
    preferred_language: Mapped[Language] = mapped_column(
        Enum(Language), nullable=False, default=Language.PT
    )
