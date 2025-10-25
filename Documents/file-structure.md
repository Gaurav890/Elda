# Elder Companion AI - Complete File Structure

## Document Purpose

This document maintains the complete file structure of the entire project (backend, mobile app, and dashboard). **UPDATE THIS FILE** whenever you add, remove, or reorganize files so that Claude Code always has accurate context.

**Last Updated:** 2025-10-24
**Status:** Initial structure (not yet implemented)

---

## Project Overview

The Elder Companion AI project consists of three main components:

1. **Backend** (`/backend/`) - FastAPI server hosted on Railway
2. **Mobile App** (`/mobile/`) - React Native + Expo app for patients
3. **Dashboard** (`/dashboard/`) - Next.js web app for caregivers on Vercel

All three components communicate through the backend REST API.

---

## Complete Project Structure

```
/Users/gaurav/Elda/
│
├── backend/                            # FastAPI backend (detailed below)
│   ├── app/
│   ├── alembic/
│   ├── tests/
│   ├── requirements.txt
│   ├── .env.example
│   └── railway.json
│
├── mobile/                             # React Native mobile app (detailed below)
│   ├── app/                            # App screens (Expo Router)
│   ├── components/                     # Reusable UI components
│   ├── services/                       # API, voice, notification services
│   ├── store/                          # State management (Zustand)
│   ├── utils/                          # Helper functions
│   ├── assets/                         # Images, fonts, sounds
│   ├── hooks/                          # Custom React hooks
│   ├── constants/                      # App constants
│   ├── app.json                        # Expo configuration
│   ├── package.json
│   ├── eas.json                        # EAS Build configuration
│   └── App.js                          # Entry point
│
├── dashboard/                          # Next.js caregiver dashboard (detailed below)
│   ├── app/                            # Next.js 14 app directory
│   ├── components/                     # React components
│   ├── lib/                            # Utilities and API client
│   ├── hooks/                          # Custom hooks
│   ├── public/                         # Static assets
│   ├── styles/                         # Global styles
│   ├── next.config.js
│   ├── package.json
│   └── vercel.json                     # Vercel deployment config
│
├── documents/                          # Project documentation
│   ├── README.md                       # Documentation hub
│   ├── architecture.md                 # System architecture
│   ├── deployment.md                   # Deployment guide
│   ├── file-structure.md              # This file
│   ├── postman-collections.md          # API testing guide
│   └── mobile-backend-communication.md # Mobile communication patterns
│
├── snap-memory/                        # Snap memory files
│   └── snap-memory-*.md
│
├── context.md                          # Main project specification
├── README.md                           # Project overview
└── SETUP_COMPLETE.md                   # Planning phase summary
```

---

## 1. Backend Structure (FastAPI)

