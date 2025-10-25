"""
Background job scheduler using APScheduler
Manages all background tasks for the Elder Companion AI system
"""

import logging
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger

from app.core.config import settings
from app.jobs.reminder_generator import (
    generate_reminders_from_schedules,
    check_and_mark_missed_reminders
)
from app.jobs.summary_generator import (
    generate_daily_summaries,
    generate_weekly_insights
)

logger = logging.getLogger(__name__)

# Global scheduler instance
scheduler = None


def init_scheduler():
    """
    Initialize and configure the background job scheduler
    """
    global scheduler

    if scheduler is not None:
        logger.warning("Scheduler already initialized")
        return scheduler

    logger.info("Initializing background job scheduler")

    # Create scheduler
    scheduler = BackgroundScheduler(
        timezone="UTC",
        daemon=True
    )

    # ===== REMINDER GENERATION =====
    # Run every minute to check for upcoming reminders
    scheduler.add_job(
        func=generate_reminders_from_schedules,
        trigger=IntervalTrigger(seconds=settings.REMINDER_CHECK_INTERVAL_SECONDS),
        id="reminder_generation",
        name="Generate reminders from schedules",
        replace_existing=True,
        max_instances=1  # Prevent overlapping executions
    )

    # Run every 5 minutes to check for missed reminders
    scheduler.add_job(
        func=check_and_mark_missed_reminders,
        trigger=IntervalTrigger(minutes=5),
        id="missed_reminder_check",
        name="Check and mark missed reminders",
        replace_existing=True,
        max_instances=1
    )

    # ===== DAILY SUMMARY GENERATION =====
    # Run once per day at configured hour (default: midnight)
    scheduler.add_job(
        func=generate_daily_summaries,
        trigger=CronTrigger(hour=settings.SUMMARY_GENERATION_HOUR, minute=0),
        id="daily_summary_generation",
        name="Generate daily summaries",
        replace_existing=True,
        max_instances=1
    )

    # ===== WEEKLY INSIGHTS =====
    # Run once per week on Monday at 6 AM
    scheduler.add_job(
        func=generate_weekly_insights,
        trigger=CronTrigger(day_of_week="mon", hour=6, minute=0),
        id="weekly_insights_generation",
        name="Generate weekly behavioral insights",
        replace_existing=True,
        max_instances=1
    )

    logger.info("Background job scheduler configured with jobs:")
    for job in scheduler.get_jobs():
        logger.info(f"  - {job.name} (ID: {job.id})")

    return scheduler


def start_scheduler():
    """
    Start the background job scheduler
    """
    global scheduler

    if scheduler is None:
        scheduler = init_scheduler()

    if not scheduler.running:
        scheduler.start()
        logger.info("Background job scheduler started")
    else:
        logger.warning("Scheduler already running")


def shutdown_scheduler():
    """
    Shutdown the background job scheduler
    """
    global scheduler

    if scheduler is not None and scheduler.running:
        scheduler.shutdown(wait=True)
        logger.info("Background job scheduler shut down")


def get_scheduler_status():
    """
    Get current scheduler status and job information

    Returns:
        dict: Scheduler status information
    """
    global scheduler

    if scheduler is None:
        return {
            "running": False,
            "jobs": []
        }

    jobs = []
    for job in scheduler.get_jobs():
        jobs.append({
            "id": job.id,
            "name": job.name,
            "next_run_time": str(job.next_run_time) if job.next_run_time else None,
            "trigger": str(job.trigger)
        })

    return {
        "running": scheduler.running,
        "jobs": jobs
    }
