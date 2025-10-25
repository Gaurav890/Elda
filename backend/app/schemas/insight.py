"""
Patient Insight Pydantic schemas
"""

from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID
from typing import Optional, List, Dict, Any
from enum import Enum


class InsightType(str, Enum):
    """Insight type enum"""
    pattern = "pattern"
    preference = "preference"
    health_trend = "health_trend"
    behavior = "behavior"
    communication = "communication"
    recommendation = "recommendation"


class InsightCategory(str, Enum):
    """Insight category enum"""
    medication = "medication"
    mood = "mood"
    activity = "activity"
    communication = "communication"
    health = "health"
    general = "general"


class PatientInsightResponse(BaseModel):
    """Response schema for patient insight"""
    id: UUID
    patient_id: UUID
    insight_type: str
    category: str
    title: str
    description: str
    confidence_score: Optional[float] = None
    evidence_count: Optional[int] = None
    supporting_data: List[Dict[str, Any]] = Field(default_factory=list)
    is_actionable: bool = False
    suggested_action: Optional[str] = None
    generated_by: str = "letta"
    letta_query_used: Optional[str] = None
    is_active: bool = True
    relevance_end_date: Optional[datetime] = None
    first_observed_at: Optional[datetime] = None
    generated_at: datetime

    class Config:
        from_attributes = True


class PatientInsightListResponse(BaseModel):
    """Response schema for patient insight list"""
    insights: List[PatientInsightResponse]
    total: int
    limit: int
    offset: int
