"""fix_id_columns_identity

Revision ID: 8d7faf9d6785
Revises: add_unique_constraints
Create Date: 2025-09-07 18:46:34.499603

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8d7faf9d6785'
down_revision: Union[str, Sequence[str], None] = 'add_unique_constraints'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Fix characters_h table
    op.execute("ALTER TABLE characters_h ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY")
    
    # Fix characters_w table
    op.execute("ALTER TABLE characters_w ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY")
    
    # Fix e_eventos table
    op.execute("ALTER TABLE e_eventos ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY")
    
    # Fix e_raridade table
    op.execute("ALTER TABLE e_raridade ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY")
    
    # Fix usuarios table
    op.execute("ALTER TABLE usuarios ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY")
    
    # colecao_w.id_local and colecao_h.id_local are already identity columns, skip them
    
    # Fix chats_tg table
    op.execute("ALTER TABLE chats_tg ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY")


def downgrade() -> None:
    """Downgrade schema."""
    # Remove identity from characters_h table
    op.execute("ALTER TABLE characters_h ALTER COLUMN id DROP IDENTITY IF EXISTS")
    
    # Remove identity from characters_w table
    op.execute("ALTER TABLE characters_w ALTER COLUMN id DROP IDENTITY IF EXISTS")
    
    # Remove identity from e_eventos table
    op.execute("ALTER TABLE e_eventos ALTER COLUMN id DROP IDENTITY IF EXISTS")
    
    # Remove identity from e_raridade table
    op.execute("ALTER TABLE e_raridade ALTER COLUMN id DROP IDENTITY IF EXISTS")
    
    # Remove identity from usuarios table
    op.execute("ALTER TABLE usuarios ALTER COLUMN id DROP IDENTITY IF EXISTS")
    
    # Remove identity from colecao_w table
    op.execute("ALTER TABLE colecao_w ALTER COLUMN id_local DROP IDENTITY IF EXISTS")
    
    # Remove identity from colecao_h table
    op.execute("ALTER TABLE colecao_h ALTER COLUMN id_local DROP IDENTITY IF EXISTS")
    
    # Remove identity from chats_tg table
    op.execute("ALTER TABLE chats_tg ALTER COLUMN id DROP IDENTITY IF EXISTS")
