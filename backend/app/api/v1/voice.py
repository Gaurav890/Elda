"""
Voice Interaction API endpoints
Handles real-time voice conversations with AI
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID

from app.core.dependencies import get_db
from app.services.ai_orchestrator import ai_orchestrator
from app.models.patient import Patient

router = APIRouter()


# ===== REQUEST/RESPONSE SCHEMAS =====

class VoiceInteractionRequest(BaseModel):
    """Request schema for voice interaction"""
    patient_id: UUID
    message: str = Field(..., min_length=1, max_length=5000, description="Transcribed patient speech")
    conversation_type: str = Field(default="spontaneous", pattern="^(spontaneous|reminder_response|check_in|emergency)$")


class VoiceInteractionResponse(BaseModel):
    """Response schema for voice interaction"""
    ai_response: str = Field(..., description="Text to convert to speech and play back")
    conversation_id: UUID
    sentiment: str
    health_mentions: List[str]
    urgency_level: str
    alert_created: bool
    response_time: float
    similar_conversations_found: int


class InitializePatientAgentRequest(BaseModel):
    """Request to initialize Letta agent for patient"""
    patient_id: UUID


class DailySummaryTriggerRequest(BaseModel):
    """Request to manually trigger daily summary generation"""
    patient_id: UUID
    summary_date: Optional[str] = None  # Format: YYYY-MM-DD, defaults to today


# ===== ENDPOINTS =====

@router.post("/interact", response_model=VoiceInteractionResponse)
async def voice_interaction(
    request: VoiceInteractionRequest,
    db: Session = Depends(get_db)
):
    """
    Process voice interaction with complete AI pipeline

    Pipeline:
    1. Transcribe speech (done by mobile app)
    2. Search similar past conversations (Chroma)
    3. Get long-term memory context (Letta)
    4. Generate AI response (Claude)
    5. Update memory (Letta)
    6. Store for semantic search (Chroma)
    7. Check for alerts
    8. Convert response to speech (done by mobile app)

    This endpoint handles steps 2-7.

    Returns AI response text to be converted to speech by the mobile app.
    """
    # Verify patient exists
    patient = db.query(Patient).filter(Patient.id == request.patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )

    # Process through AI orchestrator
    result = await ai_orchestrator.process_voice_interaction(
        patient_id=str(request.patient_id),
        patient_message=request.message,
        db=db,
        conversation_type=request.conversation_type
    )

    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Failed to process voice interaction")
        )

    return VoiceInteractionResponse(
        ai_response=result["ai_response"],
        conversation_id=UUID(result["conversation_id"]),
        sentiment=result["sentiment"],
        health_mentions=result["health_mentions"],
        urgency_level=result["urgency_level"],
        alert_created=result["alert_created"],
        response_time=result["response_time"],
        similar_conversations_found=result["similar_conversations_found"]
    )


@router.post("/initialize-agent", status_code=status.HTTP_200_OK)
async def initialize_patient_agent(
    request: InitializePatientAgentRequest,
    db: Session = Depends(get_db)
):
    """
    Initialize Letta AI agent for a patient

    This should be called when a patient is first created.
    Creates a persistent Letta agent that maintains long-term memory.
    """
    # Verify patient exists
    patient = db.query(Patient).filter(Patient.id == request.patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )

    # Check if agent already exists
    if patient.letta_agent_id:
        return {
            "message": "Patient already has Letta agent",
            "agent_id": patient.letta_agent_id,
            "already_existed": True
        }

    # Initialize agent
    success = await ai_orchestrator.initialize_patient_agent(
        patient_id=str(request.patient_id),
        db=db
    )

    if success:
        db.refresh(patient)
        return {
            "message": "Letta agent initialized successfully",
            "agent_id": patient.letta_agent_id,
            "already_existed": False
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to initialize Letta agent"
        )


@router.post("/generate-summary", status_code=status.HTTP_200_OK)
async def trigger_daily_summary(
    request: DailySummaryTriggerRequest,
    db: Session = Depends(get_db)
):
    """
    Manually trigger daily summary generation

    Normally runs automatically via background job.
    This endpoint allows caregivers to manually generate summaries.
    """
    from datetime import date, datetime
    from app.models.daily_summary import DailySummary

    # Verify patient exists
    patient = db.query(Patient).filter(Patient.id == request.patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )

    # Parse summary date
    if request.summary_date:
        try:
            summary_date = datetime.strptime(request.summary_date, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid date format. Use YYYY-MM-DD"
            )
    else:
        summary_date = date.today()

    # Check if summary already exists
    existing_summary = db.query(DailySummary).filter(
        DailySummary.patient_id == request.patient_id,
        DailySummary.summary_date == summary_date
    ).first()

    if existing_summary:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Summary already exists for {summary_date}"
        )

    # Generate summary
    result = await ai_orchestrator.generate_daily_summary_for_patient(
        patient_id=str(request.patient_id),
        db=db,
        summary_date=summary_date
    )

    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Failed to generate summary")
        )

    # Create summary record
    new_summary = DailySummary(
        patient_id=request.patient_id,
        summary_date=summary_date,
        ai_generated_summary=result["summary"],
        total_conversations=result["total_conversations"],
        reminder_adherence_rate=result["reminder_adherence_rate"],
        medication_adherence_rate=result["medication_adherence_rate"],
        meal_adherence_rate=result["meal_adherence_rate"],
        health_concerns=result["health_concerns"],
        positive_highlights=result["positive_highlights"],
        recommendations=result["recommendations"]
    )

    db.add(new_summary)
    db.commit()
    db.refresh(new_summary)

    return {
        "message": "Daily summary generated successfully",
        "summary_id": str(new_summary.id),
        "summary_date": str(summary_date),
        "summary": result["summary"]
    }


@router.get("/chroma/stats", status_code=status.HTTP_200_OK)
async def get_chroma_stats():
    """
    Get Chroma vector database statistics

    Useful for monitoring and debugging.
    """
    from app.services.chroma_service import chroma_service

    stats = chroma_service.get_collection_stats()

    return {
        "chroma_stats": stats,
        "status": "healthy" if stats.get("status") == "healthy" else "degraded"
    }


@router.get("/patients/{patient_id}/conversation-analytics", status_code=status.HTTP_200_OK)
async def get_patient_conversation_analytics(
    patient_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Get analytics about a patient's conversations from Chroma

    Returns sentiment distribution, health topics, and conversation statistics.
    """
    from app.services.chroma_service import chroma_service

    # Verify patient exists
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )

    # Get analytics from Chroma
    analytics = await chroma_service.get_patient_conversation_summary(
        patient_id=str(patient_id)
    )

    return {
        "patient_id": str(patient_id),
        "patient_name": f"{patient.first_name} {patient.last_name}",
        "analytics": analytics
    }
