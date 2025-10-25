"""
ActivityLog model - Patient activity tracking
"""

from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, JSON, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.database.base import Base


class ActivityLog(Base):
    """
    ActivityLog model - Track patient activity

    Logged from:
    - Mobile app heartbeat (every 15 minutes)
    - Voice interactions
    - Reminder responses
    - Emergency button presses
    - App opens/closes
    """
    __tablename__ = "activity_logs"

    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Foreign Keys
    patient_id = Column(
        UUID(as_uuid=True),
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Activity Type
    activity_type = Column(String(50), nullable=False)
    # Options: "heartbeat", "conversation", "reminder_response", "emergency", "app_open",
    #          "app_close", "location_update", "battery_update"

    # Activity Details
    details = Column(JSON, default=dict)
    # Examples:
    # {"battery_level": 85, "location": {"lat": 37.7749, "lon": -122.4194}}
    # {"conversation_id": "123", "duration_seconds": 45}
    # {"reminder_id": "456", "response": "taken"}

    # Device Info
    device_type = Column(String(20), nullable=True)  # "iOS", "Android"
    app_version = Column(String(20), nullable=True)  # "1.0.0"

    # Location (if available)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    # Battery
    battery_level = Column(Integer, nullable=True)  # 0-100

    # Timestamp
    logged_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    patient = relationship("Patient", back_populates="activity_logs")

    def __repr__(self):
        return f"<ActivityLog {self.activity_type} for patient {self.patient_id} at {self.logged_at}>"
