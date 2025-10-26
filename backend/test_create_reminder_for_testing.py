#!/usr/bin/env python3
"""
Test script to manually create a reminder for testing acknowledgment flow
Run this to test the complete reminder → acknowledgment → dashboard display flow
"""

import sys
import os
from datetime import datetime, timedelta

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database.session import SessionLocal
from app.models.reminder import Reminder
from app.models.patient import Patient
from app.models.schedule import Schedule
from app.services.communication.firebase_service import firebase_service
import asyncio

def create_test_reminder():
    """
    Create a test reminder due in 2 minutes from now
    This allows you to test the acknowledgment flow without waiting for the scheduler
    """
    db = SessionLocal()

    try:
        # Get first active patient
        patient = db.query(Patient).filter(
            Patient.device_setup_completed == True,
            Patient.device_token != None
        ).first()

        if not patient:
            print("❌ No active patients with device tokens found!")
            print("Please ensure:")
            print("  1. Patient has completed mobile app setup")
            print("  2. Patient has registered FCM token")
            return

        print(f"✅ Found patient: {patient.full_name} (ID: {patient.id})")
        print(f"   Device token: {patient.device_token[:20]}...")

        # Get first active schedule (or create a dummy one)
        schedule = db.query(Schedule).filter(
            Schedule.patient_id == patient.id,
            Schedule.is_active == True
        ).first()

        if not schedule:
            print("⚠️  No active schedules found. Creating a test schedule...")
            schedule = Schedule(
                patient_id=patient.id,
                type="medication",
                title="Test Medication",
                description="This is a test reminder",
                scheduled_time=datetime.now().time(),
                recurrence_pattern="daily",
                days_of_week=[0, 1, 2, 3, 4, 5, 6],
                reminder_advance_minutes=5,
                is_active=True
            )
            db.add(schedule)
            db.commit()
            db.refresh(schedule)
            print(f"✅ Created test schedule: {schedule.title}")
        else:
            print(f"✅ Using existing schedule: {schedule.title}")

        # Create reminder due in 2 minutes
        now = datetime.now()
        due_at = now + timedelta(minutes=2)

        reminder = Reminder(
            patient_id=patient.id,
            schedule_id=schedule.id,
            title=f"[TEST] {schedule.title}",
            message="This is a test reminder to test acknowledgment flow",
            due_at=due_at,
            status="pending",
            retry_count=0,
            max_retries=3
        )

        db.add(reminder)
        db.commit()
        db.refresh(reminder)

        print(f"\n🎉 Test reminder created successfully!")
        print(f"   Reminder ID: {reminder.id}")
        print(f"   Title: {reminder.title}")
        print(f"   Due at: {due_at.strftime('%I:%M %p')}")
        print(f"   Status: {reminder.status}")

        # Send push notification immediately
        print(f"\n📤 Sending push notification to mobile app...")

        speak_text = f"Hi! This is a test reminder for {schedule.title}. Please acknowledge it by tapping the checkmark button."

        # Send notification
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        success = loop.run_until_complete(
            firebase_service.send_reminder(
                device_token=patient.device_token,
                reminder_id=str(reminder.id),
                speak_text=speak_text,
                reminder_type=schedule.type,
                title=reminder.title,
                due_at=due_at.isoformat(),
                scheduled_time=schedule.scheduled_time.strftime("%H:%M"),
                requires_response=True
            )
        )

        loop.close()

        if success:
            print("✅ Push notification sent successfully!")
            print(f"\n📱 Check your mobile app:")
            print(f"   1. You should see a push notification")
            print(f"   2. HomeScreen should show the reminder with a ✓ button")
            print(f"   3. Tap the ✓ to acknowledge")
            print(f"   4. Check dashboard timeline for completion status")
            print(f"\n🧪 To test retry logic:")
            print(f"   - Don't acknowledge the reminder")
            print(f"   - Wait 15 minutes")
            print(f"   - Backend will retry (max 3 times)")
            print(f"   - After 3 retries, an alert will be created for caregiver")
        else:
            print("❌ Failed to send push notification")
            print("   Check Firebase credentials and device token")

        print(f"\n💡 Reminder acknowledgment endpoint:")
        print(f"   PUT /api/v1/mobile/reminders/{reminder.id}/acknowledge")
        print(f"   Body: {{ \"status\": \"completed\" }}")

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    print("=" * 70)
    print("TEST REMINDER CREATOR")
    print("=" * 70)
    print()
    create_test_reminder()
    print()
    print("=" * 70)
