from enum import Enum


class MediaType(str, Enum):
    """Tipos de mídia dos personagens"""
    IMAGE_URL = "IMAGE_URL"
    IMAGE_FILEID = "IMAGE_FILEID"
    IMAGE_BYTES = "IMAGE_BYTES"
    IMAGE_FILE = "IMAGE_FILE"
    IMAGE_BASE64 = "IMAGE_BASE64"
    VIDEO_BYTES = "VIDEO_BYTES"
    VIDEO_BASE64 = "VIDEO_BASE64"
    VIDEO_FILE = "VIDEO_FILE"
    VIDEO_URL = "VIDEO_URL"
    VIDEO_FILEID = "VIDEO_FILEID"


class EventType(str, Enum):
    """Tipos de eventos do sistema"""
    NONE = "SEMEVENTO"
    HALLOWEEN = "HALLOWEEN"
    SPRING = "SPRING"
    SUMMER = "SUMMER"
    WINTER = "WINTER"
    AUTUMN = "AUTUMN"
    NEW_YEAR = "NEW_YEAR"
    CHRISTMAS = "CHRISTMAS"
    VALENTINE = "VALENTINE"
    CHILDREN = "CHILDREN"
    BUNNY = "BUNNY"
    CARNIVAL = "CARNIVAL"
    MAID = "MAID"
    ANGEL = "ANGEL"
    SPORTS = "SPORTS"
    KIMONO = "KIMONO"
    GALA = "GALA"
    GALA_MASCULINA = "GALA_MASCULINA"
    NEW_YEAR_LUNAR = "NEW_YEAR_LUNAR"
    NURSE = "NURSE"
    SCHOOL = "SCHOOL"
    GAME = "GAME"


class RarityType(str, Enum):
    """Níveis de raridade dos personagens"""
    COMMON = "COMUM"
    UNCOMMON = "INCOMUM"
    RARE = "RARO"
    LEGENDARY = "LENDARIO"
    EXCLUSIVE = "EXCLUSIVO"
    LIMITED = "LIMITADO"
    SPECIAL = "ESPECIAL"
    MULTIVERSE = "MULTIVERSO"
    SPECTRAL = "ESPECTRAL"


class CategoryType(str, Enum):
    """Categoria do personagem"""
    HUSBANDO = "HUSBANDO"
    WAIFU = "WAIFU"


class ProfileType(str, Enum):
    """Status de perfil do usuário"""
    SUPREME = "SUPREMO"
    SUPER_ADMIN = "SUPER_ADMIN"
    ADMIN = "ADMIN"
    MODERATOR = "MODERATOR"
    USER = "USER"
    BANNED = "BANNED"


class HaremMode(str, Enum):
    """Modos de exibição do harém"""
    DEFAULT = "PADRAO"
    RECENT = "RECENTE"
    ANIME = "ANIME"
    DETAIL = "DETALHE"
    RARITY = "RARIDADE"
    EVENT = "EVENTO"


class Language(str, Enum):
    """Idiomas suportados"""
    PT = "pt"
    EN = "en"
    ES = "es"
    FR = "fr"
    DE = "de"
    IT = "it"
    JA = "ja"
    KO = "ko"
    ZH = "zh"


class CommandUser(str, Enum):
    """Comandos disponíveis para usuários"""
    FAV = "fav"
    HAREM = "harem"
    HAREM_MODE = "modeharem"
    DOMINATE = "dominar"
    GIFT = "gift"
    LIST_ANIME = "listanime"
    MY_INFO = "myinfo"
    TOP = "top"
    TOP_CHAT = "topchat"
    TRADE = "trade"
    START = "start"
    LANG = "lang"
    SET_PROFILE = "setprofile"
    SET_DESCRIPTION = "setdesc"


class CommandAdmin(str, Enum):
    """Comandos administrativos"""
    ADD_CHARACTER = "adcharem"
    OPEN_PROFILE = "open"
    DELETE_PROFILE = "delprofile"


class CommandDatabase(str, Enum):
    """Comandos de gerenciamento de banco de dados"""
    ADD_CHARACTER = "addchar"
    EDIT_CHARACTER = "editchar"
    DELETE_CHARACTER = "delchar"


COMMAND_DESCRIPTIONS_PRIVATE = {
    CommandUser.FAV.value: "Adiciona ou remove um personagem dos favoritos",
    CommandUser.HAREM.value: "Mostra seu harem",
    CommandUser.HAREM_MODE.value: "Define o modo de exibição do harem",
    CommandUser.DOMINATE.value: "Tenta dominar um personagem",
    CommandUser.LIST_ANIME.value: "Lista os animes disponíveis",
    CommandUser.MY_INFO.value: "Mostra suas informações",
    CommandUser.TOP.value: "Mostra o ranking de usuários",
    CommandUser.START.value: "Iniciar o bot",
}

COMMAND_DESCRIPTIONS_PUBLIC = {
    **COMMAND_DESCRIPTIONS_PRIVATE,
    CommandUser.TOP_CHAT.value: "Mostra o ranking do chat",
    CommandUser.GIFT.value: "Presenteia um personagem para outro usuário",
    CommandUser.TRADE.value: "Troca personagens com outro usuário",
}

COMMAND_DESCRIPTIONS_ADMIN = {
    **COMMAND_DESCRIPTIONS_PUBLIC,
    CommandUser.SET_PROFILE.value: "Define foto de perfil do bot",
}


def is_admin_or_higher(profile_status: ProfileType) -> bool:
    """Verifica se o perfil do usuário é ADMIN ou superior"""
    if not profile_status:
        return False

    admin_levels = {
        ProfileType.ADMIN,
        ProfileType.SUPER_ADMIN,
        ProfileType.SUPREME,
    }
    return profile_status in admin_levels
