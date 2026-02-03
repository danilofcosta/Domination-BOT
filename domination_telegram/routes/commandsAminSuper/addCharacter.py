from aiogram import Router
from aiogram.filters import Command
from aiogram.types import Message

from database.models._types import MediaType, EventType, RarityType
from database.models.Character.Character import BaseCharacter
from database.models.Character.Character import CharacterWaifu, CharacterHusbando
from database.session import AsyncSessionLocal

from domination_telegram.enuns import Commands_adm_super
from domination_telegram.enuns import Commands_adm_super, GeneroEnum
from domination_telegram.uteis.check_admin_group import check_admin_group


# ------------------------------
#   SHORTCODES DE RARIDADE
# ------------------------------
RARITY_SHORTCODES = {
    "r1": RarityType.COMMON,
    "r2": RarityType.UNCOMMON,
    "r3": RarityType.RARE,
    "r4": RarityType.LEGENDARY,
    "r5": RarityType.EXCLUSIVE,
    "r6": RarityType.LIMITED,
    "r7": RarityType.SPECIAL,
    "r8": RarityType.MULTIVERSE,
    "r9": RarityType.SPECTRAL,
}

# ------------------------------
#   SHORTCODES DE EVENTO
# ------------------------------
EVENT_SHORTCODES = {
    "e1": EventType.NONE,
    "e2": EventType.HALLOWEEN,
    "e3": EventType.SPRING,
    "e4": EventType.SUMMER,
    "e5": EventType.WINTER,
    "e6": EventType.AUTUMN,
    "e7": EventType.NEW_YEAR,
    "e8": EventType.CHRISTMAS,
    "e9": EventType.VALENTINE,
    "e10": EventType.CHILDREN,
    "e11": EventType.BUNNY,
    "e12": EventType.CARNIVAL,
    "e13": EventType.MAID,
    "e14": EventType.ANGEL,
    "e15": EventType.SPORTS,
    "e16": EventType.KIMONO,
    "e17": EventType.GALA,
    "e18": EventType.GALA_MASCULINA,
    "e19": EventType.NEW_YEAR_LUNAR,
    "e20": EventType.NURSE,
    "e21": EventType.SCHOOL,
    "e22": EventType.GAME,
}


# ------------------------------
#   PARSER R.. e E.. AUTOMÁTICO
# ------------------------------
def extract_rarity_and_event(parts: list):
    rarity = RarityType.COMMON
    event = EventType.NONE

    new_parts = []

    for p in parts:
        code = p.strip().lower()

        # r.. → raridade
        if code.startswith("r") and code[1:].isdigit():
            rarity = parse_rarity(code)
            continue

        # e.. → evento
        if code.startswith("e") and code[1:].isdigit():
            event = parse_event(code)
            continue

        # não é r.. nem e..
        new_parts.append(p)

    return rarity, event, new_parts


# ------------------------------
#   PARSERS DE VALORES
# ------------------------------
def parse_rarity(value: str) -> RarityType:
    value = value.strip().lower()
    if value in RARITY_SHORTCODES:
        return RARITY_SHORTCODES[value]

    try:
        return RarityType(value.upper())
    except Exception:
        return RarityType.COMMON


def parse_event(value: str) -> EventType:
    value = value.strip().lower()
    if value in EVENT_SHORTCODES:
        return EVENT_SHORTCODES[value]

    try:
        return EventType(value.upper())
    except Exception:
        return EventType.NONE


# ------------------------------
#   ROTEADOR
# ------------------------------
def get_router(genero: str):
    router = Router(name=f"top_{genero}")

    @router.message(
        Command(
            commands=Commands_adm_super.create_dynamic_command(
                f"{Commands_adm_super.add_character.value}{genero[0].lower()}",
                prefix_str=genero
            ),
            prefix=Commands_adm_super.prefixs.value,
        )
    )
    async def add_character(message: Message):

        if not await check_admin_group(bot=message.bot, user_id=message.from_user.id):
            return await message.reply("❌ Comando disponível apenas para administradores.", quote=True)

        if not message.reply_to_message:
            return await message.answer("⬆️ Use o comando respondendo à mensagem com as informações do personagem.")

        reply = message.reply_to_message
        infos = reply.caption or reply.text or ""
        parts = [p.strip() for p in infos.split(",")]

        if len(parts) < 2:
            return await message.answer("❌ Formato inválido. Use: Nome, Origem, r.., e.., TipoFonte, URL")

        # EXTRAÇÃO AUTOMÁTICA DE R.. E E..
        rarity, event, filtered = extract_rarity_and_event(parts)

        name = filtered[0]
        origem = filtered[1]
        tipo_fonte = filtered[2].upper() if len(filtered) > 2 else "ANIME"

        # URL ou arquivo
        if len(filtered) > 3:
            data_url = filtered[3]
            media_type = MediaType.IMAGE_URL
        else:
            if reply.photo:
                data_url = reply.photo[-1].file_id
                media_type = MediaType.IMAGE_FILE
            elif reply.video:
                data_url = reply.video.file_id
                media_type = MediaType.VIDEO_FILE
            else:
                return await message.answer("❌ Nenhum arquivo ou URL encontrado.")

        CharacterModel = CharacterWaifu if genero == GeneroEnum.Waifu.value else CharacterHusbando

        character = CharacterModel(
            character_name=name,
            origem=origem,
            tipo_fonte=tipo_fonte,
            media_type=media_type,
            event_code=event,
            rarity_code=rarity,
            data=data_url,
            extras={
                "added_by": message.from_user.id,
                "added_at": message.date,
                "source_command": message.text,
            }
        )

        await message.answer(f"✅ Personagem **{name}** adicionado com sucesso!cteste")

    return router
