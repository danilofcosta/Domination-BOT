from sqlalchemy import String, JSON, Enum, ForeignKey, Table, Column, func, BigInteger
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Mapped, mapped_column, registry, relationship, declared_attr
from types_ import (
    ModoHarem,
    TipoCategoria,
    TipoEvento,
    TipoMidia,
    TipoPerfil,
    TipoRaridade,
    Idioma,
)

# Registry
table_registry = registry()

# =============================
# TABELAS ASSOCIATIVAS
# =============================
# # Waifu
# personagem_evento_w = Table(
#     "E_ASSOCIATIVAS_EVENTOS",
#     table_registry.metadata,
#     Column("personagem_id", ForeignKey("CHARACTERS_W.id", ondelete="CASCADE"), primary_key=True),
#     Column("evento_id", ForeignKey("E_EVENTOS.id", ondelete="CASCADE"), primary_key=True)
# )
# personagem_raridade_w = Table(
#     "R_ASSOCIATIVAS_RARIDADES_W",
#     table_registry.metadata,
#     Column("personagem_id", ForeignKey("CHARACTERS_W.id", ondelete="CASCADE"), primary_key=True),
#     Column("raridade_id", ForeignKey("E_RARIDADE.id", ondelete="CASCADE"), primary_key=True)
# )


# =============================
# CLASSE BASE DE PERSONAGEM
# =============================
@table_registry.mapped_as_dataclass
class BasePersonagem:
    __abstract__ = True

    id: Mapped[int] = mapped_column(primary_key=True, init=False,autoincrement=True)
    nome_personagem: Mapped[str] = mapped_column(String, nullable=False)
    nome_anime: Mapped[str] = mapped_column(String, nullable=False)
    evento: Mapped[TipoEvento] = mapped_column(
        Enum(TipoEvento), ForeignKey("e_eventos.cod"), nullable=False, index=True
    )
    raridade: Mapped[TipoRaridade] = mapped_column(
        Enum(TipoRaridade), ForeignKey("e_raridade.cod"), nullable=False, index=True
    )

    # Correção: Usar @declared_attr para definir as relações em classes abstratas
    @declared_attr
    def evento_full(cls) -> Mapped["Evento_Midia"]:
        """Define a relação com a tabela de eventos.

        É usado @declared_attr porque BasePersonagem é uma classe abstrata,
        garantindo que a relação seja criada para cada subclasse.
        """
        return relationship(
            "Evento_Midia", foreign_keys=[cls.evento], init=False, lazy="selectin"
        )

    @declared_attr
    def raridade_full(cls) -> Mapped["Raridade_Midia"]:
        """Define a relação com a tabela de raridade.

        É usado @declared_attr porque BasePersonagem é uma classe abstrata.
        """
        return relationship(
            "Raridade_Midia", foreign_keys=[cls.raridade], init=False, lazy="selectin"
        )

    data: Mapped[str] = mapped_column(nullable=False, unique=True)
    tipo_midia: Mapped[TipoMidia] = mapped_column(Enum(TipoMidia), nullable=False)
    extras: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    created_at: Mapped[datetime] = mapped_column(init=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        init=False, server_default=func.now(), onupdate=func.now()
    )


# =============================
# EVENTO E RARIDADE
# =============================
@table_registry.mapped_as_dataclass
class Evento_Midia:
    __tablename__ = "e_eventos"
    id: Mapped[int] = mapped_column(primary_key=True, init=False,autoincrement=True)
    cod: Mapped[TipoEvento] = mapped_column(
        Enum(TipoEvento), unique=True, nullable=False
    )
    nome_traduzido: Mapped[Optional[str]] = mapped_column(String(100))
    emoji: Mapped[Optional[str]] = mapped_column(String(5))
    descricao: Mapped[Optional[str]] = mapped_column(String(255))


@table_registry.mapped_as_dataclass
class Raridade_Midia:
    __tablename__ = "e_raridade"
    id: Mapped[int] = mapped_column(primary_key=True, init=False,autoincrement=True)
    cod: Mapped[TipoRaridade] = mapped_column(
        Enum(TipoRaridade), unique=True, nullable=False
    )
    nome: Mapped[str] = mapped_column(String(50), nullable=False)
    emoji: Mapped[Optional[str]] = mapped_column(String(5))
    descricao: Mapped[Optional[str]] = mapped_column(String(255))


# =============================
# PERSONAGENS WAIFU
# =============================
@table_registry.mapped_as_dataclass(kw_only=True)
class PersonagemWaifu(BasePersonagem):
    __tablename__ = "characters_w"
    __allow_unmapped__ = True

    genero: Mapped[TipoCategoria] = mapped_column(
        Enum(TipoCategoria), default=TipoCategoria.WAIFU, nullable=False
    )


