"""
Reports service - Aggregation logic for patient reports
"""

from datetime import datetime, timedelta, date
from typing import Tuple, List, Dict, Optional
from sqlalchemy import func, and_, cast, Date
from sqlalchemy.orm import Session
from uuid import UUID

from app.models.reminder import Reminder
from app.models.schedule import Schedule
from app.models.activity_log import ActivityLog
from app.models.conversation import Conversation
from app.schemas.report import (
    PatientReport,
    MedicationAdherence,
    MedicationAdherenceData,
    ActivityTrends,
    ActivityTrendData,
    MoodAnalytics,
    MoodAnalyticsData,
    SentimentDistribution,
    TimeRange,
    Trend,
    Sentiment
)


def calculate_date_range(time_range: TimeRange, start_date: Optional[date] = None, end_date: Optional[date] = None) -> Tuple[datetime, datetime]:
    """
    Calculate start and end datetime based on time range

    Args:
        time_range: One of "7d", "30d", "90d", "all", "custom"
        start_date: Start date for custom range
        end_date: End date for custom range

    Returns:
        Tuple of (start_datetime, end_datetime)
    """
    now = datetime.utcnow()
    end_dt = datetime(now.year, now.month, now.day, 23, 59, 59)

    # Convert enum to string value for comparison
    time_range_value = time_range.value if isinstance(time_range, TimeRange) else time_range

    if time_range_value == "custom":
        if not start_date or not end_date:
            raise ValueError("start_date and end_date required for custom time range")
        start_dt = datetime(start_date.year, start_date.month, start_date.day, 0, 0, 0)
        end_dt = datetime(end_date.year, end_date.month, end_date.day, 23, 59, 59)
    elif time_range_value == "7d":
        start_dt = end_dt - timedelta(days=6)
        start_dt = datetime(start_dt.year, start_dt.month, start_dt.day, 0, 0, 0)
    elif time_range_value == "30d":
        start_dt = end_dt - timedelta(days=29)
        start_dt = datetime(start_dt.year, start_dt.month, start_dt.day, 0, 0, 0)
    elif time_range_value == "90d":
        start_dt = end_dt - timedelta(days=89)
        start_dt = datetime(start_dt.year, start_dt.month, start_dt.day, 0, 0, 0)
    elif time_range_value == "all":
        # Get data from the last year (reasonable default for "all")
        start_dt = end_dt - timedelta(days=365)
        start_dt = datetime(start_dt.year, start_dt.month, start_dt.day, 0, 0, 0)
    else:
        raise ValueError(f"Invalid time_range: {time_range_value}")

    return start_dt, end_dt


def calculate_trend(daily_data: List[float]) -> Trend:
    """
    Calculate trend based on daily data

    Args:
        daily_data: List of numeric values over time

    Returns:
        Trend enum (UP, DOWN, or STABLE)
    """
    if len(daily_data) < 2:
        return Trend.STABLE

    # Compare first half to second half
    mid = len(daily_data) // 2
    first_half_avg = sum(daily_data[:mid]) / mid if mid > 0 else 0
    second_half_avg = sum(daily_data[mid:]) / (len(daily_data) - mid) if (len(daily_data) - mid) > 0 else 0

    # Calculate percentage change
    if first_half_avg == 0:
        return Trend.STABLE

    change_percent = ((second_half_avg - first_half_avg) / first_half_avg) * 100

    # Threshold for determining trend
    if change_percent > 5:
        return Trend.UP
    elif change_percent < -5:
        return Trend.DOWN
    else:
        return Trend.STABLE


