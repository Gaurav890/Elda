"""
Caregiver Note model - Notes from caregivers about patients
"""

from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.database.base import Base


class CaregiverNote(Base):
    """
    CaregiverNote model - Notes from caregivers to provide context to AI

    Each note:
    - Is created by a caregiver about a patient
    - Has a category (medical, behavioral, preferences, etc.)
    - Has a priority (normal or important)
    - Provides context that feeds into Letta for long-term memory
    - Helps Claude generate more personalized responses

    Examples:
    - "Prefers to be called 'Maggie' not 'Margaret'" (preferences)
    - "Gets anxious about taking medication, needs reassurance" (behavioral)
    - "Has trouble remembering grandchildren's names lately" (medical)
    """
    __tablename__ = "caregiver_notes"

    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Foreign Keys
    patient_id = Column(
        UUID(as_uuid=True),
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    caregiver_id = Column(
        UUID(as_uuid=True),
        ForeignKey("caregivers.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )

    # Note Content
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)

    # Classification
    category = Column(String(50), nullable=False)
    # Options: "medical", "behavioral", "preferences", "routine", "safety", "family", "other"

    priority = Column(String(20), nullable=False, default="normal")
    # Options: "normal", "important"

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    patient = relationship("Patient", back_populates="caregiver_notes")
    caregiver = relationship("Caregiver", back_populates="notes")

    def __repr__(self):
        return f"<CaregiverNote {self.title[:30]}... by caregiver {self.caregiver_id} for patient {self.patient_id}>"

    @property
    def is_important(self) -> bool:
        """Check if note is marked as important"""
        return self.priority == "important"
