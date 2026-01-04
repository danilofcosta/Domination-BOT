from datetime import datetime
from typing import Optional
from sqlalchemy import Enum, JSON, BigInteger, String, func
from sqlalchemy.orm import Mapped, mapped_column

from ._types import Language
from .base import table_registry


@table_registry.mapped_as_dataclass
class TelegramGroup:
    __tablename__ = "telegram_groups"

    id: Mapped[int] = mapped_column(primary_key=True, init=False, autoincrement=True)
    group_id: Mapped[int] = mapped_column(BigInteger, unique=True, index=True)
    group_name: Mapped[str] = mapped_column(String(255), nullable=False)
    configuration: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    language: Mapped[Language] = mapped_column(
        Enum(Language), nullable=False, default=Language.PT
    )
    created_at: Mapped[datetime] = mapped_column(init=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        init=False, server_default=func.now(), onupdate=func.now()
    )
