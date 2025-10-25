"""
Activity Log Pydantic schemas
"""

from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID
from typing import Optional, Dict, Any, List
from enum import Enum


class ActivityType(str, Enum):
    """Activity type enum"""
    heartbeat = "heartbeat"
    conversation = "conversation"
    reminder_response = "reminder_response"
    emergency = "emergency"
    app_open = "app_open"
    app_close = "app_close"
    location_update = "location_update"
    battery_update = "battery_update"


class ActivityLogResponse(BaseModel):
    """Response schema for activity log"""
    id: UUID
    patient_id: UUID
    activity_type: str
    details: Dict[str, Any] = Field(default_factory=dict)
    device_type: Optional[str] = None
    app_version: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    battery_level: Optional[int] = None
    logged_at: datetime

    class Config:
        from_attributes = True


class ActivityLogListResponse(BaseModel):
    """Response schema for activity log list"""
    activities: List[ActivityLogResponse]
    total: int
    limit: int
    offset: int
