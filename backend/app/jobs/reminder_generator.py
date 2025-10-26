"""
Background job for generating reminders from schedules
Runs every minute to check for upcoming scheduled items
"""

import logging
import asyncio
from datetime import datetime, timedelta, time as datetime_time
from sqlalchemy.orm import Session

from app.database.session import SessionLocal
from app.models.schedule import Schedule
from app.models.reminder import Reminder
from app.models.patient import Patient
from app.models.alert import Alert
from app.services.communication.firebase_service import firebase_service

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
                        db.flush()  # Flush to get the reminder ID
                        reminders_created += 1

                        logger.info(
                            f"Created reminder for patient {schedule.patient_id}: "
                            f"{schedule.title} at {reminder_datetime}"
                        )

                        # Send push notification if patient has device token
                        patient = db.query(Patient).filter(Patient.id == schedule.patient_id).first()
                        if patient and patient.device_token:
                            _send_reminder_notification(
                                patient=patient,
                                reminder=new_reminder,
                                schedule=schedule
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

        now = datetime.utcnow()  # Use UTC to match database timestamps

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


def _send_reminder_notification(patient: Patient, reminder: Reminder, schedule: Schedule, is_retry: bool = False):
    """
    Send push notification for a reminder

    Args:
        patient: Patient object with device_token
        reminder: Reminder object
        schedule: Schedule object
        is_retry: If True, includes voice_check_in flag for proactive check-in
    """
    try:
        # Format notification message
        speak_text = _format_reminder_message(schedule, reminder)

        # Send notification using Firebase service
        # Run async function in sync context
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        # Add voice check-in flag for retry notifications
        extra_data = {}
        if is_retry:
            extra_data['voice_check_in'] = 'true'
            extra_data['retry_count'] = str(reminder.retry_count)
            logger.info(f"Sending retry notification with voice check-in flag (retry {reminder.retry_count})")

        success = loop.run_until_complete(
            firebase_service.send_reminder(
                device_token=patient.device_token,
                reminder_id=str(reminder.id),
                speak_text=speak_text,
                reminder_type=schedule.type,
                title=schedule.title,
                due_at=reminder.due_at.isoformat(),
                scheduled_time=schedule.scheduled_time.strftime("%H:%M"),
                requires_response=True,
                **extra_data
            )
        )

        loop.close()

        if success:
            logger.info(f"Push notification sent for reminder {reminder.id}")
        else:
            logger.warning(f"Failed to send push notification for reminder {reminder.id}")

    except Exception as e:
        logger.error(f"Error sending reminder notification: {e}", exc_info=True)


def _format_reminder_message(schedule: Schedule, reminder: Reminder) -> str:
    """
    Format a friendly reminder message for TTS

    Args:
        schedule: Schedule object
        reminder: Reminder object

    Returns:
        Formatted message string
    """
    # Get time in friendly format
    time_str = schedule.scheduled_time.strftime("%I:%M %p").lstrip("0")

    # Base message templates by schedule type
    templates = {
        "medication": f"Hi! It's time for your medication: {schedule.title}. This is scheduled for {time_str}.",
        "meal": f"Hi! It's time for {schedule.title}. This is scheduled for {time_str}.",
        "exercise": f"Hi! It's time for your exercise: {schedule.title}. This is scheduled for {time_str}.",
        "appointment": f"Hi! Reminder about your appointment: {schedule.title} at {time_str}.",
        "other": f"Hi! Reminder: {schedule.title} at {time_str}."
    }

    message = templates.get(schedule.type, templates["other"])

    # Add description if available
    if schedule.description:
        message += f" {schedule.description}"

    return message


def retry_unacknowledged_reminders():
    """
    Retry sending reminders that haven't been acknowledged

    Logic:
    - Find reminders that are pending and past due (>15 minutes after due_at)
    - If retry_count < max_retries (default 3):
      - Resend push notification
      - Increment retry_count
    - If retry_count >= max_retries:
      - Create MEDIUM alert for caregiver
      - Update reminder status to "missed"
    """
    db = SessionLocal()

    try:
        logger.info("Checking for unacknowledged reminders to retry")

        now = datetime.utcnow()  # Use UTC to match database timestamps
        retry_threshold = now - timedelta(minutes=15)

        # Get pending reminders that are past the retry threshold
        unacknowledged_reminders = db.query(Reminder).filter(
            Reminder.status == "pending",
            Reminder.due_at <= retry_threshold
        ).all()

        retried_count = 0
        alerts_created = 0

        for reminder in unacknowledged_reminders:
            try:
                # Check if reminder can be retried
                if reminder.can_retry:
                    # Increment retry count
                    reminder.retry_count += 1

                    logger.info(
                        f"Retrying reminder {reminder.id} for patient {reminder.patient_id} "
                        f"(attempt {reminder.retry_count}/{reminder.max_retries})"
                    )

                    # Get patient and schedule for notification
                    patient = db.query(Patient).filter(Patient.id == reminder.patient_id).first()
                    schedule = db.query(Schedule).filter(Schedule.id == reminder.schedule_id).first()

                    # Resend notification if patient has device token
                    if patient and patient.device_token and schedule:
                        _send_reminder_notification(patient, reminder, schedule, is_retry=True)
                        retried_count += 1
                    else:
                        logger.warning(
                            f"Cannot retry reminder {reminder.id}: "
                            f"patient or schedule not found, or no device token"
                        )

                else:
                    # Max retries reached - create alert for caregiver
                    if reminder.retry_count >= reminder.max_retries:
                        logger.warning(
                            f"Reminder {reminder.id} reached max retries. Creating alert for caregiver."
                        )

                        # Update reminder status to missed
                        reminder.status = "missed"

                        # Create alert for caregiver
                        schedule = db.query(Schedule).filter(Schedule.id == reminder.schedule_id).first()
                        patient = db.query(Patient).filter(Patient.id == reminder.patient_id).first()

                        if patient and schedule:
                            alert = Alert(
                                patient_id=reminder.patient_id,
                                alert_type="missed_medications" if schedule.type == "medication" else "missed_reminder",
                                severity="medium",
                                title=f"Unacknowledged reminder: {reminder.title}",
                                description=(
                                    f"{patient.full_name} has not acknowledged the reminder for "
                                    f"{reminder.title} (due at {reminder.due_at.strftime('%I:%M %p')}). "
                                    f"The system sent {reminder.retry_count} reminders with no response."
                                ),
                                recommended_action=(
                                    f"Please contact {patient.preferred_name or patient.full_name} to check if they "
                                    f"completed the task and ensure they are okay."
                                ),
                                triggered_by="reminder_retry_limit",
                                status="active"
                            )

                            db.add(alert)
                            alerts_created += 1

                            logger.info(f"Created MEDIUM alert for unacknowledged reminder {reminder.id}")

            except Exception as e:
                logger.error(f"Error processing reminder {reminder.id}: {str(e)}", exc_info=True)
                continue

        # Commit all changes
        db.commit()

        logger.info(
            f"Retry job complete. Retried {retried_count} reminders, "
            f"created {alerts_created} alerts"
        )

    except Exception as e:
        logger.error(f"Error in retry unacknowledged reminders job: {str(e)}", exc_info=True)
        db.rollback()

    finally:
        db.close()
