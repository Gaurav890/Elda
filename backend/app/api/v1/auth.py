"""
Authentication API endpoints
Handles caregiver registration, login, and token management
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.core.config import settings
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_refresh_token
from app.core.dependencies import get_current_user, get_db
from app.models.caregiver import Caregiver
from app.schemas.auth import (
    CaregiverCreate,
    CaregiverLogin,
    CaregiverResponse,
    CaregiverUpdate,
    TokenResponse,
    TokenRefresh,
    PasswordChange
)

router = APIRouter()


@router.post("/register", response_model=CaregiverResponse, status_code=status.HTTP_201_CREATED)
def register_caregiver(
    caregiver_data: CaregiverCreate,
    db: Session = Depends(get_db)
):
    """
    Register a new caregiver account

    - **email**: Valid email address (must be unique)
    - **password**: Minimum 8 characters
    - **first_name**: Caregiver first name
    - **last_name**: Caregiver last name
    - **role**: Caregiver role (family, nurse, doctor, professional)
    """
    # Check if email already exists
    existing_caregiver = db.query(Caregiver).filter(Caregiver.email == caregiver_data.email).first()
    if existing_caregiver:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new caregiver
    new_caregiver = Caregiver(
        email=caregiver_data.email,
        hashed_password=hash_password(caregiver_data.password),
        first_name=caregiver_data.first_name,
        last_name=caregiver_data.last_name,
        phone_number=caregiver_data.phone_number,
        role=caregiver_data.role
    )

    db.add(new_caregiver)
    db.commit()
    db.refresh(new_caregiver)

    return new_caregiver


@router.post("/login", response_model=TokenResponse)
def login_caregiver(
    credentials: CaregiverLogin,
    db: Session = Depends(get_db)
):
    """
    Login with email and password

    Returns access token and refresh token
    """
    # Find caregiver by email
    caregiver = db.query(Caregiver).filter(Caregiver.email == credentials.email).first()
    if not caregiver:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Verify password
    if not verify_password(credentials.password, caregiver.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Check if account is active
    if not caregiver.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )

    # Update last login
    caregiver.last_login_at = datetime.utcnow()
    db.commit()

    # Create tokens
    access_token = create_access_token(data={"sub": str(caregiver.id)})
    refresh_token = create_refresh_token(data={"sub": str(caregiver.id)})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh_access_token(
    token_data: TokenRefresh,
    db: Session = Depends(get_db)
):
    """
    Refresh access token using refresh token
    """
    # Decode refresh token
    payload = decode_refresh_token(token_data.refresh_token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

    # Get user_id from token
    user_id: str = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

    # Verify caregiver exists and is active
    caregiver = db.query(Caregiver).filter(Caregiver.id == user_id).first()
    if not caregiver or not caregiver.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

    # Create new tokens
    access_token = create_access_token(data={"sub": str(caregiver.id)})
    refresh_token = create_refresh_token(data={"sub": str(caregiver.id)})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )


@router.get("/me", response_model=CaregiverResponse)
def get_current_caregiver(
    current_user: Caregiver = Depends(get_current_user)
):
    """
    Get current authenticated caregiver profile
    """
    return current_user


@router.patch("/me", response_model=CaregiverResponse)
def update_caregiver_profile(
    update_data: CaregiverUpdate,
    current_user: Caregiver = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update current caregiver profile
    """
    # Update only provided fields
    update_dict = update_data.model_dump(exclude_unset=True)

    for field, value in update_dict.items():
        setattr(current_user, field, value)

    current_user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(current_user)

    return current_user


@router.post("/change-password", status_code=status.HTTP_200_OK)
def change_password(
    password_data: PasswordChange,
    current_user: Caregiver = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Change caregiver password
    """
    # Verify current password
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )

    # Update password
    current_user.hashed_password = hash_password(password_data.new_password)
    current_user.updated_at = datetime.utcnow()
    db.commit()

    return {"message": "Password changed successfully"}
