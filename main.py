from database.session import get_session
from database.models.base import create_tables
from database.models.Character import *


def main():
    create_tables()

    session = get_session()

    # teste: criar usuário fake
    waifu = CharactersWaifu(
        nome="Rem",
        origem="Re:Zero",
        raridade_cod="SSR",
        tema_cod="anime",
        tema="fantasia",
        tipo_midia="file_id",
        data="AgACAgQAAxkBAA..."
    )

    husbando = CharactersHusbando(
        nome="Levi",
        origem="Attack on Titan",
        raridade_cod="SSR",
        tema_cod="anime",
        tema="militar",
        tipo_midia="url",
        data="https://..."
    )

    session.add_all([waifu,husbando])
    session.commit()
    session.refresh(husbando)

    print(f"{husbando.id} criado com sucesso!")

    session.close()


if __name__ == "__main__":
    main()
