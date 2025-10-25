"""
Pydantic schemas for conversation, summary, alert, and insight endpoints
"""

from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime, date
from typing import Optional, List, Dict, Any
from uuid import UUID


# ===== CONVERSATION SCHEMAS =====

class ConversationBase(BaseModel):
    """Base schema for conversation"""
    patient_message: str = Field(..., min_length=1)
    ai_response: str = Field(..., min_length=1)
    conversation_type: str = Field(default="spontaneous", pattern="^(spontaneous|reminder_response|check_in|emergency)$")


class ConversationCreate(ConversationBase):
    """Schema for creating a conversation"""
    letta_context: Dict[str, Any] = Field(default_factory=dict)
    chroma_similar_conversations: List[Dict[str, Any]] = Field(default_factory=list)
    claude_analysis: Dict[str, Any] = Field(default_factory=dict)
    sentiment: Optional[str] = None
    health_mentions: List[str] = Field(default_factory=list)
    urgency_level: str = Field(default="none", pattern="^(none|low|medium|high|critical)$")
    response_time_seconds: Optional[float] = None


class ConversationResponse(ConversationBase):
    """Schema for conversation response"""
    id: UUID
    patient_id: UUID
    letta_context: Dict[str, Any]
    chroma_similar_conversations: List[Dict[str, Any]]
    claude_analysis: Dict[str, Any]
    sentiment: Optional[str]
    health_mentions: List[str]
    urgency_level: str
    response_time_seconds: Optional[float]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ConversationListResponse(BaseModel):
    """Schema for conversation list response"""
    id: UUID
    patient_id: UUID
    patient_message: str
    conversation_type: str
    sentiment: Optional[str]
    urgency_level: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ===== DAILY SUMMARY SCHEMAS =====

class DailySummaryBase(BaseModel):
    """Base schema for daily summary"""
    summary_date: date
    ai_generated_summary: str = Field(..., min_length=1)
    total_conversations: int = Field(default=0, ge=0)
    reminder_adherence_rate: float = Field(default=0.0, ge=0.0, le=100.0)
    medication_adherence_rate: float = Field(default=0.0, ge=0.0, le=100.0)
    meal_adherence_rate: float = Field(default=0.0, ge=0.0, le=100.0)


class DailySummaryCreate(DailySummaryBase):
    """Schema for creating a daily summary"""
    health_concerns: List[str] = Field(default_factory=list)
    positive_highlights: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)


class DailySummaryResponse(DailySummaryBase):
    """Schema for daily summary response"""
    id: UUID
    patient_id: UUID
    health_concerns: List[str]
    positive_highlights: List[str]
    recommendations: List[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ===== ALERT SCHEMAS =====

class AlertBase(BaseModel):
    """Base schema for alert"""
    alert_type: str = Field(..., pattern="^(health_concern|missed_medication|unusual_pattern|emergency|inactivity)$")
    severity: str = Field(..., pattern="^(low|medium|high|critical)$")
    title: str = Field(..., min_length=1, max_length=200)
    message: str = Field(..., min_length=1)


class AlertCreate(AlertBase):
    """Schema for creating an alert"""
    related_conversation_id: Optional[UUID] = None
    ai_recommendation: Optional[str] = None


class AlertResponse(AlertBase):
    """Schema for alert response"""
    id: UUID
    patient_id: UUID
    related_conversation_id: Optional[UUID]
    ai_recommendation: Optional[str]
    is_resolved: bool
    acknowledged_by_caregiver_id: Optional[UUID]
    acknowledged_at: Optional[datetime]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AlertAcknowledge(BaseModel):
    """Schema for acknowledging an alert"""
    is_resolved: bool = True


# ===== INSIGHT SCHEMAS =====

class InsightBase(BaseModel):
    """Base schema for patient insight"""
    insight_type: str = Field(..., pattern="^(behavioral_pattern|health_trend|recommendation|concern)$")
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1)


class InsightCreate(InsightBase):
    """Schema for creating an insight"""
    letta_analysis: Dict[str, Any] = Field(default_factory=dict)
    confidence_score: float = Field(default=0.0, ge=0.0, le=1.0)


class InsightResponse(InsightBase):
    """Schema for insight response"""
    id: UUID
    patient_id: UUID
    letta_analysis: Dict[str, Any]
    confidence_score: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
