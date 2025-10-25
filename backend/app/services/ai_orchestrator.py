"""
AI Orchestration Service
Coordinates Claude, Letta, and Chroma services for complete AI-powered conversations
"""

from typing import Dict, Any, List, Optional
import logging
import time
from datetime import datetime
from sqlalchemy.orm import Session

from app.services.claude_service import claude_service
from app.services.letta_service import letta_service
from app.services.chroma_service import chroma_service
from app.models.conversation import Conversation
from app.models.patient import Patient
from app.models.alert import Alert

logger = logging.getLogger(__name__)


class AIOrchestrator:
    """
    Orchestrates all AI services for complete voice interactions
    Coordinates: Claude (real-time), Letta (memory), Chroma (semantic search)
    """

    def __init__(self):
        """Initialize orchestrator"""
        self.claude = claude_service
        self.letta = letta_service
        self.chroma = chroma_service
        logger.info("AI Orchestrator initialized")

    async def process_voice_interaction(
        self,
        patient_id: str,
        patient_message: str,
        db: Session,
        conversation_type: str = "spontaneous"
    ) -> Dict[str, Any]:
        """
        Complete AI-powered voice interaction pipeline

        Pipeline:
        1. Get patient context from database
        2. Search Chroma for similar past conversations
        3. Get Letta memory context
        4. Send to Claude for response generation
        5. Update Letta memory
        6. Store in Chroma for future semantic search
        7. Save to database
        8. Check for alerts

        Args:
            patient_id: Patient UUID
            patient_message: Transcribed patient speech
            db: Database session
            conversation_type: Type of conversation

        Returns:
            Dict containing:
            - ai_response: Text to speak back
            - conversation_id: Created conversation ID
            - urgency_level: Detected urgency
            - alert_created: Whether an alert was created
            - response_time: Processing time in seconds
        """
        start_time = time.time()

        try:
            # 1. Get patient context
            patient = db.query(Patient).filter(Patient.id == patient_id).first()
            if not patient:
                logger.error(f"Patient {patient_id} not found")
                return {
                    "ai_response": "I'm having trouble accessing your information. Please contact your caregiver.",
                    "error": "Patient not found",
                    "response_time": time.time() - start_time
                }

            patient_context = self._build_patient_context(patient)

            # 2. Search Chroma for similar conversations (parallel with Letta)
            similar_conversations = await self.chroma.search_similar_conversations(
                patient_id=str(patient_id),
                query_message=patient_message,
                n_results=3
            )

            # 3. Get Letta memory context (if agent exists)
            letta_context = {}
            if patient.letta_agent_id:
                letta_result = await self.letta.send_message_to_agent(
                    agent_id=patient.letta_agent_id,
                    message=f"Patient said: {patient_message}",
                    conversation_context={"type": conversation_type}
                )
                letta_context = letta_result.get("memory_context", {})

            # 4. Get recent conversation history for Claude
            recent_conversations = db.query(Conversation).filter(
                Conversation.patient_id == patient_id
            ).order_by(Conversation.created_at.desc()).limit(5).all()

            conversation_history = [
                {
                    "patient_message": conv.patient_message,
                    "ai_response": conv.ai_response
                }
                for conv in reversed(recent_conversations)  # Oldest to newest
            ]

            # 5. Generate AI response with Claude
            claude_result = await self.claude.analyze_conversation(
                patient_message=patient_message,
                patient_context=patient_context,
                conversation_history=conversation_history
            )

            ai_response = claude_result.get("ai_response", "")
            sentiment = claude_result.get("sentiment", "neutral")
            health_mentions = claude_result.get("health_mentions", [])
            urgency_level = claude_result.get("urgency_level", "none")
            analysis = claude_result.get("analysis", "")

            # 6. Create conversation record
            new_conversation = Conversation(
                patient_id=patient_id,
                patient_message=patient_message,
                ai_response=ai_response,
                conversation_type=conversation_type,
                letta_context=letta_context,
                chroma_similar_conversations=similar_conversations,
                claude_analysis={"detailed_analysis": analysis},
                sentiment=sentiment,
                health_mentions=health_mentions,
                urgency_level=urgency_level,
                response_time_seconds=time.time() - start_time
            )

            db.add(new_conversation)
            db.flush()  # Get conversation ID

            # 7. Add to Chroma for future semantic search
            await self.chroma.add_conversation(
                conversation_id=str(new_conversation.id),
                patient_id=str(patient_id),
                patient_message=patient_message,
                ai_response=ai_response,
                metadata={
                    "sentiment": sentiment,
                    "health_mentions": health_mentions,
                    "urgency_level": urgency_level
                }
            )

            # 8. Check if alert should be created
            alert_created = False
            if urgency_level in ["high", "critical"]:
                alert = Alert(
                    patient_id=patient_id,
                    related_conversation_id=new_conversation.id,
                    alert_type="health_concern" if urgency_level == "high" else "emergency",
                    severity=urgency_level,
                    title=f"{'Emergency' if urgency_level == 'critical' else 'Health Concern'} Detected",
                    message=f"Patient mentioned: {patient_message[:200]}",
                    ai_recommendation=analysis
                )
                db.add(alert)
                alert_created = True
                logger.warning(f"Alert created for patient {patient_id} - urgency: {urgency_level}")

            db.commit()

            response_time = time.time() - start_time

            logger.info(f"Voice interaction processed for patient {patient_id} in {response_time:.2f}s")

            return {
                "ai_response": ai_response,
                "conversation_id": str(new_conversation.id),
                "sentiment": sentiment,
                "health_mentions": health_mentions,
                "urgency_level": urgency_level,
                "alert_created": alert_created,
                "response_time": response_time,
                "similar_conversations_found": len(similar_conversations),
                "success": True
            }

        except Exception as e:
            logger.error(f"Error in voice interaction pipeline: {str(e)}", exc_info=True)
            db.rollback()

            return {
                "ai_response": "I'm having some trouble right now. Let me alert your caregiver to help.",
                "error": str(e),
                "response_time": time.time() - start_time,
                "success": False
            }

    async def generate_daily_summary_for_patient(
        self,
        patient_id: str,
        db: Session,
        summary_date: datetime.date
    ) -> Dict[str, Any]:
        """
        Generate AI-powered daily summary for a patient

        Args:
            patient_id: Patient UUID
            db: Database session
            summary_date: Date to generate summary for

        Returns:
            Dict containing summary data
        """
        try:
            from app.models.reminder import Reminder
            from datetime import datetime, timedelta

            # Get patient
            patient = db.query(Patient).filter(Patient.id == patient_id).first()
            if not patient:
                logger.error(f"Patient {patient_id} not found")
                return {"success": False, "error": "Patient not found"}

            patient_context = self._build_patient_context(patient)

            # Get conversations for the day
            start_of_day = datetime.combine(summary_date, datetime.min.time())
            end_of_day = datetime.combine(summary_date, datetime.max.time())

            conversations = db.query(Conversation).filter(
                Conversation.patient_id == patient_id,
                Conversation.created_at >= start_of_day,
                Conversation.created_at <= end_of_day
            ).all()

            # Get reminders for the day
            reminders = db.query(Reminder).filter(
                Reminder.patient_id == patient_id,
                Reminder.due_at >= start_of_day,
                Reminder.due_at <= end_of_day
            ).all()

            # Format for Claude
            conversation_data = [
                {
                    "created_at": conv.created_at.strftime("%H:%M"),
                    "patient_message": conv.patient_message,
                    "sentiment": conv.sentiment,
                    "health_mentions": conv.health_mentions
                }
                for conv in conversations
            ]

            reminder_data = [
                {
                    "title": rem.title,
                    "status": rem.status,
                    "due_at": rem.due_at.strftime("%H:%M")
                }
                for rem in reminders
            ]

            # Generate summary with Claude
            summary_result = await self.claude.generate_daily_summary(
                conversations=conversation_data,
                reminders=reminder_data,
                patient_context=patient_context
            )

            # Calculate adherence rates
            total_reminders = len(reminders)
            completed_reminders = len([r for r in reminders if r.status == "completed"])
            medication_reminders = [r for r in reminders if r.title and "medication" in r.title.lower()]
            meal_reminders = [r for r in reminders if r.title and "meal" in r.title.lower()]

            medication_adherence = (
                len([r for r in medication_reminders if r.status == "completed"]) / len(medication_reminders) * 100
                if medication_reminders else 100.0
            )

            meal_adherence = (
                len([r for r in meal_reminders if r.status == "completed"]) / len(meal_reminders) * 100
                if meal_reminders else 100.0
            )

            overall_adherence = (
                completed_reminders / total_reminders * 100
                if total_reminders > 0 else 100.0
            )

            return {
                "summary": summary_result.get("summary", ""),
                "health_concerns": summary_result.get("health_concerns", []),
                "positive_highlights": summary_result.get("positive_highlights", []),
                "recommendations": summary_result.get("recommendations", []),
                "total_conversations": len(conversations),
                "reminder_adherence_rate": round(overall_adherence, 1),
                "medication_adherence_rate": round(medication_adherence, 1),
                "meal_adherence_rate": round(meal_adherence, 1),
                "success": True
            }

        except Exception as e:
            logger.error(f"Error generating daily summary: {str(e)}", exc_info=True)
            return {
                "success": False,
                "error": str(e)
            }

    async def initialize_patient_agent(
        self,
        patient_id: str,
        db: Session
    ) -> bool:
        """
        Initialize Letta agent for a new patient

        Args:
            patient_id: Patient UUID
            db: Database session

        Returns:
            bool: Success status
        """
        try:
            patient = db.query(Patient).filter(Patient.id == patient_id).first()
            if not patient:
                return False

            # Check if agent already exists
            if patient.letta_agent_id:
                logger.info(f"Patient {patient_id} already has Letta agent {patient.letta_agent_id}")
                return True

            # Create patient context
            patient_context = self._build_patient_context(patient)

            # Create Letta agent
            agent_id = await self.letta.create_agent_for_patient(
                patient_id=str(patient_id),
                patient_context=patient_context
            )

            if agent_id:
                # Update patient record
                patient.letta_agent_id = agent_id
                db.commit()
                logger.info(f"Created Letta agent {agent_id} for patient {patient_id}")
                return True
            else:
                logger.error(f"Failed to create Letta agent for patient {patient_id}")
                return False

        except Exception as e:
            logger.error(f"Error initializing patient agent: {str(e)}", exc_info=True)
            db.rollback()
            return False

    def _build_patient_context(self, patient: Patient) -> Dict[str, Any]:
        """Build patient context dictionary for AI services"""
        return {
            "first_name": patient.first_name,
            "last_name": patient.last_name,
            "preferred_name": patient.preferred_name,
            "age": patient.age,
            "medical_conditions": patient.medical_conditions,
            "medications": patient.medications,
            "allergies": patient.allergies,
            "dietary_restrictions": patient.dietary_restrictions,
            "personal_context": patient.personal_context
        }


# Global instance
ai_orchestrator = AIOrchestrator()
