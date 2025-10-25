"""
Pydantic schemas for schedule and reminder endpoints
"""

from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime, time
from typing import Optional, List
from uuid import UUID


# ===== SCHEDULE SCHEMAS =====

class ScheduleBase(BaseModel):
    """Base schema for schedule"""
    type: str = Field(..., pattern="^(medication|meal)$")
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    medication_name: Optional[str] = Field(None, max_length=200)
    dosage: Optional[str] = Field(None, max_length=100)
    scheduled_time: time
    recurrence_pattern: str = Field(default="daily", pattern="^(daily|weekly|custom)$")
    days_of_week: List[int] = Field(default_factory=lambda: [0, 1, 2, 3, 4, 5, 6])
    reminder_advance_minutes: int = Field(default=5, ge=0, le=60)


class ScheduleCreate(ScheduleBase):
    """Schema for creating a schedule"""
    pass


class ScheduleUpdate(BaseModel):
    """Schema for updating a schedule"""
    type: Optional[str] = Field(None, pattern="^(medication|meal)$")
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    medication_name: Optional[str] = Field(None, max_length=200)
    dosage: Optional[str] = Field(None, max_length=100)
    scheduled_time: Optional[time] = None
    recurrence_pattern: Optional[str] = Field(None, pattern="^(daily|weekly|custom)$")
    days_of_week: Optional[List[int]] = None
    reminder_advance_minutes: Optional[int] = Field(None, ge=0, le=60)
    is_active: Optional[bool] = None


class ScheduleResponse(ScheduleBase):
    """Schema for schedule response"""
    id: UUID
    patient_id: UUID
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)


# ===== REMINDER SCHEMAS =====

class ReminderBase(BaseModel):
    """Base schema for reminder"""
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    due_at: datetime


class ReminderCreate(ReminderBase):
    """Schema for creating a reminder"""
    schedule_id: Optional[UUID] = None


class ReminderUpdate(BaseModel):
    """Schema for updating a reminder"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    due_at: Optional[datetime] = None
    status: Optional[str] = Field(None, pattern="^(pending|sent|delivered|completed|missed|snoozed)$")


class ReminderResponse(ReminderBase):
    """Schema for reminder response"""
    id: UUID
    patient_id: UUID
    schedule_id: Optional[UUID]
    sent_at: Optional[datetime]
    delivered_at: Optional[datetime]
    completed_at: Optional[datetime]
    status: str
    patient_response: Optional[str]
    ai_analysis: Optional[str]
    completion_confirmed: bool
    retry_count: int
    max_retries: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ReminderStatusUpdate(BaseModel):
    """Schema for updating reminder status"""
    status: str = Field(..., pattern="^(pending|sent|delivered|completed|missed|snoozed)$")
    patient_response: Optional[str] = None
    completion_confirmed: Optional[bool] = None


class ReminderListResponse(BaseModel):
    """Schema for reminder list response"""
    id: UUID
    patient_id: UUID
    title: str
    due_at: datetime
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
