"""
Pydantic schemas for authentication endpoints
"""

from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator
from datetime import datetime
from typing import Optional, Dict, Any, Literal
from uuid import UUID


# Preference Schemas
class NotificationPreferences(BaseModel):
    """Notification channel preferences"""
    email: bool = True
    sms: bool = True
    push: bool = False


class QuietHours(BaseModel):
    """Quiet hours configuration"""
    enabled: bool = False
    start: str = Field(default="22:00", pattern=r"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$")
    end: str = Field(default="07:00", pattern=r"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$")


class CaregiverPreferences(BaseModel):
    """Complete caregiver preferences structure"""
    notifications: NotificationPreferences = Field(default_factory=NotificationPreferences)
    alert_threshold: Literal["low", "medium", "high", "critical"] = "medium"
    quiet_hours: QuietHours = Field(default_factory=QuietHours)
    daily_summary_time: str = Field(
        default="20:00",
        pattern=r"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$",
        description="Time for daily summary (HH:MM format)"
    )


class CaregiverPreferencesUpdate(BaseModel):
    """Partial update for caregiver preferences"""
    notifications: Optional[NotificationPreferences] = None
    alert_threshold: Optional[Literal["low", "medium", "high", "critical"]] = None
    quiet_hours: Optional[QuietHours] = None
    daily_summary_time: Optional[str] = Field(
        None,
        pattern=r"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
    )


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
    push_notifications_enabled: bool
    preferences: Dict[str, Any] = Field(default_factory=dict)
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
