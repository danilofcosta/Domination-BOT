import json
import asyncio
from pathlib import Path
from datetime import datetime
from sqlalchemy import select, func
from database.models.Character.Character import CharacterWaifu, CharacterHusbando
from database.models.Character.Event import Event
from database.models.Character.Rarity import Rarity
from database.models.user import User
from database.models.Colecao import WaifuCollection, HusbandoCollection
from database.models.GroupTg import TelegramGroup
from database.models._types import EventType, RarityType, MediaType, ProfileType, Language, HaremMode
from database.session import AsyncSessionLocal


EVENT_MAP = {
    "HALLOWEEN": EventType.HALLOWEEN,
    "PRIMAVERA": EventType.SPRING,
    "VERAO": EventType.SUMMER,
    "INVERNO": EventType.WINTER,
    "OUTONO": EventType.AUTUMN,
    "ANO_NOVO": EventType.NEW_YEAR,
    "NATAL": EventType.CHRISTMAS,
   
    "INFANTIL": EventType.CHILDREN,
    "CARNAVAL": EventType.CARNIVAL,
    "EMPREGADA": EventType.MAID,
    "ANJO": EventType.ANGEL,
    "ESPORTE": EventType.SPORTS,
    "KIMONO": EventType.KIMONO,
    "GALA": EventType.GALA,
    "GALA_MASCULINA": EventType.GALA_MASCULINA,
    "ENFERMEIRA": EventType.NURSE,
    "GAME": EventType.GAME,
    "PASCOA": EventType.BUNNY,
    "ANO_NOVO_LUNAR": EventType.NEW_YEAR_LUNAR,
    "ESCOLA": EventType.SCHOOL,
    "SEM_EVENTO": EventType.NONE,
    "SPRING": EventType.SPRING,
    "SUMMER": EventType.SUMMER,
    "WINTER": EventType.WINTER,
    "AUTUMN": EventType.AUTUMN,
    "NEW_YEAR": EventType.NEW_YEAR,
    "CHRISTMAS": EventType.CHRISTMAS,
    "VALENTINE": EventType.VALENTINE,
    "CHILDREN": EventType.CHILDREN,
    "BUNNY": EventType.BUNNY,
    "CARNIVAL": EventType.CARNIVAL,
    "MAID": EventType.MAID,
    "ANGEL": EventType.ANGEL,
    "SPORTS": EventType.SPORTS,
    "NEW_YEAR_LUNAR": EventType.NEW_YEAR_LUNAR,
    "NURSE": EventType.NURSE,
    "SCHOOL": EventType.SCHOOL,
    "GAME": EventType.GAME,
}

RARITY_MAP = {
    "COMUM": RarityType.COMMON,
    "INCOMUM": RarityType.UNCOMMON,
    "RARO": RarityType.RARE,
    "LENDARIO": RarityType.LEGENDARY,
    "EXCLUSIVO": RarityType.EXCLUSIVE,
    "LIMITADO": RarityType.LIMITED,
    "ESPECIAL": RarityType.SPECIAL,
    "MULTIVERSO": RarityType.MULTIVERSE,
    "ESPECTRAL": RarityType.SPECTRAL,
}

MEDIA_TYPE_MAP = {
    "IMAGEM_URL": MediaType.IMAGE_URL,
    "IMAGEM_FILEID": MediaType.IMAGE_FILEID,
    "IMAGEM_BYTES": MediaType.IMAGE_BYTES,
    "IMAGEM_FILE": MediaType.IMAGE_FILE,
    "IMAGEM_BASE64": MediaType.IMAGE_BASE64,
    "VIDEO_BYTES": MediaType.VIDEO_BYTES,
    "VIDEO_BASE64": MediaType.VIDEO_BASE64,
    "VIDEO_FILE": MediaType.VIDEO_FILE,
    "VIDEO_URL": MediaType.VIDEO_URL,
    "VIDEO_FILEID": MediaType.VIDEO_FILEID,
}

PROFILE_STATUS_MAP = {
    "SUPREMO": ProfileType.SUPREME,
    "SUPER_ADMIN": ProfileType.SUPER_ADMIN,
    "ADMIN": ProfileType.ADMIN,
    "MODERADOR": ProfileType.MODERATOR,
    "USUARIO": ProfileType.USER,
    "BANIDO": ProfileType.BANNED,
}

LANGUAGE_MAP = {
    "PT": Language.PT,
    "EN": Language.EN,
    "ES": Language.ES,
    "FR": Language.FR,
    "DE": Language.DE,
    "IT": Language.IT,
    "JA": Language.JA,
    "KO": Language.KO,
    "ZH": Language.ZH,
}

