from translate import Translator
import re
import json
import os


# Carrega as mensagens do arquivo JSON
def _load_messages():
    """Carrega as mensagens do arquivo JSON"""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(current_dir, "messages.json")

    try:
        with open(json_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Arquivo {json_path} não encontrado!")
        return {"pt": {}}
    except json.JSONDecodeError as e:
        print(f"Erro ao decodificar JSON: {e}")
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
        print(kwargs)
        # Traduz apenas se não for português
        if Idioma != "pt":
            try:

                translator = Translator(
                    provider="mymemory", from_lang="pt", to_lang=Idioma
                )
                if len(kwargs) == 0:
                    return  translator.translate(texto)
                return  translator.translate(texto.format(**kwargs))

                

                # # Protege placeholders antes da tradução
                # texto_protegido, placeholders = MESSAGE._protect_placeholders(texto)

                # # Tenta primeiro com MyMemory (mais confiável)

                # texto_traduzido = translator.translate(texto_protegido)

                # if texto_traduzido and isinstance(texto_traduzido, str):
                #     # Restaura placeholders após a tradução
                #     texto = MESSAGE._restore_placeholders(texto_traduzido, placeholders)
            except Exception as e:
                print(f"Erro na tradução com MyMemory: {e}")
                # try:
                #     # Fallback para Microsoft se MyMemory falhar
                #     translator = Translator(
                #         provider="microsoft", from_lang="pt", to_lang=Idioma
                #     )
                #     texto_traduzido = translator.translate(texto_protegido)

                #     if texto_traduzido and isinstance(texto_traduzido, str):
                #         # Restaura placeholders após a tradução
                #         texto = MESSAGE._restore_placeholders(
                #             texto_traduzido, placeholders
                #         )
                # except Exception as e2:
                #     print(f"Erro na tradução com Microsoft: {e2}")
                #     # Se ambos falharem, mantém o texto original em português
                #     pass

        try:
            if len(kwargs) == 0:
                return texto
            return texto.format(**kwargs)

        except KeyError as e:
            print(f"Erro ao formatar texto: {e}")
            return texto
