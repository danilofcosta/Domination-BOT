import asyncio
import random
from DB.database import engine
from DB.models import PersonagemWaifu, PersonagemHusbando, table_registry, Usuario
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from types_ import ModoHarem


async def check_connection():
    try:
        async with engine.connect() as conn:
            result = await conn.execute(select(PersonagemWaifu).limit(1))
            personagem = result.scalar_one_or_none()
            if personagem:
                print("✅ Conexão OK! Primeiro registro encontrado:")
                print(
                    f"Nome: {personagem.nome_personagem}, Anime: {personagem.nome_anime}, Tipo: {personagem.tipo_midia}"
                )
            else:
                print("✅ Conexão OK! Nenhum registro encontrado.")
    except Exception as e:
        print("❌ Erro na conexão:", e)


async def get_random_character():
    try:
        async with engine.connect() as conn:
            # Primeiro, vamos verificar se há dados na tabela
            count_result = await conn.execute(
                select(func.count()).select_from(PersonagemHusbando)
            )
            count = count_result.scalar()
            print(f"Total de registros na tabela CHARACTERS_H: {count}")

            if count > 0:
                # Vamos usar uma query SQL direta para debug
                from sqlalchemy import text

                raw_result = await conn.execute(
                    text("SELECT * FROM CHARACTERS_H ORDER BY RANDOM() LIMIT 1")
                )
                row = raw_result.fetchone()
                print(f"Resultado da query SQL direta: {row}")

                # Agora vamos tentar com o ORM usando uma abordagem diferente
                from sqlalchemy.orm import selectinload

                stmt = (
                    select(PersonagemHusbando)
                    .options(selectinload(PersonagemHusbando.evento_full))
                    .order_by(func.random())
                    .limit(1)
                )
                result = await conn.execute(stmt)
                personagem = result.scalars().first()
            if personagem:
                print("🎲 Personagem aleatório:")
                print(f"Tipo do objeto: {type(personagem)}")
                print(f"Atributos disponíveis: {dir(personagem)}")
                try:
                    print(f"Nome: {personagem.nome_personagem}")
                    print(f"Anime: {personagem.nome_anime}")
                    print(f"Tipo: {personagem.tipo_midia.value}")
                    print(f"Gênero: {personagem.genero.value}")
                    print(f"Evento: {personagem.evento.value}")
                    print(f"Raridade: {personagem.raridade.value}")
                except Exception as e:
                    print(f"Erro ao acessar atributos: {e}")
            else:
                print("🎲 Nenhum personagem encontrado.")
    except Exception as e:
        print("❌ Erro ao buscar personagem aleatório:", e)


async def atualizar_usuarios():
    from sqlalchemy.orm import sessionmaker

    # Criar uma sessão ORM adequada
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        # Buscar todos os usuários
        result = await session.execute(select(Usuario))
        usuarios = result.scalars().all()

        for usuario in usuarios:
            updated = False

            # Atualiza configs_w
            if not usuario.configs_w:
                usuario.configs_w = {"modo_harem": ModoHarem.PADRAO.value}
                updated = True
            elif "modo_harem" not in usuario.configs_w:
                usuario.configs_w["modo_harem"] = ModoHarem.PADRAO.value
                updated = True

            # Atualiza configs_h
            if not usuario.configs_h:
                usuario.configs_h = {"modo_harem": ModoHarem.PADRAO.value}
                updated = True
            elif "modo_harem" not in usuario.configs_h:
                usuario.configs_h["modo_harem"] = ModoHarem.PADRAO.value
                updated = True

            # Atualiza fav_w_id
            if not usuario.fav_w_id:
                usuario.fav_w_id = random.randint(1, 800)
                updated = True

            # Atualiza fav_h_id
            if not usuario.fav_h_id:
                usuario.fav_h_id = random.randint(1, 800)
                updated = True

            if updated:
                session.add(usuario)

        await session.commit()
        print(f"Atualizados {len(usuarios)} usuários.")


async def main():
    # await check_connection()
    # await get_random_character()
    await atualizar_usuarios()


async def replace_underscores():
    """Replace underscores with spaces in character names and anime names"""
    from sqlalchemy.orm import sessionmaker
    
    # Criar uma sessão ORM adequada
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    try:
        async with async_session() as session:
            # Update PersonagemWaifu table
            print("🔄 Atualizando tabela PersonagemWaifu...")

            # Update character names
            result = await session.execute(
                select(PersonagemWaifu).where(
                    PersonagemWaifu.nome_personagem.contains("_")
                )
            )
            waifus_with_underscores = result.scalars().all()

            for waifu in waifus_with_underscores:
                old_name = waifu.nome_personagem
                new_name = old_name.replace("_", " ")
                waifu.nome_personagem = new_name
                print(f"Waifu: '{old_name}' -> '{new_name}'")

            # Update anime names
            result = await session.execute(
                select(PersonagemWaifu).where(PersonagemWaifu.nome_anime.contains("_"))
            )
            waifus_anime_with_underscores = result.scalars().all()

            for waifu in waifus_anime_with_underscores:
                old_anime = waifu.nome_anime
                new_anime = old_anime.replace("_", " ")
                waifu.nome_anime = new_anime
                print(f"Anime Waifu: '{old_anime}' -> '{new_anime}'")

            # Update PersonagemHusbando table
            print("\n🔄 Atualizando tabela PersonagemHusbando...")

            # Update character names
            result = await session.execute(
                select(PersonagemHusbando).where(
                    PersonagemHusbando.nome_personagem.contains("_")
                )
            )
            husbandos_with_underscores = result.scalars().all()

            for husbando in husbandos_with_underscores:
                old_name = husbando.nome_personagem
                new_name = old_name.replace("_", " ")
                husbando.nome_personagem = new_name
                print(f"Husbando: '{old_name}' -> '{new_name}'")

            # Update anime names
            result = await session.execute(
                select(PersonagemHusbando).where(
                    PersonagemHusbando.nome_anime.contains("_")
                )
            )
            husbandos_anime_with_underscores = result.scalars().all()

            for husbando in husbandos_anime_with_underscores:
                old_anime = husbando.nome_anime
                new_anime = old_anime.replace("_", " ")
                husbando.nome_anime = new_anime
                print(f"Anime Husbando: '{old_anime}' -> '{new_anime}'")

            # Commit changes
            await session.commit()
            print("\n✅ Todas as atualizações foram concluídas com sucesso!")

    except Exception as e:
        print(f"❌ Erro ao atualizar nomes: {e}")


async def get_user():

    async with engine.connect() as session:
        result = await session.execute(
            select(Usuario).where(Usuario.telegram_id == 2045176280)
        )
        usuario = result.first()
        if usuario:
            print(usuario)  # ou print(usuario.nome, usuario.email, etc.)
        else:
            print("Usuário não encontrado.")


if __name__ == "__main__":
    asyncio.run(replace_underscores())
