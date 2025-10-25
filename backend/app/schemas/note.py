"""
Pydantic schemas for caregiver note endpoints
"""

from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional
from uuid import UUID
from enum import Enum


# ===== ENUMS =====

class NoteCategory(str, Enum):
    """Note category types"""
    MEDICAL = "medical"
    BEHAVIORAL = "behavioral"
    PREFERENCES = "preferences"
    ROUTINE = "routine"
    SAFETY = "safety"
    FAMILY = "family"
    OTHER = "other"


class NotePriority(str, Enum):
    """Note priority levels"""
    NORMAL = "normal"
    IMPORTANT = "important"


# ===== NOTE SCHEMAS =====

class NoteBase(BaseModel):
    """Base schema for caregiver note"""
    title: str = Field(..., min_length=1, max_length=200, description="Note title")
    content: str = Field(..., min_length=1, description="Note content/description")
    category: NoteCategory = Field(..., description="Note category")
    priority: NotePriority = Field(default=NotePriority.NORMAL, description="Note priority")


class NoteCreate(NoteBase):
    """Schema for creating a note"""
    pass


class NoteUpdate(BaseModel):
    """Schema for updating a note"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    content: Optional[str] = Field(None, min_length=1)
    category: Optional[NoteCategory] = None
    priority: Optional[NotePriority] = None


class NoteResponse(NoteBase):
    """Schema for note response"""
    id: UUID
    patient_id: UUID
    caregiver_id: Optional[UUID]
    created_at: datetime
    updated_at: datetime

    # Optional: Include caregiver name if needed
    author_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class NoteListResponse(BaseModel):
    """Schema for paginated note list response"""
    notes: list[NoteResponse]
    total: int
    page: int = 1
    page_size: int = 50

    model_config = ConfigDict(from_attributes=True)
