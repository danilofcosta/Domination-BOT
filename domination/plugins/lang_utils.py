"""
Utilitários para gerenciamento de Idiomas por chat
"""

from sqlalchemy import select
from DB.models import ChatTG
from types_ import Idioma
from pyrogram.types import Chat
from domination.message import MESSAGE

async def obter_Idioma_chat(client, chat_id: int) -> str:
    """
    Obtém o Idioma do chat do banco de dados
    Retorna 'pt' como padrão se não encontrar
    """
    try:
        async with await client.get_reusable_session() as session:
            stmt = select(ChatTG).where(ChatTG.id_grupo == chat_id)
            result = await session.execute(stmt)
            chat = result.scalar_one_or_none()

            if chat:
                return chat.idioma.value
            else:
                return "pt"  # Padrão português

    except Exception as e:
        print(f"Erro ao obter Idioma do chat {chat_id}: {e}")
        return "pt"  # Padrão português


def obter_Idioma_chat_sync(chat_id: int) -> str:
    """
    Versão síncrona para obter Idioma do chat
    Usada em contextos onde não é possível usar async
    """
    # Por enquanto retorna português como padrão
    # Em uma implementação real, você poderia usar uma cache ou conexão síncrona
    return "pt"


async def obter_mensagem_chat(
    client, chat_id: int, categoria: str, chave: str, **kwargs
) -> str:
    """
    Obtém uma mensagem no Idioma do chat
    """
    if chat_id :
        Idioma_chat = await obter_Idioma_chat(client, chat_id)
    else:
        Idioma_chat='pt'
    return MESSAGE.get_text(Idioma_chat, categoria, chave, **kwargs)


def obter_mensagem_chat_sync(chat_id: int, categoria: str, chave: str, **kwargs) -> str:
    """
    Versão síncrona para obter mensagem no Idioma do chat
    """
    # Importar MESSAGE aqui para evitar dependência circular
    from domination.message import MESSAGE

    Idioma_chat = obter_Idioma_chat_sync(chat_id)
    return MESSAGE.get_text(Idioma_chat, categoria, chave, **kwargs)


async def definir_Idioma_chat(
    client, chat_id: int, novo_Idioma: Idioma, chat: Chat
) -> bool:
    """
    Define o Idioma do chat
    Retorna True se sucesso, False se erro
    """
    try:
        async with await client.get_reusable_session() as session:
            # Verificar se o chat já existe
            stmt = select(ChatTG).where(ChatTG.id_grupo == chat_id)
            result = await session.execute(stmt)
            chat_existente:ChatTG = result.scalar_one_or_none()

            if chat_existente:
                # Atualizar Idioma existente
                chat_existente.idioma = novo_Idioma
                session.add(chat_existente)
            else:
                # Criar novo registro
                novo_chat = ChatTG(id_grupo=chat_id, idioma=novo_Idioma, name=chat.title, configs={})
                session.add(novo_chat)

            await session.commit()
            return True

    except Exception as e:
        print(f"Erro ao definir Idioma do chat {chat_id}: {e}")
        return False


def obter_Idiomas_disponiveis() -> dict:
    """
    Retorna dicionário com Idiomas disponíveis
    """
    return {
        "pt": ("🇧🇷", "Português"),
        "en": ("🇺🇸", "English"),
        "es": ("🇪🇸", "Español"),
        "fr": ("🇫🇷", "Français"),
        "de": ("🇩🇪", "Deutsch"),
        "it": ("🇮🇹", "Italiano"),
        "ja": ("🇯🇵", "日本語"),
        "ko": ("🇰🇷", "한국어"),
        "zh": ("🇨🇳", "中文"),
    }


def validar_Idioma(codigo_Idioma: str) -> bool:
    """
    Valida se o código do Idioma é válido
    """
    Idiomas_validos = {"pt", "en", "es", "fr", "de", "it", "ja", "ko", "zh"}
    return codigo_Idioma.lower() in Idiomas_validos


def obter_enum_Idioma(codigo_Idioma: str) -> Idioma:
    """
    Converte código do Idioma para enum
    """
    mapeamento = {
        "pt": Idioma.PT,
        "en": Idioma.EN,
        "es": Idioma.ES,
        "fr": Idioma.FR,
        "de": Idioma.DE,
        "it": Idioma.IT,
        "ja": Idioma.JA,
        "ko": Idioma.KO,
        "zh": Idioma.ZH,
    }
    return mapeamento.get(codigo_Idioma.lower(), Idioma.PT)
