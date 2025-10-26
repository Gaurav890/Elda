#!/usr/bin/env python3
"""
Test script for local notification retries (no Firebase/Apple Developer needed!)

Creates a reminder due in 2 minutes. When you open the mobile app:
1. App fetches this reminder
2. Schedules 4 local notifications:
   - 0 min (2 min from now): Initial notification
   - 15 min later: Retry 1 with voice_check_in
   - 20 min later: Retry 2 with voice_check_in
   - 25 min later: Retry 3 with voice_check_in

When you tap a retry notification, it auto-opens VoiceChat and AI speaks first!
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

def create_test_reminder():
    """Create a test reminder due in 2 minutes"""

    with Session(engine) as db:
        # Get first active patient
        patient = db.query(Patient).filter(
            Patient.device_setup_completed == True
        ).first()

        if not patient:
            print("❌ No patients found with completed device setup")
            print("Please set up the mobile app first")
            return

        # Create reminder due in 2 minutes
        due_time = datetime.utcnow() + timedelta(minutes=2)

        reminder = Reminder(
            patient_id=patient.id,
            schedule_id=None,  # No schedule needed for local notifications
            title="🧪 Local Notification Test",
            message="Take your test medication",
            due_at=due_time,
            status="pending",
            retry_count=0,
            max_retries=3
        )

        db.add(reminder)
        db.commit()
        db.refresh(reminder)

        print("✅ LOCAL NOTIFICATION test reminder created successfully!")
        print(f"\n📋 Reminder Details:")
        print(f"   Patient: {patient.full_name} ({patient.preferred_name})")
        print(f"   Patient ID: {patient.id}")
        print(f"   Title: {reminder.title}")
        print(f"   Due at: {reminder.due_at} UTC")
        print(f"   Local time: {(datetime.now() + timedelta(minutes=2)).strftime('%I:%M:%S %p')}")
        print(f"   Status: {reminder.status}")
        print(f"   ID: {reminder.id}")

        print(f"\n📱 TESTING INSTRUCTIONS:")
        print(f"   1. Open the mobile app on your iPhone")
        print(f"   2. App will fetch this reminder and schedule 4 local notifications:")
        print(f"      - Initial: {(datetime.now() + timedelta(minutes=2)).strftime('%I:%M %p')}")
        print(f"      - Retry 1: {(datetime.now() + timedelta(minutes=17)).strftime('%I:%M %p')} (with voice check-in)")
        print(f"      - Retry 2: {(datetime.now() + timedelta(minutes=22)).strftime('%I:%M %p')} (with voice check-in)")
        print(f"      - Retry 3: {(datetime.now() + timedelta(minutes=27)).strftime('%I:%M %p')} (with voice check-in)")
        print(f"   3. Wait for notifications to fire")
        print(f"   4. Tap a retry notification → Should auto-open VoiceChat")
        print(f"   5. AI should speak first: 'Hi! I noticed you haven't responded...'")

        print(f"\n✨ FEATURES BEING TESTED:")
        print(f"   ✅ No Apple Developer account needed!")
        print(f"   ✅ No Firebase push notifications needed!")
        print(f"   ✅ Pure local notifications (@notifee)")
        print(f"   ✅ Pre-scheduled retry notifications")
        print(f"   ✅ Voice check-in auto-opens VoiceChat")
        print(f"   ✅ AI speaks first on retry notifications")
        print(f"   ✅ Retries cancelled when reminder completed")

        print(f"\n💡 TIP: Complete the reminder by tapping checkmark in the app")
        print(f"         This will cancel all pending retry notifications!")

if __name__ == "__main__":
    create_test_reminder()
