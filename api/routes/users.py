from typing import Union
from http import HTTPStatus
from fastapi import APIRouter, FastAPI
from sqlalchemy import select

from api.models.Filters import FilterPage
from api.models.users import UsersListResponse
from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, Depends, HTTPException, Query
from database.models.user import User
from database.session import get_session


router = APIRouter(prefix='/users', tags=['users'])
Session = Annotated[AsyncSession, Depends(get_session)]


@router.get('/', response_model=UsersListResponse)
async def read_users(
    session: Session, filter_users: Annotated[FilterPage, Query()]
):
    query = await session.scalars(
        select(User).offset(filter_users.offset).limit(filter_users.limit)
    )

    users = query.all()

    return {'users': users}
