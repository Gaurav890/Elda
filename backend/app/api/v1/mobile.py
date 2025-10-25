"""
Mobile app API endpoints
Handles device setup and token registration
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from uuid import UUID

from app.core.dependencies import get_db
from app.models.patient import Patient
from app.schemas.mobile import (
    MobileSetupRequest,
    MobileSetupResponse,
    DeviceTokenRequest,
    DeviceTokenResponse
)

router = APIRouter()


@router.post("/setup", response_model=MobileSetupResponse)
def setup_mobile_device(
    setup_data: MobileSetupRequest,
    db: Session = Depends(get_db)
):
    """
    Verify setup token and activate mobile device

    Called by mobile app after scanning QR code.
    Validates the setup token and marks device as setup.

    **Workflow:**
    1. Mobile app scans QR code
    2. Extracts patient_id and setup_token
    3. Calls this endpoint to verify
    4. Backend validates token
    5. Mobile app stores patient_id locally
    6. Mobile app registers FCM token (separate call)

    **Validation:**
    - Patient must exist
    - Token must match
    - Token must not be expired
    - Token must not have been used

    **Returns:**
    - Success status
    - Patient details (name, preferred name)

    **Errors:**
    - 404: Patient not found
    - 401: Invalid or expired token
    - 400: Setup already completed
    """
    # Check if patient exists
    patient = db.query(Patient).filter(Patient.id == setup_data.patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )

    # Verify token exists
    if not patient.setup_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No setup token found. Please generate a new QR code."
        )

    # Verify token matches
    if patient.setup_token != setup_data.setup_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid setup token"
        )

    # Verify token not expired
    if patient.setup_token_expires < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Setup token has expired. Please generate a new QR code."
        )

    # Verify not already setup (optional - allow re-setup)
    # if patient.device_setup_completed:
    #     raise HTTPException(
    #         status_code=status.HTTP_400_BAD_REQUEST,
    #         detail="Device already setup for this patient"
    #     )

    # Mark as setup complete
    patient.device_setup_completed = True
    patient.setup_token = None  # Invalidate token (one-time use)
    patient.setup_token_expires = None

    db.commit()

    return MobileSetupResponse(
        success=True,
        patient_id=patient.id,
        patient_name=patient.full_name,
        preferred_name=patient.preferred_name
    )


@router.post("/device-token", response_model=DeviceTokenResponse)
def register_device_token(
    token_data: DeviceTokenRequest,
    db: Session = Depends(get_db)
):
    """
    Register Firebase device token for push notifications

    Called by mobile app after successful setup or when FCM token refreshes.
    Stores the device token for sending push notifications.

    **Workflow:**
    1. Mobile app completes setup
    2. Mobile app gets FCM token from Firebase
    3. Calls this endpoint to register token
    4. Backend stores token
    5. Backend can now send push notifications

    **Token Refresh:**
    Firebase tokens can refresh periodically. The mobile app should
    call this endpoint whenever the token changes.

    **Returns:**
    - Success status
    - Confirmation message

    **Errors:**
    - 404: Patient not found
    - 400: Patient not setup yet
    """
    # Check if patient exists
    patient = db.query(Patient).filter(Patient.id == token_data.patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )

    # Verify device is setup
    if not patient.device_setup_completed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Device not setup yet. Please complete setup first."
        )

    # Update device token and platform
    patient.device_token = token_data.device_token
    patient.device_platform = token_data.platform.lower()

    # Update app version if provided
    if token_data.app_version:
        patient.app_version = token_data.app_version

    db.commit()

    return DeviceTokenResponse(
        success=True,
        message="Device token registered successfully"
    )