# =============================
# PERSONAGENS HUSBANDO
# =============================
@table_registry.mapped_as_dataclass(kw_only=True)
class PersonagemHusbando(BasePersonagem):
    __tablename__ = "characters_h"
    __allow_unmapped__ = True

    genero: Mapped[TipoCategoria] = mapped_column(
        Enum(TipoCategoria), default=TipoCategoria.HUSBANDO, nullable=False
    )


# =============================
# USUÁRIO E COLEÇÕES
# =============================
@table_registry.mapped_as_dataclass
class Usuario:
    __tablename__ = "usuarios"
    id: Mapped[int] = mapped_column(primary_key=True, init=False,autoincrement=True)
    telegram_id: Mapped[int] = mapped_column(BigInteger, unique=True, nullable=False, index=True)
    telegram_from_user: Mapped[dict] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(init=False, server_default=func.now())

    colecoes_waifu: Mapped[list["ColecaoUsuarioWaifu"]] = relationship(
        back_populates="usuario",
        init=False,
        lazy="selectin",
        cascade="all, delete-orphan",
    )
    fav_w_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("characters_w.id"), nullable=True, index=True
    )
    fav_w_character: Mapped[Optional["PersonagemWaifu"]] = relationship(
        foreign_keys=[fav_w_id], init=False, lazy="selectin"
    )

    fav_h_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("characters_h.id"), nullable=True, index=True
    )
    fav_h_character: Mapped[Optional["PersonagemHusbando"]] = relationship(
        foreign_keys=[fav_h_id], init=False, lazy="selectin"
    )

    colecoes_husbando: Mapped[list["ColecaoUsuarioHusbando"]] = relationship(
        back_populates="usuario",
        init=False,
        lazy="selectin",
        cascade="all, delete-orphan",
    )
    perfil_status: Mapped[Optional[TipoPerfil]] = mapped_column(
        Enum(TipoPerfil), default=None
    )

    # Agora com valor default no JSON
    configs_w: Mapped[dict] = mapped_column(
        JSON, nullable=False, default_factory=lambda: {"modo_harem": ModoHarem.PADRAO.value}
    )
    configs_h: Mapped[dict] = mapped_column(
        JSON, nullable=False, default_factory=lambda: {"modo_harem": ModoHarem.PADRAO.value}
    )
    # Campo para idioma preferido do usuário
    idioma_preferido: Mapped[Optional[Idioma]] = mapped_column(
        Enum(Idioma), nullable=True, default=Idioma.PT
    )


@table_registry.mapped_as_dataclass
class ColecaoUsuarioWaifu:
    __tablename__ = "colecao_w"
    __allow_unmapped__ = True

    id_local: Mapped[int] = mapped_column(primary_key=True, init=False,autoincrement=True)
    telegram_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("usuarios.telegram_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    id_global: Mapped[int] = mapped_column(
        ForeignKey("characters_w.id"), nullable=False, index=True
    )

    usuario: Mapped["Usuario"] = relationship(
        back_populates="colecoes_waifu", init=False, lazy="selectin"
    )
    character: Mapped["PersonagemWaifu"] = relationship(
        foreign_keys=[id_global], init=False, lazy="selectin"
    )
    adicionado_em: Mapped[datetime] = mapped_column(
        init=False, server_default=func.now()
    )


@table_registry.mapped_as_dataclass
class ColecaoUsuarioHusbando:
    __tablename__ = "colecao_h"
    __allow_unmapped__ = True

    id_local: Mapped[int] = mapped_column(primary_key=True, init=False,autoincrement=True)
    telegram_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("usuarios.telegram_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    id_global: Mapped[int] = mapped_column(
        ForeignKey("characters_h.id"), nullable=False, index=True
    )

    usuario: Mapped["Usuario"] = relationship(
        back_populates="colecoes_husbando", init=False, lazy="selectin"
    )
    character: Mapped["PersonagemHusbando"] = relationship(
        foreign_keys=[id_global], init=False, lazy="selectin"
    )
    adicionado_em: Mapped[datetime] = mapped_column(
        init=False, server_default=func.now()
    )


@table_registry.mapped_as_dataclass
class ChatTG:
    __tablename__ = "chats_tg"

    id: Mapped[int] = mapped_column(primary_key=True, init=False, autoincrement=True)
    id_grupo: Mapped[int] = mapped_column(BigInteger, unique=True, index=True)
    name: Mapped[str] = mapped_column(String)
    configs: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    idioma: Mapped[Idioma] = mapped_column(Enum(Idioma), nullable=False, default=Idioma.PT)
    created_at: Mapped[datetime] = mapped_column(init=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        init=False, server_default=func.now(), onupdate=func.now()
    )