HAREM_MODE_MAP = {
    "PADRAO": HaremMode.DEFAULT,
    "RECENTE": HaremMode.RECENT,
    "ANIME": HaremMode.ANIME,
    "DETALHE": HaremMode.DETAIL,
    "RARIDADE": HaremMode.RARITY,
    "EVENTO": HaremMode.EVENT,
}


def load_json(filename: str) -> list:
    """Carrega arquivo JSON da pasta DB_JSON_TO_uploade"""
    path = Path("DB_JSON_TO_uploade") / filename
    try:
        with open(path, "r", encoding="utf8") as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"  [WARN] Arquivo nao encontrado: {path}")
        return []
    except json.JSONDecodeError as e:
        print(f"  [ERROR] Erro ao decodificar JSON {filename}: {e}")
        return []


async def migrate_events(session):
    """Migra eventos - DEVE SER EXECUTADO PRIMEIRO"""
    print("\n[EVENTS] Migrando eventos...")
    data = load_json("e_eventos.json")

    if not data:
        print("  [WARN] Nenhum dado carregado")
        return 0, 0

    inserted = 0
    skipped = 0
    OBGS = []
    

    for item in data:
        try:
            event_code = EVENT_MAP.get(item.get("cod"))
            if not event_code:
                skipped += 1
                continue

            event = Event(
                code=event_code,
                name=item.get("nome_traduzido", ""),
                emoji=item.get("emoji"),
                description=item.get("descricao"),
            )
         
            OBGS.append(event)
           # session.add(event)
            inserted += 1
        except Exception as e:
            skipped += 1

    try:
        session.add_all(OBGS)
        await session.commit()

        print(f"  [OK] Eventos: {inserted} inseridos, {skipped} erros")
        return inserted, skipped
    except Exception as e:
       # await session.rollback()
        print(f"  [ERROR] Erro ao salvar eventos: {e}")
        return 0, len(data)


async def migrate_rarities(session):
    """Migra raridades - DEVE SER EXECUTADO PRIMEIRO"""
    print("\n[RARITIES] Migrando raridades...")
    data = load_json("e_raridade.json")

    if not data:
        print("  [WARN] Nenhum dado carregado")
        return 0, 0

    inserted = 0
    skipped = 0
    OBGS = []

    for item in data:
        try:
            rarity_code = RARITY_MAP.get(item.get("cod"))
            if not rarity_code:
                skipped += 1
                continue

            rarity = Rarity(
                code=rarity_code,
                name=item.get("nome", ""),
                emoji=item.get("emoji"),
                description=item.get("descricao"),
            )
           # session.add(rarity)
            OBGS.append(rarity)
            inserted += 1
        except Exception as e:
            skipped += 1

    try:
        session.add_all(OBGS)
        await session.commit()

        print(f"  [OK] Raridades: {inserted} inseridos, {skipped} erros")
        return inserted, skipped
    except Exception as e:
        await session.rollback()
        print(f"  [ERROR] Erro ao salvar raridades: {e}")
        return 0, len(data)


async def migrate_characters_waifu(session):
    """Migra personagens waifus com tipo_fonte='ANIME'"""
    print("\n[WAIFU] Migrando characters waifu...")
    data = load_json("characters_w.json")

    if not data:
        print("  [WARN] Nenhum dado carregado")
        return 0, 0

    inserted = 0
    skipped = 0
    errors = []
    OBGS=[]
    for item in data:
        try:
            if not item.get("nome_personagem") or not item.get("nome_anime"):
                skipped += 1
                errors.append(
                    {"name": "UNKNOWN", "reason": "Nome do personagem ou anime ausente"})
                continue
            
            event_code = EVENT_MAP.get(
                item.get("evento", "SEM_EVENTO"), EventType.NONE)
            rarity_code = RARITY_MAP.get(
                item.get("raridade", "COMUM"), RarityType.COMMON)
            media_type = MEDIA_TYPE_MAP.get(
                item.get("tipo_midia", "IMAGEM_URL"), MediaType.IMAGE_URL)

            data_value = item.get("data")
            if not data_value:
                skipped += 1
                errors.append(
                    {"name": item["nome_personagem"], "reason": "Dados (URL/ID) ausentes"})
                continue

            character = CharacterWaifu(
                character_name=item["nome_personagem"].strip(),
                origem=item["nome_anime"].strip(),
                tipo_fonte="ANIME",
                event_code=event_code,
                rarity_code=rarity_code,
                data=str(data_value),
                media_type=media_type,
                extras=item.get("extras") or {},
            )
            # session.add(character)
            OBGS.append(character)
            inserted += 1

        except KeyError as e:
            skipped += 1
            errors.append({"name": item.get("nome_personagem",
                          "UNKNOWN"), "reason": f"Campo ausente: {e}"})
        except Exception as e:
            skipped += 1
            errors.append(
                {"name": item.get("nome_personagem", "UNKNOWN"), "reason": str(e)})

    try:
        session.add_all(OBGS)
        await session.commit()
        print(
            f"  [OK] Characters Waifu: {inserted} inseridos, {skipped} erros")
        if errors and len(errors) <= 5:
            for err in errors:
                print(f"     - {err['name']}: {err['reason']}")
        elif errors:
            for err in errors[:3]:
                print(f"     - {err['name']}: {err['reason']}")
            print(f"     ... e mais {len(errors) - 3} erros")
        return inserted, skipped
    except Exception as e:
     #   await session.rollback()
        print(f"  [ERROR] Erro ao salvar Waifu no banco de dados: {e}")
        return 0, len(data)


