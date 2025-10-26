#!/usr/bin/env python3
"""
Instant test script - creates a reminder that's already 16 minutes overdue
This means the retry system will fire within 1 minute!
"""

import sys
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

# Add parent directory to path to import app modules
sys.path.insert(0, '/Users/gaurav/Elda/backend')

from app.models.patient import Patient
from app.models.reminder import Reminder
from app.core.config import settings

# Create database engine
engine = create_engine(settings.DATABASE_URL)

def create_instant_test_reminder():
    """Create a test reminder that's already 16 minutes overdue - will retry in ~1 minute!"""

    with Session(engine) as db:
        # Get first active patient
        patient = db.query(Patient).filter(
            Patient.device_setup_completed == True
        ).first()

        if not patient:
            print("❌ No patients found with completed device setup")
            print("Please set up the mobile app first")
            return

        # Create reminder that's already 16 minutes past due
        # The retry job runs every 5 minutes and looks for reminders >15 min overdue
        due_time = datetime.utcnow() - timedelta(minutes=16)

        reminder = Reminder(
            patient_id=patient.id,
            schedule_id=None,  # No schedule, just a test reminder
            title="🧪 INSTANT Test Medication",
            message="Take your blood pressure medication",
            due_at=due_time,
            status="pending",
            retry_count=0,
            max_retries=3
        )

        db.add(reminder)
        db.commit()
        db.refresh(reminder)

        print("✅ INSTANT test reminder created successfully!")
        print(f"\n📋 Reminder Details:")
        print(f"   Patient: {patient.full_name} ({patient.preferred_name})")
        print(f"   Patient ID: {patient.id}")
        print(f"   Has device token: {'✅ Yes' if patient.device_token else '❌ No'}")
        print(f"   Title: {reminder.title}")
        print(f"   Due at: {reminder.due_at} UTC (16 minutes ago)")
        print(f"   Status: {reminder.status}")
        print(f"   Retry count: {reminder.retry_count}/{reminder.max_retries}")
        print(f"   ID: {reminder.id}")
        print(f"\n⚡ INSTANT TESTING:")
        print(f"   The retry job runs every 5 minutes")
        print(f"   This reminder is already 16 minutes overdue (threshold is 15 min)")
        print(f"   Next retry job will send notification with voice_check_in flag!")
        print(f"\n🎯 Expected behavior:")
        print(f"   1. Within ~1-5 minutes: Push notification arrives")
        print(f"   2. App automatically opens VoiceChat screen")
        print(f"   3. AI speaks: 'Hi! I noticed you haven't responded...'")
        print(f"   4. Mic starts listening automatically")
        print(f"\n💡 Note: If no device token, check that:")
        print(f"   - Mobile app is set up")
        print(f"   - Firebase credentials are configured")
        print(f"   - Device token was registered")

if __name__ == "__main__":
    create_instant_test_reminder()
