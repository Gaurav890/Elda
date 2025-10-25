"""
Comprehensive Seed Data Script
Creates realistic test data for all backend endpoints

Run with:
    python -m app.seeds.comprehensive_seed

This will populate:
- 30+ activity logs (spanning 30 days)
- 10+ patient insights (varying confidence)
- 20+ conversations (with sentiment data)
- 15+ reminders (completed and missed)
- 5+ alerts (various severities)
- 3-5 caregiver notes per patient
"""

import sys
import os
from pathlib import Path
from datetime import datetime, timedelta
from typing import List
import uuid
import random

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from sqlalchemy.orm import Session
from app.database.session import SessionLocal
from app.models import (
    Patient,
    Caregiver,
    CaregiverNote,
    ActivityLog,
    PatientInsight,
    Conversation,
    Reminder,
    Alert
)


# ============================================================================
# CONFIGURATION
# ============================================================================

# Existing IDs from database
TEST_PATIENT_IDS = [
    "4c7389e0-9485-487a-9dde-59c14ab97d67",  # Khina maya
    "0a25b63d-eb49-4ba5-b2fa-9f1594162a7a"   # Test Patient
]

TEST_CAREGIVER_ID = "7b915bd8-c634-46e4-9250-7ce1b5a4add0"  # test@example.com


# ============================================================================
# HELPER DATA
# ============================================================================

# Activity types and their probabilities
ACTIVITY_TYPES = [
    ("heartbeat", 0.4),
    ("conversation", 0.2),
    ("reminder_response", 0.15),
    ("app_open", 0.1),
    ("app_close", 0.1),
    ("emergency", 0.02),
    ("location_update", 0.03)
]

# Conversation templates
PATIENT_MESSAGES = [
    "Good morning! How are you today?",
    "I took my medication",
    "I'm feeling a bit tired",
    "My knee hurts a little",
    "Can you remind me what time dinner is?",
    "I had a nice walk today",
    "I'm feeling good today",
    "I forgot to take my pills this morning",
    "I had trouble sleeping last night",
    "I talked to my daughter today",
    "The weather is nice today",
    "I'm feeling dizzy",
    "I need help with something",
    "What day is it today?",
    "I miss my family",
    "I'm worried about my appointment",
    "Can you tell me a joke?",
    "I ate all my breakfast",
    "I don't want to take my medicine",
    "Thank you for checking on me"
]

AI_RESPONSES = [
    "Good morning! I'm glad to hear from you. How did you sleep?",
    "That's wonderful! Great job staying on top of your medications.",
    "I understand. Make sure to rest and let your caregiver know if it gets worse.",
    "I'm sorry to hear that. Have you tried the pain relief we discussed?",
    "Dinner is at 6 PM. Would you like me to remind you closer to that time?",
    "That's excellent! Regular walks are great for your health.",
    "I'm so happy to hear that! What made today special?",
    "That's okay, you can take them now. Let me notify your caregiver.",
    "I'm sorry to hear that. What kept you awake?",
    "How wonderful! I'm sure she was happy to hear from you.",
    "Would you like to sit by the window and enjoy it?",
    "Let's take this seriously. I'm going to notify your caregiver right away.",
    "Of course! What do you need help with?",
    "Today is {day}. Is there something you're trying to remember?",
    "I know. Would you like to call them?",
    "Your appointment is coming up. Everything will be fine.",
    "Why did the scarecrow win an award? Because he was outstanding in his field!",
    "That's wonderful! Good nutrition is so important.",
    "I understand it's not pleasant, but it helps you stay healthy.",
    "You're very welcome! I'm always here for you."
]

SENTIMENTS = ["positive", "neutral", "negative", "concerned", "distressed"]
SENTIMENT_WEIGHTS = [0.4, 0.3, 0.15, 0.1, 0.05]

HEALTH_MENTIONS_OPTIONS = [
    [],
    ["medication taken"],
    ["feeling tired"],
    ["knee pain"],
    ["dizzy"],
    ["trouble sleeping"],
    ["headache"],
    ["chest pain"],
    ["good mood"],
    ["ate well"]
]