def calculate_medication_adherence(
    db: Session,
    patient_id: UUID,
    start_dt: datetime,
    end_dt: datetime
) -> MedicationAdherence:
    """
    Calculate medication adherence metrics

    Args:
        db: Database session
        patient_id: Patient UUID
        start_dt: Start datetime
        end_dt: End datetime

    Returns:
        MedicationAdherence object
    """
    # Get all medication reminders in date range
    reminders = db.query(Reminder).join(Schedule).filter(
        and_(
            Reminder.patient_id == patient_id,
            Schedule.type == "medication",
            Reminder.due_at >= start_dt,
            Reminder.due_at <= end_dt
        )
    ).all()

    # Group by date
    daily_adherence: Dict[date, Dict] = {}

    for reminder in reminders:
        reminder_date = reminder.due_at.date()

        if reminder_date not in daily_adherence:
            daily_adherence[reminder_date] = {
                "total": 0,
                "completed": 0
            }

        daily_adherence[reminder_date]["total"] += 1
        if reminder.status == "completed":
            daily_adherence[reminder_date]["completed"] += 1

    # Calculate daily data
    daily_data = []
    rates = []

    for date_key in sorted(daily_adherence.keys()):
        stats = daily_adherence[date_key]
        total = stats["total"]
        completed = stats["completed"]
        rate = completed / total if total > 0 else 0.0

        daily_data.append(MedicationAdherenceData(
            date=date_key,
            rate=rate,
            completed=completed,
            total=total
        ))
        rates.append(rate)

    # Calculate overall rate
    total_reminders = sum(d["total"] for d in daily_adherence.values())
    total_completed = sum(d["completed"] for d in daily_adherence.values())
    overall_rate = total_completed / total_reminders if total_reminders > 0 else 0.0

    # Calculate trend
    trend = calculate_trend(rates) if rates else "stable"

    return MedicationAdherence(
        overall_rate=overall_rate,
        trend=trend,
        daily_data=daily_data
    )


def calculate_activity_trends(
    db: Session,
    patient_id: UUID,
    start_dt: datetime,
    end_dt: datetime
) -> ActivityTrends:
    """
    Calculate activity trends metrics

    Args:
        db: Database session
        patient_id: Patient UUID
        start_dt: Start datetime
        end_dt: End datetime

    Returns:
        ActivityTrends object
    """
    # Get all activity logs in date range
    activities = db.query(ActivityLog).filter(
        and_(
            ActivityLog.patient_id == patient_id,
            ActivityLog.logged_at >= start_dt,
            ActivityLog.logged_at <= end_dt
        )
    ).all()

    # Group by date
    daily_activity: Dict[date, Dict] = {}

    for activity in activities:
        activity_date = activity.logged_at.date()

        if activity_date not in daily_activity:
            daily_activity[activity_date] = {
                "interactions": 0,
                "minutes": 0
            }

        daily_activity[activity_date]["interactions"] += 1

        # Estimate activity minutes based on activity type
        if activity.activity_type == "conversation":
            # Assume conversations are ~2 minutes on average
            daily_activity[activity_date]["minutes"] += 2
        elif activity.activity_type == "app_open":
            # Assume app usage is ~5 minutes
            daily_activity[activity_date]["minutes"] += 5
        elif activity.activity_type == "reminder_response":
            # Quick interaction, ~1 minute
            daily_activity[activity_date]["minutes"] += 1

    # Calculate daily data
    daily_data = []
    minutes_list = []

    for date_key in sorted(daily_activity.keys()):
        stats = daily_activity[date_key]

        daily_data.append(ActivityTrendData(
            date=date_key,
            minutes=stats["minutes"],
            interactions=stats["interactions"]
        ))
        minutes_list.append(stats["minutes"])

    # Calculate average daily minutes
    avg_minutes = sum(minutes_list) / len(minutes_list) if minutes_list else 0.0

    # Calculate trend
    trend = calculate_trend(minutes_list) if minutes_list else Trend.STABLE

    return ActivityTrends(
        average_daily_minutes=avg_minutes,
        trend=trend,
        daily_data=daily_data
    )


