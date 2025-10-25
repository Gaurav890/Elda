"""
SQLAlchemy declarative base
Import all models here for Alembic auto-generation
"""

from sqlalchemy.orm import declarative_base

# Create declarative base
Base = declarative_base()

# Import all models here so Alembic can detect them
# This ensures migrations include all tables
from app.models.patient import Patient
from app.models.caregiver import Caregiver
from app.models.relationship import PatientCaregiverRelationship
from app.models.schedule import Schedule
from app.models.reminder import Reminder
from app.models.conversation import Conversation
from app.models.daily_summary import DailySummary
from app.models.alert import Alert
from app.models.insight import PatientInsight
from app.models.activity_log import ActivityLog
from app.models.system_log import SystemLog