# Insight templates
INSIGHT_TYPES = ["pattern", "preference", "health_trend", "behavior", "communication", "recommendation"]
INSIGHT_CATEGORIES = ["medication", "mood", "activity", "communication", "health", "general"]

INSIGHT_TEMPLATES = [
    ("pattern", "medication", "Forgets evening medications", "Patient has missed evening medications 3 times in the past week", 0.85, 3),
    ("preference", "communication", "Prefers morning conversations", "Patient is more responsive and cheerful during morning interactions", 0.92, 12),
    ("health_trend", "mood", "Mood improves after walks", "Patient reports better mood and energy after daily walks", 0.78, 8),
    ("behavior", "activity", "More active in the mornings", "Patient shows higher activity levels between 8 AM and 11 AM", 0.88, 15),
    ("pattern", "health", "Reports knee pain after activity", "Patient mentions knee discomfort after extended walking or standing", 0.73, 5),
    ("preference", "general", "Likes to talk about family", "Patient frequently brings up stories about children and grandchildren", 0.95, 20),
    ("recommendation", "medication", "Benefits from gentle reminders", "Patient responds well to friendly, non-urgent medication reminders", 0.81, 10),
    ("health_trend", "activity", "Sleeps better with evening routine", "Patient reports improved sleep when following consistent evening routine", 0.76, 6),
    ("behavior", "communication", "Responds to humor positively", "Patient's mood lifts noticeably when conversation includes light humor", 0.83, 14),
    ("pattern", "medication", "Takes morning meds reliably", "Patient consistently takes morning medications without reminders", 0.94, 25),
    ("preference", "general", "Enjoys weather updates", "Patient frequently asks about weather and likes to discuss it", 0.71, 9),
    ("health_trend", "health", "Appetite varies with mood", "Patient eats less when reporting feeling sad or tired", 0.79, 7)
]

# Reminder templates
REMINDER_TITLES = [
    "Take morning medication",
    "Take evening medication",
    "Take afternoon medication",
    "Time for breakfast",
    "Time for lunch",
    "Time for dinner",
    "Drink water",
    "Take a walk",
    "Call family member",
    "Doctor appointment reminder"
]

REMINDER_STATUSES = ["completed", "missed", "completed", "completed", "missed"]  # 60% completed, 40% missed

# Alert templates
ALERT_TEMPLATES = [
    ("missed_medications", "high", "3 missed medications today", "Patient has missed 3 medication reminders today", "missed_reminders"),
    ("inactivity", "medium", "No activity for 4 hours", "Patient has not shown any activity for 4 hours", "inactivity_detection"),
    ("health_concern", "high", "Patient reports dizziness", "Patient reported feeling dizzy during conversation", "ai_analysis"),
    ("emergency", "critical", "Emergency button pressed", "Patient pressed the emergency button", "emergency_button"),
    ("unusual_pattern", "medium", "Unusual sleep pattern detected", "Patient slept during the day for 3 hours", "ai_analysis"),
    ("health_concern", "low", "Patient reports mild discomfort", "Patient mentioned mild knee discomfort", "ai_analysis"),
    ("missed_medications", "medium", "Missed evening medication", "Patient missed evening medication reminder", "missed_reminders")
]

ALERT_SEVERITIES = ["low", "medium", "high", "critical"]

# Note templates
NOTE_CATEGORIES = ["medical", "behavioral", "preferences", "routine", "safety", "family"]
NOTE_TEMPLATES = [
    ("medical", "important", "New medication prescribed", "Doctor prescribed Lisinopril 10mg for blood pressure. Take once daily in morning."),
    ("preferences", "normal", "Prefers to be called by nickname", "Patient prefers to be called 'Maggie' rather than 'Margaret'."),
    ("behavioral", "important", "Gets anxious about medication", "Patient shows anxiety when reminded about medications. Use calm, reassuring tone."),
    ("routine", "normal", "Morning routine preference", "Patient likes to have breakfast at 8 AM, prefers tea over coffee."),
    ("family", "normal", "Daughter visits on weekends", "Daughter Sarah visits every Saturday afternoon around 2 PM."),
    ("safety", "important", "Falls risk when rushing", "Patient tends to rush to the door when someone knocks. Remind to take time."),
    ("medical", "normal", "Allergic to penicillin", "Patient has confirmed penicillin allergy. Use alternative antibiotics if needed."),
    ("preferences", "normal", "Enjoys gardening shows", "Patient loves watching gardening shows in the afternoon."),
    ("behavioral", "normal", "Better mood after music", "Patient's mood improves when listening to classical music."),
    ("routine", "normal", "Evening routine", "Patient prefers to watch news at 6 PM before dinner.")
]


