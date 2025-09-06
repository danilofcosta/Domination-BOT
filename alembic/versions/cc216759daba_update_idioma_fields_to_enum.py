"""update_idioma_fields_to_enum

Revision ID: cc216759daba
Revises: 5a7871959826
Create Date: 2025-09-05 21:58:06.822331

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'cc216759daba'
down_revision: Union[str, Sequence[str], None] = '5a7871959826'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Criar o tipo ENUM para idiomas
    idioma_enum = sa.Enum('pt', 'en', 'es', 'fr', 'de', 'it', 'ja', 'ko', name='idioma')
    idioma_enum.create(op.get_bind())
    
    # Alterar coluna idioma_preferido na tabela USUARIOS
    with op.batch_alter_table('USUARIOS') as batch_op:
        # Primeiro, alterar a coluna para usar o ENUM
        batch_op.alter_column('idioma_preferido',
                             type_=idioma_enum,
                             existing_type=sa.String(2),
                             nullable=True,
                             server_default='pt',
                             postgresql_using='idioma_preferido::idioma')
    
    # Alterar coluna idioma na tabela GRUPOS_IDIOMAS
    with op.batch_alter_table('GRUPOS_IDIOMAS') as batch_op:
        # Primeiro, alterar a coluna para usar o ENUM
        batch_op.alter_column('idioma',
                             type_=idioma_enum,
                             existing_type=sa.String(2),
                             nullable=False,
                             server_default='pt',
                             postgresql_using='idioma::idioma')


def downgrade() -> None:
    """Downgrade schema."""
    # Alterar coluna idioma_preferido na tabela USUARIOS de volta para String
    with op.batch_alter_table('USUARIOS') as batch_op:
        batch_op.alter_column('idioma_preferido',
                             type_=sa.String(2),
                             existing_type=sa.Enum('pt', 'en', 'es', 'fr', 'de', 'it', 'ja', 'ko', name='idioma'),
                             nullable=True,
                             server_default='pt')
    
    # Alterar coluna idioma na tabela GRUPOS_IDIOMAS de volta para String
    with op.batch_alter_table('GRUPOS_IDIOMAS') as batch_op:
        batch_op.alter_column('idioma',
                             type_=sa.String(2),
                             existing_type=sa.Enum('pt', 'en', 'es', 'fr', 'de', 'it', 'ja', 'ko', name='idioma'),
                             nullable=False,
                             server_default='pt')
    
    # Remover o tipo ENUM
    sa.Enum(name='idioma').drop(op.get_bind())
