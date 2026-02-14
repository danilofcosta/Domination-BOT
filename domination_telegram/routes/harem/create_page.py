from collections import defaultdict
from typing import List, Union
from database.models.Colecao import WaifuCollection, HusbandoCollection


def classificar_personagens(
    collection: List[Union[WaifuCollection, HusbandoCollection]]
) -> dict:

    resultado = {
        "total": len(collection),
        "origens": {}
    }

    for item in collection:
        char = item.character
        origem = char.origem.lower()
        nome = char.character_name.lower()

        # Cria a origem se não existir
        if origem not in resultado["origens"]:
            resultado["origens"][origem] = {
                "total": 0,
                "characters": {}
            }

        resultado["origens"][origem]["total"] += 1

        # Cria o personagem se não existir
        if nome not in resultado["origens"][origem]["characters"]:
            resultado["origens"][origem]["characters"][nome] = {
                "id": char.id,
                "nome": char.character_name,
                "repeticoes": 0,
                "raridade": {
                    "nome": char.rarity.name,
                    "emoji": char.rarity.emoji
                },
                "raridades": defaultdict(int),
                "eventos": defaultdict(lambda: {
                    "nome": "",
                    "emoji": "",
                    "quantidade": 0
                })
            }

        personagem = resultado["origens"][origem]["characters"][nome]
        personagem["repeticoes"] += 1

        # Contagem por raridade
        personagem["raridades"][char.rarity_code.value] += 1

        # Contagem por evento
        evento = personagem["eventos"][char.event_code.value]
        evento["nome"] = char.event.name
        evento["emoji"] = char.event.emoji
        evento["quantidade"] += 1

    # Converter defaultdicts para dict normal antes de retornar
    for origem in resultado["origens"].values():
        for char in origem["characters"].values():
            char["raridades"] = dict(char["raridades"])
            char["eventos"] = dict(char["eventos"])

    return resultado


def create_harem_default(dados):
    """
    Cria páginas do harém usando a estrutura gerada por classificar_personagens
    """

    pages = []
    current_page = []
    current_length = 0
    max_length = 1000

    for origem_nome, origem_data in dados["origens"].items():
        header = (
            f"☛ {origem_nome.capitalize()} {origem_data['total']}\n"
            + "✧" * 16
            + "\n"
        )

        characters_text = ""

        for personagem in origem_data["characters"].values():
            # Junta todos os emojis dos eventos do personagem
            eventos_text = ""
            for evento in personagem["eventos"].values():
                eventos_text += evento["emoji"]

            characters_text += (
                f"➢ ꙳ {personagem['id']} "
                f"꙳ {personagem['raridade']['emoji']} "
                f"꙳ {personagem['nome']} "
                f"{eventos_text} "
                f"{personagem['repeticoes']}x\n"
            )

        anime_text = header + characters_text + "✧" * 16 + "\n"

        # Controle de tamanho das páginas
        if current_length + len(anime_text) > max_length and current_page:
            pages.append("\n".join(current_page))
            current_page = [anime_text]
            current_length = len(anime_text)
        else:
            current_page.append(anime_text)
            current_length += len(anime_text)

    if current_page:
        pages.append("\n".join(current_page))

    return pages
