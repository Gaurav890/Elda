"""
Pydantic schemas for patient endpoints
"""

from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime, date
from typing import Optional, List, Dict, Any, Literal
from uuid import UUID


class PatientBase(BaseModel):
    """Base schema for patient"""
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    preferred_name: Optional[str] = Field(None, max_length=100)
    date_of_birth: date
    gender: Optional[str] = Field(None, max_length=20)
    phone_number: Optional[str] = Field(None, max_length=20)
    address: Optional[str] = None
    emergency_contact_name: Optional[str] = Field(None, max_length=100)
    emergency_contact_phone: Optional[str] = Field(None, max_length=20)


class PatientCreate(PatientBase):
    """Schema for creating a patient"""
    medical_conditions: List[str] = Field(default_factory=list)
    medications: List[str] = Field(default_factory=list)
    allergies: List[str] = Field(default_factory=list)
    dietary_restrictions: List[str] = Field(default_factory=list)
    personal_context: Dict[str, Any] = Field(default_factory=dict)


class PatientUpdate(BaseModel):
    """Schema for updating a patient"""
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    preferred_name: Optional[str] = Field(None, max_length=100)
    date_of_birth: Optional[date] = None
    gender: Optional[str] = Field(None, max_length=20)
    phone_number: Optional[str] = Field(None, max_length=20)
    address: Optional[str] = None
    emergency_contact_name: Optional[str] = Field(None, max_length=100)
    emergency_contact_phone: Optional[str] = Field(None, max_length=20)
    medical_conditions: Optional[List[str]] = None
    medications: Optional[List[str]] = None
    allergies: Optional[List[str]] = None
    dietary_restrictions: Optional[List[str]] = None
    personal_context: Optional[Dict[str, Any]] = None
    # Phase 2: Personalization fields
    profile_photo_url: Optional[str] = Field(None, max_length=500)
    timezone: Optional[str] = Field(None, max_length=50)
    preferred_voice: Optional[Literal["male", "female", "neutral"]] = None
    communication_style: Optional[Literal["friendly", "formal", "casual"]] = None
    language: Optional[str] = Field(None, max_length=10, description="ISO 639-1 language code")
    app_version: Optional[str] = Field(None, max_length=20)


class PatientResponse(PatientBase):
    """Schema for patient response"""
    id: UUID
    medical_conditions: List[str]
    medications: List[str]
    allergies: List[str]
    dietary_restrictions: List[str]
    personal_context: Dict[str, Any]
    # Phase 2: Personalization fields
    profile_photo_url: Optional[str]
    timezone: str
    preferred_voice: str
    communication_style: str
    language: str
    # Mobile app fields
    letta_agent_id: Optional[str]
    device_token: Optional[str]
    app_version: Optional[str]
    last_active_at: Optional[datetime]
    last_heartbeat_at: Optional[datetime]
    # Status
    is_active: bool
    # Timestamps
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)


class PatientListResponse(BaseModel):
    """Schema for patient list response"""
    id: UUID
    first_name: str
    last_name: str
    preferred_name: Optional[str]
    date_of_birth: date
    phone_number: Optional[str]
    last_active_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)


class PatientWithRelationship(PatientResponse):
    """Schema for patient response with relationship info"""
    relationship_type: Optional[str] = None
    relationship_created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# Activity Monitoring Schemas

class HeartbeatCreate(BaseModel):
    """Schema for creating a heartbeat activity log"""
    activity_type: Literal[
        "heartbeat",
        "conversation",
        "reminder_response",
        "emergency",
        "app_open",
        "app_close",
        "location_update",
        "battery_update"
    ] = "heartbeat"
    details: Optional[Dict[str, Any]] = Field(default_factory=dict)
    device_type: Optional[str] = Field(None, max_length=20, description="iOS or Android")
    app_version: Optional[str] = Field(None, max_length=20, description="App version (e.g., 1.0.0)")
    latitude: Optional[float] = Field(None, ge=-90, le=90, description="Latitude coordinate")
    longitude: Optional[float] = Field(None, ge=-180, le=180, description="Longitude coordinate")
    battery_level: Optional[int] = Field(None, ge=0, le=100, description="Battery level (0-100)")


class ActivityLogResponse(BaseModel):
    """Schema for activity log response"""
    id: UUID
    patient_id: UUID
    activity_type: str
    details: Dict[str, Any]
    device_type: Optional[str]
    app_version: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    battery_level: Optional[int]
    logged_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ActivityLogListResponse(BaseModel):
    """Schema for paginated activity log list"""
    total: int
    activities: List[ActivityLogResponse]
    patient_id: UUID
