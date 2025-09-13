# ---------------- Funções utilitárias ----------------

from pyrogram import Client
from DB.models import PersonagemHusbando, PersonagemWaifu
from types_ import COMMAND_LIST_DB
from uteis import create_bt_clear, create_one_bt


def get_personagem_cache(client: Client, user_id: int, char_id: int) -> dict | None:
    """
    Retorna os dados de edição do personagem armazenados no cache.

    Args:
        client (Client): Cliente Pyrogram que contém o atributo `genero`.
        user_id (int): ID do usuário que está editando.
        char_id (int): ID do personagem.

    Returns:
        dict | None: Dados do personagem em cache ou None se não encontrado.
    """
    user_cache = getattr(Client, "edit_cache", {}).get(user_id, {})
    genero_cache = user_cache.get(getattr(client, "genero").value, {})
    return genero_cache.get(char_id)


def bts_edit(personagem_id: int) -> list[list]:
    """
    Botões para edição de um personagem.

    Args:
        personagem_id (int): ID do personagem.

    Returns:
        list[list]: Estrutura de botões InlineKeyboard para edição.
    """
    return [
        [
            create_one_bt(
                text="✏ Nome",
                callback_data=f"{COMMAND_LIST_DB.EDITCHAR.value}_nome_{personagem_id}",
            ),
            create_one_bt(
                text="🎞 Anime",
                callback_data=f"{COMMAND_LIST_DB.EDITCHAR.value}_anime_{personagem_id}",
            ),
        ],
        [
            create_one_bt(
                text="💎 Raridade",
                callback_data=f"{COMMAND_LIST_DB.EDITCHAR.value}_raridade_{personagem_id}",
            ),
            create_one_bt(
                text="🎉 Evento",
                callback_data=f"{COMMAND_LIST_DB.EDITCHAR.value}_evento_{personagem_id}",
            ),
        ],
        [
            create_one_bt(
                text="🖼 Mídia",
                callback_data=f"{COMMAND_LIST_DB.EDITCHAR.value}_midia_{personagem_id}",
            ),
        ],
        [create_bt_clear()],
        [
            create_one_bt(
                text="💾 Salvar",
                callback_data=f"{COMMAND_LIST_DB.EDITCHAR.value}_salvar_{personagem_id}",
            )
        ],
    ]


def create_cap_edit_Show(check: PersonagemHusbando | PersonagemWaifu) -> list[str]:
    """
    Gera as linhas de caption do personagem para edição.

    Args:
        check (PersonagemHusbando | PersonagemWaifu): Objeto do personagem.

    Returns:
        list[str]: Lista de linhas formatadas para usar como caption.
    """
    # Formatar data de modificação
    if hasattr(check.updated_at, 'strftime'):
        data_modificacao = check.updated_at.strftime('%d/%m/%Y %H:%M:%S')
    else:
        data_modificacao = str(check.updated_at)
    
    return [
        f"<code>ID</code>: {check.id}",
        f"<code>Nome</code>: {check.nome_personagem}",
        f"<code>Anime/Fonte</code>: {check.nome_anime}",
        f"<code>Raridade</code>: {check.raridade.value if hasattr(check.raridade, 'value') else check.raridade}",
        f"<code>Evento</code>: {check.evento.value if hasattr(check.evento, 'value') else check.evento}",
        f"<code>Última modificação</code>: {data_modificacao}",
    ]


