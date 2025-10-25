"""
SystemLog model - System-level logging and audit trail
"""

from sqlalchemy import Column, String, Text, DateTime, JSON, Integer
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from app.database.base import Base


class SystemLog(Base):
    """
    SystemLog model - System events and audit trail

    Logs:
    - API calls and errors
    - Background job executions
    - AI service calls (Claude, Letta, Chroma)
    - External service calls (Twilio, Firebase)
    - Performance metrics
    - Security events
    """
    __tablename__ = "system_logs"

    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Log Level
    level = Column(String(20), nullable=False)
    # Options: "DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"

    # Log Category
    category = Column(String(50), nullable=False)
    # Options: "api", "scheduler", "ai_service", "external_service", "database", "security", "performance"

    # Service/Component
    service = Column(String(50), nullable=True)  # "claude", "letta", "chroma", "twilio", "firebase"
    component = Column(String(100), nullable=True)  # "conversation_service", "reminder_scheduler", etc.

    # Event
    event_type = Column(String(100), nullable=False)  # "api_call", "job_executed", "error_occurred"
    message = Column(Text, nullable=False)  # Detailed log message

    # Additional Context
    details = Column(JSON, default=dict)
    # Example: {"endpoint": "/api/v1/conversations", "status_code": 200, "duration_ms": 45}
    # Example: {"error": "Connection timeout", "retry_count": 3}

    # Performance Metrics
    duration_ms = Column(Integer, nullable=True)  # How long operation took
    response_time_ms = Column(Integer, nullable=True)  # For API calls

    # User Context (if applicable)
    user_id = Column(UUID(as_uuid=True), nullable=True)  # Caregiver or patient ID
    user_type = Column(String(20), nullable=True)  # "caregiver" or "patient"

    # Request Context (if applicable)
    request_id = Column(String(100), nullable=True)  # For tracing requests
    ip_address = Column(String(45), nullable=True)  # IPv4 or IPv6

    # Timestamp
    logged_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    def __repr__(self):
        return f"<SystemLog {self.level} {self.category}: {self.message[:50]}>"