async def migrate_characters_husbando(session):
    """Migra personagens husbandos com tipo_fonte='ANIME'"""
    print("\n[HUSBANDO] Migrando characters husbando...")
    data = load_json("characters_h.json")

    if not data:
        print("  [WARN] Nenhum dado carregado")
        return 0, 0

    inserted = 0
    skipped = 0
    errors = []
    OBGS=[]

    for item in data:
        try:
            if not item.get("nome_personagem") or not item.get("nome_anime"):
                skipped += 1
                errors.append(
                    {"name": "UNKNOWN", "reason": "Nome do personagem ou anime ausente"})
                continue

            event_code = EVENT_MAP.get(
                item.get("evento", "SEM_EVENTO"), EventType.NONE)
            rarity_code = RARITY_MAP.get(
                item.get("raridade", "COMUM"), RarityType.COMMON)
            media_type = MEDIA_TYPE_MAP.get(
                item.get("tipo_midia", "IMAGEM_URL"), MediaType.IMAGE_URL)

            data_value = item.get("data")
            if not data_value:
                skipped += 1
                errors.append(
                    {"name": item["nome_personagem"], "reason": "Dados (URL/ID) ausentes"})
                continue

            character = CharacterHusbando(
                character_name=item["nome_personagem"].strip(),
                origem=item["nome_anime"].strip(),
                tipo_fonte="ANIME",
                event_code=event_code,
                rarity_code=rarity_code,
                data=str(data_value),
                media_type=media_type,
                extras=item.get("extras") or {},
            )
           # session.add(character)
            OBGS.append(character)
            inserted += 1

        except KeyError as e:
            skipped += 1
            errors.append({"name": item.get("nome_personagem",
                          "UNKNOWN"), "reason": f"Campo ausente: {e}"})
        except Exception as e:
            skipped += 1
            errors.append(
                {"name": item.get("nome_personagem", "UNKNOWN"), "reason": str(e)})

    try:
        session.add_all(OBGS)
        await session.commit()
        print(
            f"  [OK] Characters Husbando: {inserted} inseridos, {skipped} erros")
        if errors and len(errors) <= 5:
            for err in errors:
                print(f"     - {err['name']}: {err['reason']}")
        elif errors:
            for err in errors[:3]:
                print(f"     - {err['name']}: {err['reason']}")
            print(f"     ... e mais {len(errors) - 3} erros")
        return inserted, skipped
    except Exception as e:
        await session.rollback()
        print(f"  [ERROR] Erro ao salvar Husbando no banco de dados: {e}")
        return 0, len(data)


