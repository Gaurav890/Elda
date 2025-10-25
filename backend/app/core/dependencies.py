"""
FastAPI dependencies for dependency injection
"""

from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.database.session import get_db

# Security scheme for JWT authentication
security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """
    Get current authenticated user from JWT token

    Args:
        credentials: HTTP Bearer token from request header
        db: Database session

    Returns:
        Caregiver model instance

    Raises:
        HTTPException: If token is invalid or user not found
    """
    from app.models.caregiver import Caregiver

    token = credentials.credentials

    # Decode token
    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Get user_id from token
    user_id: str = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Query database for user
    user = db.query(Caregiver).filter(Caregiver.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account"
        )

    return user


def get_current_active_user(
    current_user = Depends(get_current_user)
):
    """
    Get current active user (not disabled)
    Note: Already checked in get_current_user, so this is just an alias

    Args:
        current_user: Current authenticated user

    Returns:
        Caregiver model instance
    """
    return current_user


def get_patient_with_access_check(
    patient_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Verify that the current caregiver has access to the specified patient

    Args:
        patient_id: Patient UUID
        current_user: Current authenticated caregiver
        db: Database session

    Returns:
        Patient model instance

    Raises:
        HTTPException: If patient not found or caregiver doesn't have access
    """
    from app.models.patient import Patient
    from app.models.relationship import PatientCaregiverRelationship

    # Query database for patient
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if patient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )

    # Check relationship
    relationship = db.query(PatientCaregiverRelationship).filter(
        PatientCaregiverRelationship.patient_id == patient_id,
        PatientCaregiverRelationship.caregiver_id == current_user.id
    ).first()

    if relationship is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this patient"
        )

    return patient
