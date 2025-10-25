"""
Schedule model - Medication and meal schedules
"""

from sqlalchemy import Column, String, Time, Boolean, DateTime, Integer, ForeignKey, JSON, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.database.base import Base


class Schedule(Base):
    """
    Schedule model for medications and meals

    Each schedule:
    - Can be medication or meal
    - Has specific times (e.g., 8:00 AM, 2:00 PM)
    - Has recurrence pattern (daily, specific days)
    - Generates reminders automatically
    """
    __tablename__ = "schedules"

    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Foreign Keys
    patient_id = Column(
        UUID(as_uuid=True),
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Schedule Type
    type = Column(String(20), nullable=False)  # "medication" or "meal"

    # Basic Info
    title = Column(String(200), nullable=False)  # "Take blood pressure medication" or "Lunch"
    description = Column(String(500), nullable=True)  # Additional details

    # Medication-specific (if type="medication")
    medication_name = Column(String(200), nullable=True)
    dosage = Column(String(100), nullable=True)  # "500mg", "2 tablets"
    instructions = Column(String(500), nullable=True)  # "Take with food"

    # Timing
    scheduled_time = Column(Time, nullable=False)  # 08:00:00, 14:00:00, etc.

    # Recurrence
    recurrence_pattern = Column(String(20), default="daily", nullable=False)
    # Options: "daily", "weekly", "specific_days"

    days_of_week = Column(ARRAY(Integer), default=list)  # [1,2,3,4,5] for Mon-Fri, [0,1,2,3,4,5,6] for all days
    # 0=Monday, 1=Tuesday, ..., 6=Sunday

    # Reminder Settings
    reminder_advance_minutes = Column(Integer, default=5, nullable=False)  # Remind 5 minutes before

    # Status
    is_active = Column(Boolean, default=True, nullable=False)

    # Additional context for AI
    context = Column(JSON, default=dict)
    # Example: {"important": true, "side_effects": ["drowsiness"], "food_requirement": "with food"}

    # Timestamps
    start_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    end_date = Column(DateTime, nullable=True)  # null = ongoing
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    patient = relationship("Patient", back_populates="schedules")
    reminders = relationship("Reminder", back_populates="schedule", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Schedule {self.type}: {self.title} at {self.scheduled_time} for patient {self.patient_id}>"
