from tkinter import EventType
from pydantic import BaseModel, Field
from typing import Optional, Dict
from datetime import datetime
from enum import Enum
from fastapi import APIRouter

from database.models._types import MediaType, RarityType


class BaseCharacterBase(BaseModel):
    character_name: str = Field(..., max_length=100)
    origem: str = Field(..., max_length=100)
    tipo_fonte: str = Field(..., max_length=500)

    event_code: EventType
    rarity_code: RarityType

    data: str
    media_type: MediaType
    extras: Optional[Dict] = None

class BaseCharacterOut(BaseModel):
    id: int
    character_name: str
    origem: str
    tipo_fonte: str
    event_code: EventType
    rarity_code: RarityType
    data: str
    media_type: MediaType
    extras: Optional[Dict]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
