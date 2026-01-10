"""init = true na tabela de user 

Revision ID: c65c7cf929a8
Revises: 2a33162e98e0
Create Date: 2026-01-10 09:48:13.277092

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c65c7cf929a8'
down_revision: Union[str, Sequence[str], None] = '2a33162e98e0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
