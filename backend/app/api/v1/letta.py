"""
Letta AI Integration API endpoints
Handles Letta agent management and long-term memory
"""

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from uuid import UUID
from datetime import datetime

from app.core.dependencies import get_current_user, get_db
from app.models.caregiver import Caregiver
from app.models.patient import Patient
from app.models.conversation import Conversation
from app.models.relationship import PatientCaregiverRelationship
from app.services.letta_service import letta_service

router = APIRouter()


# ===== REQUEST/RESPONSE SCHEMAS =====

class CreateAgentRequest(BaseModel):
    """Request to create a Letta agent for a patient"""
    patient_id: UUID


class CreateAgentResponse(BaseModel):
    """Response after creating a Letta agent"""
    patient_id: UUID
    agent_id: str
    status: str
    message: str


class AgentStatusResponse(BaseModel):
    """Response for agent status check"""
    patient_id: UUID
    has_agent: bool
    agent_id: Optional[str] = None
    agent_created_at: Optional[datetime] = None


class SyncConversationsRequest(BaseModel):
    """Request to sync conversations to Letta"""
    patient_id: UUID
    limit: Optional[int] = 50  # Number of recent conversations to sync


class SyncConversationsResponse(BaseModel):
    """Response after syncing conversations"""
    patient_id: UUID
    conversations_synced: int
    agent_id: str
    status: str


class GenerateInsightRequest(BaseModel):
    """Request to generate insight using Letta"""
    patient_id: UUID
    insight_type: Optional[str] = "general"  # general, behavioral, health, mood


class GenerateInsightResponse(BaseModel):
    """Response with generated insight"""
    patient_id: UUID
    insight_text: str
    confidence_score: float
    memory_context: Dict[str, Any]
    success: bool


# ===== HELPER FUNCTIONS =====

def verify_patient_access(
    patient_id: UUID,
    caregiver: Caregiver,
    db: Session
) -> Patient:
    """Verify caregiver has access to patient and return patient"""
    # Check patient exists
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )

    # Check access
    relationship = db.query(PatientCaregiverRelationship).filter(
        PatientCaregiverRelationship.patient_id == patient_id,
        PatientCaregiverRelationship.caregiver_id == caregiver.id
    ).first()

    if not relationship:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this patient"
        )

    return patient


# ===== ENDPOINTS =====

