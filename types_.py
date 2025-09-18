from enum import Enum as PyEnum


class TipoMidia(str, PyEnum):
    IMAGEM_URL = "IMAGE_URL"
    IMAGEM_FILEID = "IMAGE_FILEID"
    IMAGEM_BYTES = "IMAGE_BYTES"
    IMAGEM_ARQUIVO = "IMAGE_FILE"
    IMAGEM_BASE64 = "IMAGE_BASE64"
    VIDEO_BYTES = "VIDEO_BYTES"
    VIDEO_BASE64 = "VIDEO_BASE64"
    VIDEO_ARQUIVO = "VIDEO_FILE"
    VIDEO_URL = "VIDEO_URL"
    VIDEO_FILEID = "VIDEO_FILEID"


class TipoEvento(str, PyEnum):
    SEM_EVENTO = "SEMEVENTO"
    HALLOWEEN = "HALLOWEEN"
    PRIMAVERA = "SPRING"
    VERAO = "SUMMER"
    INVERNO = "WINTER"
    OUTONO = "AUTUMN"
    ANO_NOVO = "NEW_YEAR"
    NATAL = "CHRISTMAS"
    DIAS_DOS_NAMORADOS = "VALENTINE"
    INFANTIL = "CHILDREN"
    PASCOA = "BUNNY"
    CARNAVAL = "CARNIVAL"
    EMPREGADA = "MAID"
    ANJO = "ANGEL"
    ESPORTE = "SPORTS"
    KIMONO = "KIMONO"
    GALA = "GALA"
    GALA_MASCULINA = "GALA_MASCULINA"
    ANO_NOVO_LUNAR = "NEW_YEAR_LUNAR"
    ENFERMEIRA = "NURSE"
    ESCOLA = "SCHOOL"
    GAME = "GAME"


class TipoRaridade(str, PyEnum):
    COMUM = "COMUM"
    INCOMUM = "INCOMUM"
    RARO = "RARO"
    LENDARIO = "LENDARIO"
    EXCLUSIVO = "EXCLUSIVO"
    LIMITADO = "LIMITADO"
    ESPECIAL = "ESPECIAL"
    MULTIVERSO = "MULTIVERSO"
    ESPECTRAL = "ESPECTRAL"


class TipoCategoria(str, PyEnum):
    HUSBANDO = "HUSBANDO"
    WAIFU = "WAIFU"


class TipoPerfil(str, PyEnum):
    SUPREMO = "SUPREMO"
    SUPER_ADMIN = "SUPER_ADMIN"
    ADMIN = "ADMIN"
    MODERATOR = "MODERATOR"
    USUARIO = "USER"
    BANNED = "BANNED"


class ModoHarem(str, PyEnum):
    PADRAO = "PADRAO"
    RECENTE = "RECENTE"
    ANIME = "ANIME"
    DETALHE = "DETALHE"
    RARIDADE = "RARIDADE"
    EVENTO = "EVENTO"


class Idioma(str, PyEnum):
    PT = "pt"
    EN = "en"
    ES = "es"
    FR = "fr"
    DE = "de"
    IT = "it"
    JA = "ja"
    KO = "ko"
    ZH = "zh"


class COMMAND_LIST(PyEnum):
    FAV = "fav"
    HAREM = "harem"
    HAREMMODE = "modeharem"
    DOMINAR = "dominar"
    GIFT = "gift"
    LISTANIME = "listanime"
    MYINFO = "myinfo"
    TOP = "top"
    TOP_CHAT = "topchat"
    TRADE = "trade"
    START = "start"
    LANG = "lang"
    SETPROFILE = "setprofile"
    SETDESCRIPTION = "setdesc"

class COMMAND_LIST_ADMIN(PyEnum):
    ADD_CHAR="adcharem"
    OPEN_PROFILE="open"
    DELETE_PROFILE="delprofile"


COMMAND_LIST_MIN_DESC_PV = {
    COMMAND_LIST.FAV.value: "Adiciona ou remove um personagem dos favoritos",
    COMMAND_LIST.HAREM.value: "Mostra seu harem",
    COMMAND_LIST.HAREMMODE.value: "Define o modo de exibição do harem",
    COMMAND_LIST.DOMINAR.value: "Tenta dominar um personagem",
    COMMAND_LIST.LISTANIME.value: "Lista os animes disponíveis",
    COMMAND_LIST.MYINFO.value: "Mostra suas informações",
    COMMAND_LIST.TOP.value: "Mostra o ranking de usuários",
    COMMAND_LIST.START.value: "Iniciar o bot",
}
COMMAND_LIST_MIN_DESC_PUBLIC = COMMAND_LIST_MIN_DESC_PV.copy()
COMMAND_LIST_MIN_DESC_PUBLIC[COMMAND_LIST.TOP_CHAT.value] = "Mostra o ranking do chat"
COMMAND_LIST_MIN_DESC_PUBLIC[COMMAND_LIST.GIFT.value] = (
    "Presenteia um personagem para outro usuário"
)
COMMAND_LIST_MIN_DESC_PUBLIC[COMMAND_LIST.TRADE.value] = (
    "Troca personagens com outro usuário"
)
COMMAND_LIST_MIN_DESC_ADMIN = COMMAND_LIST_MIN_DESC_PUBLIC.copy()
COMMAND_LIST_MIN_DESC_ADMIN.update( {
    COMMAND_LIST.SETPROFILE.value: "Define foto de perfil do bot",
})


class COMMAND_LIST_DB(PyEnum):
    ADDCHAR = "addchar"
    EDITCHAR = "editchar"
    DELCHAR = "delchar"


def is_admin_or_higher(perfil_status):
    """Verifica se o perfil do usuário é ADMIN ou superior"""
    if not perfil_status:
        return False

    admin_levels = [TipoPerfil.ADMIN, TipoPerfil.SUPER_ADMIN, TipoPerfil.SUPREMO]
    return perfil_status in admin_levels