# ============================================================================
# SEED FUNCTIONS
# ============================================================================

def seed_activity_logs(db: Session, patient_ids: List[str], days: int = 30) -> int:
    """
    Seed activity logs spanning multiple days

    Args:
        db: Database session
        patient_ids: List of patient IDs
        days: Number of days to span (default 30)

    Returns:
        Number of activity logs created
    """
    print(f"\n🏃 Seeding activity logs for {days} days...")

    count = 0
    now = datetime.utcnow()

    for patient_id in patient_ids:
        # Create activity logs for each day
        for day_offset in range(days):
            day_start = now - timedelta(days=day_offset)

            # 2-6 activities per day (random)
            num_activities = random.randint(2, 6)

            for _ in range(num_activities):
                # Random time during the day
                hour = random.randint(6, 22)
                minute = random.randint(0, 59)
                logged_at = day_start.replace(hour=hour, minute=minute, second=0, microsecond=0)

                # Choose activity type based on weights
                activity_type = random.choices(
                    [a[0] for a in ACTIVITY_TYPES],
                    weights=[a[1] for a in ACTIVITY_TYPES]
                )[0]

                # Generate appropriate details
                details = {}
                if activity_type == "heartbeat":
                    details = {"battery_level": random.randint(20, 100)}
                elif activity_type == "conversation":
                    details = {"duration_seconds": random.randint(30, 180)}
                elif activity_type == "reminder_response":
                    details = {"response": random.choice(["taken", "completed", "acknowledged"])}
                elif activity_type == "emergency":
                    details = {"reason": "Emergency button pressed", "location_known": True}

                activity_log = ActivityLog(
                    id=uuid.uuid4(),
                    patient_id=uuid.UUID(patient_id),
                    activity_type=activity_type,
                    details=details,
                    device_type=random.choice(["iOS", "Android"]),
                    app_version="1.0.0",
                    battery_level=random.randint(20, 100) if random.random() > 0.5 else None,
                    logged_at=logged_at
                )

                db.add(activity_log)
                count += 1

    db.commit()
    print(f"✅ Created {count} activity logs")
    return count


def seed_patient_insights(db: Session, patient_ids: List[str]) -> int:
    """
    Seed patient insights with varying confidence levels

    Args:
        db: Database session
        patient_ids: List of patient IDs

    Returns:
        Number of insights created
    """
    print(f"\n💡 Seeding patient insights...")

    count = 0
    now = datetime.utcnow()

    for patient_id in patient_ids:
        # Each patient gets 5-7 insights
        num_insights = random.randint(5, 7)

        # Use templates
        selected_templates = random.sample(INSIGHT_TEMPLATES, min(num_insights, len(INSIGHT_TEMPLATES)))

        for template in selected_templates:
            insight_type, category, title, description, confidence, evidence = template

            # Vary the confidence a bit
            confidence = min(1.0, max(0.5, confidence + random.uniform(-0.1, 0.1)))

            # Random observation date within last 30 days
            days_ago = random.randint(3, 30)
            first_observed = now - timedelta(days=days_ago)

            insight = PatientInsight(
                id=uuid.uuid4(),
                patient_id=uuid.UUID(patient_id),
                insight_type=insight_type,
                category=category,
                title=title,
                description=description,
                confidence_score=round(confidence, 2),
                evidence_count=evidence,
                supporting_data=[
                    {
                        "date": (now - timedelta(days=i*3)).strftime("%Y-%m-%d"),
                        "observation": f"Supporting evidence #{i+1}"
                    }
                    for i in range(min(3, evidence))
                ],
                is_actionable=random.choice([True, False]),
                suggested_action=f"Consider adjusting care plan based on this {insight_type}" if random.random() > 0.5 else None,
                generated_by="letta",
                letta_query_used=f"Analyze patient behavior patterns related to {category}",
                is_active=True,
                first_observed_at=first_observed,
                generated_at=now - timedelta(days=random.randint(0, 5))
            )

            db.add(insight)
            count += 1

    db.commit()
    print(f"✅ Created {count} patient insights")
    return count


