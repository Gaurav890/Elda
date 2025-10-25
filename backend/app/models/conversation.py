"""
Conversation model - Voice interactions between patient and AI
"""

from sqlalchemy import Column, String, Text, DateTime, Boolean, ForeignKey, JSON, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.database.base import Base


class Conversation(Base):
    """
    Conversation model - Voice interactions

    Each conversation:
    - Is initiated by patient or scheduled reminder
    - Has patient's message (from STT)
    - Has AI's response (sent to TTS)
    - Includes context from Letta and Chroma
    - Stores sentiment analysis and health mentions
    """
    __tablename__ = "conversations"

    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Foreign Keys
    patient_id = Column(
        UUID(as_uuid=True),
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Conversation Type
    conversation_type = Column(String(20), default="spontaneous", nullable=False)
    # Options: "spontaneous", "reminder_response", "check_in", "emergency"

    # Messages
    patient_message = Column(Text, nullable=False)  # What patient said (from STT)
    ai_response = Column(Text, nullable=False)  # AI's response (sent to TTS)

    # AI Context Used
    letta_context = Column(JSON, default=dict)  # What Letta provided
    # Example: {"recent_patterns": ["complained about knee pain 3x this week"], "mood": "positive"}

    chroma_similar_conversations = Column(JSON, default=list)  # Similar past conversations from Chroma
    # Example: [{"id": "123", "text": "my knee hurts", "similarity": 0.89}]

    claude_analysis = Column(JSON, default=dict)  # Claude's full analysis
    # Example: {"sentiment": "concerned", "health_mentions": ["knee pain"], "urgency": "low"}

    # Sentiment & Health Analysis
    sentiment = Column(String(20), nullable=True)  # "positive", "neutral", "negative", "concerned", "distressed"
    health_mentions = Column(JSON, default=list)  # ["knee pain", "medication taken", "feeling tired"]
    urgency_level = Column(String(20), default="none", nullable=False)
    # Options: "none", "low", "medium", "high", "critical"

    # Response Quality
    response_time_seconds = Column(Float, nullable=True)  # How long it took to generate response
    conversation_continued = Column(Boolean, default=False, nullable=False)  # Did patient continue talking?

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    patient = relationship("Patient", back_populates="conversations")

    def __repr__(self):
        return f"<Conversation {self.id} with patient {self.patient_id} at {self.created_at}>"

    @property
    def has_health_concerns(self) -> bool:
        """Check if conversation mentions health concerns"""
        return bool(self.health_mentions) or self.urgency_level in ["high", "critical"]
