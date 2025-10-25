"""
PatientCaregiverRelationship model - Association table for many-to-many relationship
"""

from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime

from app.database.base import Base


class PatientCaregiverRelationship(Base):
    """
    Association table linking patients and caregivers

    Allows:
    - One patient to have multiple caregivers
    - One caregiver to monitor multiple patients
    - Track relationship type (primary, secondary, emergency contact)
    """
    __tablename__ = "patient_caregiver_relationships"

    # Composite primary key
    patient_id = Column(
        UUID(as_uuid=True),
        ForeignKey("patients.id", ondelete="CASCADE"),
        primary_key=True
    )

    caregiver_id = Column(
        UUID(as_uuid=True),
        ForeignKey("caregivers.id", ondelete="CASCADE"),
        primary_key=True
    )

    # Relationship type
    relationship_type = Column(String(50), default="family", nullable=False)
    # Options: "primary", "family", "professional", "emergency_contact"

    # Is this the primary caregiver?
    is_primary = Column(String, default=False, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<Relationship patient={self.patient_id} caregiver={self.caregiver_id} type={self.relationship_type}>"