**Location:** `/Users/gaurav/Elda/backend/`
**Deployment:** Railway (with PostgreSQL)
**Port:** 8000

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                          # FastAPI app initialization
│   │
│   ├── core/                            # Core configuration and dependencies
│   │   ├── __init__.py
│   │   ├── config.py                    # Settings (Pydantic BaseSettings)
│   │   ├── security.py                  # JWT, password hashing
│   │   └── dependencies.py              # get_db, get_current_user
│   │
│   ├── models/                          # SQLAlchemy ORM models (11 tables)
│   │   ├── __init__.py
│   │   ├── patient.py                   # Patient model
│   │   ├── caregiver.py                 # Caregiver model
│   │   ├── relationship.py              # PatientCaregiverRelationship
│   │   ├── schedule.py                  # Schedule model
│   │   ├── reminder.py                  # Reminder model
│   │   ├── conversation.py              # Conversation model
│   │   ├── daily_summary.py             # DailySummary model
│   │   ├── alert.py                     # Alert model
│   │   ├── insight.py                   # PatientInsight model
│   │   ├── activity_log.py              # ActivityLog model
│   │   └── system_log.py                # SystemLog model
│   │
│   ├── schemas/                         # Pydantic schemas (request/response)
│   │   ├── __init__.py
│   │   ├── patient.py                   # PatientCreate, PatientUpdate, PatientResponse
│   │   ├── caregiver.py                 # CaregiverCreate, CaregiverLogin, CaregiverResponse
│   │   ├── schedule.py                  # ScheduleCreate, ScheduleUpdate, ScheduleResponse
│   │   ├── reminder.py                  # ReminderResponse, ReminderAnalysis
│   │   ├── conversation.py              # ConversationCreate, ConversationResponse
│   │   ├── alert.py                     # AlertCreate, AlertResponse, AlertAcknowledge
│   │   ├── daily_summary.py             # DailySummaryResponse
│   │   ├── insight.py                   # InsightResponse
│   │   ├── mobile.py                    # MobileHeartbeat, MobileEmergency
│   │   └── common.py                    # APIResponse, PaginationParams
│   │
│   ├── api/                             # API route handlers
│   │   ├── __init__.py
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── auth.py                  # POST /auth/register, /login, /refresh
│   │       ├── patients.py              # Patient CRUD operations
│   │       ├── schedules.py             # Schedule CRUD operations
│   │       ├── reminders.py             # Reminder history, retry
│   │       ├── conversations.py         # Conversation history, patient message submission
│   │       ├── alerts.py                # Alert management
│   │       ├── summaries.py             # Daily summaries
│   │       ├── insights.py              # Patient insights from Letta
│   │       └── mobile.py                # POST /heartbeat, /emergency
│   │
│   ├── services/                        # Business logic layer
│   │   ├── __init__.py
│   │   │
│   │   ├── ai/                          # AI service integrations
│   │   │   ├── __init__.py
│   │   │   ├── claude_service.py        # Claude API integration
│   │   │   ├── letta_service.py         # Letta Cloud integration
│   │   │   └── chroma_service.py        # Chroma vector DB (semantic search)
│   │   │
│   │   ├── communication/               # External communication services
│   │   │   ├── __init__.py
│   │   │   ├── twilio_service.py        # SMS & voice calls to caregivers
│   │   │   └── firebase_service.py      # Push notifications to patient app
│   │   │
│   │   ├── scheduler/                   # APScheduler jobs
│   │   │   ├── __init__.py
│   │   │   ├── reminder_scheduler.py    # Check reminders every minute
│   │   │   ├── monitoring_scheduler.py  # Check inactivity every 30 min
│   │   │   └── summary_scheduler.py     # Generate summaries at midnight
│   │   │
│   │   ├── patient_service.py           # Patient business logic
│   │   ├── conversation_service.py      # Conversation processing pipeline
│   │   ├── alert_service.py             # Alert creation and dispatch
│   │   ├── summary_service.py           # Daily summary generation
│   │   └── activity_service.py          # Activity monitoring logic
│   │
│   ├── database/
│   │   ├── __init__.py
│   │   ├── session.py                   # Database session management
│   │   └── base.py                      # Base class for all models
│   │
│   └── utils/
│       ├── __init__.py
│       ├── logging.py                   # Custom logging utilities
│       ├── validators.py                # Custom validators
│       └── helpers.py                   # Common helper functions
│
├── alembic/                             # Database migrations
│   ├── versions/
│   │   └── (migration files will be here)
│   ├── env.py                           # Alembic environment
│   ├── script.py.mako                   # Migration template
│   └── alembic.ini                      # Alembic configuration
│
├── tests/                               # Test suite
│   ├── __init__.py
│   ├── conftest.py                      # Pytest fixtures
│   ├── test_auth.py                     # Authentication tests
│   ├── test_patients.py                 # Patient endpoint tests
│   ├── test_conversations.py            # Conversation flow tests
│   ├── test_ai_services.py              # AI service integration tests
│   └── test_schedulers.py               # Background job tests
│
├── requirements.txt                     # Python dependencies
├── .env.example                         # Example environment variables
├── .env                                # Actual environment variables (gitignored)
├── .gitignore                          # Git ignore rules
├── README.md                            # Backend setup instructions
├── railway.json                         # Railway deployment configuration
├── Procfile                             # Process file for Railway
└── Dockerfile                           # Docker configuration (optional)
```

---

## File Details

### Root Level Files

#### `requirements.txt`
**Purpose:** Python package dependencies
**Key dependencies:**
- fastapi==0.104.1
- uvicorn[standard]==0.24.0
- sqlalchemy==2.0.23
- alembic==1.12.1
- psycopg2-binary==2.9.9
- anthropic==0.7.7 (Claude)
- letta-cloud==0.1.0 (Letta)
- chromadb==0.4.18 (Chroma)
- twilio==8.11.0
- firebase-admin==6.3.0

#### `.env.example`
**Purpose:** Template for environment variables
**Contains:** All required environment variables with placeholder values

#### `.env`
**Purpose:** Actual environment variables (never committed to Git)
**Contains:** API keys, database URL, secrets

#### `railway.json`
**Purpose:** Railway deployment configuration
**Contains:** Build and deployment commands

#### `Procfile`
**Purpose:** Process file for Railway
**Contains:** Web server start command and release command

---

### Core Application Files

#### `app/main.py`
**Purpose:** FastAPI application entry point
**Responsibilities:**
- Create FastAPI app instance
- Configure CORS for mobile + dashboard
- Include all API routers
- Initialize APScheduler
- Set up middleware
- Configure logging
- Health check endpoint

**Key functions:**
```python
def create_app() -> FastAPI:
    """Create and configure FastAPI application"""

