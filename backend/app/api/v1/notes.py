"""
Caregiver Notes API endpoints
Handles CRUD operations for caregiver notes about patients
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from uuid import UUID

from app.core.dependencies import get_current_user, get_db
from app.models.caregiver import Caregiver
from app.models.patient import Patient
from app.models.note import CaregiverNote
from app.models.relationship import PatientCaregiverRelationship
from app.schemas.note import (
    NoteCreate,
    NoteUpdate,
    NoteResponse,
    NoteCategory,
    NotePriority
)

router = APIRouter()


# ===== NOTE ENDPOINTS =====

@router.post("/patients/{patient_id}/notes", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def create_note(
    patient_id: UUID,
    note_data: NoteCreate,
    current_user: Caregiver = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new note for a patient

    - Verifies caregiver has access to patient
    - Creates note with current caregiver as author
    - Returns created note with author information
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

    # Create note
    new_note = CaregiverNote(
        patient_id=patient_id,
        caregiver_id=current_user.id,
        title=note_data.title,
        content=note_data.content,
        category=note_data.category.value,
        priority=note_data.priority.value
    )

    db.add(new_note)
    db.commit()
    db.refresh(new_note)

    # Add author name to response
    note_dict = {
        "id": new_note.id,
        "patient_id": new_note.patient_id,
        "caregiver_id": new_note.caregiver_id,
        "title": new_note.title,
        "content": new_note.content,
        "category": new_note.category,
        "priority": new_note.priority,
        "created_at": new_note.created_at,
        "updated_at": new_note.updated_at,
        "author_name": current_user.full_name
    }

    return note_dict


@router.get("/patients/{patient_id}/notes", response_model=List[NoteResponse])
def list_notes(
    patient_id: UUID,
    category: Optional[NoteCategory] = Query(None),
    priority: Optional[NotePriority] = Query(None),
    limit: int = Query(50, le=200, ge=1),
    offset: int = Query(0, ge=0),
    current_user: Caregiver = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all notes for a patient

    - Optionally filter by category and/or priority
    - Supports pagination with limit and offset
    - Returns notes with author information
    - Ordered by created_at descending (newest first)
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

    # Build query with eager loading of caregiver
    query = db.query(CaregiverNote).options(
        joinedload(CaregiverNote.caregiver)
    ).filter(CaregiverNote.patient_id == patient_id)

    # Apply filters
    if category:
        query = query.filter(CaregiverNote.category == category.value)

    if priority:
        query = query.filter(CaregiverNote.priority == priority.value)

    # Order by created_at descending (newest first) and paginate
    notes = query.order_by(CaregiverNote.created_at.desc()).limit(limit).offset(offset).all()

    # Add author names to response
    result = []
    for note in notes:
        note_dict = {
            "id": note.id,
            "patient_id": note.patient_id,
            "caregiver_id": note.caregiver_id,
            "title": note.title,
            "content": note.content,
            "category": note.category,
            "priority": note.priority,
            "created_at": note.created_at,
            "updated_at": note.updated_at,
            "author_name": note.caregiver.full_name if note.caregiver else "Unknown"
        }
        result.append(note_dict)

    return result


@router.get("/notes/{note_id}", response_model=NoteResponse)
def get_note(
    note_id: UUID,
    current_user: Caregiver = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific note by ID

    - Verifies caregiver has access to the patient
    - Returns note with author information
    """
    note = db.query(CaregiverNote).options(
        joinedload(CaregiverNote.caregiver)
    ).filter(CaregiverNote.id == note_id).first()

    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )

    # Check access
    relationship = db.query(PatientCaregiverRelationship).filter(
        PatientCaregiverRelationship.patient_id == note.patient_id,
        PatientCaregiverRelationship.caregiver_id == current_user.id
    ).first()

    if not relationship:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this note"
        )

    # Build response with author name
    note_dict = {
        "id": note.id,
        "patient_id": note.patient_id,
        "caregiver_id": note.caregiver_id,
        "title": note.title,
        "content": note.content,
        "category": note.category,
        "priority": note.priority,
        "created_at": note.created_at,
        "updated_at": note.updated_at,
        "author_name": note.caregiver.full_name if note.caregiver else "Unknown"
    }

    return note_dict


@router.patch("/notes/{note_id}", response_model=NoteResponse)
def update_note(
    note_id: UUID,
    update_data: NoteUpdate,
    current_user: Caregiver = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a note

    - Verifies caregiver has access to the patient
    - Only updates fields that are provided
    - Returns updated note
    """
    note = db.query(CaregiverNote).options(
        joinedload(CaregiverNote.caregiver)
    ).filter(CaregiverNote.id == note_id).first()

    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )

    # Check access
    relationship = db.query(PatientCaregiverRelationship).filter(
        PatientCaregiverRelationship.patient_id == note.patient_id,
        PatientCaregiverRelationship.caregiver_id == current_user.id
    ).first()

    if not relationship:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this note"
        )

    # Update fields
    update_dict = update_data.model_dump(exclude_unset=True)

    for field, value in update_dict.items():
        # Convert enum values to strings
        if field in ['category', 'priority'] and value is not None:
            setattr(note, field, value.value)
        else:
            setattr(note, field, value)

    db.commit()
    db.refresh(note)

    # Build response with author name
    note_dict = {
        "id": note.id,
        "patient_id": note.patient_id,
        "caregiver_id": note.caregiver_id,
        "title": note.title,
        "content": note.content,
        "category": note.category,
        "priority": note.priority,
        "created_at": note.created_at,
        "updated_at": note.updated_at,
        "author_name": note.caregiver.full_name if note.caregiver else "Unknown"
    }

    return note_dict


@router.delete("/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(
    note_id: UUID,
    current_user: Caregiver = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a note

    - Verifies caregiver has access to the patient
    - Permanently deletes the note
    """
    note = db.query(CaregiverNote).filter(CaregiverNote.id == note_id).first()

    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )

    # Check access
    relationship = db.query(PatientCaregiverRelationship).filter(
        PatientCaregiverRelationship.patient_id == note.patient_id,
        PatientCaregiverRelationship.caregiver_id == current_user.id
    ).first()

    if not relationship:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this note"
        )

    db.delete(note)
    db.commit()

    return None
