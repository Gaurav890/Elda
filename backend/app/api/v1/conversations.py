"""
Conversation, Summary, Alert, and Insight API endpoints
Handles AI-powered interactions and analytics
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date
from uuid import UUID

from app.core.dependencies import get_current_user, get_db
from app.models.caregiver import Caregiver
from app.models.patient import Patient
from app.models.conversation import Conversation
from app.models.daily_summary import DailySummary
from app.models.alert import Alert
from app.models.insight import PatientInsight
from app.models.relationship import PatientCaregiverRelationship
from app.schemas.conversation import (
    ConversationCreate,
    ConversationResponse,
    ConversationListResponse,
    DailySummaryCreate,
    DailySummaryResponse,
    AlertCreate,
    AlertResponse,
    AlertAcknowledge,
    InsightCreate,
    InsightResponse
)

router = APIRouter()


# ===== CONVERSATION ENDPOINTS =====

@router.post("/patients/{patient_id}/conversations", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
def create_conversation(
    patient_id: UUID,
    conversation_data: ConversationCreate,
    current_user: Caregiver = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new conversation record

    - Used by voice interaction system
    - Stores AI context and analysis
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

    # Create conversation
    new_conversation = Conversation(
        patient_id=patient_id,
        patient_message=conversation_data.patient_message,
        ai_response=conversation_data.ai_response,
        conversation_type=conversation_data.conversation_type,
        letta_context=conversation_data.letta_context,
        chroma_similar_conversations=conversation_data.chroma_similar_conversations,
        claude_analysis=conversation_data.claude_analysis,
        sentiment=conversation_data.sentiment,
        health_mentions=conversation_data.health_mentions,
        urgency_level=conversation_data.urgency_level,
        response_time_seconds=conversation_data.response_time_seconds
    )

    db.add(new_conversation)
    db.commit()
    db.refresh(new_conversation)

    return new_conversation


@router.get("/patients/{patient_id}/conversations", response_model=List[ConversationListResponse])
def list_conversations(
    patient_id: UUID,
    conversation_type: Optional[str] = Query(None),
    urgency_level: Optional[str] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    limit: int = Query(50, le=200),
    current_user: Caregiver = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get conversations for a patient

    - Optionally filter by type, urgency, date range
    - Returns most recent first
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
    query = db.query(Conversation).filter(Conversation.patient_id == patient_id)

    if conversation_type:
        query = query.filter(Conversation.conversation_type == conversation_type)

    if urgency_level:
        query = query.filter(Conversation.urgency_level == urgency_level)

    if start_date:
        query = query.filter(Conversation.created_at >= start_date)

    if end_date:
        query = query.filter(Conversation.created_at <= end_date)

    conversations = query.order_by(Conversation.created_at.desc()).limit(limit).all()

    return conversations


@router.get("/conversations/{conversation_id}", response_model=ConversationResponse)
def get_conversation(
    conversation_id: UUID,
    current_user: Caregiver = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed conversation by ID
    """
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

    # Check access
    relationship = db.query(PatientCaregiverRelationship).filter(
        PatientCaregiverRelationship.patient_id == conversation.patient_id,
        PatientCaregiverRelationship.caregiver_id == current_user.id
    ).first()

    if not relationship:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this conversation"
        )

    return conversation


# ===== DAILY SUMMARY ENDPOINTS =====

@router.post("/patients/{patient_id}/summaries", response_model=DailySummaryResponse, status_code=status.HTTP_201_CREATED)
def create_daily_summary(
    patient_id: UUID,
    summary_data: DailySummaryCreate,
    current_user: Caregiver = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a daily summary for a patient

    - Usually called by background job
    - Can be manually triggered by caregiver
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

    # Check if summary already exists for this date
    existing_summary = db.query(DailySummary).filter(
        DailySummary.patient_id == patient_id,
        DailySummary.summary_date == summary_data.summary_date
    ).first()

    if existing_summary:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Summary already exists for this date"
        )

    # Create summary
    new_summary = DailySummary(
        patient_id=patient_id,
        summary_date=summary_data.summary_date,
        ai_generated_summary=summary_data.ai_generated_summary,
        total_conversations=summary_data.total_conversations,
        reminder_adherence_rate=summary_data.reminder_adherence_rate,
        medication_adherence_rate=summary_data.medication_adherence_rate,
        meal_adherence_rate=summary_data.meal_adherence_rate,
        health_concerns=summary_data.health_concerns,
        positive_highlights=summary_data.positive_highlights,
        recommendations=summary_data.recommendations
    )

    db.add(new_summary)
    db.commit()
    db.refresh(new_summary)

    return new_summary