async def startup_event():
    """Initialize services on startup (database, scheduler)"""

async def shutdown_event():
    """Cleanup on shutdown"""

@app.get("/health")
async def health_check():
    """Health check endpoint"""
```

#### `app/core/config.py`
**Purpose:** Application configuration using Pydantic Settings
**Contains:**
- Environment variables
- API keys
- Database connection settings
- External service configurations

**Key class:**
```python
class Settings(BaseSettings):
    # App settings
    APP_ENV: str
    SECRET_KEY: str

    # Database
    DATABASE_URL: str

    # AI Services
    CLAUDE_API_KEY: str
    LETTA_API_KEY: str
    CHROMA_HOST: str

    # Communication
    TWILIO_ACCOUNT_SID: str
    TWILIO_AUTH_TOKEN: str
    FIREBASE_SERVER_KEY: str

    class Config:
        env_file = ".env"
```

#### `app/core/security.py`
**Purpose:** Authentication and security utilities
**Key functions:**
```python
def hash_password(password: str) -> str:
    """Hash password with bcrypt"""

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""

def create_access_token(data: dict, expires_delta: timedelta) -> str:
    """Create JWT access token"""

def create_refresh_token(data: dict) -> str:
    """Create JWT refresh token"""

def verify_token(token: str) -> dict:
    """Verify and decode JWT token"""
```

#### `app/core/dependencies.py`
**Purpose:** FastAPI dependencies for route handlers
**Key dependencies:**
```python
async def get_db() -> AsyncGenerator:
    """Database session dependency"""

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Caregiver:
    """Get current authenticated caregiver"""

async def get_patient_with_access_check(patient_id: str, current_user: Caregiver = Depends(get_current_user), db: Session = Depends(get_db)) -> Patient:
    """Verify caregiver has access to patient"""
```

---

### Database Layer

#### `app/database/session.py`
**Purpose:** Database session management
**Key components:**
```python
# SQLAlchemy engine
engine = create_async_engine(DATABASE_URL)

# Session factory
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

# Session dependency
async def get_db() -> AsyncGenerator:
    async with AsyncSessionLocal() as session:
        yield session
```

#### `app/database/base.py`
**Purpose:** Base class for all SQLAlchemy models
**Contains:**
```python
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

