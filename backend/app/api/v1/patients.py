"""
Patient API endpoints
Handles patient CRUD operations and caregiver relationships
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from uuid import UUID

from app.core.dependencies import get_current_user, get_db
from app.models.caregiver import Caregiver
from app.models.patient import Patient
from app.models.relationship import PatientCaregiverRelationship
from app.models.activity_log import ActivityLog
from app.schemas.patient import (
    PatientCreate,
    PatientUpdate,
    PatientResponse,
    PatientListResponse,
    PatientWithRelationship,
    HeartbeatCreate,
    ActivityLogResponse,
    ActivityLogListResponse
)

router = APIRouter()


@router.post("", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
def create_patient(
    patient_data: PatientCreate,
    current_user: Caregiver = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new patient and associate with current caregiver

    - Creates patient record
    - Establishes caregiver relationship
    - Returns complete patient details
    """
    # Create new patient
    new_patient = Patient(
        first_name=patient_data.first_name,
        last_name=patient_data.last_name,
        preferred_name=patient_data.preferred_name,
        date_of_birth=patient_data.date_of_birth,
        gender=patient_data.gender,
        phone_number=patient_data.phone_number,
        address=patient_data.address,
        emergency_contact_name=patient_data.emergency_contact_name,
        emergency_contact_phone=patient_data.emergency_contact_phone,
        medical_conditions=patient_data.medical_conditions,
        medications=patient_data.medications,
        allergies=patient_data.allergies,
        dietary_restrictions=patient_data.dietary_restrictions,
        personal_context=patient_data.personal_context
    )

    db.add(new_patient)
    db.flush()  # Get patient ID without committing

    # Create relationship with current caregiver
    relationship = PatientCaregiverRelationship(
        patient_id=new_patient.id,
        caregiver_id=current_user.id,
        relationship_type="primary"
    )
    db.add(relationship)

    db.commit()
    db.refresh(new_patient)

    return new_patient


@router.get("", response_model=List[PatientListResponse])
def list_patients(
    current_user: Caregiver = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all patients associated with current caregiver

    Returns simplified patient list
    """
    # Get all patients through relationships
    patients = db.query(Patient).join(
        PatientCaregiverRelationship,
        Patient.id == PatientCaregiverRelationship.patient_id
    ).filter(
        PatientCaregiverRelationship.caregiver_id == current_user.id
    ).order_by(
        Patient.last_name,
        Patient.first_name
    ).all()

    return patients


@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(
    patient_id: UUID,
    current_user: Caregiver = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed information about a specific patient

    - Verifies caregiver has access to this patient
    - Returns complete patient details
    """
    # Check if patient exists
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )

    # Check if caregiver has access
    relationship = db.query(PatientCaregiverRelationship).filter(
        PatientCaregiverRelationship.patient_id == patient_id,
        PatientCaregiverRelationship.caregiver_id == current_user.id
    ).first()

    if not relationship:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this patient"
        )

    return patient


@router.patch("/{patient_id}", response_model=PatientResponse)
def update_patient(
    patient_id: UUID,
    update_data: PatientUpdate,
    current_user: Caregiver = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update patient information

    - Verifies caregiver has access to this patient
    - Updates only provided fields
    - Returns updated patient details
    """
    # Check if patient exists and caregiver has access
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )

    relationship = db.query(PatientCaregiverRelationship).filter(
        PatientCaregiverRelationship.patient_id == patient_id,
        PatientCaregiverRelationship.caregiver_id == current_user.id
    ).first()

    if not relationship:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this patient"
        )

    # Update only provided fields
    update_dict = update_data.model_dump(exclude_unset=True)

    for field, value in update_dict.items():
        setattr(patient, field, value)

    patient.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(patient)

    return patient


@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_patient(
    patient_id: UUID,
    current_user: Caregiver = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a patient

    - Verifies caregiver has access
    - Only primary caregiver can delete
    - Cascade deletes all related records (schedules, conversations, etc.)
    """
    # Check if patient exists
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )

    # Check if caregiver has access and is primary
    relationship = db.query(PatientCaregiverRelationship).filter(
        PatientCaregiverRelationship.patient_id == patient_id,
        PatientCaregiverRelationship.caregiver_id == current_user.id
    ).first()

    if not relationship:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this patient"
        )

    if relationship.relationship_type != "primary":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only primary caregiver can delete patient"
        )

    # Delete patient (cascade will handle related records)
    db.delete(patient)
    db.commit()

    return None


