"""add configs_w|h

Revision ID: 53903f6f0d99
Revises: 2c694b849a3a
Create Date: 2025-09-01 08:44:23.506245
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import text

# revision identifiers, used by Alembic.
revision: str = "53903f6f0d99"
down_revision: Union[str, Sequence[str], None] = "0902a6360a78"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Adicionar colunas separadamente para evitar dependência circular
    op.add_column("USUARIOS", sa.Column("Configs_w", sa.JSON(), nullable=True))
    op.add_column("USUARIOS", sa.Column("Configs_h", sa.JSON(), nullable=True))

    # Adicionar colunas fav_w_id e fav_h_id se não existirem
    try:
        op.add_column("USUARIOS", sa.Column("fav_w_id", sa.Integer(), nullable=True))
    except Exception:
        pass  # Coluna já existe

    try:
        op.add_column("USUARIOS", sa.Column("fav_h_id", sa.Integer(), nullable=True))
    except Exception:
        pass  # Coluna já existe

    # Criar índices
    try:
        op.create_index("ix_USUARIOS_fav_w_id", "USUARIOS", ["fav_w_id"], unique=False)
    except Exception:
        pass  # Índice já existe

    try:
        op.create_index("ix_USUARIOS_fav_h_id", "USUARIOS", ["fav_h_id"], unique=False)
    except Exception:
        pass  # Índice já existe

    # Preenche registros antigos com valor default
    conn = op.get_bind()
    conn.execute(
        text(
            'UPDATE USUARIOS SET Configs_w = json(\'{"modo_harem": "padrao"}\') WHERE Configs_w IS NULL'
        )
    )
    conn.execute(
        text(
            'UPDATE USUARIOS SET Configs_h = json(\'{"modo_harem": "padrao"}\') WHERE Configs_h IS NULL'
        )
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Remover índices
    try:
        op.drop_index("ix_USUARIOS_fav_w_id", table_name="USUARIOS")
    except Exception:
        pass

    try:
        op.drop_index("ix_USUARIOS_fav_h_id", table_name="USUARIOS")
    except Exception:
        pass

    # Remover colunas
    op.drop_column("USUARIOS", "Configs_h")
    op.drop_column("USUARIOS", "Configs_w")
    op.drop_column("USUARIOS", "fav_h_id")
    op.drop_column("USUARIOS", "fav_w_id")