# Import all models here for Alembic auto-generation
from app.models.patient import Patient
from app.models.caregiver import Caregiver
# ... etc
```

#### `app/models/*.py`
**Purpose:** SQLAlchemy ORM models (one file per table)
**Example structure (patient.py):**
```python
from sqlalchemy import Column, String, Date, ARRAY, JSONB, Boolean, DateTime
from app.database.base import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    first_name = Column(String, nullable=False)
    preferred_name = Column(String)
    date_of_birth = Column(Date, nullable=False)
    medical_conditions = Column(ARRAY(String))
    personal_context = Column(JSONB)  # Family, hobbies, etc.
    letta_agent_id = Column(String)  # Link to Letta Cloud
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)

    # Relationships
    caregivers = relationship("Caregiver", secondary="patient_caregiver_relationship", back_populates="patients")
    schedules = relationship("Schedule", back_populates="patient")
    conversations = relationship("Conversation", back_populates="patient")
```

---

### API Layer

#### `app/api/v1/*.py`
**Purpose:** API route handlers (one file per resource)
**Example structure (patients.py):**
```python
from fastapi import APIRouter, Depends, HTTPException
from app.schemas.patient import PatientCreate, PatientResponse
from app.core.dependencies import get_db, get_current_user

router = APIRouter()

@router.get("/", response_model=List[PatientResponse])
async def list_patients(
    current_user: Caregiver = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all patients for authenticated caregiver"""

@router.post("/", response_model=PatientResponse, status_code=201)
async def create_patient(
    patient: PatientCreate,
    current_user: Caregiver = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create new patient"""

@router.get("/{patient_id}", response_model=PatientResponse)
async def get_patient(
    patient_id: str,
    patient: Patient = Depends(get_patient_with_access_check)
):
    """Get patient details"""
```

---

### Service Layer

#### `app/services/ai/claude_service.py`
**Purpose:** Claude API integration for real-time understanding
**Key methods:**
```python
class ClaudeService:
    async def analyze_conversation(
        self,
        patient_message: str,
        patient_profile: dict,
        letta_context: dict,
        chroma_similar: list,
        current_context: dict
    ) -> dict:
        """Analyze patient message and generate response"""

    async def generate_daily_summary(
        self,
        patient_id: str,
        day_data: dict,
        letta_insights: dict
    ) -> dict:
        """Generate daily summary narrative"""
```

#### `app/services/ai/letta_service.py`
**Purpose:** Letta Cloud integration for long-term memory
**Key methods:**
```python
class LettaService:
    async def create_agent(self, patient_id: str, patient_profile: dict) -> str:
        """Create Letta agent for new patient"""

    async def get_context(self, agent_id: str) -> dict:
        """Get patient context from Letta before conversation"""

    async def update_memory(
        self,
        agent_id: str,
        interaction_summary: str,
        outcomes: dict
    ):
        """Update Letta's memory after interaction"""

    async def generate_insights(self, agent_id: str) -> list:
        """Query Letta for actionable insights"""
```

#### `app/services/ai/chroma_service.py`
**Purpose:** Chroma vector database for semantic search
**Key methods:**
```python
class ChromaService:
    async def add_conversation(
        self,
        patient_id: str,
        conversation_id: str,
        text: str,
        metadata: dict
    ):
        """Store conversation for semantic search"""

    async def semantic_search(
        self,
        patient_id: str,
        query: str,
        n_results: int = 5
    ) -> list:
        """Search conversations semantically"""

    async def find_similar_situations(
        self,
        patient_id: str,
        current_message: str
    ) -> list:
        """Find past situations similar to current one"""
```

#### `app/services/conversation_service.py`
**Purpose:** Orchestrate full conversation pipeline
**Key method:**
```python
class ConversationService:
    async def process_patient_message(
        self,
        patient_id: str,
        message: str,
        context: dict
    ) -> dict:
        """
        Full pipeline:
        1. Query Letta for patient context
        2. Query Chroma for similar conversations
        3. Get current context from database
        4. Send all to Claude for analysis
        5. Execute Claude's recommended actions
        6. Update Letta's memory
        7. Store in Chroma
        8. Return response to mobile app
        """
```

#### `app/services/scheduler/*.py`
**Purpose:** APScheduler background jobs
**Example (reminder_scheduler.py):**
```python
class ReminderScheduler:
    async def check_due_reminders(self):
        """
        Runs every minute
        - Query schedules for due reminders
        - Create reminder records
        - Send push notifications via Firebase
        """
```

---

### Schemas (Pydantic Models)

#### `app/schemas/*.py`
**Purpose:** Request/response validation and serialization
**Example (patient.py):**
```python
from pydantic import BaseModel, EmailStr
from typing import Optional, List

class PatientBase(BaseModel):
    first_name: str
    last_name: str
    preferred_name: Optional[str]
    date_of_birth: date

class PatientCreate(PatientBase):
    medical_conditions: List[str] = []
    personal_context: dict = {}

class PatientResponse(PatientBase):
    id: str
    letta_agent_id: Optional[str]
    last_active_at: Optional[datetime]
    is_active: bool

    class Config:
        orm_mode = True
```

---

## 2. Mobile App Structure (React Native + Expo)

**Location:** `/Users/gaurav/Elda/mobile/`
**Framework:** React Native with Expo
**Deployment:** Expo EAS Build → App Stores
**Target:** iOS and Android patients

```
mobile/
├── app/                                # Expo Router file-based routing
│   ├── _layout.js                      # Root layout
│   ├── index.js                        # Home screen (voice interface)
│   ├── onboarding.js                   # QR code scan + setup
│   ├── settings.js                     # App settings
│   └── emergency.js                    # Emergency contact screen
│
├── components/                         # Reusable UI components
│   ├── common/
│   │   ├── Button.js                   # Custom button component
│   │   ├── Card.js                     # Card component
│   │   ├── LoadingSpinner.js           # Loading indicator
│   │   └── StatusIndicator.js          # Connection status
│   │
│   ├── voice/
│   │   ├── VoiceWaveform.js            # Visual feedback during listening
│   │   ├── SpeakingIndicator.js        # Shows when AI is speaking
│   │   └── MicrophoneButton.js         # Large mic button for manual start
│   │
│   └── emergency/
│       └── EmergencyButton.js          # Large red emergency button
│
├── services/                           # Core service modules
│   ├── api/
│   │   ├── client.js                   # Axios instance with base config
│   │   ├── conversations.js            # POST /conversations/patient
│   │   ├── heartbeat.js                # POST /mobile/heartbeat
│   │   └── emergency.js                # POST /mobile/emergency
│   │
│   ├── voice/
│   │   ├── VoiceService.js             # Voice recognition and TTS
│   │   ├── stt.js                      # Speech-to-text (react-native-voice)
│   │   └── tts.js                      # Text-to-speech (expo-speech)
│   │
│   ├── notifications/
│   │   ├── NotificationService.js      # Firebase Cloud Messaging
│   │   ├── handlers.js                 # Notification tap handlers
│   │   └── permissions.js              # Request notification permissions
│   │
│   ├── background/
│   │   ├── HeartbeatTask.js            # 15-minute heartbeat task
│   │   ├── LocationService.js          # Location tracking
│   │   └── BatteryMonitor.js           # Battery level monitoring
│   │
│   └── storage/
│       ├── AsyncStorageService.js      # Local data persistence
│       ├── MessageQueue.js             # Offline message queue
│       └── PatientStorage.js           # Patient ID and profile storage
│
├── store/                              # State management (Zustand)
│   ├── usePatientStore.js              # Patient profile state
│   ├── useConversationStore.js         # Conversation history
│   ├── useAppState.js                  # App state (listening, speaking, etc.)
│   └── useOfflineQueue.js              # Offline message queue
│
├── hooks/                              # Custom React hooks
│   ├── useVoiceInteraction.js          # Voice interaction lifecycle
│   ├── useNetworkStatus.js             # Online/offline detection
│   ├── useNotifications.js             # Notification subscription
│   └── useHeartbeat.js                 # Heartbeat management
│
├── utils/                              # Helper functions
│   ├── logger.js                       # Logging utility
│   ├── formatters.js                   # Date/time formatters
│   ├── validators.js                   # Input validation
│   └── errorHandler.js                 # Error handling
│
├── constants/                          # App constants
│   ├── config.js                       # API URL, timeouts, etc.
│   ├── colors.js                       # Color palette
│   ├── typography.js                   # Font sizes, weights
│   └── notifications.js                # Notification types
│
├── assets/                             # Static assets
│   ├── images/
│   │   ├── icon.png                    # App icon
│   │   ├── splash.png                  # Splash screen
│   │   └── emergency-icon.png
│   ├── sounds/
│   │   ├── notification.mp3            # Notification sound
│   │   └── listening-start.mp3         # Listening started sound
│   └── fonts/
│       └── (custom fonts if needed)
│
├── app.json                            # Expo configuration
├── eas.json                            # EAS Build configuration
├── package.json                        # Dependencies
├── babel.config.js                     # Babel configuration
├── .env.example                        # Environment variables template
├── .env                                # Actual environment variables
└── App.js                              # Entry point

```

### Key Mobile App Files

#### `App.js`
**Purpose:** Application entry point
**Responsibilities:**
- Initialize services (notifications, storage)
- Load patient profile from storage
- Set up navigation
- Handle deep links

```javascript
import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { initializeServices } from './services';
import { usePatientStore } from './store/usePatientStore';

export default function App() {
  const loadPatient = usePatientStore((state) => state.loadPatient);

  useEffect(() => {
    initializeServices();
    loadPatient();
  }, []);

  return (
    <NavigationContainer>
      {/* Expo Router handles navigation */}
    </NavigationContainer>
  );
}
```

#### `services/voice/VoiceService.js`
**Purpose:** Manage voice interactions
**Key methods:**
- `startListening()` - Start STT
- `stopListening()` - Stop STT
- `speak(text)` - Use TTS to speak
- `handleSpeechResults(text)` - Send to backend

#### `services/background/HeartbeatTask.js`
**Purpose:** Background heartbeat every 15 minutes
**Sends:**
- Battery level
- Location (if available)
- Last activity timestamp
- App version

#### `services/notifications/NotificationService.js`
**Purpose:** Handle push notifications from Firebase
**Handles:**
- Reminder notifications (medication, meals)
- Alert notifications (caregiver messages)
- Wake app when notification received
- Start TTS automatically for reminders

---

## 3. Dashboard Structure (Next.js)

**Location:** `/Users/gaurav/Elda/dashboard/`
**Framework:** Next.js 14 (App Router)
**Deployment:** Vercel
**Target:** Caregiver web interface

```
dashboard/
├── app/                                # Next.js 14 app directory
│   ├── layout.js                       # Root layout with providers
│   ├── page.js                         # Login page
│   ├── globals.css                     # Global styles
│   │
│   ├── (auth)/                         # Authentication routes
│   │   ├── login/
│   │   │   └── page.js                 # Login page
│   │   └── register/
│   │       └── page.js                 # Register page
│   │
│   └── (dashboard)/                    # Protected dashboard routes
│       ├── layout.js                   # Dashboard layout with sidebar
│       ├── overview/
│       │   └── page.js                 # Dashboard overview
│       ├── patients/
│       │   ├── page.js                 # Patient list
│       │   └── [id]/
│       │       ├── page.js             # Patient detail
│       │       ├── conversations/
│       │       │   └── page.js         # Conversation history
│       │       ├── schedules/
│       │       │   └── page.js         # Medication & meal schedules
│       │       ├── alerts/
│       │       │   └── page.js         # Patient alerts
│       │       └── insights/
│       │           └── page.js         # Letta-powered insights
│       │
│       ├── search/
│       │   └── page.js                 # Semantic search (Chroma)
│       │
│       └── settings/
│           └── page.js                 # Caregiver settings
│
├── components/                         # React components
│   ├── ui/                             # Shadcn UI components
│   │   ├── button.jsx
│   │   ├── card.jsx
│   │   ├── dialog.jsx
│   │   ├── input.jsx
│   │   └── ... (other Shadcn components)
│   │
│   ├── layout/
│   │   ├── Sidebar.jsx                 # Navigation sidebar
│   │   ├── Header.jsx                  # Top header with user menu
│   │   └── Footer.jsx                  # Footer
│   │
│   ├── patients/
│   │   ├── PatientCard.jsx             # Patient overview card
│   │   ├── PatientList.jsx             # Searchable patient list
│   │   ├── PatientForm.jsx             # Add/edit patient form
│   │   └── VitalsSummary.jsx           # Quick vitals display
│   │
│   ├── conversations/
│   │   ├── ConversationList.jsx        # List of conversations
│   │   ├── ConversationItem.jsx        # Single conversation bubble
│   │   ├── ConversationSearch.jsx      # Semantic search box
│   │   └── ConversationTimeline.jsx    # Timeline view
│   │
│   ├── schedules/
│   │   ├── ScheduleCalendar.jsx        # Weekly schedule view
│   │   ├── ScheduleForm.jsx            # Add medication/meal
│   │   └── ReminderHistory.jsx         # Past reminders
│   │
│   ├── alerts/
│   │   ├── AlertList.jsx               # List of active alerts
│   │   ├── AlertBanner.jsx             # Top banner for urgent alerts
│   │   └── AlertModal.jsx              # Alert detail modal
│   │
│   └── insights/
│       ├── InsightCard.jsx             # Single insight display
│       └── InsightTimeline.jsx         # Insights over time
│
├── lib/                                # Utilities and API client
│   ├── api/
│   │   ├── client.js                   # Axios instance with auth
│   │   ├── auth.js                     # Login, register, refresh
│   │   ├── patients.js                 # Patient CRUD
│   │   ├── conversations.js            # Conversation endpoints
│   │   ├── schedules.js                # Schedule endpoints
│   │   ├── alerts.js                   # Alert endpoints
│   │   └── insights.js                 # Insight endpoints
│   │
│   ├── utils/
│   │   ├── formatters.js               # Date/time/number formatters
│   │   ├── validators.js               # Form validation
│   │   └── cn.js                       # Class name utility
│   │
│   └── constants/
│       ├── config.js                   # API URL, polling intervals
│       └── routes.js                   # Route constants
│
├── hooks/                              # Custom React hooks
│   ├── useAuth.js                      # Authentication state
│   ├── usePatients.js                  # Patient data fetching
│   ├── useConversations.js             # Conversation polling
│   ├── useAlerts.js                    # Alert polling
│   └── usePolling.js                   # Generic polling hook
│
├── context/                            # React Context providers
│   ├── AuthContext.js                  # Authentication context
│   └── ThemeContext.js                 # Theme (light/dark mode)
│
├── public/                             # Static assets
│   ├── favicon.ico
│   ├── logo.svg
│   └── images/
│
├── styles/                             # Additional styles
│   └── (if needed beyond Tailwind)
│
├── next.config.js                      # Next.js configuration
├── tailwind.config.js                  # Tailwind CSS configuration
├── components.json                     # Shadcn UI configuration
├── package.json                        # Dependencies
├── .env.local                          # Environment variables
├── .env.example                        # Environment template
└── vercel.json                         # Vercel deployment config
```

### Key Dashboard Files

#### `app/layout.js`
**Purpose:** Root layout for entire application
**Includes:**
- HTML structure
- Global styles
- Context providers
- Font loading

#### `app/(dashboard)/layout.js`
**Purpose:** Protected dashboard layout
**Includes:**
- Authentication check
- Sidebar navigation
- Header with user menu
- Auto-refresh for alerts

#### `lib/api/client.js`
**Purpose:** Axios instance with authentication
**Features:**
- Automatic JWT token injection
- Token refresh on 401 errors
- Request/response interceptors
- Error handling

```javascript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
});

