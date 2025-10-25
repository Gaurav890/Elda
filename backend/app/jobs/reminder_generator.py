"""
Background job for generating reminders from schedules
Runs every minute to check for upcoming scheduled items
"""

import logging
from datetime import datetime, timedelta, time as datetime_time
from sqlalchemy.orm import Session

from app.database.session import SessionLocal
from app.models.schedule import Schedule
from app.models.reminder import Reminder

logger = logging.getLogger(__name__)


def generate_reminders_from_schedules():
    """
    Generate reminders for upcoming scheduled items

    Checks all active schedules and creates reminders for items due within the next hour
    """
    db = SessionLocal()

    try:
        logger.info("Starting reminder generation job")

        # Get current time
        now = datetime.now()
        current_time = now.time()
        current_weekday = now.weekday()  # 0 = Monday, 6 = Sunday

        # Look ahead window (1 hour)
        look_ahead_window = now + timedelta(hours=1)

        # Get all active schedules
        active_schedules = db.query(Schedule).filter(
            Schedule.is_active == True
        ).all()

        reminders_created = 0

        for schedule in active_schedules:
            try:
                # Check if schedule applies today
                if not _schedule_applies_today(schedule, current_weekday):
                    continue

                # Calculate when reminder should be sent
                scheduled_datetime = _combine_date_and_time(now.date(), schedule.scheduled_time)
                reminder_datetime = scheduled_datetime - timedelta(minutes=schedule.reminder_advance_minutes)

                # Check if reminder should be created (within the next hour)
                if now <= reminder_datetime <= look_ahead_window:
                    # Check if reminder already exists for this schedule today
                    existing_reminder = db.query(Reminder).filter(
                        Reminder.schedule_id == schedule.id,
                        Reminder.due_at >= now.replace(hour=0, minute=0, second=0, microsecond=0),
                        Reminder.due_at < now.replace(hour=23, minute=59, second=59, microsecond=999999)
                    ).first()

                    if not existing_reminder:
                        # Create new reminder
                        new_reminder = Reminder(
                            patient_id=schedule.patient_id,
                            schedule_id=schedule.id,
                            title=schedule.title,
                            description=schedule.description,
                            due_at=reminder_datetime
                        )

                        db.add(new_reminder)
                        reminders_created += 1

                        logger.info(
                            f"Created reminder for patient {schedule.patient_id}: "
                            f"{schedule.title} at {reminder_datetime}"
                        )

            except Exception as e:
                logger.error(f"Error processing schedule {schedule.id}: {str(e)}", exc_info=True)
                continue

        # Commit all reminders
        db.commit()

        logger.info(f"Reminder generation job complete. Created {reminders_created} reminders")

    except Exception as e:
        logger.error(f"Error in reminder generation job: {str(e)}", exc_info=True)
        db.rollback()

    finally:
        db.close()


def check_and_mark_missed_reminders():
    """
    Check for reminders that are past due and mark them as missed
    """
    db = SessionLocal()

    try:
        logger.info("Checking for missed reminders")

        now = datetime.now()

        # Get pending reminders that are past due (more than 30 minutes late)
        late_threshold = now - timedelta(minutes=30)

        missed_reminders = db.query(Reminder).filter(
            Reminder.status == "pending",
            Reminder.due_at < late_threshold
        ).all()

        missed_count = 0

        for reminder in missed_reminders:
            reminder.status = "missed"
            missed_count += 1
            logger.warning(f"Marked reminder {reminder.id} as missed for patient {reminder.patient_id}")

        db.commit()

        logger.info(f"Marked {missed_count} reminders as missed")

    except Exception as e:
        logger.error(f"Error checking missed reminders: {str(e)}", exc_info=True)
        db.rollback()

    finally:
        db.close()


def _schedule_applies_today(schedule: Schedule, current_weekday: int) -> bool:
    """
    Check if a schedule applies to the current day

    Args:
        schedule: Schedule object
        current_weekday: Current day of week (0 = Monday, 6 = Sunday)

    Returns:
        bool: True if schedule applies today
    """
    if schedule.recurrence_pattern == "daily":
        return True
    elif schedule.recurrence_pattern == "weekly":
        return current_weekday in schedule.days_of_week
    elif schedule.recurrence_pattern == "custom":
        return current_weekday in schedule.days_of_week

    return False


def _combine_date_and_time(date, time):
    """Combine date and time objects into datetime"""
    return datetime.combine(date, time)
