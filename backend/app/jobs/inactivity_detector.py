"""
Background job for detecting patient inactivity
Monitors heartbeat timestamps and creates alerts when patients are inactive
"""

import logging
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.database.session import SessionLocal
from app.models.patient import Patient
from app.models.activity_log import ActivityLog
from app.models.alert import Alert

logger = logging.getLogger(__name__)

# Inactivity thresholds (in hours)
INACTIVITY_WARNING_HOURS = 2      # Warning alert after 2 hours
INACTIVITY_HIGH_HOURS = 4          # High severity after 4 hours
INACTIVITY_CRITICAL_HOURS = 6      # Critical severity after 6 hours


def detect_patient_inactivity():
    """
    Check for inactive patients and create alerts

    Checks all active patients for recent heartbeat activity.
    Creates alerts based on inactivity duration:
    - 2 hours: Warning alert
    - 4 hours: High severity alert
    - 6 hours: Critical alert (escalate to emergency contact)

    Only creates one alert per patient per threshold to avoid spam.
    """
    db = SessionLocal()

    try:
        logger.info("Starting inactivity detection job")

        now = datetime.utcnow()

        # Define inactivity thresholds
        warning_threshold = now - timedelta(hours=INACTIVITY_WARNING_HOURS)
        high_threshold = now - timedelta(hours=INACTIVITY_HIGH_HOURS)
        critical_threshold = now - timedelta(hours=INACTIVITY_CRITICAL_HOURS)

        # Get all active patients
        active_patients = db.query(Patient).filter(
            Patient.is_active == True
        ).all()

        alerts_created = 0
        patients_checked = 0

        for patient in active_patients:
            try:
                patients_checked += 1

                # Get last activity (prefer last_heartbeat_at, fallback to last_active_at)
                last_activity = patient.last_heartbeat_at or patient.last_active_at

                # Skip if no activity recorded yet (new patient)
                if not last_activity:
                    logger.debug(f"Patient {patient.id} has no activity recorded yet, skipping")
                    continue

                # Check inactivity duration
                inactive_duration = now - last_activity
                inactive_hours = inactive_duration.total_seconds() / 3600

                # Determine severity based on duration
                severity = None
                alert_type = "inactivity"
                message = None

                if last_activity <= critical_threshold:
                    severity = "critical"
                    message = (
                        f"{patient.display_name} has been inactive for {inactive_hours:.1f} hours. "
                        f"Last activity: {last_activity.strftime('%Y-%m-%d %H:%M:%S UTC')}. "
                        f"This requires immediate attention."
                    )
                elif last_activity <= high_threshold:
                    severity = "high"
                    message = (
                        f"{patient.display_name} has been inactive for {inactive_hours:.1f} hours. "
                        f"Last activity: {last_activity.strftime('%Y-%m-%d %H:%M:%S UTC')}. "
                        f"Please check on the patient."
                    )
                elif last_activity <= warning_threshold:
                    severity = "medium"
                    message = (
                        f"{patient.display_name} has been inactive for {inactive_hours:.1f} hours. "
                        f"Last activity: {last_activity.strftime('%Y-%m-%d %H:%M:%S UTC')}."
                    )

                # If patient is inactive, check if alert already exists
                if severity:
                    # Check for existing unacknowledged inactivity alert
                    existing_alert = db.query(Alert).filter(
                        and_(
                            Alert.patient_id == patient.id,
                            Alert.alert_type == "inactivity",
                            Alert.severity == severity,
                            Alert.acknowledged_at.is_(None),  # Only check unacknowledged
                            Alert.created_at >= now - timedelta(hours=24)  # Within last 24 hours
                        )
                    ).first()

                    if existing_alert:
                        logger.debug(
                            f"Inactivity alert already exists for patient {patient.id} "
                            f"at severity {severity}"
                        )
                        continue

                    # Create recommended action
                    recommended_action = "Please check on the patient"
                    if severity == "critical" and patient.emergency_contact_name:
                        recommended_action = (
                            f"URGENT: Contact {patient.emergency_contact_name} "
                            f"at {patient.emergency_contact_phone} immediately."
                        )
                    elif severity == "high":
                        recommended_action = "Please call the patient or visit them soon."

                    # Create new alert
                    new_alert = Alert(
                        patient_id=patient.id,
                        alert_type=alert_type,
                        severity=severity,
                        title=f"Patient Inactivity: {patient.display_name}",
                        description=message,
                        recommended_action=recommended_action,
                        triggered_by="inactivity_detector"
                    )

                    db.add(new_alert)
                    alerts_created += 1

                    logger.warning(
                        f"Created {severity} inactivity alert for patient {patient.display_name} "
                        f"({patient.id}): {inactive_hours:.1f} hours inactive"
                    )

                    # For critical alerts, log emergency contact info
                    if severity == "critical" and patient.emergency_contact_name:
                        logger.critical(
                            f"CRITICAL: Patient {patient.display_name} inactive for {inactive_hours:.1f} hours. "
                            f"Emergency contact: {patient.emergency_contact_name} "
                            f"({patient.emergency_contact_phone})"
                        )

            except Exception as e:
                logger.error(
                    f"Error checking inactivity for patient {patient.id}: {e}",
                    exc_info=True
                )
                continue

        # Commit all new alerts
        db.commit()

        logger.info(
            f"Inactivity detection completed: "
            f"Checked {patients_checked} patients, created {alerts_created} alerts"
        )

    except Exception as e:
        logger.error(f"Error in inactivity detection job: {e}", exc_info=True)
        db.rollback()
    finally:
        db.close()


