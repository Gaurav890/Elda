"""add_caregiver_preferences_column

Revision ID: 8ab72b20f47b
Revises: a72a74be09a9
Create Date: 2025-10-24 22:19:52.803975

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8ab72b20f47b'
down_revision: Union[str, None] = 'a72a74be09a9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add preferences JSONB column to caregivers table with default empty object
    op.add_column(
        'caregivers',
        sa.Column('preferences', sa.JSON(), nullable=False, server_default='{}')
    )


def downgrade() -> None:
    # Remove preferences column from caregivers table
    op.drop_column('caregivers', 'preferences')
