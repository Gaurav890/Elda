"""
Mobile App Testing Seed Data
Creates a complete test patient with valid setup token for mobile app testing

Run with:
    python -m app.seeds.mobile_test_seed

This will create:
- 1 Test patient (Grandma Betty) with valid setup token
- 1 Caregiver (Sarah Miller - daughter)
- 5 Medication schedules (morning, afternoon, evening)
- 3 Meal schedules (breakfast, lunch, dinner)
- Recent activity logs
- Sample conversations
- Reminders (completed and missed)
"""

import sys
import os
from pathlib import Path
from datetime import datetime, timedelta, time
from typing import List
import uuid
import secrets
from passlib.context import CryptContext

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from sqlalchemy.orm import Session
from app.database.session import SessionLocal
from app.models import (
    Patient,
    Caregiver,
    Schedule,
    Reminder,
    Conversation,
    ActivityLog,
    PatientCaregiverRelationship
)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def generate_setup_token() -> str:
    """Generate a secure setup token"""
    return secrets.token_urlsafe(32)


def create_test_patient(db: Session) -> Patient:
    """
    Create test patient: Grandma Betty
    """
    print("\n👵 Creating test patient...")

    # Generate setup token (valid for 7 days)
    setup_token = generate_setup_token()
    setup_token_expires = datetime.utcnow() + timedelta(days=7)

    patient = Patient(
        id=uuid.uuid4(),
        first_name="Betty",
        last_name="Johnson",
        preferred_name="Grandma Betty",
        date_of_birth=datetime(1945, 5, 15).date(),
        gender="female",
        phone_number="+1-555-0123",
        address="123 Maple Street, Springfield, IL 62701",
        emergency_contact_name="Sarah Miller (Daughter)",
        emergency_contact_phone="+1-555-0124",

        # Medical info
        medical_conditions=["Type 2 Diabetes", "Hypertension", "Mild Arthritis"],
        medications=[
            "Metformin 500mg - twice daily",
            "Lisinopril 10mg - once daily",
            "Aspirin 81mg - once daily"
        ],
        allergies=["Penicillin"],
        dietary_restrictions=["Low sodium", "Diabetic-friendly"],

        # Personal context for AI
        personal_context={
            "family": {
                "children": ["Sarah (daughter)", "Mike (son)"],
                "grandchildren": 4,
                "spouse": "Deceased (2020)"
            },
            "hobbies": ["Gardening", "Reading mystery novels", "Watching cooking shows"],
            "favorite_foods": ["Homemade soup", "Apple pie", "Chicken"],
            "important_dates": {
                "birthday": "May 15",
                "anniversary": "June 20"
            },
            "personality": "Warm, independent, sometimes forgetful but good-humored about it",
            "communication_preferences": "Likes jokes, enjoys talking about family"
        },

        # Personalization
        profile_photo_url=None,
        timezone="America/Chicago",
        preferred_voice="female",
        communication_style="friendly",
        language="en",

        # Mobile setup - VALID TOKEN FOR TESTING
        setup_token=setup_token,
        setup_token_expires=setup_token_expires,
        device_setup_completed=False,
        device_platform=None,

        # Status
        is_active=True,
        notes="Test patient for mobile app development. Setup token is valid and ready for QR code scanning.",

        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    db.add(patient)
    db.commit()
    db.refresh(patient)

    print(f"✅ Created patient: {patient.full_name}")
    print(f"   Patient ID: {patient.id}")
    print(f"   Setup Token: {setup_token}")
    print(f"   Token Expires: {setup_token_expires}")
    print(f"\n📱 QR CODE DATA:")
    print(f'   {{"patient_id": "{patient.id}", "setup_token": "{setup_token}"}}')

    return patient


def create_test_caregiver(db: Session, patient: Patient) -> Caregiver:
    """
    Create test caregiver: Sarah Miller (daughter)
    """
    print("\n👩 Creating test caregiver...")

    # Hash password: "test123"
    hashed_password = pwd_context.hash("test123")

    caregiver = Caregiver(
        id=uuid.uuid4(),
        email="sarah.miller@example.com",
        hashed_password=hashed_password,
        first_name="Sarah",
        last_name="Miller",
        phone_number="+1-555-0124",
        role="family",

        # Notification preferences
        sms_notifications_enabled=True,
        email_notifications_enabled=True,
        push_notifications_enabled=True,

        preferences={
            "notifications": {
                "email": True,
                "sms": True,
                "push": True
            },
            "alert_threshold": "medium",
            "quiet_hours": {
                "enabled": True,
                "start": "22:00",
                "end": "07:00"
            },
            "daily_summary_time": "20:00"
        },

        is_active=True,
        is_verified=True,
        last_login_at=datetime.utcnow() - timedelta(hours=2),

        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    db.add(caregiver)
    db.commit()
    db.refresh(caregiver)

    # Create relationship
    relationship = PatientCaregiverRelationship(
        patient_id=patient.id,
        caregiver_id=caregiver.id,
        relationship_type="family",
        is_primary=True,
        created_at=datetime.utcnow()
    )

    db.add(relationship)
    db.commit()

    print(f"✅ Created caregiver: {caregiver.full_name}")
    print(f"   Email: {caregiver.email}")
    print(f"   Password: test123")
    print(f"   Relationship: Daughter (Primary)")

    return caregiver


def create_medication_schedules(db: Session, patient: Patient) -> List[Schedule]:
    """
    Create medication schedules
    """
    print("\n💊 Creating medication schedules...")

    schedules = []

    medications = [
        {
            "title": "Take morning medication",
            "medication_name": "Metformin",
            "dosage": "500mg",
            "instructions": "Take with breakfast",
            "scheduled_time": time(8, 0),
            "reminder_advance_minutes": 5
        },
        {
            "title": "Take morning blood pressure medication",
            "medication_name": "Lisinopril",
            "dosage": "10mg",
            "instructions": "Take with water",
            "scheduled_time": time(8, 30),
            "reminder_advance_minutes": 5
        },
        {
            "title": "Take afternoon medication",
            "medication_name": "Metformin",
            "dosage": "500mg",
            "instructions": "Take with lunch",
            "scheduled_time": time(13, 0),
            "reminder_advance_minutes": 5
        },
        {
            "title": "Take evening medication",
            "medication_name": "Metformin",
            "dosage": "500mg",
            "instructions": "Take with dinner",
            "scheduled_time": time(18, 0),
            "reminder_advance_minutes": 10
        },
        {
            "title": "Take aspirin",
            "medication_name": "Aspirin",
            "dosage": "81mg",
            "instructions": "Take with food",
            "scheduled_time": time(20, 0),
            "reminder_advance_minutes": 5
        }
    ]

    for med in medications:
        schedule = Schedule(
            id=uuid.uuid4(),
            patient_id=patient.id,
            type="medication",
            title=med["title"],
            description=f"{med['medication_name']} {med['dosage']}",
            medication_name=med["medication_name"],
            dosage=med["dosage"],
            instructions=med["instructions"],
            scheduled_time=med["scheduled_time"],
            recurrence_pattern="daily",
            days_of_week=[0, 1, 2, 3, 4, 5, 6],  # All days
            reminder_advance_minutes=med["reminder_advance_minutes"],
            is_active=True,
            context={"important": True, "frequency": "daily"},
            start_date=datetime.utcnow() - timedelta(days=30),
            end_date=None,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        db.add(schedule)
        schedules.append(schedule)

    db.commit()

    print(f"✅ Created {len(schedules)} medication schedules")
    for s in schedules:
        print(f"   • {s.title} at {s.scheduled_time.strftime('%I:%M %p')}")

    return schedules


def create_meal_schedules(db: Session, patient: Patient) -> List[Schedule]:
    """
    Create meal schedules
    """
    print("\n🍽️  Creating meal schedules...")

    schedules = []

    meals = [
        {
            "title": "Breakfast time",
            "description": "Time for a healthy breakfast",
            "scheduled_time": time(7, 30),
            "reminder_advance_minutes": 15
        },
        {
            "title": "Lunch time",
            "description": "Time for lunch",
            "scheduled_time": time(12, 30),
            "reminder_advance_minutes": 15
        },
        {
            "title": "Dinner time",
            "description": "Time for dinner",
            "scheduled_time": time(17, 30),
            "reminder_advance_minutes": 15
        }
    ]

    for meal in meals:
        schedule = Schedule(
            id=uuid.uuid4(),
            patient_id=patient.id,
            type="meal",
            title=meal["title"],
            description=meal["description"],
            scheduled_time=meal["scheduled_time"],
            recurrence_pattern="daily",
            days_of_week=[0, 1, 2, 3, 4, 5, 6],  # All days
            reminder_advance_minutes=meal["reminder_advance_minutes"],
            is_active=True,
            context={"meal_type": meal["title"].split()[0].lower()},
            start_date=datetime.utcnow() - timedelta(days=30),
            end_date=None,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        db.add(schedule)
        schedules.append(schedule)

    db.commit()

    print(f"✅ Created {len(schedules)} meal schedules")
    for s in schedules:
        print(f"   • {s.title} at {s.scheduled_time.strftime('%I:%M %p')}")

    return schedules


def create_sample_conversations(db: Session, patient: Patient) -> int:
    """
    Create sample conversations from the past week
    """
    print("\n💬 Creating sample conversations...")

    conversations_data = [
        {
            "patient_message": "Good morning! I just took my medication.",
            "ai_response": "Good morning, Grandma Betty! That's wonderful. I'm so proud of you for staying on top of your medications. How are you feeling today?",
            "sentiment": "positive",
            "health_mentions": ["medication taken"],
            "urgency_level": "none",
            "days_ago": 0,
            "hour": 8
        },
        {
            "patient_message": "My knee is hurting a bit today.",
            "ai_response": "I'm sorry to hear about your knee, Betty. Is it the same knee that bothers you after gardening? Have you tried resting it?",
            "sentiment": "concerned",
            "health_mentions": ["knee pain"],
            "urgency_level": "low",
            "days_ago": 1,
            "hour": 14
        },
        {
            "patient_message": "I talked to Sarah today. She's coming to visit this weekend!",
            "ai_response": "How wonderful! I know how much you love spending time with Sarah. That will be a lovely visit!",
            "sentiment": "positive",
            "health_mentions": [],
            "urgency_level": "none",
            "days_ago": 2,
            "hour": 15
        },
        {
            "patient_message": "I forgot to take my afternoon pills yesterday.",
            "ai_response": "Thank you for letting me know, Betty. That happens sometimes. Let's make sure you take them today. I'll remind you a little earlier. Should I notify Sarah about this?",
            "sentiment": "neutral",
            "health_mentions": ["missed medication"],
            "urgency_level": "medium",
            "days_ago": 3,
            "hour": 10
        },
        {
            "patient_message": "Can you tell me a joke?",
            "ai_response": "Of course! Why don't scientists trust atoms? Because they make up everything! Did that make you smile?",
            "sentiment": "positive",
            "health_mentions": [],
            "urgency_level": "none",
            "days_ago": 4,
            "hour": 16
        }
    ]

    count = 0
    now = datetime.utcnow()

    for conv_data in conversations_data:
        created_at = now - timedelta(days=conv_data["days_ago"], hours=24-conv_data["hour"])

        conversation = Conversation(
            id=uuid.uuid4(),
            patient_id=patient.id,
            conversation_type="spontaneous",
            patient_message=conv_data["patient_message"],
            ai_response=conv_data["ai_response"],
            letta_context={"mood": conv_data["sentiment"]},
            chroma_similar_conversations=[],
            claude_analysis={
                "sentiment": conv_data["sentiment"],
                "health_mentions": conv_data["health_mentions"],
                "urgency": conv_data["urgency_level"]
            },
            sentiment=conv_data["sentiment"],
            health_mentions=conv_data["health_mentions"],
            urgency_level=conv_data["urgency_level"],
            response_time_seconds=1.2,
            conversation_continued=False,
            created_at=created_at
        )

        db.add(conversation)
        count += 1

    db.commit()

    print(f"✅ Created {count} sample conversations")
    return count


def create_recent_activity_logs(db: Session, patient: Patient) -> int:
    """
    Create recent activity logs (past 7 days)
    """
    print("\n🏃 Creating recent activity logs...")

    count = 0
    now = datetime.utcnow()

    # Create heartbeats for the past 7 days (2-4 per day)
    for days_ago in range(7):
        for _ in range(3):
            hour = [8, 14, 20][_]
            logged_at = (now - timedelta(days=days_ago)).replace(hour=hour, minute=0, second=0, microsecond=0)

            activity_log = ActivityLog(
                id=uuid.uuid4(),
                patient_id=patient.id,
                activity_type="heartbeat",
                details={
                    "battery_level": 85,
                    "app_state": "active",
                    "network_type": "wifi"
                },
                device_type="ios",
                app_version="1.0.0",
                battery_level=85,
                logged_at=logged_at
            )

            db.add(activity_log)
            count += 1

    db.commit()

    print(f"✅ Created {count} activity logs")
    return count


def main():
    """
    Main execution function
    """
    print("=" * 70)
    print("📱 MOBILE APP TESTING SEED DATA")
    print("=" * 70)
    print("\nThis will create a complete test environment for mobile app testing:")
    print("  • 1 Test patient (Grandma Betty) with VALID setup token")
    print("  • 1 Caregiver (Sarah Miller - daughter)")
    print("  • 5 Medication schedules")
    print("  • 3 Meal schedules")
    print("  • Sample conversations")
    print("  • Recent activity logs")
    print("\n" + "=" * 70)

    # Get database session
    db = SessionLocal()

    try:
        # Create all test data
        patient = create_test_patient(db)
        caregiver = create_test_caregiver(db, patient)
        medication_schedules = create_medication_schedules(db, patient)
        meal_schedules = create_meal_schedules(db, patient)
        conversations_count = create_sample_conversations(db, patient)
        activity_count = create_recent_activity_logs(db, patient)

        # Summary
        print("\n" + "=" * 70)
        print("🎉 MOBILE TESTING SEED COMPLETE!")
        print("=" * 70)

        print(f"\n📊 Summary:")
        print(f"   • Patient: {patient.full_name} ({patient.id})")
        print(f"   • Caregiver: {caregiver.full_name} ({caregiver.email})")
        print(f"   • Medication schedules: {len(medication_schedules)}")
        print(f"   • Meal schedules: {len(meal_schedules)}")
        print(f"   • Conversations: {conversations_count}")
        print(f"   • Activity logs: {activity_count}")

        print(f"\n🔑 Mobile App Credentials:")
        print(f"   Patient ID: {patient.id}")
        print(f"   Setup Token: {patient.setup_token}")
        print(f"   Token Expires: {patient.setup_token_expires}")

        print(f"\n📱 QR Code JSON (for SetupScreen.tsx):")
        print(f'   {{"patient_id": "{patient.id}", "setup_token": "{patient.setup_token}"}}')

        print(f"\n👤 Caregiver Login (for web dashboard):")
        print(f"   Email: {caregiver.email}")
        print(f"   Password: test123")

        print("\n✅ Database is ready for mobile app testing!")
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
