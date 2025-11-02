import re
import json
import os
from domination.logger import log_info, log_error, log_debug


# Carrega as mensagens do arquivo JSON
def _load_messages():
    """Carrega as mensagens do arquivo JSON"""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(current_dir, "messages.json")

    try:
        with open(json_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        log_error(f"Arquivo {json_path} não encontrado!", "message")
        return {"pt": {}}
    except json.JSONDecodeError as e:
        log_error(f"Erro ao decodificar JSON: {e}", "message", exc_info=True)
        return {"pt": {}}


# Carrega as mensagens
MESSAGES = _load_messages()


class MESSAGE:

    @staticmethod
    def _protect_placeholders(text: str) -> tuple[str, dict]:
        """
        Protege placeholders {variavel} antes da tradução.
        Retorna (texto_protegido, dicionario_placeholders)
        """
        placeholders = {}
        pattern = r"\{([^}]+)\}"

        def replace_placeholder(match):
            placeholder = match.group(0)  # {variavel}
            var_name = match.group(1)  # variavel
            # Usar um identificador mais único e menos provável de ser traduzido
            protected_name = f"PLACEHOLDER_{var_name.upper()}_{len(placeholders)}"
            placeholders[protected_name] = placeholder
            return protected_name

        protected_text = re.sub(pattern, replace_placeholder, text)
        return protected_text, placeholders

    @staticmethod
    def _restore_placeholders(text: str, placeholders: dict) -> str:
        """
        Restaura placeholders após a tradução.
        """
        # Ordenar por tamanho do nome protegido (maior primeiro) para evitar substituições parciais
        sorted_placeholders = sorted(
            placeholders.items(), key=lambda x: len(x[0]), reverse=True
        )

        for protected_name, original_placeholder in sorted_placeholders:
            text = text.replace(protected_name, original_placeholder)
        return text

    @staticmethod
    def get_text(Idioma: str, category: str, key: str, **kwargs) -> str:
        """
        Retorna o texto traduzido de acordo com o idioma, categoria e chave.
        Substitui placeholders usando kwargs.
        """
        # Acessa corretamente a estrutura: MESSAGES["pt"][category]
        comandos = MESSAGES.get("pt", {}).get(category, {})
        texto = comandos.get(key, "Texto não encontrado.")
        log_debug(f"Kwargs para formatação: {kwargs}", "message")
        # Traduz apenas se não for português
        
        try:
            if len(kwargs) == 0:
                return texto
            return texto.format(**kwargs)

        except KeyError as e:
            log_error(f"Erro ao formatar texto: {e}", "message", exc_info=True)
            return texto