@router.get("/patients/{patient_id}/summaries", response_model=List[DailySummaryResponse])
def list_summaries(
    patient_id: UUID,
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    limit: int = Query(30, le=90),
    current_user: Caregiver = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get daily summaries for a patient

    - Returns most recent first
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
    query = db.query(DailySummary).filter(DailySummary.patient_id == patient_id)

    if start_date:
        query = query.filter(DailySummary.summary_date >= start_date)

    if end_date:
        query = query.filter(DailySummary.summary_date <= end_date)

    summaries = query.order_by(DailySummary.summary_date.desc()).limit(limit).all()

    return summaries


# ===== ALERT ENDPOINTS =====

@router.post("/patients/{patient_id}/alerts", response_model=AlertResponse, status_code=status.HTTP_201_CREATED)
def create_alert(
    patient_id: UUID,
    alert_data: AlertCreate,
    current_user: Caregiver = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create an alert for a patient

    - Usually called by AI analysis detecting concerns
    - Can be manually created by caregiver
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

    # Create alert
    new_alert = Alert(
        patient_id=patient_id,
        alert_type=alert_data.alert_type,
        severity=alert_data.severity,
        title=alert_data.title,
        message=alert_data.message,
        related_conversation_id=alert_data.related_conversation_id,
        ai_recommendation=alert_data.ai_recommendation
    )

    db.add(new_alert)
    db.commit()
    db.refresh(new_alert)

    return new_alert


@router.get("/patients/{patient_id}/alerts", response_model=List[AlertResponse])
def list_alerts(
    patient_id: UUID,
    is_resolved: Optional[bool] = Query(None),
    severity: Optional[str] = Query(None),
    current_user: Caregiver = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get alerts for a patient

    - Optionally filter by resolution status or severity
    - Returns most recent first
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
    query = db.query(Alert).filter(Alert.patient_id == patient_id)

    if is_resolved is not None:
        query = query.filter(Alert.is_resolved == is_resolved)

    if severity:
        query = query.filter(Alert.severity == severity)

    alerts = query.order_by(Alert.created_at.desc()).all()

    return alerts


@router.patch("/alerts/{alert_id}/acknowledge", response_model=AlertResponse)
def acknowledge_alert(
    alert_id: UUID,
    acknowledge_data: AlertAcknowledge,
    current_user: Caregiver = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Acknowledge and optionally resolve an alert
    """
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )

    # Check access
    relationship = db.query(PatientCaregiverRelationship).filter(
        PatientCaregiverRelationship.patient_id == alert.patient_id,
        PatientCaregiverRelationship.caregiver_id == current_user.id
    ).first()

    if not relationship:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this alert"
        )

    # Update alert
    alert.is_resolved = acknowledge_data.is_resolved
    alert.acknowledged_by_caregiver_id = current_user.id
    alert.acknowledged_at = datetime.utcnow()

    db.commit()
    db.refresh(alert)

    return alert


# ===== INSIGHT ENDPOINTS =====

@router.post("/patients/{patient_id}/insights", response_model=InsightResponse, status_code=status.HTTP_201_CREATED)
def create_insight(
    patient_id: UUID,
    insight_data: InsightCreate,
    current_user: Caregiver = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a patient insight

    - Usually called by Letta analysis
    - Can be manually created by caregiver
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

    # Create insight
    new_insight = PatientInsight(
        patient_id=patient_id,
        insight_type=insight_data.insight_type,
        title=insight_data.title,
        description=insight_data.description,
        letta_analysis=insight_data.letta_analysis,
        confidence_score=insight_data.confidence_score
    )

    db.add(new_insight)
    db.commit()
    db.refresh(new_insight)

    return new_insight


@router.get("/patients/{patient_id}/insights", response_model=List[InsightResponse])
def list_insights(
    patient_id: UUID,
    insight_type: Optional[str] = Query(None),
    min_confidence: float = Query(0.0, ge=0.0, le=1.0),
    current_user: Caregiver = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get insights for a patient

    - Optionally filter by type
    - Optionally filter by minimum confidence score
    - Returns most recent first
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
    query = db.query(PatientInsight).filter(PatientInsight.patient_id == patient_id)

    if insight_type:
        query = query.filter(PatientInsight.insight_type == insight_type)

    query = query.filter(PatientInsight.confidence_score >= min_confidence)

    insights = query.order_by(PatientInsight.created_at.desc()).all()

    return insights