async def migrate_users(session):
    """Migra usuários com suas configurações"""
    print("\n[USERS] Migrando usuários...")
    data = load_json("usuarios.json")

    if not data:
        print("  [WARN] Nenhum dado carregado")
        return 0, 0

    inserted = 0
    skipped = 0
    errors = []
    OBGS=[]

    for item in data:
        try:
            telegram_id = item.get("telegram_id")
            if not telegram_id:
                skipped += 1
                errors.append(
                    {"id": "UNKNOWN", "reason": "telegram_id ausente"})
                continue

            profile_status = PROFILE_STATUS_MAP.get(
                item.get("perfil_status", "USUARIO"),
                ProfileType.USER
            )
            language = LANGUAGE_MAP.get(
                item.get("idioma_preferido", "PT"),
                Language.PT
            )

            waifu_config = item.get("configs_w", {}).copy(
            ) if item.get("configs_w") else {}
            if "modo_harem" in waifu_config:
                harem_mode = HAREM_MODE_MAP.get(
                    waifu_config.pop("modo_harem", "PADRAO"),
                    HaremMode.DEFAULT
                )
                waifu_config["harem_mode"] = harem_mode.value

            husbando_config = item.get(
                "configs_h", {}).copy() if item.get("configs_h") else {}
            if "modo_harem" in husbando_config:
                harem_mode = HAREM_MODE_MAP.get(
                    husbando_config.pop("modo_harem", "PADRAO"),
                    HaremMode.DEFAULT
                )
                husbando_config["harem_mode"] = harem_mode.value

            # print(f"    [DEBUG] Migrando usuario TG ID {item['fav_w_id']}")
            # print(f"    [DEBUG] Migrando usuario TG ID {telegram_id}")

            user = User(
            telegram_id=int(telegram_id),
            telegram_user_data=item.get("telegram_from_user") or {},
            profile_status=profile_status,
            waifu_config=waifu_config or {"harem_mode": HaremMode.DEFAULT.value},
            husbando_config=husbando_config or {"harem_mode": HaremMode.DEFAULT.value},
            preferred_language=language,
            favorite_waifu_id=item.get("fav_w_id"),
            favorite_husbando_id=item.get("fav_h_id"),
        )

            # user.favorite_waifu_id = item.get('fav_w_id',None) or None
            # user.favorite_husbando_id = item.get ('fav_h_id',None)or None
           # session.add(user)
            OBGS.append(user)
            inserted += 1

        except ValueError as e:

            skipped += 1
            errors.append({"id": item.get("telegram_id", "UNKNOWN"),
                          "reason": f"Erro de tipo de dados: {e}"})
        except Exception as e:
            skipped += 1
            errors.append(
                {"id": item.get("telegram_id", "UNKNOWN"), "reason": str(e)})

    try:
        session.add_all(OBGS)
        await session.commit()
        print(f"  [OK] Usuarios: {inserted} inseridos, {skipped} erros")
        if errors and len(errors) <= 5:
            for err in errors:
                print(f"     - ID {err['id']}: {err['reason']}")
        elif errors:
            for err in errors[:3]:
                print(f"     - ID {err['id']}: {err['reason']}")
            print(f"     ... e mais {len(errors) - 3} erros")
        return inserted, skipped
    except Exception as e:
        await session.rollback()
        print(f"  [ERROR] Erro ao salvar usuarios no banco de dados: {e}")
        return 0, len(data)


async def migrate_waifu_collections(session):
    """Migra coleções waifu dos usuários - busca por nome+origem"""
    print("\n[WAIFU_COL] Migrando colecoes waifu...")
    char_data = load_json("characters_w.json")
    col_data = load_json("colecao_w.json")

    if not col_data or not char_data:
        print("  [WARN] Nenhum dado carregado")
        return 0, 0

    char_map = {int(c.get("id")): c for c in char_data}

    inserted = 0
    skipped = 0
    OBGS=[]

    for item in col_data:
        try:
            telegram_id = item.get("telegram_id")
            old_character_id = int(item.get("id_global", 0))

            if not telegram_id or old_character_id == 0:
                skipped += 1
                continue

            old_char = char_map.get(old_character_id)
            if not old_char:
                skipped += 1
                continue

            stmt = select(CharacterWaifu.id).where(
                (CharacterWaifu.character_name == old_char.get("nome_personagem").strip()) &
                (CharacterWaifu.origem == old_char.get("nome_anime").strip())
            )
            result = await session.execute(stmt)
            character_id = result.scalar()

            if not character_id:
                skipped += 1
                continue

            collection = WaifuCollection(
                telegram_id=int(telegram_id),
                character_id=character_id,
            )
          #  session.add(collection)
            OBGS.append(collection)
            inserted += 1

        except Exception as e:
            skipped += 1

    try:
        session.add_all(OBGS)
        await session.commit()
        print(f"  [OK] Colecoes Waifu: {inserted} inseridos, {skipped} erros")
        return inserted, skipped
    except Exception as e:
        await session.rollback()
        print(f"  [ERROR] Erro ao salvar colecoes waifu: {e}")
        return 0, len(col_data)


