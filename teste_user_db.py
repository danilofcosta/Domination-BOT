import asyncio
import json

from sqlalchemy import select

from DB.database import DATABASE
from DB.models import Usuario
from types_ import TipoPerfil, Idioma


async def main() -> None:
    test_telegram_id = 9876543210123

    # Clean up any previous leftover with same telegram_id
    existing = await DATABASE.get_info_one(select(Usuario).where(Usuario.telegram_id == test_telegram_id))
    if existing:
        await DATABASE.delete_object_by_id(Usuario, existing.id)

    user = Usuario(
        telegram_id=test_telegram_id,
        telegram_from_user={
            "id": test_telegram_id,
            "first_name": "Teste",
            "last_name": None,
            "username": None,
            "is_bot": False,
        },
        fav_h_id=None,
        fav_w_id=None,
        perfil_status=TipoPerfil.USUARIO,
        idioma_preferido=Idioma.PT,
    )

    # Create user
    created = await DATABASE.add_object_commit(user)
    print(f"Created user id={created.id} telegram_id={created.telegram_id}")

    # Verify fetch
    fetched = await DATABASE.get_info_one(select(Usuario).where(Usuario.telegram_id == test_telegram_id))
    print(f"Fetched user exists={bool(fetched)}")

    # Delete user
    await DATABASE.delete_object_by_id(Usuario, created.id)

    # Verify deletion
    deleted_check = await DATABASE.get_info_one(select(Usuario).where(Usuario.telegram_id == test_telegram_id))
    print(f"Deleted user exists={bool(deleted_check)}")


if __name__ == "__main__":
    asyncio.run(main())


