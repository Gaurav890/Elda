#!/usr/bin/env python3
"""
Quick test script to create a reminder that triggers soon
This allows testing the proactive voice check-in feature without waiting
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
    """Create a test reminder that's due in 2 minutes"""

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
            schedule_id=None,  # No schedule, just a test reminder
            title="Test Medication Reminder",
            description="Take your test medication",
            due_at=due_time,
            status="pending",
            type="medication"
        )

        db.add(reminder)
        db.commit()
        db.refresh(reminder)

        print("✅ Test reminder created successfully!")
        print(f"\n📋 Reminder Details:")
        print(f"   Patient: {patient.full_name} ({patient.preferred_name})")
        print(f"   Title: {reminder.title}")
        print(f"   Due at: {reminder.due_at} UTC")
        print(f"   Local time: {(datetime.now() + timedelta(minutes=2)).strftime('%I:%M:%S %p')}")
        print(f"   Status: {reminder.status}")
        print(f"   ID: {reminder.id}")
        print(f"\n⏰ Timeline:")
        print(f"   Now: Initial notification won't fire (created after due time)")
        print(f"   +2 min: Reminder becomes past due")
        print(f"   +17 min: First retry (15 min after due)")
        print(f"   +22 min: Second retry with voice check-in 🎙️")
        print(f"   +27 min: Third retry with voice check-in 🎙️")
        print(f"\n💡 To test immediately:")
        print(f"   Option A: Wait 17 minutes for first retry")
        print(f"   Option B: I'll create a reminder that's already past due")

if __name__ == "__main__":
    create_test_reminder()