async def migrate_husbando_collections(session):
    """Migra coleções husbando dos usuários - busca por nome+origem"""
    print("\n[HUSBANDO_COL] Migrando colecoes husbando...")
    char_data = load_json("characters_h.json")
    col_data = load_json("colecao_h.json")

    if not col_data or not char_data:
        print("  [WARN] Nenhum dado carregado")
        return 0, 0

    char_map = {int(c.get("id")): c for c in char_data}

    inserted = 0
    skipped = 0
    OBGS=[]
    for item in col_data:
        try:
            telegram_id = item.get("telegram_id")
            old_character_id = int(item.get("id_global", 0))

            if not telegram_id or old_character_id == 0:
                skipped += 1
                continue

            old_char = char_map.get(old_character_id)
            if not old_char:
                skipped += 1
                continue

            stmt = select(CharacterHusbando.id).where(
                (CharacterHusbando.character_name == old_char.get("nome_personagem").strip()) &
                (CharacterHusbando.origem == old_char.get("nome_anime").strip())
            )
            result = await session.execute(stmt)
            character_id = result.scalar()

            if not character_id:
                skipped += 1
                continue

            collection = HusbandoCollection(
                telegram_id=int(telegram_id),
                character_id=character_id,
            )
          #  session.add(collection)
            OBGS.append(collection)
            inserted += 1

        except Exception as e:
            skipped += 1

    try:
        session.add_all(OBGS)
        await session.commit()
        print(
            f"  [OK] Colecoes Husbando: {inserted} inseridos, {skipped} erros")
        return inserted, skipped
    except Exception as e:
        await session.rollback()
        print(f"  [ERROR] Erro ao salvar colecoes husbando: {e}")
        return 0, len(col_data)


async def migrate_telegram_groups(session):
    """Migra grupos do telegram com suas configurações"""
    print("\n[GROUPS] Migrando grupos telegram...")
    data = load_json("chats_tg.json")

    if not data:
        print("  [WARN] Nenhum dado carregado")
        return 0, 0

    inserted = 0
    skipped = 0
    OBGS=[]

    for item in data:
        try:
            group_id = item.get("id_grupo")
            if not group_id:
                skipped += 1
                continue

            language = LANGUAGE_MAP.get(
                item.get("idioma", "PT"),
                Language.PT
            )

            group = TelegramGroup(
                group_id=int(group_id),
                group_name=(item.get("name", "") or "").strip(),
                configuration=item.get("configs") or {},
                language=language,
            )
          #  session.add(group)
            OBGS.append(group)
            inserted += 1

        except Exception as e:
            skipped += 1

    try:
        session.add_all(OBGS)
        await session.commit()
        print(f"  [OK] Grupos Telegram: {inserted} inseridos, {skipped} erros")
        return inserted, skipped
    except Exception as e:
        await session.rollback()
        print(f"  [ERROR] Erro ao salvar grupos: {e}")
        return 0, len(data)


async def main_migracao_manual():
    """Executa a migração completa do banco antigo"""
    print("=" * 70)
    print("[START] INICIANDO MIGRACAO MANUAL DO BANCO DE DADOS ANTIGO")
    print("=" * 70)
    print(f"   Data/Hora: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
    print(f"   Tipo fonte: ANIME")
    print("=" * 70)

    async with AsyncSessionLocal() as session:
        try:
            total_inserted = 0
            total_skipped = 0

            ins, skp = await migrate_events(session)
            total_inserted += ins
            total_skipped += skp

            ins, skp = await migrate_rarities(session)
            total_inserted += ins
            total_skipped += skp

            ins, skp = await migrate_characters_waifu(session)
            total_inserted += ins
            total_skipped += skp

            ins, skp = await migrate_characters_husbando(session)
            total_inserted += ins
            total_skipped += skp

            ins, skp = await migrate_users(session)
            total_inserted += ins
            total_skipped += skp

            ins, skp = await migrate_waifu_collections(session)
            total_inserted += ins
            total_skipped += skp

            ins, skp = await migrate_husbando_collections(session)
            total_inserted += ins
            total_skipped += skp

   

            ins, skp = await migrate_telegram_groups(session)
            total_inserted += ins
            total_skipped += skp

            # print("\n" + "=" * 70)
            # print("[SUMMARY] RESUMO DA MIGRACAO")
            # print("=" * 70)
            # print(f"   Total Inseridos: {total_inserted}")
            # print(f"   Total Erros: {total_skipped}")
            # if (total_inserted + total_skipped) > 0:
            #     taxa = (total_inserted / (total_inserted + total_skipped) * 100)
            #     print(f"   Taxa Sucesso: {taxa:.1f}%")
            # else:
            #     print(f"   Taxa Sucesso: N/A")
            # print("=" * 70)

        except Exception as e:
            print(f"\n[ERROR] Erro critico durante migracao: {str(e)[:100]}")
            await session.rollback()
            raise


if __name__ == "__main__":
    try:
        asyncio.run(main_migracao_manual())
    except KeyboardInterrupt:
        print("\n\n[WARN] Migracao interrompida pelo usuario")
    except Exception as e:
        msg = str(e)[:100] if e else "Desconhecido"
        print(f"\n\n[ERROR] Erro fatal: {msg}")
        exit(1)
