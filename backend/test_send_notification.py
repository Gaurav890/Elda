#!/usr/bin/env python3
"""
Test sending a push notification to a patient
Useful for testing without waiting for scheduled reminders
"""

import asyncio
from datetime import datetime
from app.database.session import SessionLocal
from app.models.patient import Patient
from app.services.communication.firebase_service import firebase_service

async def test_send_notification(patient_id: str = None):
    """Send a test notification to a patient"""
    db = SessionLocal()

    try:
        # Get patient
        if patient_id:
            patient = db.query(Patient).filter(Patient.id == patient_id).first()
        else:
            # Get first patient with device token
            patient = db.query(Patient).filter(
                Patient.device_token.isnot(None),
                Patient.device_token != ""
            ).first()

        if not patient:
            print("❌ No patient found with device token")
            return

        if not patient.device_token:
            print(f"❌ Patient {patient.full_name} has no device token")
            return

        print(f"\n📱 Sending test notification to: {patient.full_name}")
        print(f"   Patient ID: {patient.id}")
        print(f"   Device Token: {patient.device_token[:20]}...")

        # Send test notification
        success = await firebase_service.send_reminder(
            device_token=patient.device_token,
            reminder_id="test-123",
            speak_text="Hello! This is a test notification from the Elder Companion AI system.",
            reminder_type="test",
            title="Test Reminder",
            due_at=datetime.now().isoformat(),
            scheduled_time=datetime.now().strftime("%H:%M"),
            requires_response=False
        )

        if success:
            print("\n✅ Notification sent successfully!")
            print("\n⚠️  NOTE: Without APNs key, notification won't arrive on device")
            print("   But backend processed it correctly!")
        else:
            print("\n❌ Failed to send notification")
            print("   Check backend logs for details")

    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()

    finally:
        db.close()


if __name__ == "__main__":
    import sys

    patient_id = sys.argv[1] if len(sys.argv) > 1 else None

    if patient_id:
        print(f"Testing with patient ID: {patient_id}")
    else:
        print("Testing with first patient that has device token")

    asyncio.run(test_send_notification(patient_id))
