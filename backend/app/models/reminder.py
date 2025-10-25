"""
Reminder model - Individual reminder instances generated from schedules
"""

from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Text, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.database.base import Base


class Reminder(Base):
    """
    Reminder model - Individual reminder instances

    Each reminder:
    - Is generated from a schedule
    - Has a specific due time
    - Tracks delivery status (sent, delivered, completed, missed)
    - Stores patient's response
    - Can be retried if missed
    """
    __tablename__ = "reminders"

    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Foreign Keys
    patient_id = Column(
        UUID(as_uuid=True),
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    schedule_id = Column(
        UUID(as_uuid=True),
        ForeignKey("schedules.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )

    # Reminder Details
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=True)  # Custom message for this reminder

    # Timing
    due_at = Column(DateTime, nullable=False, index=True)  # When reminder should be sent
    sent_at = Column(DateTime, nullable=True)  # When reminder was actually sent
    delivered_at = Column(DateTime, nullable=True)  # When push notification was delivered
    completed_at = Column(DateTime, nullable=True)  # When patient acknowledged
    snoozed_until = Column(DateTime, nullable=True)  # If snoozed, when to retry

    # Status
    status = Column(String(20), default="pending", nullable=False)
    # Options: "pending", "sent", "delivered", "completed", "missed", "snoozed"

    delivery_method = Column(String(20), default="push", nullable=False)
    # Options: "push", "voice", "sms"

    # Patient Response
    patient_response = Column(Text, nullable=True)  # What patient said
    ai_analysis = Column(Text, nullable=True)  # Claude's analysis of response

    completion_confirmed = Column(Boolean, default=False, nullable=False)
    # Did they actually take medication/eat meal?

    # Retry tracking
    retry_count = Column(Integer, default=0, nullable=False)
    max_retries = Column(Integer, default=3, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    patient = relationship("Patient", back_populates="reminders")
    schedule = relationship("Schedule", back_populates="reminders")

    def __repr__(self):
        return f"<Reminder {self.title} due at {self.due_at} status={self.status}>"

    @property
    def is_overdue(self) -> bool:
        """Check if reminder is overdue"""
        if self.status in ["completed", "snoozed"]:
            return False
        return datetime.utcnow() > self.due_at

    @property
    def can_retry(self) -> bool:
        """Check if reminder can be retried"""
        return self.retry_count < self.max_retries and self.status != "completed"
