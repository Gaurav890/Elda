"""
Patient model - Elderly care recipients
"""

from sqlalchemy import Column, String, Date, Boolean, DateTime, ARRAY, JSON, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.database.base import Base


class Patient(Base):
    """
    Patient model representing elderly care recipients

    Each patient:
    - Has basic demographic info
    - Can have multiple caregivers
    - Has medication/meal schedules
    - Receives reminders and has conversations
    - Has a dedicated Letta agent for long-term memory
    """
    __tablename__ = "patients"

    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Basic Info
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    preferred_name = Column(String(100), nullable=True)  # What they like to be called
    date_of_birth = Column(Date, nullable=False)
    gender = Column(String(20), nullable=True)
    phone_number = Column(String(20), nullable=True)
    address = Column(Text, nullable=True)
    emergency_contact_name = Column(String(100), nullable=True)
    emergency_contact_phone = Column(String(20), nullable=True)

    # Medical & Personal Context
    medical_conditions = Column(ARRAY(String), default=list)  # ["diabetes", "hypertension"]
    medications = Column(ARRAY(String), default=list)  # ["Metformin 500mg", "Lisinopril 10mg"]
    allergies = Column(ARRAY(String), default=list)  # ["penicillin", "peanuts"]
    dietary_restrictions = Column(ARRAY(String), default=list)  # ["vegetarian", "low-sodium"]

    # Personal context for AI (family, hobbies, preferences)
    personal_context = Column(JSON, default=dict)
    # Example: {"family": "2 daughters", "hobbies": ["gardening", "reading"], "favorite_food": "pasta"}

    # Personalization Settings
    profile_photo_url = Column(String(500), nullable=True)  # URL to profile photo
    timezone = Column(String(50), default="UTC", nullable=False)  # Patient's timezone
    preferred_voice = Column(String(20), default="neutral", nullable=False)  # male/female/neutral
    communication_style = Column(String(20), default="friendly", nullable=False)  # friendly/formal/casual
    language = Column(String(10), default="en", nullable=False)  # ISO 639-1 language code

    # AI Integration
    letta_agent_id = Column(String(255), nullable=True, unique=True)  # Letta Cloud agent ID

    # Mobile App
    device_token = Column(String(255), nullable=True)  # Firebase device token for push notifications
    app_version = Column(String(20), nullable=True)  # Mobile app version (e.g., 1.0.0)
    last_active_at = Column(DateTime, nullable=True)  # Last time patient interacted with app
    last_heartbeat_at = Column(DateTime, nullable=True)  # Last heartbeat from mobile app

    # Mobile Setup (QR Code)
    setup_token = Column(String(255), nullable=True)  # One-time token for device setup
    setup_token_expires = Column(DateTime, nullable=True)  # Token expiry timestamp
    device_setup_completed = Column(Boolean, default=False, nullable=False)  # Setup completion flag
    device_platform = Column(String(20), nullable=True)  # iOS or Android

    # Status
    is_active = Column(Boolean, default=True, nullable=False)

    # Notes
    notes = Column(Text, nullable=True)  # General notes from caregivers

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    # Many-to-many with caregivers through PatientCaregiverRelationship
    caregivers = relationship(
        "Caregiver",
        secondary="patient_caregiver_relationships",
        back_populates="patients"
    )

    # One-to-many relationships
    schedules = relationship("Schedule", back_populates="patient", cascade="all, delete-orphan")
    reminders = relationship("Reminder", back_populates="patient", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="patient", cascade="all, delete-orphan")
    daily_summaries = relationship("DailySummary", back_populates="patient", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="patient", cascade="all, delete-orphan")
    insights = relationship("PatientInsight", back_populates="patient", cascade="all, delete-orphan")
    activity_logs = relationship("ActivityLog", back_populates="patient", cascade="all, delete-orphan")
    caregiver_notes = relationship("CaregiverNote", back_populates="patient", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Patient {self.first_name} {self.last_name} ({self.id})>"

    @property
    def full_name(self) -> str:
        """Get patient's full name"""
        return f"{self.first_name} {self.last_name}"

    @property
    def display_name(self) -> str:
        """Get preferred name or first name"""
        return self.preferred_name if self.preferred_name else self.first_name

    @property
    def age(self) -> int:
        """Calculate patient's age"""
        from datetime import date
        today = date.today()
        return today.year - self.date_of_birth.year - (
            (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
        )
