from collections import defaultdict
from sqlalchemy import select, func
from DB.models import PersonagemWaifu, PersonagemHusbando
from types_ import TipoCategoria
from DB.database import DATABASE

async def create_harem_pages_ref( colecoes, genero):
    """
    Cria páginas do harém com contagem correta do banco.
    """
    db_model = (
        PersonagemHusbando if genero == TipoCategoria.HUSBANDO else PersonagemWaifu
    )
    anime_groups = defaultdict(
        lambda: {"personagens": [], "total_colecao": 0, "total_banco": 0}
    )
    personagem_counts = defaultdict(int)

    for colecao in colecoes:
        personagem_counts[colecao.character.id] += 1

    personagens_vistos = set()
    for colecao in colecoes:
        char_id = colecao.character.id
        anime = colecao.character.nome_anime
        if char_id in personagens_vistos:
            continue
        personagens_vistos.add(char_id)

        anime_groups[anime]["personagens"].append(
            {
                "id": char_id,
                "nome": colecao.character.nome_personagem,
                "raridade": colecao.character.raridade_full.emoji,
                "evento": (
                    f"[{colecao.character.evento_full.emoji}]"
                    if colecao.character.evento_full
                    else ""
                ),
                "count": personagem_counts[char_id],
            }
        )
        anime_groups[anime]["total_colecao"] += 1

    for anime in anime_groups.keys():
        stmt = select(func.count(db_model.id)).where(db_model.nome_anime == anime)
        result = await DATABASE.get_info_one(stmt)
        total = result or 1
        anime_groups[anime]["total_banco"] = total

    sorted_animes = sorted(anime_groups.keys())
    pages, current_page, current_length, max_length = [], [], 0, 1000

    for anime in sorted_animes:
        anime_data = anime_groups[anime]
        header = (
            f"☛ {anime} {anime_data['total_colecao']}/{anime_data['total_banco']}\n"
            + "✧" * 16
            + "\n"
        )
        characters_text = "".join(
            f"➢ ꙳ {char['id']} ꙳ {char['raridade']} ꙳ {char['nome']} {char['evento']} {char['count']}x\n"
            for char in anime_data["personagens"]
        )
        anime_text = header + characters_text + "✧" * 16 + "\n"

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


async def build_delete_mode_pages( colecoes, genero):
    """Cria páginas do modo DELETE com info detalhada para exclusão/gestão."""
    db_model = (
        PersonagemHusbando if genero == TipoCategoria.HUSBANDO else PersonagemWaifu
    )

    counts = defaultdict(int)
    ids_locais_por_char = defaultdict(list)
    for c in colecoes:
        counts[c.character.id] += 1
        ids_locais_por_char[c.character.id].append(getattr(c, "id_local", 0))

    anime_to_total = {}
    animes_unicos = {c.character.nome_anime for c in colecoes}
    for anime in animes_unicos:
        stmt = select(func.count(db_model.id)).where(db_model.nome_anime == anime)
        result = await DATABASE.get_info_one(stmt)
        anime_to_total[anime] = result or 0

    def format_line(c):
        raridade_emoji = c.character.raridade_full.emoji if c.character.raridade_full else ""
        repeticoes = counts[c.character.id]
        ids_locais = ", ".join(str(x) for x in sorted(ids_locais_por_char[c.character.id], reverse=True))
        total_banco_anime = anime_to_total.get(c.character.nome_anime, 0)
        return (
            f"🍁 nome: {c.character.nome_personagem} (x{repeticoes})\n"
            f"🆔 id: {ids_locais}\n"
            f"{raridade_emoji} ʀᴀʀɪᴛʏ: {c.character.raridade.value}\n"
            f"🈴 anime: {c.character.nome_anime} ({repeticoes}/{total_banco_anime})\n"
        )

    seen = set()
    lines = []
    for c in sorted(colecoes, key=lambda x: (x.character.nome_anime, x.character.nome_personagem)):
        if c.character.id in seen:
            continue
        seen.add(c.character.id)
        lines.append(format_line(c))

    pages = []
    for i in range(0, len(lines), 5):
        pages.append("\n".join(lines[i:i+5]))
    return pages


def build_recent_pages(colecoes_sorted_desc):
    """Cria páginas do modo RECENTE: 3 itens por página, ordenados por id_local desc."""
    def format_item(c):
        evento_emoji = c.character.evento_full.emoji if c.character.evento_full else ""
        raridade_emoji = c.character.raridade_full.emoji if c.character.raridade_full else ""
        return (
            f"{raridade_emoji} Nome: {c.character.nome_personagem}\n"
            f"🆔 ID: {c.character.id}\n"
            f"⭐ Raridade: {c.character.raridade.value}\n"
            f"🈯️ Anime: {c.character.nome_anime}\n"
            f"{evento_emoji} Evento: {c.character.evento.value.capitalize()}\n"
        )

    items_text = [format_item(c) for c in colecoes_sorted_desc]
    pages = []
    for i in range(0, len(items_text), 3):
        page_items = items_text[i:i+3]
        pages.append("\n".join(page_items))
    return pages


async def build_anime_mode_pages( colecoes, genero):
    """Cria páginas do modo ANIME: um bloco por anime com contagem única e total no banco."""
    db_model = (
        PersonagemHusbando if genero == TipoCategoria.HUSBANDO else PersonagemWaifu
    )

    unique_per_anime = defaultdict(set)
    for c in colecoes:
        unique_per_anime[c.character.nome_anime].add(c.character.id)

    anime_to_total = {}
    for anime in unique_per_anime.keys():
        stmt = select(func.count(db_model.id)).where(db_model.nome_anime == anime)
        result = await DATABASE.get_info_one(stmt)
        anime_to_total[anime] = result.scalar() or 0

    lines = []
    for anime in sorted(unique_per_anime.keys()):
        colecao_count = len(unique_per_anime[anime])
        total_banco = anime_to_total.get(anime, 0)
        lines.append(
            f"↳ {anime.capitalize()}\n"
            f"➻ coletado: {colecao_count}\n"
            f"➻ faltando: {total_banco - colecao_count}\n"
        )

    pages = []
    for i in range(0, len(lines), 8):
        pages.append("\n".join(lines[i:i+8]))
    return pages



