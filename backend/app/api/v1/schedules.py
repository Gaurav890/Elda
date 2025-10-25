"""
Schedule and Reminder API endpoints
Handles medication/meal schedules and reminder instances
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date
from uuid import UUID

from app.core.dependencies import get_current_user, get_db
from app.models.caregiver import Caregiver
from app.models.patient import Patient
from app.models.schedule import Schedule
from app.models.reminder import Reminder
from app.models.relationship import PatientCaregiverRelationship
from app.schemas.schedule import (
    ScheduleCreate,
    ScheduleUpdate,
    ScheduleResponse,
    ReminderCreate,
    ReminderUpdate,
    ReminderResponse,
    ReminderStatusUpdate,
    ReminderListResponse
)

router = APIRouter()


# ===== SCHEDULE ENDPOINTS =====

@router.post("/patients/{patient_id}/schedules", response_model=ScheduleResponse, status_code=status.HTTP_201_CREATED)
def create_schedule(
    patient_id: UUID,
    schedule_data: ScheduleCreate,
    current_user: Caregiver = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new medication or meal schedule for a patient

    - Verifies caregiver has access to patient
    - Creates recurring schedule
    - Returns created schedule
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

    # Create schedule
    new_schedule = Schedule(
        patient_id=patient_id,
        type=schedule_data.type,
        title=schedule_data.title,
        description=schedule_data.description,
        medication_name=schedule_data.medication_name,
        dosage=schedule_data.dosage,
        scheduled_time=schedule_data.scheduled_time,
        recurrence_pattern=schedule_data.recurrence_pattern,
        days_of_week=schedule_data.days_of_week,
        reminder_advance_minutes=schedule_data.reminder_advance_minutes
    )

    db.add(new_schedule)
    db.commit()
    db.refresh(new_schedule)

    return new_schedule


@router.get("/patients/{patient_id}/schedules", response_model=List[ScheduleResponse])
def list_schedules(
    patient_id: UUID,
    schedule_type: Optional[str] = Query(None, pattern="^(medication|meal)$"),
    is_active: Optional[bool] = Query(None),
    current_user: Caregiver = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all schedules for a patient

    - Optionally filter by type (medication or meal)
    - Optionally filter by active status
    """
    # Check access
    relationship = db.query(PatientCaregiverRelationship).filter(
        PatientCaregiverRelationship.patient_id == patient_id,
        PatientCaregiverRelationship.caregiver_id == current_user.id
    ).first()

    if not relationship:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this patient"
        )

    # Build query
    query = db.query(Schedule).filter(Schedule.patient_id == patient_id)

    if schedule_type:
        query = query.filter(Schedule.type == schedule_type)

    if is_active is not None:
        query = query.filter(Schedule.is_active == is_active)

    schedules = query.order_by(Schedule.scheduled_time).all()

    return schedules


@router.get("/schedules/{schedule_id}", response_model=ScheduleResponse)
def get_schedule(
    schedule_id: UUID,
    current_user: Caregiver = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific schedule by ID
    """
    schedule = db.query(Schedule).filter(Schedule.id == schedule_id).first()
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Schedule not found"
        )

    # Check access
    relationship = db.query(PatientCaregiverRelationship).filter(
        PatientCaregiverRelationship.patient_id == schedule.patient_id,
        PatientCaregiverRelationship.caregiver_id == current_user.id
    ).first()

    if not relationship:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this schedule"
        )

    return schedule


@router.patch("/schedules/{schedule_id}", response_model=ScheduleResponse)
def update_schedule(
    schedule_id: UUID,
    update_data: ScheduleUpdate,
    current_user: Caregiver = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a schedule
    """
    schedule = db.query(Schedule).filter(Schedule.id == schedule_id).first()
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Schedule not found"
        )

    # Check access
    relationship = db.query(PatientCaregiverRelationship).filter(
        PatientCaregiverRelationship.patient_id == schedule.patient_id,
        PatientCaregiverRelationship.caregiver_id == current_user.id
    ).first()

    if not relationship:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this schedule"
        )

    # Update fields
    update_dict = update_data.model_dump(exclude_unset=True)

    for field, value in update_dict.items():
        setattr(schedule, field, value)

    schedule.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(schedule)

    return schedule


