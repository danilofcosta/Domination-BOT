"""add_unique_constraints

Revision ID: add_unique_constraints
Revises: 3c2773b5ffc2
Create Date: 2025-09-07 15:35:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_unique_constraints'
down_revision: Union[str, Sequence[str], None] = '3c2773b5ffc2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Adicionar constraint única na coluna cod da tabela e_eventos
    op.create_unique_constraint('uq_e_eventos_cod', 'e_eventos', ['cod'])
    
    # Adicionar constraint única na coluna cod da tabela e_raridade
    op.create_unique_constraint('uq_e_raridade_cod', 'e_raridade', ['cod'])


def downgrade() -> None:
    """Downgrade schema."""
    # Remover constraint única da tabela e_eventos
    op.drop_constraint('uq_e_eventos_cod', 'e_eventos', type_='unique')
    
    # Remover constraint única da tabela e_raridade
    op.drop_constraint('uq_e_raridade_cod', 'e_raridade', type_='unique')
