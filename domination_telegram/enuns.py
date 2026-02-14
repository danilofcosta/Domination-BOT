from enum import Enum


class GeneroEnum(str, Enum):
    Waifu = "waifu"
    Husbando = "husbando"

class Commands_Bot(str, Enum):
    prefixs='/.!'
    Harem='harem'
    fav='fav'
    gift='gift'
    list_annime='listanime'
    top='top'

    @staticmethod
    def create_dynamic_command( command:str,prefix_str:str) -> tuple:
        # print(command,prefix_str[0].lower()+command)
        return (command,prefix_str[0].lower()+command)

class Commands_adm_super(str, Enum):
    prefixs='/.!'
    add_character='add_character'

    @staticmethod
    def create_dynamic_command( command:str,prefix_str:str) -> tuple:
        print(command,prefix_str[0].lower()+command)
        return (command,prefix_str[0].lower()+command)






commands_description = {
    Commands_Bot.Harem: "Mostra seu harém atual.",
    Commands_Bot.fav: "Define um personagem favorito.",
    Commands_Bot.gift: "Envia um presente para outro usuário.",
    Commands_Bot.list_annime: "Lista personagens de um anime.",
    Commands_Bot.top: "Mostra o ranking do servidor."
}