from fastapi import APIRouter
from sqlalchemy import select, desc
from database.models.user import User
from database.session import AsyncSessionLocal

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

@router.get("/cont")
async def get_cont():
    async with AsyncSessionLocal() as session:
        stmt = (
            select(
                User.id.label("user_id"),
                User.telegram_user_data.label("telegram_user_data"),
            )
            .group_by(User.id)
            .order_by(desc("user_id"))
        )

        result = await session.execute(stmt)
        top_users = result.all()

    # Exemplo: retorna quantidade de usuários
    return {"cont": len(top_users)}
