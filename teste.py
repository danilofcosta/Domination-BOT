from types_ import TipoEvento, TipoRaridade


def create_prelist(base_enum, key: str) -> dict:
    prelist = {}
    for num, enum in enumerate(base_enum, start=1):
        prelist[f"{key}{num}"] = enum
    return prelist
pre_evento = create_prelist(TipoEvento, "e")
pre_raridade = create_prelist(TipoRaridade, "r")
# print(pre_evento)
print(pre_raridade)