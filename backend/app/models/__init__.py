"""
Database models for Elder Companion AI

This module exports all SQLAlchemy models for:
- Patients and caregivers
- Schedules and reminders
- Conversations and AI interactions
- Alerts and daily summaries
- Activity tracking and system logs
"""

from app.models.caregiver import Caregiver
from app.models.patient import Patient
from app.models.relationship import PatientCaregiverRelationship
from app.models.schedule import Schedule
from app.models.reminder import Reminder
from app.models.conversation import Conversation
from app.models.daily_summary import DailySummary
from app.models.alert import Alert
from app.models.insight import PatientInsight
from app.models.activity_log import ActivityLog
from app.models.system_log import SystemLog

__all__ = [
    "Caregiver",
    "Patient",
    "PatientCaregiverRelationship",
    "Schedule",
    "Reminder",
    "Conversation",
    "DailySummary",
    "Alert",
    "PatientInsight",
    "ActivityLog",
    "SystemLog",
]
