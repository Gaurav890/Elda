"""
Pydantic schemas for authentication endpoints
"""

from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import datetime
from typing import Optional
from uuid import UUID


class CaregiverBase(BaseModel):
    """Base schema for caregiver"""
    email: EmailStr
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    phone_number: Optional[str] = Field(None, max_length=20)
    role: str = Field(default="family", max_length=50)


class CaregiverCreate(CaregiverBase):
    """Schema for caregiver registration"""
    password: str = Field(..., min_length=8, max_length=100)


class CaregiverLogin(BaseModel):
    """Schema for caregiver login"""
    email: EmailStr
    password: str


class CaregiverUpdate(BaseModel):
    """Schema for updating caregiver profile"""
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone_number: Optional[str] = Field(None, max_length=20)
    role: Optional[str] = Field(None, max_length=50)
    sms_notifications_enabled: Optional[bool] = None
    email_notifications_enabled: Optional[bool] = None


class CaregiverResponse(CaregiverBase):
    """Schema for caregiver response"""
    id: UUID
    role: str
    sms_notifications_enabled: bool
    email_notifications_enabled: bool
    is_active: bool
    created_at: datetime
    last_login_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    """Schema for token response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds


class TokenRefresh(BaseModel):
    """Schema for token refresh request"""
    refresh_token: str


class PasswordChange(BaseModel):
    """Schema for password change"""
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=100)
