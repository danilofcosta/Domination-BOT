from fastapi import APIRouter

from backend.models.caracter import BaseCharacterOut
from database.models.Character.Character import BaseCharacter
from database.session import get_session
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends
router = APIRouter(
    prefix="/add_caracter",
    tags=["Add Caracter"],
    responses={404: {"description": "Not found"}},
)


@router.post("/", response_model=BaseCharacterOut)
async def create_character(
    payload: BaseCharacter, 
    session: AsyncSession = Depends(get_session)
):
    db_obj = BaseCharacter(**payload.model_dump())
    
    session.add(db_obj)
    await session.commit()
    await session.refresh(db_obj)

    return db_obj
