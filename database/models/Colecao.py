from datetime import datetime
from sqlalchemy import BigInteger, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import table_registry
from .Character.Character import CharacterHusbando, CharacterWaifu


@table_registry.mapped_as_dataclass
class WaifuCollection:
    __tablename__ = "waifu_collection"
    __allow_unmapped__ = True

    id: Mapped[int] = mapped_column(
        primary_key=True, init=False, autoincrement=True
    )
    telegram_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("users.telegram_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    character_id: Mapped[int] = mapped_column(
        ForeignKey("characters_waifu.id"), nullable=False, index=True
    )

    user: Mapped["User"] = relationship(
        back_populates="waifu_collection", init=False, lazy="selectin"
    )
    character: Mapped["CharacterWaifu"] = relationship(
        foreign_keys=[character_id], init=False, lazy="selectin"
    )
    added_at: Mapped[datetime] = mapped_column(
        init=False, server_default=func.now()
    )


@table_registry.mapped_as_dataclass
class HusbandoCollection:
    __tablename__ = "husbando_collection"
    __allow_unmapped__ = True

    id: Mapped[int] = mapped_column(
        primary_key=True, init=False, autoincrement=True
    )
    telegram_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("users.telegram_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    character_id: Mapped[int] = mapped_column(
        ForeignKey("characters_husbando.id"), nullable=False, index=True
    )

    user: Mapped["User"] = relationship(
        back_populates="husbando_collection", init=False, lazy="selectin"
    )
    character: Mapped["CharacterHusbando"] = relationship(
        foreign_keys=[character_id], init=False, lazy="selectin"
    )
    added_at: Mapped[datetime] = mapped_column(
        init=False, server_default=func.now()
    )