@router.post("/agents/create", response_model=CreateAgentResponse, status_code=status.HTTP_201_CREATED)
async def create_letta_agent(
    request: CreateAgentRequest,
    current_user: Caregiver = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a Letta AI agent for a patient

    Creates a long-term memory agent that will:
    - Track behavioral patterns
    - Remember patient preferences
    - Identify health trends
    - Provide context for AI responses

    Once created, the agent will be used automatically in voice interactions.
    """
    # Verify access
    patient = verify_patient_access(request.patient_id, current_user, db)

    # Check if agent already exists
    if patient.letta_agent_id:
        return CreateAgentResponse(
            patient_id=request.patient_id,
            agent_id=patient.letta_agent_id,
            status="already_exists",
            message=f"Patient already has a Letta agent: {patient.letta_agent_id}"
        )

    # Build patient context
    patient_context = {
        "first_name": patient.first_name,
        "last_name": patient.last_name,
        "age": patient.age,
        "medical_conditions": patient.medical_conditions,
        "medications": patient.medications,
        "allergies": patient.allergies,
        "dietary_restrictions": patient.dietary_restrictions,
        "personal_context": patient.personal_context,
        "preferred_name": patient.preferred_name or patient.first_name
    }

    # Create agent
    agent_id = await letta_service.create_agent_for_patient(
        patient_id=str(request.patient_id),
        patient_context=patient_context
    )

    if not agent_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create Letta agent"
        )

    # Update patient record
    patient.letta_agent_id = agent_id
    db.commit()

    return CreateAgentResponse(
        patient_id=request.patient_id,
        agent_id=agent_id,
        status="created",
        message=f"Successfully created Letta agent for {patient.display_name}"
    )


@router.get("/agents/status/{patient_id}", response_model=AgentStatusResponse)
async def get_agent_status(
    patient_id: UUID,
    current_user: Caregiver = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Check if a patient has a Letta agent and get its status
    """
    # Verify access
    patient = verify_patient_access(patient_id, current_user, db)

    return AgentStatusResponse(
        patient_id=patient_id,
        has_agent=bool(patient.letta_agent_id),
        agent_id=patient.letta_agent_id,
        agent_created_at=patient.updated_at if patient.letta_agent_id else None
    )


@router.post("/agents/sync-conversations", response_model=SyncConversationsResponse)
async def sync_conversations_to_letta(
    request: SyncConversationsRequest,
    background_tasks: BackgroundTasks,
    current_user: Caregiver = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Sync past conversations to Letta agent for memory building

    This is useful when:
    - An agent is newly created for an existing patient
    - You want to refresh the agent's memory with recent conversations

    The sync happens in the background to avoid blocking the API.
    """
    # Verify access
    patient = verify_patient_access(request.patient_id, current_user, db)

    # Check if agent exists
    if not patient.letta_agent_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Patient does not have a Letta agent. Create one first."
        )

    # Get recent conversations
    conversations = db.query(Conversation).filter(
        Conversation.patient_id == request.patient_id
    ).order_by(Conversation.created_at.desc()).limit(request.limit).all()

    if not conversations:
        return SyncConversationsResponse(
            patient_id=request.patient_id,
            conversations_synced=0,
            agent_id=patient.letta_agent_id,
            status="no_conversations_to_sync"
        )

    # Sync conversations in order (oldest to newest)
    conversations_synced = 0
    for conv in reversed(conversations):  # Oldest first
        try:
            await letta_service.send_message_to_agent(
                agent_id=patient.letta_agent_id,
                message=f"Past conversation - Patient: {conv.patient_message}",
                conversation_context={
                    "timestamp": conv.created_at.isoformat(),
                    "sentiment": conv.sentiment,
                    "health_mentions": conv.health_mentions
                }
            )
            conversations_synced += 1
        except Exception as e:
            # Log error but continue syncing
            print(f"Error syncing conversation {conv.id}: {e}")

    return SyncConversationsResponse(
        patient_id=request.patient_id,
        conversations_synced=conversations_synced,
        agent_id=patient.letta_agent_id,
        status="completed"
    )


@router.post("/agents/generate-insight", response_model=GenerateInsightResponse)
async def generate_letta_insight(
    request: GenerateInsightRequest,
    current_user: Caregiver = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate an AI-powered insight using Letta's long-term memory

    Uses the patient's conversation history stored in Letta to identify:
    - Behavioral patterns
    - Health trends
    - Mood changes
    - Actionable recommendations

    The insight is generated by analyzing long-term memory, not just recent data.
    """
    # Verify access
    patient = verify_patient_access(request.patient_id, current_user, db)

    # Check if agent exists
    if not patient.letta_agent_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Patient does not have a Letta agent. Create one first."
        )

    # Get recent conversations for context
    recent_conversations = db.query(Conversation).filter(
        Conversation.patient_id == request.patient_id
    ).order_by(Conversation.created_at.desc()).limit(20).all()

    conversation_data = [
        {
            "created_at": conv.created_at.isoformat(),
            "sentiment": conv.sentiment,
            "health_mentions": conv.health_mentions
        }
        for conv in recent_conversations
    ]

    # Generate insight
    patient_context = {
        "first_name": patient.first_name,
        "age": patient.age,
        "medical_conditions": patient.medical_conditions
    }

    insight_result = await letta_service.generate_insight(
        agent_id=patient.letta_agent_id,
        patient_context=patient_context,
        recent_conversations=conversation_data
    )

    return GenerateInsightResponse(
        patient_id=request.patient_id,
        insight_text=insight_result.get("insight_text", ""),
        confidence_score=insight_result.get("confidence_score", 0.0),
        memory_context=insight_result.get("memory_context", {}),
        success=insight_result.get("success", False)
    )


@router.post("/agents/bulk-create")
async def bulk_create_agents(
    current_user: Caregiver = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create Letta agents for all patients that don't have one

    Admin/bulk operation to initialize agents for existing patients.
    """
    # Get all patients the caregiver has access to
    relationships = db.query(PatientCaregiverRelationship).filter(
        PatientCaregiverRelationship.caregiver_id == current_user.id
    ).all()

    patient_ids = [rel.patient_id for rel in relationships]

    # Get patients without agents
    patients_without_agents = db.query(Patient).filter(
        Patient.id.in_(patient_ids),
        Patient.letta_agent_id.is_(None)
    ).all()

    results = []
    for patient in patients_without_agents:
        patient_context = {
            "first_name": patient.first_name,
            "last_name": patient.last_name,
            "age": patient.age,
            "medical_conditions": patient.medical_conditions,
            "medications": patient.medications,
            "preferred_name": patient.preferred_name or patient.first_name
        }

        agent_id = await letta_service.create_agent_for_patient(
            patient_id=str(patient.id),
            patient_context=patient_context
        )

        if agent_id:
            patient.letta_agent_id = agent_id
            results.append({
                "patient_id": str(patient.id),
                "patient_name": patient.full_name,
                "agent_id": agent_id,
                "status": "created"
            })
        else:
            results.append({
                "patient_id": str(patient.id),
                "patient_name": patient.full_name,
                "agent_id": None,
                "status": "failed"
            })

    db.commit()

    return {
        "total_patients": len(patients_without_agents),
        "agents_created": len([r for r in results if r["status"] == "created"]),
        "agents_failed": len([r for r in results if r["status"] == "failed"]),
        "results": results
    }