@router.delete("/schedules/{schedule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_schedule(
    schedule_id: UUID,
    current_user: Caregiver = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a schedule

    - Cascade deletes all related reminders
    """
    schedule = db.query(Schedule).filter(Schedule.id == schedule_id).first()
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Schedule not found"
        )

    # Check access
    relationship = db.query(PatientCaregiverRelationship).filter(
        PatientCaregiverRelationship.patient_id == schedule.patient_id,
        PatientCaregiverRelationship.caregiver_id == current_user.id
    ).first()

    if not relationship:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this schedule"
        )

    db.delete(schedule)
    db.commit()

    return None


# ===== REMINDER ENDPOINTS =====

@router.post("/patients/{patient_id}/reminders", response_model=ReminderResponse, status_code=status.HTTP_201_CREATED)
def create_reminder(
    patient_id: UUID,
    reminder_data: ReminderCreate,
    current_user: Caregiver = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a one-time reminder for a patient

    - For ad-hoc reminders not tied to a schedule
    """
    # Check access
    relationship = db.query(PatientCaregiverRelationship).filter(
        PatientCaregiverRelationship.patient_id == patient_id,
        PatientCaregiverRelationship.caregiver_id == current_user.id
    ).first()

    if not relationship:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this patient"
        )

    # Verify schedule exists if provided
    if reminder_data.schedule_id:
        schedule = db.query(Schedule).filter(
            Schedule.id == reminder_data.schedule_id,
            Schedule.patient_id == patient_id
        ).first()
        if not schedule:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Schedule not found"
            )

    # Create reminder
    new_reminder = Reminder(
        patient_id=patient_id,
        schedule_id=reminder_data.schedule_id,
        title=reminder_data.title,
        description=reminder_data.description,
        due_at=reminder_data.due_at
    )

    db.add(new_reminder)
    db.commit()
    db.refresh(new_reminder)

    return new_reminder


@router.get("/patients/{patient_id}/reminders", response_model=List[ReminderListResponse])
def list_reminders(
    patient_id: UUID,
    status_filter: Optional[str] = Query(None, pattern="^(pending|sent|delivered|completed|missed|snoozed)$"),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_user: Caregiver = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all reminders for a patient

    - Optionally filter by status
    - Optionally filter by date range
    """
    # Check access
    relationship = db.query(PatientCaregiverRelationship).filter(
        PatientCaregiverRelationship.patient_id == patient_id,
        PatientCaregiverRelationship.caregiver_id == current_user.id
    ).first()

    if not relationship:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this patient"
        )

    # Build query
    query = db.query(Reminder).filter(Reminder.patient_id == patient_id)

    if status_filter:
        query = query.filter(Reminder.status == status_filter)

    if start_date:
        query = query.filter(Reminder.due_at >= start_date)

    if end_date:
        query = query.filter(Reminder.due_at <= end_date)

    reminders = query.order_by(Reminder.due_at.desc()).all()

    return reminders


@router.get("/reminders/{reminder_id}", response_model=ReminderResponse)
def get_reminder(
    reminder_id: UUID,
    current_user: Caregiver = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific reminder by ID
    """
    reminder = db.query(Reminder).filter(Reminder.id == reminder_id).first()
    if not reminder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reminder not found"
        )

    # Check access
    relationship = db.query(PatientCaregiverRelationship).filter(
        PatientCaregiverRelationship.patient_id == reminder.patient_id,
        PatientCaregiverRelationship.caregiver_id == current_user.id
    ).first()

    if not relationship:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this reminder"
        )

    return reminder


@router.patch("/reminders/{reminder_id}/status", response_model=ReminderResponse)
def update_reminder_status(
    reminder_id: UUID,
    status_data: ReminderStatusUpdate,
    current_user: Caregiver = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update reminder status

    - Used by background jobs or patient responses
    """
    reminder = db.query(Reminder).filter(Reminder.id == reminder_id).first()
    if not reminder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reminder not found"
        )

    # Check access
    relationship = db.query(PatientCaregiverRelationship).filter(
        PatientCaregiverRelationship.patient_id == reminder.patient_id,
        PatientCaregiverRelationship.caregiver_id == current_user.id
    ).first()

    if not relationship:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this reminder"
        )

    # Update status
    reminder.status = status_data.status

    if status_data.patient_response:
        reminder.patient_response = status_data.patient_response

    if status_data.completion_confirmed is not None:
        reminder.completion_confirmed = status_data.completion_confirmed

    # Update timestamp based on status
    if status_data.status == "sent" and not reminder.sent_at:
        reminder.sent_at = datetime.utcnow()
    elif status_data.status == "delivered" and not reminder.delivered_at:
        reminder.delivered_at = datetime.utcnow()
    elif status_data.status == "completed" and not reminder.completed_at:
        reminder.completed_at = datetime.utcnow()

    db.commit()
    db.refresh(reminder)

    return reminder
