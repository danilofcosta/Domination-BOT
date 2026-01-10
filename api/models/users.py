from datetime import datetime
from typing import Optional, List, Dict

from pydantic import BaseModel

from database.models._types import ProfileType, Language


class CharacterBaseResponse(BaseModel):
    id: int
    name: str

    model_config = {
        "from_attributes": True
    }


class UserResponse(BaseModel):
    id: int
    telegram_id: int
    telegram_user_data: Optional[Dict]
    created_at: datetime

    profile_status: Optional[ProfileType]
    preferred_language: Language

    waifu_config: Dict
    husbando_config: Dict
    favorite_waifu_id: Optional[int]
    favorite_husbando_id: Optional[int]

    favorite_waifu: Optional[CharacterBaseResponse]
    favorite_husbando: Optional[CharacterBaseResponse]

    model_config = {
        "from_attributes": True
    }




class UsersListResponse(BaseModel):
    users: List[UserResponse]

    model_config = {
        "from_attributes": True
    }