"""
Activity Logs API endpoints
Handles retrieval of patient activity logs
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional
from uuid import UUID

from app.core.dependencies import get_current_user, get_db
from app.models.caregiver import Caregiver
from app.models.patient import Patient
from app.models.activity_log import ActivityLog
from app.models.relationship import PatientCaregiverRelationship
from app.schemas.activity import ActivityLogResponse, ActivityLogListResponse

router = APIRouter()


# ===== ACTIVITY LOG ENDPOINTS =====

@router.get("/patients/{patient_id}/activity", response_model=ActivityLogListResponse)
def list_activity_logs(
    patient_id: UUID,
    activity_type: Optional[str] = Query(None, description="Filter by activity type"),
    limit: int = Query(50, le=200, ge=1, description="Maximum number of logs to return"),
    offset: int = Query(0, ge=0, description="Number of logs to skip"),
    current_user: Caregiver = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get activity logs for a patient

    - Returns last 50 activity logs by default (most recent first)
    - Can filter by activity_type
    - Supports pagination via limit/offset
    - Verifies caregiver has access to patient
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

    # Build query
    query = db.query(ActivityLog).filter(ActivityLog.patient_id == patient_id)

    # Apply activity_type filter if provided
    if activity_type:
        query = query.filter(ActivityLog.activity_type == activity_type)

    # Get total count
    total = query.count()

    # Order by most recent first
    query = query.order_by(desc(ActivityLog.logged_at))

    # Apply pagination
    activities = query.offset(offset).limit(limit).all()

    return ActivityLogListResponse(
        activities=activities,
        total=total,
        limit=limit,
        offset=offset
    )
