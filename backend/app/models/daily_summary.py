"""
DailySummary model - Daily summaries generated at midnight
"""

from sqlalchemy import Column, String, Text, Date, DateTime, Integer, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.database.base import Base


class DailySummary(Base):
    """
    DailySummary model - Generated at midnight each day

    Each summary includes:
    - Medication adherence stats
    - Conversation highlights
    - Health concerns
    - Activity patterns
    - AI-generated narrative summary (Claude)
    """
    __tablename__ = "daily_summaries"

    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Foreign Keys
    patient_id = Column(
        UUID(as_uuid=True),
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Summary Date
    summary_date = Column(Date, nullable=False, unique=False, index=True)  # Which day this summary is for

    # Statistics
    total_reminders = Column(Integer, default=0, nullable=False)
    completed_reminders = Column(Integer, default=0, nullable=False)
    missed_reminders = Column(Integer, default=0, nullable=False)
    adherence_rate = Column(Integer, default=0, nullable=False)  # Percentage (0-100)

    total_conversations = Column(Integer, default=0, nullable=False)
    spontaneous_conversations = Column(Integer, default=0, nullable=False)

    # Activity
    active_hours = Column(JSON, default=list)  # [8, 9, 10, 14, 15, 20] - hours when patient was active

    # Health Mentions
    health_concerns = Column(JSON, default=list)
    # Example: [{"concern": "knee pain", "mentions": 3, "severity": "moderate"}]

    # Sentiment Analysis
    overall_sentiment = Column(String(20), nullable=True)  # "positive", "neutral", "negative"
    mood_trend = Column(String(20), nullable=True)  # "improving", "stable", "declining"

    # AI-Generated Narrative (Claude)
    summary_narrative = Column(Text, nullable=False)
    # Example: "John had a good day with 90% medication adherence. He mentioned knee pain twice but
    # overall mood was positive. He was most active in the morning and evening."

    # Letta Insights
    letta_insights = Column(JSON, default=dict)
    # Example: {"patterns": ["prefers evening conversations"], "concerns": ["knee pain recurring"]}

    # Highlights
    highlights = Column(JSON, default=list)
    # Example: ["Took all medications on time", "Reported improved sleep", "Mentioned knee pain"]

    # Timestamps
    generated_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    patient = relationship("Patient", back_populates="daily_summaries")

    def __repr__(self):
        return f"<DailySummary for patient {self.patient_id} on {self.summary_date}>"