def update_patient_heartbeat_timestamp(patient_id: str, db: Session):
    """
    Helper function to update patient's last_heartbeat_at timestamp

    This should be called when a heartbeat activity is logged.

    Args:
        patient_id: UUID of the patient
        db: Database session
    """
    try:
        patient = db.query(Patient).filter(Patient.id == patient_id).first()
        if patient:
            # Get the most recent heartbeat
            latest_heartbeat = db.query(ActivityLog).filter(
                and_(
                    ActivityLog.patient_id == patient_id,
                    ActivityLog.activity_type == "heartbeat"
                )
            ).order_by(ActivityLog.logged_at.desc()).first()

            if latest_heartbeat:
                patient.last_heartbeat_at = latest_heartbeat.logged_at
                db.commit()
                logger.debug(
                    f"Updated last_heartbeat_at for patient {patient_id} "
                    f"to {latest_heartbeat.logged_at}"
                )
    except Exception as e:
        logger.error(f"Error updating heartbeat timestamp: {e}")
        db.rollback()


def get_inactivity_statistics():
    """
    Get statistics about patient inactivity

    Returns:
        dict: Statistics about inactive patients
    """
    db = SessionLocal()

    try:
        now = datetime.utcnow()
        warning_threshold = now - timedelta(hours=INACTIVITY_WARNING_HOURS)
        high_threshold = now - timedelta(hours=INACTIVITY_HIGH_HOURS)
        critical_threshold = now - timedelta(hours=INACTIVITY_CRITICAL_HOURS)

        # Get all active patients
        active_patients = db.query(Patient).filter(
            Patient.is_active == True
        ).all()

        stats = {
            "total_patients": len(active_patients),
            "active": 0,
            "warning": 0,
            "high": 0,
            "critical": 0,
            "no_activity": 0
        }

        for patient in active_patients:
            last_activity = patient.last_heartbeat_at or patient.last_active_at

            if not last_activity:
                stats["no_activity"] += 1
            elif last_activity <= critical_threshold:
                stats["critical"] += 1
            elif last_activity <= high_threshold:
                stats["high"] += 1
            elif last_activity <= warning_threshold:
                stats["warning"] += 1
            else:
                stats["active"] += 1

        return stats

    except Exception as e:
        logger.error(f"Error getting inactivity statistics: {e}")
        return None
    finally:
        db.close()