def calculate_mood_analytics(
    db: Session,
    patient_id: UUID,
    start_dt: datetime,
    end_dt: datetime
) -> MoodAnalytics:
    """
    Calculate mood analytics metrics

    Args:
        db: Database session
        patient_id: Patient UUID
        start_dt: Start datetime
        end_dt: End datetime

    Returns:
        MoodAnalytics object
    """
    # Get all conversations in date range
    conversations = db.query(Conversation).filter(
        and_(
            Conversation.patient_id == patient_id,
            Conversation.created_at >= start_dt,
            Conversation.created_at <= end_dt
        )
    ).all()

    # Map sentiment to score (1-10 scale)
    sentiment_scores = {
        "positive": 8.0,
        "neutral": 5.0,
        "negative": 3.0,
        "concerned": 4.0,
        "distressed": 2.0
    }

    # Count sentiment types
    sentiment_counts = {
        "positive": 0,
        "neutral": 0,
        "negative": 0
    }

    # Group by date
    daily_mood: Dict[date, List[float]] = {}

    for conv in conversations:
        conv_date = conv.created_at.date()
        sentiment = conv.sentiment or "neutral"
        score = sentiment_scores.get(sentiment, 5.0)

        if conv_date not in daily_mood:
            daily_mood[conv_date] = []

        daily_mood[conv_date].append(score)

        # Map to simplified sentiment for distribution
        if sentiment in ["positive"]:
            sentiment_counts["positive"] += 1
        elif sentiment in ["negative", "concerned", "distressed"]:
            sentiment_counts["negative"] += 1
        else:
            sentiment_counts["neutral"] += 1

    # Calculate daily data
    daily_data = []
    all_scores = []

    for date_key in sorted(daily_mood.keys()):
        scores = daily_mood[date_key]
        avg_score = sum(scores) / len(scores) if scores else 5.0

        # Determine sentiment for the day
        if avg_score >= 7:
            sentiment = Sentiment.POSITIVE
        elif avg_score >= 4:
            sentiment = Sentiment.NEUTRAL
        else:
            sentiment = Sentiment.NEGATIVE

        daily_data.append(MoodAnalyticsData(
            date=date_key,
            score=avg_score,
            sentiment=sentiment
        ))
        all_scores.append(avg_score)

    # Calculate overall average
    avg_sentiment_score = sum(all_scores) / len(all_scores) if all_scores else 5.0

    # Calculate sentiment distribution
    total_convs = sum(sentiment_counts.values())
    distribution = SentimentDistribution(
        positive=sentiment_counts["positive"] / total_convs if total_convs > 0 else 0.0,
        neutral=sentiment_counts["neutral"] / total_convs if total_convs > 0 else 0.0,
        negative=sentiment_counts["negative"] / total_convs if total_convs > 0 else 0.0
    )

    # Calculate trend
    trend = calculate_trend(all_scores) if all_scores else Trend.STABLE

    return MoodAnalytics(
        average_sentiment_score=avg_sentiment_score,
        trend=trend,
        sentiment_distribution=distribution,
        daily_data=daily_data
    )


def generate_report(
    db: Session,
    patient_id: UUID,
    time_range: TimeRange = "7d",
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
) -> PatientReport:
    """
    Generate a comprehensive patient report

    Args:
        db: Database session
        patient_id: Patient UUID
        time_range: One of "7d", "30d", "90d", "all", "custom"
        start_date: Start date for custom range
        end_date: End date for custom range

    Returns:
        PatientReport object with all metrics
    """
    # Calculate date range
    start_dt, end_dt = calculate_date_range(time_range, start_date, end_date)

    # Calculate all metrics
    medication_adherence = calculate_medication_adherence(db, patient_id, start_dt, end_dt)
    activity_trends = calculate_activity_trends(db, patient_id, start_dt, end_dt)
    mood_analytics = calculate_mood_analytics(db, patient_id, start_dt, end_dt)

    return PatientReport(
        time_range=time_range,
        start_date=start_dt.date(),
        end_date=end_dt.date(),
        medication_adherence=medication_adherence,
        activity_trends=activity_trends,
        mood_analytics=mood_analytics
    )