def seed_conversations(db: Session, patient_ids: List[str], count: int = 20) -> int:
    """
    Seed conversations with sentiment data

    Args:
        db: Database session
        patient_ids: List of patient IDs
        count: Number of conversations per patient

    Returns:
        Number of conversations created
    """
    print(f"\n💬 Seeding conversations...")

    total_count = 0
    now = datetime.utcnow()

    for patient_id in patient_ids:
        # Each patient gets 10-15 conversations over the past 30 days
        num_conversations = random.randint(10, 15)

        for i in range(num_conversations):
            # Random time within past 30 days
            days_ago = random.randint(0, 30)
            hours_ago = random.randint(0, 23)
            created_at = now - timedelta(days=days_ago, hours=hours_ago)

            # Pick random message pair
            patient_message = random.choice(PATIENT_MESSAGES)
            ai_response = random.choice(AI_RESPONSES).replace("{day}", created_at.strftime("%A"))

            # Sentiment based on message content
            if any(word in patient_message.lower() for word in ["hurt", "pain", "dizzy", "worried", "forgot"]):
                sentiment = random.choices(["concerned", "negative", "neutral"], weights=[0.5, 0.3, 0.2])[0]
                urgency = random.choices(["low", "medium", "high"], weights=[0.3, 0.5, 0.2])[0]
            elif any(word in patient_message.lower() for word in ["good", "nice", "happy", "thank"]):
                sentiment = random.choices(["positive", "neutral"], weights=[0.7, 0.3])[0]
                urgency = "none"
            else:
                sentiment = random.choices(SENTIMENTS, weights=SENTIMENT_WEIGHTS)[0]
                urgency = random.choices(["none", "low", "medium"], weights=[0.6, 0.3, 0.1])[0]

            # Health mentions
            health_mentions = []
            if any(word in patient_message.lower() for word in ["medication", "pills", "medicine"]):
                health_mentions.append("medication taken" if "took" in patient_message.lower() else "medication concern")
            if any(word in patient_message.lower() for word in ["hurt", "pain"]):
                health_mentions.append("pain reported")
            if "dizzy" in patient_message.lower():
                health_mentions.append("dizziness")
            if any(word in patient_message.lower() for word in ["tired", "sleep"]):
                health_mentions.append("fatigue or sleep issue")

            conversation = Conversation(
                id=uuid.uuid4(),
                patient_id=uuid.UUID(patient_id),
                conversation_type=random.choice(["spontaneous", "reminder_response", "check_in"]),
                patient_message=patient_message,
                ai_response=ai_response,
                letta_context={
                    "recent_patterns": ["Patient has been active today"],
                    "mood": sentiment
                },
                chroma_similar_conversations=[],
                claude_analysis={
                    "sentiment": sentiment,
                    "health_mentions": health_mentions,
                    "urgency": urgency
                },
                sentiment=sentiment,
                health_mentions=health_mentions,
                urgency_level=urgency,
                response_time_seconds=round(random.uniform(0.5, 3.0), 2),
                conversation_continued=random.choice([True, False]),
                created_at=created_at
            )

            db.add(conversation)
            total_count += 1

    db.commit()
    print(f"✅ Created {total_count} conversations")
    return total_count


