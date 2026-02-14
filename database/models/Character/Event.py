from typing import Optional
from sqlalchemy import Enum, String
from sqlalchemy.orm import Mapped, mapped_column

from .._types import EventType
from ..base import table_registry


@table_registry.mapped_as_dataclass
class Event:
    __tablename__ = "events"

    id: Mapped[int] = mapped_column(primary_key=True, init=False, autoincrement=True)
    code: Mapped[EventType] = mapped_column(
        Enum(EventType), unique=True, nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    emoji: Mapped[Optional[str]] = mapped_column(String(5), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
