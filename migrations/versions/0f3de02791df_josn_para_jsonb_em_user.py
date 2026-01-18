"""josn para jsonb em user

Revision ID: 0f3de02791df
Revises: c65c7cf929a8
Create Date: 2026-01-18 12:05:30.841947

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0f3de02791df'
down_revision: Union[str, Sequence[str], None] = 'c65c7cf929a8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
