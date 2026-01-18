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
        print(command,prefix_str[0].lower()+command)
        return (command,prefix_str[0].lower()+command)

    