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


def create_caption_check_true_character(
    character: CharacterHusbando | CharacterWaifu,
    message,
    genero: GeneroEnum,
    start_time
):
    # Texto do gênero
    texto_genero = "uma nova waifu" if genero == GeneroEnum.Waifu else "um novo husbando"

    # Emojis por gênero
    emojis = {
        GeneroEnum.Waifu: {
            "nome": "✨",
            "raridade": "🏆",
            "origem": "📜",
            "tempo": "⏳"
        },
        GeneroEnum.Husbando: {
            "nome": "💛",
            "raridade": "🏆",
            "origem": "📜",
            "tempo": "⏳"
        }
    }

    base = f"""✅ {metion_user.metion_user(message.from_user.first_name, message.from_user.id)} você conseguiu {texto_genero}

{emojis[genero]['nome']} NOME: {character.character_name}
{emojis[genero]['raridade']} RARIDADE: {character.rarity.name}
{emojis[genero]['origem']} FONTE: {character.origem}
{character.event.emoji} {character.event.name} {character.event.emoji}

{emojis[genero]['tempo']} Tempo gasto: {tempo_gasto(start_time)}"""

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
                                  genero, user: tuple = None, cont: int = None):

    genero = f'essa waifu' if genero == GeneroEnum.Waifu.name.lower(
    ) else 'um husbando'
    event = f" {character.event.emoji} {character.event.name} {character.event.emoji}" if character.event != None and character.event_code != EventType.NONE.value else ''
    base = f"""
Wow! Veja  {genero} {'' if not user else f'de {metion_user.metion_user(username=user[0], id=user[1])}'}!

{character.origem} {''if not cont else f'x{cont}'}
{character.id} : {character.character_name} {f'[{character.event.emoji}]' if character.event != None and character.event_code != EventType.NONE.value else ''}
({character.rarity.emoji} 𝙍𝘼𝙍𝙄𝙏𝙔:  {character.rarity.name})

{event}
"""
    return base.strip()
