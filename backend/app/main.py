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

    # Initialize AI services
    try:
        from app.services.chroma_service import chroma_service
        logger.info("Chroma service initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize Chroma service: {e}")

    # Initialize background job scheduler
    try:
        from app.jobs.scheduler import start_scheduler
        start_scheduler()
        logger.info("Background job scheduler started")
    except Exception as e:
        logger.error(f"Failed to start scheduler: {e}")

    yield

    # Shutdown
    logger.info("Shutting down Elder Companion AI Backend")

    # Shutdown background scheduler
    try:
        from app.jobs.scheduler import shutdown_scheduler
        shutdown_scheduler()
        logger.info("Background job scheduler stopped")
    except Exception as e:
        logger.error(f"Error stopping scheduler: {e}")


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
    allow_origins=settings.cors_origins_list,
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


# Scheduler status endpoint
@app.get("/admin/scheduler", tags=["Admin"])
async def scheduler_status():
    """
    Get background job scheduler status
    """
    from app.jobs.scheduler import get_scheduler_status
    return get_scheduler_status()


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


# Include API routers
from app.api.v1 import auth, patients, schedules, conversations, voice, notes, activity, reports, letta, mobile

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(patients.router, prefix="/api/v1/patients", tags=["Patients"])
app.include_router(schedules.router, prefix="/api/v1/schedules", tags=["Schedules"])
app.include_router(conversations.router, prefix="/api/v1/conversations", tags=["Conversations"])
app.include_router(voice.router, prefix="/api/v1/voice", tags=["Voice Interaction"])
app.include_router(notes.router, prefix="/api/v1", tags=["Caregiver Notes"])
app.include_router(activity.router, prefix="/api/v1", tags=["Activity Logs"])
app.include_router(reports.router, prefix="/api/v1", tags=["Reports"])
app.include_router(letta.router, prefix="/api/v1/letta", tags=["Letta AI Integration"])
app.include_router(mobile.router, prefix="/api/v1/mobile", tags=["Mobile App"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True if settings.APP_ENV == "development" else False
    )
