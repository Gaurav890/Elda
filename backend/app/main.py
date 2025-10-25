"""
Elder Companion AI - FastAPI Backend
Main application entry point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
from contextlib import asynccontextmanager

from app.core.config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO if settings.APP_ENV == "production" else logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events
    """
    # Startup
    logger.info("Starting Elder Companion AI Backend")
    logger.info(f"Environment: {settings.APP_ENV}")

    # TODO: Initialize database connection
    # TODO: Initialize APScheduler for background jobs
    # TODO: Initialize AI services (Claude, Letta, Chroma)

    yield

    # Shutdown
    logger.info("Shutting down Elder Companion AI Backend")
    # TODO: Close database connections
    # TODO: Shutdown APScheduler


# Create FastAPI app
app = FastAPI(
    title="Elder Companion AI API",
    description="Backend API for Elder Companion AI - Voice-enabled elderly care platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint for monitoring
    """
    return JSONResponse(
        status_code=200,
        content={
            "status": "healthy",
            "service": "elder-companion-api",
            "version": "1.0.0",
            "environment": settings.APP_ENV
        }
    )


# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint
    """
    return {
        "message": "Elder Companion AI API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }


# TODO: Include routers
# from app.api.v1 import auth, patients, schedules, reminders, conversations, alerts, summaries, insights, mobile
# app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
# app.include_router(patients.router, prefix="/api/v1/patients", tags=["Patients"])
# app.include_router(schedules.router, prefix="/api/v1/schedules", tags=["Schedules"])
# app.include_router(reminders.router, prefix="/api/v1/reminders", tags=["Reminders"])
# app.include_router(conversations.router, prefix="/api/v1/conversations", tags=["Conversations"])
# app.include_router(alerts.router, prefix="/api/v1/alerts", tags=["Alerts"])
# app.include_router(summaries.router, prefix="/api/v1/summaries", tags=["Summaries"])
# app.include_router(insights.router, prefix="/api/v1/insights", tags=["Insights"])
# app.include_router(mobile.router, prefix="/api/v1/mobile", tags=["Mobile"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True if settings.APP_ENV == "development" else False
    )
