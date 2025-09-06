from enum import Enum as PyEnum


class TipoMidia(str, PyEnum):
    IMAGEM_URL = 'IMAGE_URL'
    IMAGEM_FILEID = 'IMAGE_FILEID'
    IMAGEM_BYTES = 'IMAGE_BYTES'
    IMAGEM_ARQUIVO = 'IMAGE_FILE'
    IMAGEM_BASE64 = 'IMAGE_BASE64'
    VIDEO_BYTES = 'VIDEO_BYTES'
    VIDEO_BASE64 = 'VIDEO_BASE64'
    VIDEO_ARQUIVO = 'VIDEO_FILE'
    VIDEO_URL = 'VIDEO_URL'
    VIDEO_FILEID = 'VIDEO_FILEID'


class TipoEvento(str, PyEnum):
    SEM_EVENTO = 'SEMEVENTO'
    HALLOWEEN = 'HALLOWEEN'
    PRIMAVERA = 'SPRING'
    VERAO = 'SUMMER'
    INVERNO = 'WINTER'
    OUTONO = 'AUTUMN'
    ANO_NOVO = 'NEW_YEAR'
    NATAL = 'CHRISTMAS'
    VALENTINA = 'VALENTINE'
    INFANTIL = 'CHILDREN'
    COELHINHA = 'BUNNY'
    CARNAVAL = 'CARNIVAL'
    EMPREGADA = 'MAID'
    ANJO = 'ANGEL'
    ESPORTIVO = 'SPORTS'
    KIMONO = 'KIMONO'
    GALA = 'GALA'
    GALA_MASCULINA = 'GALA_MASCULINA'
    ANO_NOVO_LUNAR = 'NEW_YEAR_LUNAR'
    ENFERMEIRA = 'NURSE'
    ESCOLAR = 'SCHOOL'
    GAME = 'GAME'



class TipoRaridade(str, PyEnum):
    COMUM = 'COMUM'
    INCOMUM = 'INCOMUM'
    RARO = 'RARO'
    LENDARIO = 'LENDARIO'
    EXCLUSIVO = 'EXCLUSIVO'
    LIMITADO = 'LIMITADO'
    ESPECIAL = 'ESPECIAL'
    MULTIVERSO = 'MULTIVERSO'
    ESPECTRAL = 'ESPECTRAL'


class TipoCategoria(str, PyEnum):
    HUSBANDO = 'HUSBANDO'
    WAIFU = 'WAIFU'


class TipoPerfil(str, PyEnum):
    SUPREMO = 'SUPREMO'
    SUPER_ADMIN = 'SUPER_ADMIN'
    ADMIN = 'ADMIN'
    MODERATOR = 'MODERATOR'
    USUARIO = 'USER'
    BANNED = 'BANNED'

class ModoHarem(str,PyEnum):
    PADRAO ='PADRAO'

class Idioma(str, PyEnum):
    PT = 'pt'
    EN = 'en'
    ES = 'es'
    FR = 'fr'
    DE = 'de'
    IT = 'it'
    JA = 'ja'
    KO = 'ko'
    ZH = 'zh'
