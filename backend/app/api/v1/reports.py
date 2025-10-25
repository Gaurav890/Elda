"""
Reports API endpoints
Handles generation of patient reports with aggregated metrics
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID
from datetime import date

from app.core.dependencies import get_current_user, get_db
from app.models.caregiver import Caregiver
from app.models.patient import Patient
from app.models.relationship import PatientCaregiverRelationship
from app.schemas.report import PatientReport, TimeRange
from app.services.reports import generate_report

router = APIRouter()


# ===== REPORTS ENDPOINTS =====

@router.get("/patients/{patient_id}/reports", response_model=PatientReport)
def get_patient_report(
    patient_id: UUID,
    time_range: TimeRange = Query("7d", description="Time range for report: 7d, 30d, 90d, all, or custom"),
    start_date: Optional[date] = Query(None, description="Start date for custom range (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date for custom range (YYYY-MM-DD)"),
    current_user: Caregiver = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate a comprehensive patient report with aggregated metrics

    **Time Ranges:**
    - `7d`: Last 7 days
    - `30d`: Last 30 days
    - `90d`: Last 90 days
    - `all`: Last year
    - `custom`: Custom date range (requires start_date and end_date)

    **Report Includes:**
    - Medication adherence metrics (overall rate, trend, daily data)
    - Activity trends (average daily minutes, trend, daily data)
    - Mood analytics (sentiment score, distribution, trend, daily data)

    **Permissions:**
    - Requires authenticated caregiver
    - Caregiver must have access to the patient
    """
    # Check if patient exists
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )

    # Verify caregiver has access to patient
    relationship = db.query(PatientCaregiverRelationship).filter(
        PatientCaregiverRelationship.patient_id == patient_id,
        PatientCaregiverRelationship.caregiver_id == current_user.id
    ).first()

    if not relationship:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this patient"
        )

    # Validate custom date range
    if time_range == TimeRange.CUSTOM or time_range.value == "custom":
        if not start_date or not end_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="start_date and end_date are required for custom time range"
            )

        if start_date > end_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="start_date must be before or equal to end_date"
            )

    # Generate report
    try:
        report = generate_report(
            db=db,
            patient_id=patient_id,
            time_range=time_range,
            start_date=start_date,
            end_date=end_date
        )
        return report
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating report: {str(e)}"
        )
