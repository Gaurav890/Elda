"""
Create upcoming reminders for testing
"""
import sys
from pathlib import Path
from datetime import datetime, timedelta, time as dt_time
import uuid

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from app.database.session import SessionLocal
from app.models.patient import Patient
from app.models.schedule import Schedule
from app.models.reminder import Reminder

db = SessionLocal()

try:
    # Get all patients with schedules
    patients = db.query(Patient).all()
    print(f"Found {len(patients)} patients\n")

    now = datetime.utcnow()
    reminders_created = 0

    for patient in patients:
        print(f"Creating reminders for {patient.full_name}...")

        # Get active schedules for this patient
        schedules = db.query(Schedule).filter(
            Schedule.patient_id == patient.id,
            Schedule.is_active == True
        ).all()

        print(f"  Found {len(schedules)} active schedules")

        # Create reminders for the next 24 hours
        for schedule in schedules:
            # Create 3 reminders: in 5 min, 2 hours, 6 hours
            for offset_minutes in [5, 120, 360]:
                due_at = now + timedelta(minutes=offset_minutes)

                # Check if reminder already exists
                existing = db.query(Reminder).filter(
                    Reminder.schedule_id == schedule.id,
                    Reminder.due_at == due_at
                ).first()

                if not existing:
                    reminder = Reminder(
                        id=uuid.uuid4(),
                        patient_id=patient.id,
                        schedule_id=schedule.id,
                        title=schedule.title,
                        message=f"{schedule.title}. {schedule.description or ''}",
                        due_at=due_at,
                        status="pending",
                        delivery_method="push",
                        max_retries=2,
                        retry_count=0,
                        created_at=now,
                        updated_at=now
                    )
                    db.add(reminder)
                    reminders_created += 1
                    print(f"    ✅ Created reminder for {schedule.title} at {due_at.strftime('%H:%M')}")

    db.commit()
    print(f"\n✅ Created {reminders_created} upcoming reminders")

except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    db.rollback()
finally:
    db.close()
