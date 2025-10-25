"""
Background job for generating daily summaries
Runs once per day (typically at midnight or early morning)
"""

import logging
from datetime import datetime, timedelta, date as datetime_date
import asyncio

from app.database.session import SessionLocal
from app.models.patient import Patient
from app.models.daily_summary import DailySummary
from app.services.ai_orchestrator import ai_orchestrator

logger = logging.getLogger(__name__)


def generate_daily_summaries():
    """
    Generate daily summaries for all active patients

    Typically called at midnight to summarize the previous day
    """
    # Run async function in sync context
    asyncio.run(async_generate_daily_summaries())


async def async_generate_daily_summaries():
    """
    Async version of daily summary generation
    """
    db = SessionLocal()

    try:
        logger.info("Starting daily summary generation job")

        # Get yesterday's date
        yesterday = datetime.now().date() - timedelta(days=1)

        # Get all active patients with recent activity
        cutoff_date = datetime.now() - timedelta(days=7)  # Active in last 7 days

        active_patients = db.query(Patient).filter(
            Patient.last_active_at >= cutoff_date
        ).all()

        logger.info(f"Found {len(active_patients)} active patients")

        summaries_created = 0
        summaries_skipped = 0
        summaries_failed = 0

        for patient in active_patients:
            try:
                # Check if summary already exists for yesterday
                existing_summary = db.query(DailySummary).filter(
                    DailySummary.patient_id == patient.id,
                    DailySummary.summary_date == yesterday
                ).first()

                if existing_summary:
                    logger.info(f"Summary already exists for patient {patient.id} on {yesterday}")
                    summaries_skipped += 1
                    continue

                # Generate summary
                logger.info(f"Generating summary for patient {patient.id} ({patient.first_name} {patient.last_name})")

                result = await ai_orchestrator.generate_daily_summary_for_patient(
                    patient_id=str(patient.id),
                    db=db,
                    summary_date=yesterday
                )

                if result.get("success"):
                    # Create summary record
                    new_summary = DailySummary(
                        patient_id=patient.id,
                        summary_date=yesterday,
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

                    summaries_created += 1
                    logger.info(f"Successfully created summary for patient {patient.id}")

                else:
                    logger.error(f"Failed to generate summary for patient {patient.id}: {result.get('error')}")
                    summaries_failed += 1

            except Exception as e:
                logger.error(f"Error generating summary for patient {patient.id}: {str(e)}", exc_info=True)
                summaries_failed += 1
                db.rollback()
                continue

        logger.info(
            f"Daily summary generation complete. "
            f"Created: {summaries_created}, Skipped: {summaries_skipped}, Failed: {summaries_failed}"
        )

    except Exception as e:
        logger.error(f"Error in daily summary generation job: {str(e)}", exc_info=True)

    finally:
        db.close()


def generate_weekly_insights():
    """
    Generate weekly behavioral insights using Letta's long-term memory

    Runs once per week (typically on Monday morning)
    """
    asyncio.run(async_generate_weekly_insights())


async def async_generate_weekly_insights():
    """
    Async version of weekly insights generation
    """
    db = SessionLocal()

    try:
        logger.info("Starting weekly insights generation job")

        # Get all patients with Letta agents
        patients_with_agents = db.query(Patient).filter(
            Patient.letta_agent_id.isnot(None)
        ).all()

        logger.info(f"Found {len(patients_with_agents)} patients with Letta agents")

        insights_created = 0

        for patient in patients_with_agents:
            try:
                from app.models.insight import PatientInsight
                from app.models.conversation import Conversation
                from app.services.letta_service import letta_service

                # Get recent conversations (last 7 days)
                week_ago = datetime.now() - timedelta(days=7)
                recent_conversations = db.query(Conversation).filter(
                    Conversation.patient_id == patient.id,
                    Conversation.created_at >= week_ago
                ).order_by(Conversation.created_at.desc()).limit(20).all()

                if len(recent_conversations) < 3:
                    logger.info(f"Not enough conversations for patient {patient.id}, skipping insights")
                    continue

                # Format conversation data
                conversation_data = [
                    {
                        "created_at": conv.created_at,
                        "sentiment": conv.sentiment,
                        "health_mentions": conv.health_mentions,
                        "urgency_level": conv.urgency_level
                    }
                    for conv in recent_conversations
                ]

                # Build patient context
                patient_context = {
                    "first_name": patient.first_name,
                    "age": patient.age,
                    "medical_conditions": patient.medical_conditions,
                    "medications": patient.medications
                }

                # Generate insight using Letta
                insight_result = await letta_service.generate_insight(
                    agent_id=patient.letta_agent_id,
                    patient_context=patient_context,
                    recent_conversations=conversation_data
                )

                if insight_result.get("success"):
                    # Create insight record
                    new_insight = PatientInsight(
                        patient_id=patient.id,
                        insight_type="behavioral_pattern",
                        title="Weekly Behavioral Insight",
                        description=insight_result["insight_text"],
                        letta_analysis=insight_result.get("memory_context", {}),
                        confidence_score=insight_result.get("confidence_score", 0.7)
                    )

                    db.add(new_insight)
                    db.commit()

                    insights_created += 1
                    logger.info(f"Created weekly insight for patient {patient.id}")

            except Exception as e:
                logger.error(f"Error generating insight for patient {patient.id}: {str(e)}", exc_info=True)
                db.rollback()
                continue

        logger.info(f"Weekly insights generation complete. Created {insights_created} insights")

    except Exception as e:
        logger.error(f"Error in weekly insights generation job: {str(e)}", exc_info=True)

    finally:
        db.close()
