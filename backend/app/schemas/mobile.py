"""
Pydantic schemas for mobile app endpoints
"""

from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID


class QRCodeGenerateResponse(BaseModel):
    """Response schema for QR code generation"""
    qr_code_data: str = Field(..., description="JSON string to encode in QR code")
    setup_token: str = Field(..., description="One-time setup token")
    expires_in_minutes: int = Field(default=15, description="Token expiry time")
    patient_id: UUID = Field(..., description="Patient ID")

    model_config = {"from_attributes": True}


class MobileSetupRequest(BaseModel):
    """Request schema for mobile device setup"""
    patient_id: UUID = Field(..., description="Patient UUID from QR code")
    setup_token: str = Field(..., description="One-time setup token from QR code")


class MobileSetupResponse(BaseModel):
    """Response schema for mobile device setup"""
    success: bool = Field(..., description="Setup success status")
    patient_id: UUID = Field(..., description="Patient UUID")
    patient_name: str = Field(..., description="Patient full name")
    preferred_name: Optional[str] = Field(None, description="Patient preferred name")


class DeviceTokenRequest(BaseModel):
    """Request schema for registering device token"""
    patient_id: UUID = Field(..., description="Patient UUID")
    device_token: str = Field(..., description="Firebase FCM device token")
    platform: str = Field(..., description="Device platform (ios/android)")
    app_version: Optional[str] = Field(None, description="Mobile app version")


class DeviceTokenResponse(BaseModel):
    """Response schema for device token registration"""
    success: bool = Field(..., description="Registration success status")
    message: str = Field(default="Device token registered successfully")
