"""sync_enum_values_with_python_code

Revision ID: ce685350e1d5
Revises: 746b3e8d9014
Create Date: 2025-09-13 18:29:06.581175

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ce685350e1d5'
down_revision: Union[str, Sequence[str], None] = '746b3e8d9014'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Sincronizar valores dos enums com o código Python."""
    
    # 1. Criar enum ModoHarem que não existe no banco (se não existir)
    op.execute("""
        DO $$ 
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'modoharem') THEN
                CREATE TYPE modoharem AS ENUM ('PADRAO', 'RECENTE', 'ANIME', 'DETALHE', 'RARIDADE', 'EVENTO');
            END IF;
        END $$;
    """)


def downgrade() -> None:
    """Reverter mudanças dos enums."""
    
    # 1. Remover enum ModoHarem
    op.execute("DROP TYPE IF EXISTS modoharem")
