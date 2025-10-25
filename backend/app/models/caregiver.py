"""
Caregiver model - Family members or professional caregivers
"""

from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.database.base import Base


class Caregiver(Base):
    """
    Caregiver model representing family members or professional caregivers

    Each caregiver:
    - Has authentication credentials (email/password)
    - Can monitor multiple patients
    - Receives alerts and notifications
    - Can view patient insights and daily summaries
    """
    __tablename__ = "caregivers"

    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Authentication
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)

    # Basic Info
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    phone_number = Column(String(20), nullable=True)

    # Role (family member, nurse, doctor, etc.)
    role = Column(String(50), default="family", nullable=False)
    # Options: "family", "nurse", "doctor", "professional", "other"

    # Notification Preferences
    sms_notifications_enabled = Column(Boolean, default=True, nullable=False)
    email_notifications_enabled = Column(Boolean, default=True, nullable=False)
    push_notifications_enabled = Column(Boolean, default=True, nullable=False)

    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)  # Email verification
    last_login_at = Column(DateTime, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    # Many-to-many with patients through PatientCaregiverRelationship
    patients = relationship(
        "Patient",
        secondary="patient_caregiver_relationships",
        back_populates="caregivers"
    )

    # Alerts acknowledged by this caregiver
    acknowledged_alerts = relationship("Alert", back_populates="acknowledged_by_caregiver")

    def __repr__(self):
        return f"<Caregiver {self.email} ({self.id})>"

    @property
    def full_name(self) -> str:
        """Get caregiver's full name"""
        return f"{self.first_name} {self.last_name}"
