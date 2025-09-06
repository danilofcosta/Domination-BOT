"""add_language_preferences

Revision ID: 5a7871959826
Revises: 46634fbac903
Create Date: 2025-09-04 20:12:57.523901

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5a7871959826'
down_revision: Union[str, Sequence[str], None] = '46634fbac903'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Adicionar coluna de idioma preferido para usuários
    with op.batch_alter_table('USUARIOS') as batch_op:
        batch_op.add_column(sa.Column('idioma_preferido', sa.String(2), nullable=True, default='pt'))
    
    # Criar tabela para idiomas de grupos
    op.create_table('GRUPOS_IDIOMAS',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('chat_id', sa.BigInteger(), nullable=False),
        sa.Column('idioma', sa.String(2), nullable=False, default='pt'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('chat_id')
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Remover tabela de idiomas de grupos
    op.drop_table('GRUPOS_IDIOMAS')
    
    # Remover coluna de idioma preferido
    with op.batch_alter_table('USUARIOS') as batch_op:
        batch_op.drop_column('idioma_preferido')
