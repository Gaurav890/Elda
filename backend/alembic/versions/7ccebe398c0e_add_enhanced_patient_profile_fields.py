"""add_enhanced_patient_profile_fields

Revision ID: 7ccebe398c0e
Revises: 8ab72b20f47b
Create Date: 2025-10-24 22:33:04.192478

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7ccebe398c0e'
down_revision: Union[str, None] = '8ab72b20f47b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add basic demographic fields (missing from schema)
    op.add_column('patients', sa.Column('gender', sa.String(20), nullable=True))
    op.add_column('patients', sa.Column('phone_number', sa.String(20), nullable=True))
    op.add_column('patients', sa.Column('address', sa.Text(), nullable=True))
    op.add_column('patients', sa.Column('emergency_contact_name', sa.String(100), nullable=True))
    op.add_column('patients', sa.Column('emergency_contact_phone', sa.String(20), nullable=True))

    # Add dietary_restrictions array (missing from model)
    op.execute("ALTER TABLE patients ADD COLUMN dietary_restrictions VARCHAR[] DEFAULT '{}'")

    # Phase 2: Enhanced personalization fields
    op.add_column('patients', sa.Column('profile_photo_url', sa.String(500), nullable=True))
    op.add_column('patients', sa.Column('timezone', sa.String(50), nullable=False, server_default='UTC'))
    op.add_column('patients', sa.Column('preferred_voice', sa.String(20), nullable=False, server_default='neutral'))
    op.add_column('patients', sa.Column('communication_style', sa.String(20), nullable=False, server_default='friendly'))
    op.add_column('patients', sa.Column('language', sa.String(10), nullable=False, server_default='en'))
    op.add_column('patients', sa.Column('app_version', sa.String(20), nullable=True))
    op.add_column('patients', sa.Column('last_heartbeat_at', sa.DateTime(), nullable=True))


def downgrade() -> None:
    # Remove Phase 2 fields
    op.drop_column('patients', 'last_heartbeat_at')
    op.drop_column('patients', 'app_version')
    op.drop_column('patients', 'language')
    op.drop_column('patients', 'communication_style')
    op.drop_column('patients', 'preferred_voice')
    op.drop_column('patients', 'timezone')
    op.drop_column('patients', 'profile_photo_url')

    # Remove missing fields
    op.drop_column('patients', 'dietary_restrictions')
    op.drop_column('patients', 'emergency_contact_phone')
    op.drop_column('patients', 'emergency_contact_name')
    op.drop_column('patients', 'address')
    op.drop_column('patients', 'phone_number')
    op.drop_column('patients', 'gender')
