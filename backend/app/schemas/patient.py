"""
Pydantic schemas for patient endpoints
"""

from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime, date
from typing import Optional, List, Dict, Any
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


class PatientResponse(PatientBase):
    """Schema for patient response"""
    id: UUID
    medical_conditions: List[str]
    medications: List[str]
    allergies: List[str]
    dietary_restrictions: List[str]
    personal_context: Dict[str, Any]
    letta_agent_id: Optional[str]
    device_token: Optional[str]
    last_active_at: Optional[datetime]
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