// Request interceptor: Add auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      const refreshed = await refreshToken();
      if (refreshed) {
        // Retry original request
        return apiClient(error.config);
      } else {
        // Redirect to login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

#### `hooks/usePolling.js`
**Purpose:** Generic polling hook for real-time updates
**Usage:**
```javascript
const { data, loading, error } = usePolling(
  fetchConversations,  // Function to call
  5000,                // Interval (5 seconds)
  [patientId]          // Dependencies
);
```

---

## Directory Update Log

**Format:** `YYYY-MM-DD - Action - File Path - Description`

### 2025-10-24
- INITIAL - All paths - Initial file structure documented
- UPDATED - Complete project structure - Added mobile/ and dashboard/ directories
- DOCUMENTED - mobile/ - React Native + Expo app structure
- DOCUMENTED - dashboard/ - Next.js 14 dashboard structure
- PENDING - All files - Implementation not yet started

*(Update this log whenever file structure changes)*

---

## Adding New Files

When adding new files, follow these steps:

1. **Create the file** in appropriate directory
2. **Add to this document** in the structure tree above
3. **Update the log** at the bottom
4. **Document purpose** if it's a key file
5. **Update related docs** if architecture changes

---

## File Naming Conventions

**Python files:**
- Lowercase with underscores: `patient_service.py`
- Models: Singular noun: `patient.py` (not `patients.py`)
- Services: Suffix with `_service`: `claude_service.py`
- Schemas: Match model name: `patient.py` (schemas/patient.py vs models/patient.py)

**Directories:**
- Lowercase, no underscores: `services`, `models`
- Plural when containing multiple related files: `models/`, `schemas/`
- Descriptive: `ai/` not `external/`

---

## Import Conventions

**Absolute imports from project root:**
```python
# Good
from app.models.patient import Patient
from app.services.ai.claude_service import ClaudeService

# Bad
from models.patient import Patient  # Relative
from ..models.patient import Patient  # Relative
```

**Service imports in route handlers:**
```python
from app.services.conversation_service import ConversationService

# In route handler:
conversation_service = ConversationService()
result = await conversation_service.process_patient_message(...)
```

---

## Testing File Structure

Tests mirror the main app structure:

```
tests/
├── test_api/
│   └── test_v1/
│       ├── test_auth.py          # Tests for api/v1/auth.py
│       ├── test_patients.py      # Tests for api/v1/patients.py
│       └── ...
│
├── test_services/
│   ├── test_ai/
│   │   ├── test_claude_service.py
│   │   ├── test_letta_service.py
│   │   └── test_chroma_service.py
│   └── test_conversation_service.py
│
└── test_models/
    ├── test_patient.py
    └── ...
```

---

## Database Migrations

**Location:** `alembic/versions/`

**Naming convention:**
```
{revision_id}_{description}.py

Example:
001_initial_tables.py
002_add_letta_agent_id.py
003_add_chroma_collection_ref.py
```

**Create new migration:**
```bash
alembic revision --autogenerate -m "description"
```

**Apply migrations:**
```bash
alembic upgrade head
```

---

## Configuration Files

### `alembic.ini`
**Purpose:** Alembic configuration
**Key setting:** `sqlalchemy.url` (set from environment variable)

### `railway.json`
**Purpose:** Railway deployment configuration
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pip install -r requirements.txt"
  },
  "deploy": {
    "startCommand": "uvicorn app.main:app --host 0.0.0.0 --port $PORT",
    "releaseCommand": "alembic upgrade head",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10,
    "healthcheckPath": "/health"
  }
}
```

### `Procfile`
**Purpose:** Process commands for Railway
```
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
release: alembic upgrade head
```

---

## Environment Variables Reference

See `.env.example` for complete list. Key variables:

**Application:**
- `APP_ENV` - development | production
- `SECRET_KEY` - JWT secret
- `DATABASE_URL` - PostgreSQL connection string

**AI Services:**
- `CLAUDE_API_KEY` - Anthropic API key
- `LETTA_API_KEY` - Letta Cloud API key
- `CHROMA_HOST` - Chroma database host
- `CHROMA_PORT` - Chroma database port

**Communication:**
- `TWILIO_ACCOUNT_SID` - Twilio account SID
- `TWILIO_AUTH_TOKEN` - Twilio auth token
- `TWILIO_PHONE_NUMBER` - Twilio phone number
- `FIREBASE_SERVER_KEY` - Firebase server key

---

## Quick Reference

**Start development server:**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Create migration:**
```bash
alembic revision --autogenerate -m "description"
alembic upgrade head
```

**Run tests:**
```bash
pytest
pytest tests/test_api/  # Specific directory
pytest tests/test_api/test_v1/test_auth.py  # Specific file
```

**Install dependencies:**
```bash
pip install -r requirements.txt
```

**Format code:**
```bash
black app/
isort app/
```

---

## Notes

- This file structure follows FastAPI best practices
- Designed for scalability (easy to add new features)
- Clear separation of concerns (models, schemas, services, routes)
- Testable (each component is isolated)
- AI services are well-integrated (Claude + Letta + Chroma working together)

**REMEMBER:** Update this document whenever file structure changes!

**Last Updated:** 2025-10-24
