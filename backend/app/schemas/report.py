"""
Report schemas - Patient report data structures
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, date as date_type
from enum import Enum


# Enums for report fields
class TimeRange(str, Enum):
    """Time range options"""
    SEVEN_DAYS = "7d"
    THIRTY_DAYS = "30d"
    NINETY_DAYS = "90d"
    ALL = "all"
    CUSTOM = "custom"


class Trend(str, Enum):
    """Trend direction"""
    UP = "up"
    DOWN = "down"
    STABLE = "stable"


class Sentiment(str, Enum):
    """Sentiment types"""
    POSITIVE = "positive"
    NEUTRAL = "neutral"
    NEGATIVE = "negative"


# Medication Adherence Schemas
class MedicationAdherenceData(BaseModel):
    """Daily medication adherence data point"""
    date: date_type = Field(..., description="Date of the data point")
    rate: float = Field(..., ge=0.0, le=1.0, description="Adherence rate (0.0-1.0)")
    completed: int = Field(..., ge=0, description="Number of medications completed")
    total: int = Field(..., ge=0, description="Total number of medications")

    class Config:
        json_schema_extra = {
            "example": {
                "date": "2025-10-18",
                "rate": 0.83,
                "completed": 5,
                "total": 6
            }
        }


class MedicationAdherence(BaseModel):
    """Medication adherence metrics"""
    overall_rate: float = Field(..., ge=0.0, le=1.0, description="Overall adherence rate")
    trend: Trend = Field(..., description="Trend direction (up, down, stable)")
    daily_data: List[MedicationAdherenceData] = Field(default_factory=list, description="Daily adherence data")

    class Config:
        json_schema_extra = {
            "example": {
                "overall_rate": 0.85,
                "trend": "up",
                "daily_data": [
                    {
                        "date": "2025-10-18",
                        "rate": 0.83,
                        "completed": 5,
                        "total": 6
                    }
                ]
            }
        }


# Activity Trends Schemas
class ActivityTrendData(BaseModel):
    """Daily activity trend data point"""
    date: date_type = Field(..., description="Date of the data point")
    minutes: int = Field(..., ge=0, description="Total activity minutes")
    interactions: int = Field(..., ge=0, description="Number of interactions")

    class Config:
        json_schema_extra = {
            "example": {
                "date": "2025-10-18",
                "minutes": 42,
                "interactions": 8
            }
        }


class ActivityTrends(BaseModel):
    """Activity trends metrics"""
    average_daily_minutes: float = Field(..., ge=0.0, description="Average daily activity minutes")
    trend: Trend = Field(..., description="Trend direction (up, down, stable)")
    daily_data: List[ActivityTrendData] = Field(default_factory=list, description="Daily activity data")

    class Config:
        json_schema_extra = {
            "example": {
                "average_daily_minutes": 45.0,
                "trend": "stable",
                "daily_data": [
                    {
                        "date": "2025-10-18",
                        "minutes": 42,
                        "interactions": 8
                    }
                ]
            }
        }


# Mood Analytics Schemas
class SentimentDistribution(BaseModel):
    """Sentiment distribution breakdown"""
    positive: float = Field(..., ge=0.0, le=1.0, description="Percentage of positive sentiment")
    neutral: float = Field(..., ge=0.0, le=1.0, description="Percentage of neutral sentiment")
    negative: float = Field(..., ge=0.0, le=1.0, description="Percentage of negative sentiment")

    class Config:
        json_schema_extra = {
            "example": {
                "positive": 0.65,
                "neutral": 0.25,
                "negative": 0.10
            }
        }


class MoodAnalyticsData(BaseModel):
    """Daily mood analytics data point"""
    date: date_type = Field(..., description="Date of the data point")
    score: float = Field(..., ge=1.0, le=10.0, description="Sentiment score (1-10 scale)")
    sentiment: Sentiment = Field(..., description="Overall sentiment for the day")

    class Config:
        json_schema_extra = {
            "example": {
                "date": "2025-10-18",
                "score": 7.0,
                "sentiment": "positive"
            }
        }


class MoodAnalytics(BaseModel):
    """Mood analytics metrics"""
    average_sentiment_score: float = Field(..., ge=1.0, le=10.0, description="Average sentiment score (1-10)")
    trend: Trend = Field(..., description="Trend direction (up, down, stable)")
    sentiment_distribution: SentimentDistribution = Field(..., description="Breakdown of sentiment types")
    daily_data: List[MoodAnalyticsData] = Field(default_factory=list, description="Daily mood data")

    class Config:
        json_schema_extra = {
            "example": {
                "average_sentiment_score": 7.2,
                "trend": "up",
                "sentiment_distribution": {
                    "positive": 0.65,
                    "neutral": 0.25,
                    "negative": 0.10
                },
                "daily_data": [
                    {
                        "date": "2025-10-18",
                        "score": 7.0,
                        "sentiment": "positive"
                    }
                ]
            }
        }


# Main Report Schema
class PatientReport(BaseModel):
    """Complete patient report with all metrics"""
    time_range: TimeRange = Field(..., description="Time range for the report")
    start_date: date_type = Field(..., description="Start date of the report")
    end_date: date_type = Field(..., description="End date of the report")
    medication_adherence: MedicationAdherence = Field(..., description="Medication adherence metrics")
    activity_trends: ActivityTrends = Field(..., description="Activity trends metrics")
    mood_analytics: MoodAnalytics = Field(..., description="Mood analytics metrics")

    class Config:
        json_schema_extra = {
            "example": {
                "time_range": "7d",
                "start_date": "2025-10-18",
                "end_date": "2025-10-25",
                "medication_adherence": {
                    "overall_rate": 0.85,
                    "trend": "up",
                    "daily_data": []
                },
                "activity_trends": {
                    "average_daily_minutes": 45.0,
                    "trend": "stable",
                    "daily_data": []
                },
                "mood_analytics": {
                    "average_sentiment_score": 7.2,
                    "trend": "up",
                    "sentiment_distribution": {
                        "positive": 0.65,
                        "neutral": 0.25,
                        "negative": 0.10
                    },
                    "daily_data": []
                }
            }
        }