def seed_reminders(db: Session, patient_ids: List[str]) -> int:
    """
    Seed reminders (completed and missed)

    Args:
        db: Database session
        patient_ids: List of patient IDs

    Returns:
        Number of reminders created
    """
    print(f"\n⏰ Seeding reminders...")

    count = 0
    now = datetime.utcnow()

    for patient_id in patient_ids:
        # Each patient gets 7-10 reminders over past 7 days
        num_reminders = random.randint(7, 10)

        for i in range(num_reminders):
            # Random time within past 7 days
            days_ago = random.randint(0, 7)
            hour = random.choice([8, 12, 14, 18, 20])  # Common reminder times
            due_at = (now - timedelta(days=days_ago)).replace(hour=hour, minute=0, second=0, microsecond=0)

            # Random title
            title = random.choice(REMINDER_TITLES)

            # Status (60% completed, 40% missed)
            status = random.choice(REMINDER_STATUSES)

            # Set timestamps based on status
            sent_at = due_at
            delivered_at = sent_at + timedelta(seconds=random.randint(1, 10))

            if status == "completed":
                completed_at = delivered_at + timedelta(minutes=random.randint(1, 30))
                patient_response = random.choice([
                    "Done, thank you",
                    "Just took it",
                    "All set",
                    "Completed",
                    "Yes, I took my medication"
                ])
                completion_confirmed = True
            else:
                completed_at = None
                patient_response = None
                completion_confirmed = False

            reminder = Reminder(
                id=uuid.uuid4(),
                patient_id=uuid.UUID(patient_id),
                schedule_id=None,  # Not linking to schedules for now
                title=title,
                message=f"This is a reminder to {title.lower()}",
                due_at=due_at,
                sent_at=sent_at,
                delivered_at=delivered_at,
                completed_at=completed_at,
                snoozed_until=None,
                status=status,
                delivery_method="push",
                patient_response=patient_response,
                ai_analysis=f"Patient acknowledged and {status} the reminder" if status == "completed" else None,
                completion_confirmed=completion_confirmed,
                retry_count=1 if status == "missed" else 0,
                max_retries=3
            )

            db.add(reminder)
            count += 1

    db.commit()
    print(f"✅ Created {count} reminders")
    return count


def seed_alerts(db: Session, patient_ids: List[str], caregiver_id: str) -> int:
    """
    Seed alerts with various severities

    Args:
        db: Database session
        patient_ids: List of patient IDs
        caregiver_id: Caregiver ID for acknowledged alerts

    Returns:
        Number of alerts created
    """
    print(f"\n🚨 Seeding alerts...")

    count = 0
    now = datetime.utcnow()

    for patient_id in patient_ids:
        # Each patient gets 2-4 alerts
        num_alerts = random.randint(2, 4)

        # Select random alert templates
        selected_templates = random.sample(ALERT_TEMPLATES, min(num_alerts, len(ALERT_TEMPLATES)))

        for template in selected_templates:
            alert_type, severity, title, description, triggered_by = template

            # Random time within past 14 days
            days_ago = random.randint(0, 14)
            hours_ago = random.randint(0, 23)
            created_at = now - timedelta(days=days_ago, hours=hours_ago)

            # Status: 70% acknowledged, 30% active
            status = random.choices(["active", "acknowledged", "resolved"], weights=[0.2, 0.5, 0.3])[0]

            # Set acknowledged info if not active
            acknowledged_by_id = uuid.UUID(caregiver_id) if status != "active" else None
            acknowledged_at = created_at + timedelta(hours=random.randint(1, 12)) if status != "active" else None
            resolved_at = acknowledged_at + timedelta(hours=random.randint(1, 24)) if status == "resolved" else None

            alert = Alert(
                id=uuid.uuid4(),
                patient_id=uuid.UUID(patient_id),
                acknowledged_by=acknowledged_by_id,
                alert_type=alert_type,
                severity=severity,
                title=title,
                description=description,
                recommended_action=f"Please check on patient and {alert_type.replace('_', ' ')}",
                triggered_by=triggered_by,
                status=status,
                created_at=created_at,
                acknowledged_at=acknowledged_at,
                resolved_at=resolved_at,
                sms_sent=random.choice([True, False]),
                email_sent=True if severity in ["high", "critical"] else False,
                push_sent=True,
                phone_call_made=True if severity == "critical" else False,
                escalation_level=2 if severity == "critical" else 1
            )

            db.add(alert)
            count += 1

    db.commit()
    print(f"✅ Created {count} alerts")
    return count


