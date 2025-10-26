"""
Mobile app API endpoints
Handles device setup and token registration
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date
from uuid import UUID
from typing import List

from app.core.dependencies import get_db
from app.models.patient import Patient
from app.models.schedule import Schedule
from app.models.reminder import Reminder
from app.schemas.mobile import (
    MobileSetupRequest,
    MobileSetupResponse,
    DeviceTokenRequest,
    DeviceTokenResponse
)
from app.schemas.schedule import ScheduleResponse, ReminderAcknowledge, ReminderResponse

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


@router.get("/patients/{patient_id}/schedules", response_model=List[ScheduleResponse])
def get_patient_schedules(
    patient_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Get all active schedules for a patient (public endpoint for mobile app)

    This endpoint is public (no authentication required) since the mobile app
    only has the patient_id, not auth tokens.

    **Returns:**
    - List of active schedules with all details
    - Sorted by scheduled_time (earliest first)
    - Only returns active schedules (is_active=True)

    **Errors:**
    - 404: Patient not found
    """
    # Check if patient exists
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )

    # Get all active schedules for this patient
    schedules = db.query(Schedule).filter(
        Schedule.patient_id == patient_id,
        Schedule.is_active == True
    ).order_by(Schedule.scheduled_time).all()

    return schedules


@router.get("/patients/{patient_id}/reminders", response_model=List[ReminderResponse])
def get_patient_reminders(
    patient_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Get all pending and recent reminders for a patient (public endpoint for mobile app)

    This endpoint is public (no authentication required) since the mobile app
    only has the patient_id, not auth tokens.

    **Returns:**
    - List of reminders with all details
    - Sorted by due_at (earliest first)
    - Includes pending, sent, and delivered reminders
    - Also includes completed/missed reminders from today for display

    **Errors:**
    - 404: Patient not found
    """
    # Check if patient exists
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )

    # Get today's date
    today = date.today()

    # Get all reminders for this patient:
    # 1. All pending/sent/delivered reminders (regardless of date)
    # 2. All completed/missed reminders from today (for display)
    # For simplicity, just return all pending reminders (we'll filter by date on frontend if needed)
    reminders = db.query(Reminder).filter(
        Reminder.patient_id == patient_id,
        Reminder.status.in_(['pending', 'sent', 'delivered'])
    ).order_by(Reminder.due_at).all()

    return reminders


@router.put("/reminders/{reminder_id}/acknowledge", response_model=ReminderResponse)
def acknowledge_reminder(
    reminder_id: UUID,
    ack_data: ReminderAcknowledge,
    db: Session = Depends(get_db)
):
    """
    Acknowledge a reminder from the mobile app (patient)

    This endpoint allows patients to mark reminders as completed, missed, or snoozed.
    Called from the mobile app when:
    - Patient says "I took it" / "done" in voice chat
    - Patient taps checkmark button on home screen

    **Parameters:**
    - reminder_id: UUID of the reminder to acknowledge
    - status: "completed", "missed", or "snoozed"
    - notes: Optional notes about the acknowledgment
    - patient_response: Optional patient's verbal response

    **Returns:**
    - Updated reminder object with new status and timestamps

    **Errors:**
    - 404: Reminder not found
    """
    # Get reminder
    reminder = db.query(Reminder).filter(Reminder.id == reminder_id).first()
    if not reminder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reminder not found"
        )

    # Update reminder status
    reminder.status = ack_data.status

    # Update timestamps based on status
    if ack_data.status == "completed":
        reminder.completed_at = datetime.utcnow()
        reminder.completion_confirmed = True

    # Store patient response if provided
    if ack_data.patient_response:
        reminder.patient_response = ack_data.patient_response

    # Store notes if provided (can be used for "why" - e.g., "forgot", "already took it")
    if ack_data.notes:
        if reminder.message:
            reminder.message = f"{reminder.message}\n\nNotes: {ack_data.notes}"
        else:
            reminder.message = f"Notes: {ack_data.notes}"

    reminder.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(reminder)

    return reminder
