from datetime import datetime
from database.models.Character.Character import CharacterHusbando, CharacterWaifu
from domination_telegram.enuns import GeneroEnum
from domination_telegram.uteis import metion_user
from database.models._types import EventType


def tempo_gasto(start_time: datetime) -> str:
    if not isinstance(start_time, datetime):
        return "0s"
    total_segundos = int((datetime.now() - start_time).total_seconds())
    horas = total_segundos // 3600
    minutos = (total_segundos % 3600) // 60
    segundos = total_segundos % 60
    if horas > 0:
        return f"{horas}h {minutos}m {segundos}s"
    elif minutos > 0:
        return f"{minutos}m {segundos}s"
    else:
        return f"{segundos}s"


def create_caption_check_true_character(character: CharacterHusbando | CharacterWaifu, message, genero, start_time):
    genero = f'um nova waifu ' if genero == GeneroEnum.Waifu.name.lower(
    ) else 'um novo husbando '
    cap = {
        "mgs": f"{metion_user.metion_user(message.from_user.first_name, message.from_user.id)} você {genero} ",
        "nome": f"{character.character_name}",
        "origem": f"{character.origem}",
        "raridae": f"{character.rarity.name}",

        "event": f"{character.event.emoji} {character.event.name} {character.event.emoji}", }

    base = f"""✅ {cap['mgs']}

🌸 NOME: {character.character_name}
🔴 RARIDADE:  {character.rarity.name}
❇️ FONTE: {character.origem}

⌛️ Tempo gasto: {tempo_gasto(start_time)}"""
    return base


def create_secret_caption(Character: CharacterWaifu | CharacterHusbando, genero=str):

    raridade = Character.rarity.emoji
    if genero == GeneroEnum.Waifu.value.lower():

        secret_text = (
            f"{raridade} Uma {genero.title()} apareceu!\n"
            "Adicione-a ao seu harém enviando:  /dominar nome_do_personagem",
        )
    else:
        secret_text = (
            f"{raridade} Um {genero.title()} apareceu!\n"
            "Adicione-o ao seu harém enviando:  /dominar nome_do_personagem",
        )

    return "".join(secret_text)


def create_caption_show_character(character: CharacterWaifu | CharacterHusbando,
                                  genero):
    print( character.event_code == EventType.NONE.value)
    print( character.event_code)
    print(type(genero))
    genero = f'essa waifu' if genero == GeneroEnum.Waifu.name.lower(
    ) else 'um husbando'
    event = f" {character.event.emoji} {character.event.name} {character.event.emoji}" if character.event != None and character.event_code != EventType.NONE.value else ''
    base = f"""
Wow! Veja  {genero}!

{character.origem}
{character.id} : {character.character_name} {f'[{character.event.emoji}]' if character.event != None and character.event_code != EventType.NONE.value  else ''}
({character.rarity.emoji} 𝙍𝘼𝙍𝙄𝙏𝙔:  {character.rarity.name})

{event}
"""
    return base.strip()