def seed_caregiver_notes(db: Session, patient_ids: List[str], caregiver_id: str) -> int:
    """
    Seed caregiver notes (3-5 per patient)

    Args:
        db: Database session
        patient_ids: List of patient IDs
        caregiver_id: Caregiver ID

    Returns:
        Number of notes created
    """
    print(f"\n📝 Seeding caregiver notes...")

    count = 0
    now = datetime.utcnow()

    for patient_id in patient_ids:
        # Each patient gets 3-5 notes
        num_notes = random.randint(3, 5)

        # Select random note templates
        selected_templates = random.sample(NOTE_TEMPLATES, min(num_notes, len(NOTE_TEMPLATES)))

        for i, template in enumerate(selected_templates):
            category, priority, title, content = template

            # Random creation time within past 60 days
            days_ago = random.randint(1, 60)
            created_at = now - timedelta(days=days_ago)

            note = CaregiverNote(
                id=uuid.uuid4(),
                patient_id=uuid.UUID(patient_id),
                caregiver_id=uuid.UUID(caregiver_id),
                title=title,
                content=content,
                category=category,
                priority=priority,
                created_at=created_at,
                updated_at=created_at
            )

            db.add(note)
            count += 1

    db.commit()
    print(f"✅ Created {count} caregiver notes")
    return count


# ============================================================================
# MAIN EXECUTION
# ============================================================================

def main():
    """
    Main execution function
    """
    print("=" * 70)
    print("🌱 COMPREHENSIVE SEED DATA SCRIPT")
    print("=" * 70)
    print("\nThis will populate the database with realistic test data:")
    print("  • 30+ activity logs per patient (spanning 30 days)")
    print("  • 10+ patient insights with varying confidence")
    print("  • 20+ conversations with sentiment data")
    print("  • 15+ reminders (completed and missed)")
    print("  • 5+ alerts (various severities)")
    print("  • 3-5 caregiver notes per patient")
    print("\n" + "=" * 70)

    # Get database session
    db = SessionLocal()

    try:
        # Verify patients exist
        print(f"\n🔍 Verifying test data exists...")
        patients = db.query(Patient).filter(Patient.id.in_([uuid.UUID(pid) for pid in TEST_PATIENT_IDS])).all()

        if len(patients) != len(TEST_PATIENT_IDS):
            print(f"❌ Error: Expected {len(TEST_PATIENT_IDS)} patients, found {len(patients)}")
            print(f"   Looking for IDs: {TEST_PATIENT_IDS}")
            return

        caregiver = db.query(Caregiver).filter(Caregiver.id == uuid.UUID(TEST_CAREGIVER_ID)).first()
        if not caregiver:
            print(f"❌ Error: Test caregiver not found (ID: {TEST_CAREGIVER_ID})")
            return

        print(f"✅ Found {len(patients)} patients and test caregiver")
        for patient in patients:
            print(f"   • {patient.first_name} {patient.last_name} ({patient.id})")

        # Start seeding
        print("\n" + "=" * 70)
        print("🚀 STARTING SEED PROCESS")
        print("=" * 70)

        total_records = 0

        # Seed each type of data
        total_records += seed_activity_logs(db, TEST_PATIENT_IDS, days=30)
        total_records += seed_patient_insights(db, TEST_PATIENT_IDS)
        total_records += seed_conversations(db, TEST_PATIENT_IDS)
        total_records += seed_reminders(db, TEST_PATIENT_IDS)
        total_records += seed_alerts(db, TEST_PATIENT_IDS, TEST_CAREGIVER_ID)
        total_records += seed_caregiver_notes(db, TEST_PATIENT_IDS, TEST_CAREGIVER_ID)

        # Summary
        print("\n" + "=" * 70)
        print("🎉 SEED COMPLETE!")
        print("=" * 70)
        print(f"\n📊 Total records created: {total_records}")
        print("\n✅ Database is now populated with comprehensive test data")
        print("   You can now test all backend endpoints with realistic data!")
        print("\n" + "=" * 70)

    except Exception as e:
        print(f"\n❌ Error during seeding: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    main()
