"""add_unique_constraint_to_user_username

Revision ID: f1dc07104dfe
Revises: a92ce163bf77
Create Date: 2026-05-31 12:04:42.785476

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f1dc07104dfe'
down_revision: Union[str, Sequence[str], None] = 'a92ce163bf77'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_unique_constraint('uq_users_username', 'users', ['username'])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint('uq_users_username', 'users', type_='unique')
