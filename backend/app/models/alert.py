"""
Alert model - Critical notifications for caregivers
"""

from sqlalchemy import Column, String, Text, DateTime, Boolean, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.database.base import Base


class Alert(Base):
    """
    Alert model - Critical notifications

    Generated when:
    - Patient misses multiple reminders
    - Patient is inactive for extended period
    - Patient reports concerning health symptoms
    - Emergency button pressed
    - AI detects urgency in conversation
    """
    __tablename__ = "alerts"

    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Foreign Keys
    patient_id = Column(
        UUID(as_uuid=True),
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    acknowledged_by = Column(
        UUID(as_uuid=True),
        ForeignKey("caregivers.id", ondelete="SET NULL"),
        nullable=True
    )

    # Alert Type
    alert_type = Column(String(50), nullable=False)
    # Options: "missed_medications", "inactivity", "health_concern", "emergency", "unusual_pattern"

    # Severity
    severity = Column(String(20), nullable=False)
    # Options: "low", "medium", "high", "critical"

    # Details
    title = Column(String(200), nullable=False)  # "3 missed medications today"
    description = Column(Text, nullable=False)  # Detailed description
    recommended_action = Column(Text, nullable=True)  # What caregiver should do

    # Trigger
    triggered_by = Column(String(50), nullable=True)  # "reminder_missed", "emergency_button", "ai_analysis"

    # Status
    status = Column(String(20), default="active", nullable=False)
    # Options: "active", "acknowledged", "resolved", "escalated"

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    acknowledged_at = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)

    # Notification Tracking
    sms_sent = Column(Boolean, default=False, nullable=False)
    email_sent = Column(Boolean, default=False, nullable=False)
    push_sent = Column(Boolean, default=False, nullable=False)
    phone_call_made = Column(Boolean, default=False, nullable=False)

    # Escalation
    escalation_level = Column(Integer, default=1, nullable=False)  # 1, 2, 3 (how many times escalated)

    # Relationships
    patient = relationship("Patient", back_populates="alerts")
    acknowledged_by_caregiver = relationship("Caregiver", back_populates="acknowledged_alerts")

    def __repr__(self):
        return f"<Alert {self.alert_type} severity={self.severity} for patient {self.patient_id}>"

    @property
    def is_critical(self) -> bool:
        """Check if alert is critical"""
        return self.severity == "critical"

    @property
    def is_resolved(self) -> bool:
        """Check if alert is resolved"""
        return self.status in ["resolved", "acknowledged"]