@router.post("/{patient_id}/caregivers/{caregiver_id}", status_code=status.HTTP_201_CREATED)
def add_caregiver_to_patient(
    patient_id: UUID,
    caregiver_id: UUID,
    current_user: Caregiver = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add another caregiver to a patient

    - Only primary caregiver can add other caregivers
    - Creates secondary caregiver relationship
    """
    # Check if patient exists and current user has primary access
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )

    current_relationship = db.query(PatientCaregiverRelationship).filter(
        PatientCaregiverRelationship.patient_id == patient_id,
        PatientCaregiverRelationship.caregiver_id == current_user.id
    ).first()

    if not current_relationship or current_relationship.relationship_type != "primary":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only primary caregiver can add other caregivers"
        )

    # Check if target caregiver exists
    target_caregiver = db.query(Caregiver).filter(Caregiver.id == caregiver_id).first()
    if not target_caregiver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Caregiver not found"
        )

    # Check if relationship already exists
    existing_relationship = db.query(PatientCaregiverRelationship).filter(
        PatientCaregiverRelationship.patient_id == patient_id,
        PatientCaregiverRelationship.caregiver_id == caregiver_id
    ).first()

    if existing_relationship:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Caregiver already associated with this patient"
        )

    # Create new relationship
    new_relationship = PatientCaregiverRelationship(
        patient_id=patient_id,
        caregiver_id=caregiver_id,
        relationship_type="secondary"
    )
    db.add(new_relationship)
    db.commit()

    return {"message": "Caregiver added successfully"}


@router.delete("/{patient_id}/caregivers/{caregiver_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_caregiver_from_patient(
    patient_id: UUID,
    caregiver_id: UUID,
    current_user: Caregiver = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Remove a caregiver from a patient

    - Only primary caregiver can remove other caregivers
    - Cannot remove primary caregiver
    """
    # Check if current user has primary access
    current_relationship = db.query(PatientCaregiverRelationship).filter(
        PatientCaregiverRelationship.patient_id == patient_id,
        PatientCaregiverRelationship.caregiver_id == current_user.id
    ).first()

    if not current_relationship or current_relationship.relationship_type != "primary":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only primary caregiver can remove other caregivers"
        )

    # Check if target relationship exists
    target_relationship = db.query(PatientCaregiverRelationship).filter(
        PatientCaregiverRelationship.patient_id == patient_id,
        PatientCaregiverRelationship.caregiver_id == caregiver_id
    ).first()

    if not target_relationship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Caregiver relationship not found"
        )

    # Cannot remove primary caregiver
    if target_relationship.relationship_type == "primary":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot remove primary caregiver"
        )

    # Delete relationship
    db.delete(target_relationship)
    db.commit()

    return None


# Activity Monitoring Endpoints

@router.post("/{patient_id}/heartbeat", response_model=ActivityLogResponse, status_code=status.HTTP_201_CREATED)
def record_patient_activity(
    patient_id: UUID,
    activity_data: HeartbeatCreate,
    db: Session = Depends(get_db)
):
    """
    Record patient activity (heartbeat, app events, location updates)

    This endpoint is called by the mobile app to track patient activity:
    - **Heartbeat**: Regular check-in (every 15 minutes)
    - **App events**: app_open, app_close
    - **Location updates**: GPS coordinates
    - **Battery updates**: Device battery level
    - **Conversations**: Logged automatically during voice interactions
    - **Reminder responses**: Logged when patient responds to reminders
    - **Emergency**: Emergency button press

    **Authentication**: This endpoint is public (called from patient mobile app)
    but requires valid patient_id

    **Example request:**
    ```json
    {
      "activity_type": "heartbeat",
      "device_type": "iOS",
      "app_version": "1.0.0",
      "latitude": 37.7749,
      "longitude": -122.4194,
      "battery_level": 85,
      "details": {
        "screen": "home",
        "last_interaction": "2025-10-24T10:30:00Z"
      }
    }
    ```
    """
    # Check if patient exists
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )

    # Create activity log
    activity_log = ActivityLog(
        patient_id=patient_id,
        activity_type=activity_data.activity_type,
        details=activity_data.details,
        device_type=activity_data.device_type,
        app_version=activity_data.app_version,
        latitude=activity_data.latitude,
        longitude=activity_data.longitude,
        battery_level=activity_data.battery_level
    )

    db.add(activity_log)

    # Update patient's last_active_at timestamp
    patient.last_active_at = datetime.utcnow()

    db.commit()
    db.refresh(activity_log)

    return activity_log


@router.get("/{patient_id}/activity", response_model=ActivityLogListResponse)
def get_patient_activity(
    patient_id: UUID,
    limit: int = 100,
    offset: int = 0,
    activity_type: str = None,
    current_user: Caregiver = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get patient activity history

    Returns paginated list of activity logs for a patient.

    **Query Parameters:**
    - **limit**: Maximum number of records to return (default: 100, max: 500)
    - **offset**: Number of records to skip (default: 0)
    - **activity_type**: Filter by activity type (heartbeat, conversation, etc.)

    **Filters by Activity Type:**
    - `heartbeat` - Regular check-ins
    - `conversation` - Voice interactions
    - `reminder_response` - Reminder completions
    - `emergency` - Emergency button presses
    - `app_open` / `app_close` - App lifecycle events
    - `location_update` - GPS updates
    - `battery_update` - Battery level changes

    **Example:**
    ```
    GET /api/v1/patients/{id}/activity?limit=50&activity_type=heartbeat
    ```

    **Response includes:**
    - Total count of matching records
    - Paginated list of activity logs
    - Patient ID for reference
    """
    # Check if patient exists
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )

    # Check if caregiver has access
    relationship = db.query(PatientCaregiverRelationship).filter(
        PatientCaregiverRelationship.patient_id == patient_id,
        PatientCaregiverRelationship.caregiver_id == current_user.id
    ).first()

    if not relationship:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this patient"
        )

    # Validate and cap limit
    if limit > 500:
        limit = 500

    # Build query
    query = db.query(ActivityLog).filter(ActivityLog.patient_id == patient_id)

    # Apply activity_type filter if provided
    if activity_type:
        query = query.filter(ActivityLog.activity_type == activity_type)

    # Get total count
    total = query.count()

    # Get paginated results (ordered by most recent first)
    activities = query.order_by(
        ActivityLog.logged_at.desc()
    ).limit(limit).offset(offset).all()

    return ActivityLogListResponse(
        total=total,
        activities=activities,
        patient_id=patient_id
    )
