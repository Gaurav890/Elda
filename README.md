
# Elder Companion AI - Complete Project Specification 

## Project Overview

**Elder Companion AI** is a voice-first mobile application designed to help elderly individuals (especially those with Alzheimer's, dementia, or living alone) maintain their daily routines through intelligent reminders, conversational AI companionship, and caregiver oversight.

### Core Innovation

-   **Voice-first interaction**: All patient communication happens in-app through voice
-   **AI that learns**: System adapts to each patient's patterns over time
-   **Proactive monitoring**: Multiple detection methods ensure safety
-   **Family connection**: Caregivers stay informed without being intrusive


### What Makes This Special

-   **NOT just a reminder app**: It's a companion that learns, adapts, and cares
-   **NOT an alarm system**: It's conversational and empathetic
-   **NOT a replacement for caregivers**: It's a tool to enhance care and maintain independence

----------

## Table of Contents

1.  [System Architecture](#system-architecture)
2.  [Tech Stack](#tech-stack)
3.  [Database Schema](#database-schema)
4.  [Core Features](#core-features)
5.  [AI Integration Strategy](#ai-integration-strategy)
6.  [Communication Flow](#communication-flow)
7.  [Mobile App Specifications](#mobile-app-specifications)
8.  [Web Dashboard Specifications](#web-dashboard-specifications)
9.  [API Design](#api-design)
10.  [Security & Privacy](#security-privacy)
11.  [Implementation Timeline](#implementation-timeline)
12.  [Testing Strategy](#testing-strategy)
13.  [Deployment Strategy](#deployment-strategy)
14.  [Demo Preparation](#demo-preparation)

----------

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              CAREGIVER WEB DASHBOARD                         │
│  - Patient management                                        │
│  - Schedule configuration                                    │
│  - Real-time monitoring                                      │
│  - Daily reports and insights                                │
│  - Alert management                                          │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         │ HTTPS REST API
                         │ (Polling every 5-10 seconds)
                         │
┌────────────────────────▼─────────────────────────────────────┐
│                    BACKEND SERVER                            │
│                     (FastAPI)                                │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │             CORE SERVICES                          │     │
│  │  • Scheduler (APScheduler - check-ins every 2hrs) │     │
│  │  • Activity Monitor (check every 30 min)          │     │
│  │  • Alert Manager                                   │     │
│  │  • Daily Summary Generator (midnight)             │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │             AI LAYER                               │     │
│  │                                                     │     │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────┐  │     │
│  │  │   CLAUDE    │  │    LETTA    │  │  CHROMA  │  │     │
│  │  │             │  │             │  │          │  │     │
│  │  │ Real-time   │  │ Long-term   │  │ Semantic │  │     │
│  │  │ Understanding│ │ Memory     │  │ Search   │  │     │
│  │  └─────────────┘  └─────────────┘  └──────────┘  │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │         COMMUNICATION SERVICES                     │     │
│  │  • Twilio (SMS/Calls to CAREGIVERS only)          │     │
│  │  • Firebase (Push notifications to patient app)   │     │
│  │  • Vapi (Optional voice AI enhancement)           │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │         DATABASE (PostgreSQL)                      │     │
│  │  • Patient profiles                                │     │
│  │  • Schedules & reminders                           │     │
│  │  • Conversations                                   │     │
│  │  • Activity logs                                   │     │
│  │  • Alerts & insights                               │     │
│  └────────────────────────────────────────────────────┘     │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         │ HTTPS REST API
                         │ Push Notifications (Firebase)
                         │
┌────────────────────────▼─────────────────────────────────────┐
│           PATIENT MOBILE APP (React Native)                  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  VOICE INTERACTION LAYER                             │   │
│  │  • Voice input (react-native-voice)                  │   │
│  │  • Voice output (expo-speech TTS)                    │   │
│  │  • Always-visible "Talk to Me" button                │   │
│  │  • Wake word detection: "Hey Companion" (optional)   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  MONITORING LAYER                                    │   │
│  │  • Activity tracker (sends heartbeat every 15 min)  │   │
│  │  • Accelerometer (motion detection)                  │   │
│  │  • App state tracking (foreground/background)        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  SAFETY FEATURES                                     │   │
│  │  • Emergency button (giant, red, always visible)     │   │
│  │  • Scheduled check-ins (every 2 hours)               │   │
│  │  • Manual check-in trigger                           │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘

NOTE: IoT Integration (Alexa, Google Home, Smart Pill Dispensers)
is NOT part of this hackathon build. Mention as future roadmap.
```

---

### Data Flow Diagrams

#### 1. Scheduled Check-In Flow
```
EVERY 2 HOURS:

Backend Scheduler triggers check-in
  ↓
Send push notification to patient's app
  "Hi Maggie, just checking in. How are you feeling?"
  ↓
App receives notification
  ↓
App plays TTS: "Hi Maggie, just checking in. How are you feeling?"
  ↓
App starts listening for voice input (30 second timeout)
  ↓
┌─────────────────────┬────────────────────────┐
│                     │                        │
PATIENT RESPONDS    NO RESPONSE              
  ↓                   ↓
Voice → Text      Wait 30 seconds
  ↓                   ↓
Send to Backend   Send second prompt:
  ↓               "Maggie, please say something
Backend:           so I know you're okay"
1. Get Letta         ↓
   context         Listen again (30 sec)
2. Send to           ↓
   Claude         ┌──────┬──────┐
3. Analyze         │      │
   response        RESPONDS  STILL NO RESPONSE
4. Update             ↓        ↓
   Letta           (same    CREATE ALERT
5. Generate         as      ↓
   reply           left)   Notify caregiver:
  ↓                        • SMS via Twilio
Send response              • Dashboard update
to app                     • Log in database
  ↓
App speaks response
  ↓
Log interaction
```

---

#### 2. Manual Conversation Flow
```
PATIENT INITIATES:

Patient taps "Talk to Me" button (or says "Hey Companion")
  ↓
App starts listening
  ↓
Patient speaks: "I'm feeling dizzy"
  ↓
Voice → Text conversion
  ↓
Send to Backend: {patient_id, message: "I'm feeling dizzy", timestamp}
  ↓
BACKEND PROCESSING:
┌──────────────────────────────────────────────────┐
│ STEP 1: Retrieve Letta Context                   │
│                                                   │
│ Query Letta agent for patient:                   │
│ - What patterns do we know?                       │
│ - Communication preferences?                      │
│ - Recent health mentions?                         │
│ - Family context?                                 │
│                                                   │
│ Letta returns comprehensive memory                │
└──────────────┬────────────────────────────────────┘
               ↓
┌──────────────────────────────────────────────────┐
│ STEP 2: Get Current Context                      │
│                                                   │
│ From database:                                    │
│ - Patient profile (age, conditions, preferences) │
│ - Today's schedule and completed activities      │
│ - Recent conversations (last 5)                  │
│ - Current medications                            │
│ - Family member info from personal_context       │
└──────────────┬────────────────────────────────────┘
               ↓
┌──────────────────────────────────────────────────┐
│ STEP 3: Send Everything to Claude                │
│                                                   │
│ Prompt includes:                                  │
│ - Patient profile                                 │
│ - Letta's memory (patterns, preferences)         │
│ - Current context (schedule, recent activity)    │
│ - Patient's message: "I'm feeling dizzy"         │
│                                                   │
│ Ask Claude to:                                    │
│ - Understand intent                               │
│ - Assess severity (is this emergency?)           │
│ - Detect emotional state                          │
│ - Generate appropriate response                   │
│ - Recommend actions (alert caregiver? call 911?) │
└──────────────┬────────────────────────────────────┘
               ↓
┌──────────────────────────────────────────────────┐
│ STEP 4: Claude Analyzes and Responds             │
│                                                   │
│ Claude returns:                                   │
│ {                                                 │
│   "intent": "health_concern",                     │
│   "severity": "medium",                           │
│   "reasoning": "Dizziness could indicate blood    │
│                 pressure issue or dehydration",   │
│   "emotional_state": "concerned",                 │
│   "response": "I'm concerned about your dizziness,│
│                Maggie. Have you taken your blood  │
│                pressure medication today? Would   │
│                you like me to alert your daughter?│
│   "recommended_actions": [                        │
│     "alert_caregiver",                            │
│     "ask_followup_questions"                      │
│   ],                                              │
│   "needs_escalation": true                        │
│ }                                                 │
└──────────────┬────────────────────────────────────┘
               ↓
┌──────────────────────────────────────────────────┐
│ STEP 5: Take Action Based on Analysis            │
│                                                   │
│ If needs_escalation = true:                       │
│   → Create alert in database                      │
│   → Send SMS to caregiver via Twilio              │
│   → Update dashboard                              │
│                                                   │
│ If follow-up needed:                              │
│   → Mark conversation as ongoing                  │
│   → Keep context for next message                 │
└──────────────┬────────────────────────────────────┘
               ↓
┌──────────────────────────────────────────────────┐
│ STEP 6: Update Letta's Memory                    │
│                                                   │
│ Send to Letta:                                    │
│ "Patient mentioned dizziness at 2:30 PM.          │
│  Context: Had not taken BP medication yet.        │
│  Response: Concerned but cooperative.             │
│  Action taken: Alerted caregiver."                │
│                                                   │
│ Letta learns:                                     │
│ - Patient reports health concerns appropriately   │
│ - Dizziness may be pattern (track over time)     │
│ - Responsive to follow-up questions               │
└──────────────┬────────────────────────────────────┘
               ↓
┌──────────────────────────────────────────────────┐
│ STEP 7: Send Response Back to App                │
│                                                   │
│ Return to mobile app:                             │
│ {                                                 │
│   "response": "I'm concerned about your dizziness,│
│                Maggie. Have you taken your blood  │
│                pressure medication today?...",    │
│   "speak": true,                                  │
│   "keep_listening": true,                         │
│   "alert_sent": true                              │
│ }                                                 │
└──────────────┬────────────────────────────────────┘
               ↓
App receives response
  ↓
TTS speaks: "I'm concerned about your dizziness, Maggie..."
  ↓
App continues listening for follow-up response
  ↓
[Conversation continues in same pattern]
```

---

#### 3. Emergency Alert Flow
```
PATIENT PRESSES EMERGENCY BUTTON:

Big red "I NEED HELP" button pressed
  ↓
App shows confirmation: "Alerting your family now. Press again to confirm."
  ↓
Patient confirms (or auto-confirms after 3 seconds)
  ↓
Send to Backend: {patient_id, alert_type: "emergency_button", timestamp, location (if available)}
  ↓
BACKEND IMMEDIATE ACTIONS:
┌────────────────────────────────────────────┐
│ 1. Create CRITICAL alert in database       │
│ 2. Send SMS to primary caregiver (Twilio): │
│    "🚨 EMERGENCY: Maggie pressed help      │
│     button at 3:45 PM. Call her now:       │
│     +1234567890"                            │
│ 3. Make voice call to caregiver (Twilio):  │
│    Automated message explaining emergency   │
│ 4. Update dashboard (caregiver sees alert) │
│ 5. Log event with full context             │
└────────────────────────────────────────────┘
  ↓
App displays:
"Help is on the way! Sarah has been alerted.
 Stay where you are and stay calm."
  ↓
App stays on this screen until caregiver acknowledges alert
```

---

#### 4. Activity Monitoring Flow
```
PASSIVE MONITORING (runs continuously):

Mobile App Background Service:
  Every 15 minutes:
    ↓
  Send heartbeat to backend:
    {
      patient_id: "123",
      timestamp: "2025-10-24T14:30:00Z",
      activity_type: "heartbeat",
      app_state: "background", // or "active"
      last_interaction: "2025-10-24T14:15:00Z",
      movement_detected: true // from accelerometer
    }
    ↓
  Backend stores activity log
    ↓
Backend Scheduler (every 30 minutes):
  ↓
Check all patients' last activity
  ↓
For each patient:
  ↓
Calculate: hours_since_last_activity = (now - last_activity_timestamp) / 3600
  ↓
Is it daytime (8am - 8pm)?
  ↓
┌──────────────┬──────────────────────┐
│              │                      │
YES            NO
  ↓              ↓
Is hours >= 4? Skip (nighttime
  ↓            is expected
┌──┴──┐         inactivity)
│     │
YES   NO
  ↓     ↓
Has   Skip
recent
alert?
  ↓
┌──┴──┐
│     │
NO   YES
  ↓     ↓
CREATE Skip
ALERT  (don't
↓      spam)
Severity: MEDIUM
Type: "unusual_inactivity"
Message: "No activity from Maggie for 4+ hours"
  ↓
Actions:
1. Send SMS to caregiver
2. Update dashboard
3. Log alert
4. Suggest welfare check
```

----------

## Tech Stack

### Backend Stack

-   **Framework**: FastAPI (Python 3.11+)
    -   Fast, modern, async support
    -   Auto-generated API documentation
    -   Built-in validation with Pydantic
-   **Database**: PostgreSQL 15
    -   Reliable, ACID compliant
    -   JSONB support for flexible schemas
    -   Excellent performance for our use case
-   **ORM**: SQLAlchemy 2.0
    -   Async support
    -   Type-safe queries
    -   Migration management with Alembic
-   **Task Scheduling**: APScheduler
    -   Run background jobs (check-ins, monitoring, summaries)
    -   Cron-like scheduling
    -   Persistent job store
-   **Authentication**: JWT (JSON Web Tokens)
    -   Stateless authentication
    -   Secure caregiver access
    -   Token refresh mechanism

----------

### AI & Intelligence Stack

#### 1. Claude API (Anthropic)

**Purpose**: Real-time conversation understanding and generation **Model**: claude-sonnet-4 (latest) **Use cases**:

-   Analyze patient messages for intent, emotion, urgency
-   Generate personalized, contextual responses
-   Detect confusion, distress, or health concerns
-   Create daily summary narratives
-   Answer patient questions about medications, family, etc.

#### 2. Letta Cloud

**Purpose**: Long-term memory and pattern recognition **Use cases**:

-   Remember patient preferences (name, communication style)
-   Track behavioral patterns over time
-   Store family context and personal information
-   Identify changes (mood shifts, routine deviations)
-   Provide personalization insights to Claude

#### 3. Chroma

**Purpose**: Semantic search through conversation history **Use cases**:

-   Find similar past interactions
-   Search for specific topics ("knee pain mentions")
-   Cluster conversations by theme
-   Retrieve relevant context for Claude

**Why these three work together**:

-   **Claude** = The brain (understands and responds NOW)
-   **Letta** = The memory (knows history and patterns)
-   **Chroma** = The search engine (finds relevant past info)

----------

### Communication Services

#### 1. Twilio

**Purpose**: Communication with CAREGIVERS ONLY (NOT patients) **Services used**:

-   **SMS API**: Send text alerts to caregivers for emergencies
-   **Voice API**: Make phone calls to caregivers for critical alerts **NOT used for**: Patient voice calls (all patient voice is in-app)

#### 2. Firebase Cloud Messaging (FCM)

**Purpose**: Push notifications to patient's mobile app **Use cases**:

-   Scheduled check-in notifications
-   Reminder notifications
-   Wake app from background for voice interaction
-   Silent notifications for data sync

#### 3. Vapi (Optional Enhancement)

**Purpose**: More natural voice AI conversations **Use case**: If time permits, replace basic TTS with Vapi's conversational AI **Benefits**: Better accent handling, more natural dialogue flow **Priority**: Nice-to-have, not essential for MVP

----------

### Mobile App Stack

**Framework**: React Native with Expo

-   **Why**: Write once, deploy iOS + Android
-   **Expo benefits**: Easier setup, managed builds, OTA updates

**Key Libraries**:

-   **@react-native-voice/voice**: Speech-to-text (voice input)
-   **expo-speech**: Text-to-speech (voice output)
-   **react-native-background-fetch**: Run tasks while app in background
-   **@react-navigation/native**: Screen navigation
-   **axios**: API calls to backend
-   **AsyncStorage**: Local data persistence
-   **react-native-sensors** (optional): Accelerometer for motion detection

**UI Library**: React Native Paper (Material Design)

-   Large, accessible components
-   High contrast, elderly-friendly

----------

### Web Dashboard Stack

**Framework**: Next.js 14 with TypeScript

-   Server-side rendering
-   API routes (optional)
-   Optimized performance

**Styling**: Tailwind CSS

-   Rapid development
-   Responsive by default
-   Easy customization

**Data Visualization**: Recharts

-   Activity timelines
-   Mood trends
-   Medication adherence charts

**State Management**: React Query

-   Server state caching
-   Automatic refetching
-   Optimistic updates

----------

### DevOps & Deployment

**Backend Hosting**: Railway.app

-   Free tier includes PostgreSQL
-   Easy deployments from GitHub
-   Environment variable management
-   Automatic HTTPS

**Database**: Railway PostgreSQL

-   Included with backend
-   Automatic backups
-   Connection pooling

**Web Dashboard**: Vercel

-   Free tier for Next.js
-   Automatic deployments
-   Edge network (fast globally)

**Mobile Builds**: Expo EAS Build

-   Build iOS and Android from cloud
-   No need for local Xcode/Android Studio
-   Or use Expo Go for quick demo (no build needed)

----------

## Database Schema

### Design Principles

-   **Normalize where appropriate**: Avoid data duplication
-   **Denormalize for performance**: Store commonly accessed data together
-   **Use JSONB for flexibility**: Personal context, analysis results
-   **Index strategically**: Common query patterns
-   **Audit trail**: Track all changes with timestamps

----------

### Tables Overview

1.  **patients** - Core patient profiles
2.  **caregivers** - Family members and care providers
3.  **patient_caregiver_relationship** - Link patients to caregivers (many-to-many)
4.  **schedules** - Recurring reminder templates
5.  **reminders** - Individual reminder instances
6.  **conversations** - All conversational interactions
7.  **daily_summaries** - Generated end-of-day reports
8.  **alerts** - Critical notifications requiring attention
9.  **patient_insights** - Learned patterns from Letta
10.  **activity_logs** - Heartbeat and interaction tracking
11.  **system_logs** - Application logs and debugging

----------

### Table 1: patients

**Purpose**: Store all information about elderly patients

**Key Fields**:

**Basic Information**:

-   `id` (UUID, primary key)
-   `first_name`, `last_name`
-   `date_of_birth`
-   `gender`
-   `profile_photo_url`

**Contact Information**:

-   `phone_number` (unique, for emergency calls)
-   `email` (optional)
-   `address`
-   `timezone` (important for scheduling)

**Medical Information**:

-   `medical_conditions` (TEXT ARRAY: ["diabetes", "hypertension", "dementia"])
-   `allergies` (TEXT ARRAY)
-   `emergency_notes` (TEXT: critical info for emergencies)

**AI Personalization**:

-   `preferred_voice` (male/female/neutral)
-   `communication_style` (friendly/formal/casual)
-   `language` (en, es, fr, etc.)
-   `letta_agent_id` (VARCHAR: link to Letta memory agent)

**Personal Context** (JSONB):

json

```json
{
  "family_members": [
    {
      "name": "Sarah",
      "relationship": "daughter",
      "details": "Lives in Seattle, calls every Sunday, nurse, has two kids (Tommy 7, Emma 5)",
      "contact": "+1234567890",
      "primary_contact": true
    }
  ],
  "important_dates": [
    {"date": "1945-06-15", "event": "Wedding anniversary", "deceased_spouse": true}
  ],
  "hobbies": ["gardening", "knitting", "game shows"],
  "favorite_topics": ["grandchildren", "old movies", "rose garden"],
  "sensitive_topics": ["late husband", "difficulty walking"],
  "special_notes": "Loves talking about roses. Gets emotional about husband."
}
```

**Device & Activity**:

-   `device_token` (for push notifications)
-   `app_version`
-   `last_active_at` (TIMESTAMP)
-   `last_heartbeat_at` (TIMESTAMP)

**Status**:

-   `is_active` (BOOLEAN)
-   `created_at`, `updated_at`

**Indexes**:

-   `phone_number` (unique)
-   `is_active`
-   `last_active_at` (for inactivity checks)

----------

### Table 2: caregivers

**Purpose**: Store information about family members and care providers

**Key Fields**:

**Basic Information**:

-   `id` (UUID)
-   `first_name`, `last_name`
-   `relationship` (daughter, son, spouse, professional caregiver, etc.)

**Contact**:

-   `phone_number` (for alerts)
-   `email` (for login and reports)

**Authentication**:

-   `password_hash` (bcrypt)
-   `last_login_at`

**Preferences** (JSONB):

json

```json
{
  "notifications": {
    "email": true,
    "sms": true,
    "push": false
  },
  "alert_threshold": "medium",  // low, medium, high, critical_only
  "quiet_hours": {
    "enabled": true,
    "start": "22:00",
    "end": "07:00"
  },
  "daily_summary_time": "20:00",  // when to send daily report
  "summary_delivery": ["email", "dashboard"]
}
```

**Status**:

-   `is_active`
-   `created_at`, `updated_at`

----------

### Table 3: patient_caregiver_relationship

**Purpose**: Link patients to their caregivers (many-to-many)

**Why**: One patient can have multiple caregivers, one caregiver can manage multiple patients

**Key Fields**:

-   `id` (UUID)
-   `patient_id` (FK → patients.id)
-   `caregiver_id` (FK → caregivers.id)
-   `is_primary` (BOOLEAN: primary contact for emergencies)
-   `access_level` (full, view_only, emergency_only)
-   `relationship_notes` (TEXT: "Lives nearby, visits daily")
-   `created_at`

**Constraints**:

-   Unique combination of (patient_id, caregiver_id)
-   At least one primary caregiver per patient (business logic)

----------

### Table 4: schedules

**Purpose**: Define recurring reminder templates

**Key Fields**:

**Basic Info**:

-   `id` (UUID)
-   `patient_id` (FK → patients.id)
-   `title` (VARCHAR: "Morning Medication", "Lunch")
-   `description` (TEXT: additional details)
-   `category` (ENUM: medication, meal, exercise, social, hygiene, other)

**Timing**:

-   `schedule_type` (ENUM: daily, weekly, specific_date, interval)
-   `time_of_day` (TIME: 08:00:00)
-   `days_of_week` (INTEGER ARRAY: [0,1,2,3,4,5,6] for Sun-Sat, NULL if daily)
-   `specific_date` (DATE: for one-time reminders)
-   `interval_hours` (INTEGER: for "every X hours" reminders)

**Reminder Configuration**:

-   `reminder_method` (ENUM: push, push_with_voice, check_in)
-   `advance_reminder_minutes` (INTEGER: remind X minutes before, default 5)
-   `max_retry_attempts` (INTEGER: default 2)
-   `retry_interval_minutes` (INTEGER: default 10)

**Medication Specific** (if category = medication):

-   `medication_name` (VARCHAR: "Lisinopril")
-   `dosage` (VARCHAR: "10mg")
-   `medication_color` (VARCHAR: "yellow pill", "blue tablet")
-   `medication_location` (VARCHAR: "kitchen table", "bedside drawer")
-   `medication_instructions` (TEXT: "Take with food")

**Status**:

-   `is_active` (BOOLEAN)
-   `start_date`, `end_date` (NULL = indefinite)
-   `created_at`, `updated_at`

**Indexes**:

-   `patient_id`
-   `is_active`
-   `time_of_day`
-   `category`

----------

### Table 5: reminders

**Purpose**: Track individual reminder instances (generated from schedules)

**Key Fields**:

**Links**:

-   `id` (UUID)
-   `schedule_id` (FK → schedules.id)
-   `patient_id` (FK → patients.id)

**Timing**:

-   `scheduled_time` (TIMESTAMP: when it should trigger)
-   `sent_at` (TIMESTAMP: when actually sent)
-   `responded_at` (TIMESTAMP: when patient responded)

**Delivery**:

-   `delivery_method` (push, voice_call_backup, check_in)
-   `delivery_status` (pending, sent, delivered, failed)
-   `notification_id` (external ID from FCM/Twilio)

**Response**:

-   `response_text` (TEXT: transcribed speech)
-   `response_audio_url` (TEXT: recording URL if saved)
-   `acknowledged` (BOOLEAN: did they confirm completion)

**AI Analysis** (JSONB):

json

```json
{
  "claude_analysis": {
    "intent": "task_completed",
    "confidence": 0.95,
    "reasoning": "Patient said 'already took it' which Letta data shows is 95% reliable",
    "emotional_state": "neutral",
    "concerns": [],
    "needs_escalation": false
  },
  "sentiment": "positive",
  "completion_status": "completed"  // completed, skipped, unclear, missed
}
```

**Follow-up**:

-   `retry_count` (INTEGER)
-   `next_retry_at` (TIMESTAMP)
-   `requires_caregiver_attention` (BOOLEAN)

**Timestamps**:

-   `created_at`, `updated_at`

**Indexes**:

-   `patient_id`
-   `scheduled_time`
-   `delivery_status`
-   `completion_status`

----------

### Table 6: conversations

**Purpose**: Store all conversational interactions beyond scheduled reminders

**Key Fields**:

**Context**:

-   `id` (UUID)
-   `patient_id` (FK → patients.id)
-   `conversation_type` (reminder_followup, casual_chat, emergency, check_in, question)
-   `related_reminder_id` (FK → reminders.id, nullable)

**Message**:

-   `message_from` (patient, ai, caregiver)
-   `message_text` (TEXT)
-   `audio_url` (TEXT: if voice recorded)

**AI Context** (JSONB):

json

```json
{
  "claude_response": "I'm concerned about your dizziness...",
  "intent_detected": "health_concern",
  "confidence": 0.87,
  "sentiment": "concerned",
  "topics": ["health", "dizziness", "medication"],
  "requires_escalation": true,
  "escalation_reason": "potential_health_emergency"
}
```

**Metadata**:

-   `created_at`

**Indexes**:

-   `patient_id`
-   `conversation_type`
-   `created_at` (DESC for recent conversations)

----------

### Table 7: daily_summaries

**Purpose**: Generated reports for caregivers at end of each day

**Key Fields**:

**Identity**:

-   `id` (UUID)
-   `patient_id` (FK → patients.id)
-   `summary_date` (DATE)

**Statistics**:

-   `total_reminders_sent` (INTEGER)
-   `reminders_acknowledged` (INTEGER)
-   `reminders_missed` (INTEGER)
-   `medications_taken` (INTEGER)
-   `medications_missed` (INTEGER)
-   `meals_completed` (INTEGER)
-   `conversations_initiated` (INTEGER: by patient)
-   `emergency_alerts` (INTEGER)

**Mood & Sentiment**:

-   `overall_mood` (great, good, okay, concerning, distressed)
-   `mood_trend` (improving, stable, declining)
-   `mood_confidence` (FLOAT: AI's confidence in assessment)

**AI-Generated Insights** (TEXT ARRAYS):

-   `key_observations` (["Responded to all morning reminders within 5 minutes", "Mentioned knee pain twice"])
-   `concerns` (["Missed both evening medications", "Seemed confused about day of week"])
-   `positive_notes` (["Engaged in pleasant conversation about grandchildren", "Completed exercise routine"])

**Recommendations** (TEXT ARRAY):

-   `caregiver_recommendations` (["Consider adjusting evening reminder time", "May need follow-up about knee pain"])

**Detailed Timeline** (JSONB):

json

```json
{
  "timeline": [
    {
      "time": "08:00",
      "event": "Morning medication",
      "status": "completed",
      "response_time_minutes": 3,
      "notes": "Acknowledged promptly"
    },
    {
      "time": "12:30",
      "event": "Lunch reminder",
      "status": "completed",
      "notes": "Mentioned feeling tired"
    },
    {
      "time": "14:00",
      "event": "Check-in conversation",
      "status": "engaged",
      "duration_seconds": 145,
      "topics": ["weather", "grandchildren"],
      "mood": "happy"
    }
  ]
}
```

**Delivery**:

-   `sent_to_caregiver` (BOOLEAN)
-   `sent_at` (TIMESTAMP)
-   `delivery_methods` (TEXT ARRAY: ["email", "dashboard"])

**Timestamps**:

-   `created_at`

**Constraints**:

-   Unique (patient_id, summary_date)

----------

### Table 8: alerts

**Purpose**: Critical notifications requiring caregiver attention

**Key Fields**:

**Identity**:

-   `id` (UUID)
-   `patient_id` (FK → patients.id)

**Alert Details**:

-   `alert_type` (no_response, distress_detected, medication_error, unusual_inactivity, emergency_button, health_concern, pattern_change)
-   `severity` (low, medium, high, critical)
-   `title` (VARCHAR: "No response to medication reminders")
-   `description` (TEXT: detailed explanation)

**Context**:

-   `related_reminder_id` (FK → reminders.id, nullable)
-   `related_conversation_id` (FK → conversations.id, nullable)
-   `trigger_data` (JSONB: additional context)

**Response**:

-   `acknowledged` (BOOLEAN)
-   `acknowledged_by` (FK → caregivers.id)
-   `acknowledged_at` (TIMESTAMP)
-   `resolution_notes` (TEXT: what caregiver did)
-   `resolved_at` (TIMESTAMP)

**Notification**:

-   `notification_sent` (BOOLEAN)
-   `notification_sent_at` (TIMESTAMP)
-   `notification_method` (sms, call, email, push, multiple)
-   `notification_ids` (JSONB: tracking IDs from Twilio, etc.)

**Timestamps**:

-   `created_at`

**Indexes**:

-   `patient_id`
-   `severity`
-   `acknowledged`
-   `created_at` (DESC)

----------

### Table 9: patient_insights

**Purpose**: Store learned patterns and insights from Letta

**Key Fields**:

**Identity**:

-   `id` (UUID)
-   `patient_id` (FK → patients.id)

**Insight Details**:

-   `insight_type` (response_pattern, timing_preference, communication_style, health_pattern, behavioral_change)
-   `insight_category` (behavior, health, communication, routine, social)
-   `title` (VARCHAR: "Prefers morning reminders")
-   `description` (TEXT: "Patient responds to morning medication reminders within 5 minutes, but evening reminders require 2-3 attempts")

**Evidence**:

-   `confidence_score` (FLOAT: 0.0 to 1.0)
-   `based_on_interactions` (INTEGER: how many data points)
-   `first_observed_at` (TIMESTAMP)
-   `last_observed_at` (TIMESTAMP)
-   `example_interactions` (JSONB ARRAY: references to supporting data)

**Actionability**:

-   `is_actionable` (BOOLEAN)
-   `recommended_action` (TEXT: "Adjust evening reminder time to 6:30 PM")
-   `action_priority` (low, medium, high)

**Status**:

-   `is_active` (BOOLEAN: still current or outdated)
-   `reviewed_by_caregiver` (BOOLEAN)
-   `reviewed_at` (TIMESTAMP)
-   `caregiver_notes` (TEXT)

**Timestamps**:

-   `created_at`, `updated_at`

**Indexes**:

-   `patient_id`
-   `insight_type`
-   `is_active`
-   `confidence_score` (DESC)

----------

### Table 10: activity_logs

**Purpose**: Track all patient activity for monitoring

**Key Fields**:

**Identity**:

-   `id` (UUID)
-   `patient_id` (FK → patients.id)

**Activity Details**:

-   `activity_type` (heartbeat, app_open, app_close, voice_interaction, button_press, reminder_acknowledged, movement_detected, screen_interaction)
-   `timestamp` (TIMESTAMP)
-   `app_state` (active, background, inactive)

**Additional Context** (JSONB):

json

```json
{
  "location": {"lat": 37.7749, "lng": -122.4194},  // if available
  "battery_level": 0.75,
  "movement_intensity": 0.8,  // from accelerometer
  "screen_on": true,
  "network_type": "wifi"
}
```

**Indexes**:

-   `patient_id`
-   `timestamp` (DESC)
-   `activity_type`

**Retention Policy**: Keep 30 days, archive older

----------

### Table 11: system_logs

**Purpose**: Application logging and debugging

**Key Fields**:

**Identity**:

-   `id` (UUID)

**Log Details**:

-   `log_level` (debug, info, warning, error, critical)
-   `log_type` (api_call, reminder_sent, ai_interaction, alert_triggered, database_query, external_service)
-   `message` (TEXT)
-   `details` (JSONB: structured data)

**Context**:

-   `patient_id` (FK, nullable)
-   `caregiver_id` (FK, nullable)
-   `source` (VARCHAR: which service/component)
-   `stack_trace` (TEXT: if error)

**Timestamp**:

-   `created_at`

**Indexes**:

-   `log_level`
-   `log_type`
-   `created_at` (DESC)
-   `patient_id`

**Retention Policy**: Keep 90 days, archive critical errors indefinitely

----------

## Core Features

### Feature 1: Smart Hybrid Monitoring System

**What**: Multi-layered approach to ensure patient safety without being intrusive

**Components**:

#### 1.1 Scheduled Check-Ins (Every 2 Hours)

**How it works**:

-   Backend scheduler triggers check-in at configured intervals (default: 2 hours)
-   Send push notification to app with friendly message
-   App plays TTS: "Hi [PreferredName], just checking in. How are you feeling?"
-   Listen for response (30 second timeout)
-   If no response, wait and try again with more urgent tone
-   After 2 failed attempts (total 60 seconds), create alert

**Personalization via Letta**:

-   Adjust check-in frequency based on patient's routine
-   Use language style patient responds to best
-   Consider time of day (don't check during nap time if pattern detected)

**Implementation considerations**:

-   Store check-in results in reminders table (special category)
-   Track response patterns over time
-   Allow caregiver to adjust frequency per patient

----------

#### 1.2 Manual Activation (Always Available)

**What**: Patient-initiated conversation

**UI**:

-   Giant "Talk to Me" button on home screen (can't miss it)
-   Always visible, even when app minimized (via notification)
-   Optional: Wake word "Hey Companion" (if implemented)

**Flow**:

-   Patient taps button (or says wake word)
-   App immediately starts listening
-   Visual feedback: pulsing microphone icon
-   Patient speaks anything
-   App processes through full AI pipeline (Letta → Claude)
-   Responds appropriately

**Use cases**:

-   "Did I take my medicine?" → Check today's reminders
-   "I'm feeling dizzy" → Health concern, alert caregiver
-   "I'm lonely" → Engage in conversation
-   "Call my daughter" → Facilitate contact

----------

#### 1.3 Emergency Button (One-Tap SOS)

**UI Requirements**:

-   Giant red button
-   Always visible (persistent notification + in-app)
-   High contrast (red on white background)
-   Large text: "I NEED HELP"
-   Simple icon (SOS or phone)

**Interaction**:

-   Single tap shows confirmation: "Alert your family? Tap again to confirm"
-   Auto-confirm after 3 seconds if no cancel
-   Vibration feedback
-   Audible confirmation: "Help is on the way"

**Actions triggered**:

1.  Create CRITICAL alert in database
2.  Send SMS to ALL caregivers (not just primary): "🚨 EMERGENCY: [Name] pressed help button at [time]. Call now: [phone]"
3.  Make voice call to primary caregiver via Twilio
4.  Update dashboard with flashing alert
5.  Display reassurance message to patient: "Sarah has been alerted. Stay where you are."
6.  Keep screen on this message until caregiver acknowledges

**Important**: Do NOT auto-call 911. Let caregiver decide if needed.

----------

#### 1.4 Passive Activity Monitoring

**What**: Track app usage and device movement to detect unusual inactivity

**Data collected (every 15 minutes via heartbeat)**:

-   App state (foreground/background/closed)
-   Last user interaction timestamp
-   Device movement (accelerometer data)
-   Battery level (to know if phone died)
-   Location (if permissions granted)

**Inactivity detection logic**:

-   Define "daytime": 8 AM - 8 PM (customizable per patient)
-   If NO activity detected for 4+ hours during daytime → Create alert
-   Severity depends on context:
    -   Just no app usage → Medium alert
    -   No app usage + no device movement → High alert
    -   No app usage + battery critical → High alert (phone may be dead)

**Smart filtering**:

-   Don't alert if patient had a scheduled appointment (check calendar integration)
-   Don't alert during known nap times (learn from Letta patterns)
-   Don't alert if caregiver recently acknowledged similar alert

**Caregiver alert message**: "No activity detected from [Name] for [X] hours. Last seen: [time]. May want to check in."

----------

### Feature 2: Intelligent Conversation System

**What**: Voice-first AI that understands, remembers, and responds naturally

----------

#### 2.1 Voice Input Processing

**How patient speaks**:

-   Tap "Talk to Me" button
-   Speak naturally (no specific phrases required)
-   Visual feedback while listening (pulsing mic, "I'm listening...")

**Speech-to-text**:

-   Use device's built-in speech recognition (react-native-voice)
-   Fallback to cloud STT if local quality poor
-   Support multiple accents and speech patterns
-   Handle background noise gracefully

**What gets sent to backend**:

json

```json
{
  "patient_id": "uuid",
  "message": "I already took my medicine",
  "timestamp": "2025-10-24T08:05:23Z",
  "context": {
    "last_reminder": "Morning medication at 8:00 AM",
    "triggered_by": "reminder_response"  // or "manual", "check_in"
  }
}
```

---

#### 2.2 AI Processing Pipeline (Claude + Letta)

**Step 1: Retrieve Letta Context**
- Query Letta agent: "What do you know about this patient?"
- Letta returns:
  - Communication preferences (name, style, patterns)
  - Medication reliability scores
  - Health mentions and concerns
  - Family context
  - Recent behavioral patterns

**Step 2: Get Current Context**
- From database:
  - Patient profile
  - Today's schedule and what's been completed
  - Recent conversations (last 5)
  - Active medications
  - Family member information from personal_context field

**Step 3: Send Everything to Claude**
- Construct comprehensive prompt including:
  - Patient profile
  - Letta's memory
  - Current context
  - Patient's message
- Ask Claude to:
  - Understand intent
  - Assess urgency/severity
  - Detect emotional state
  - Generate appropriate response
  - Recommend actions (alert caregiver, ask follow-up, etc.)

**Step 4: Claude Responds**
- Returns structured JSON with:
  - Intent classification
  - Confidence score
  - Sentiment analysis
  - Generated response text
  - Recommended actions
  - Escalation flag

**Step 5: Update Letta's Memory**
- Send interaction summary to Letta:
  - What happened
  - Patient's response
  - Outcome
  - Mood indicators
  - Any notable patterns
- Letta processes and updates long-term memory

**Step 6: Return Response to App**
- Send response text
- App converts to speech (TTS)
- Patient hears natural, conversational reply

---

#### 2.3 Response Generation Principles

**Tone**:
- Warm and friendly (not robotic)
- Patient (never rushed or annoyed)
- Respectful (use preferred name)
- Conversational (not medical jargon)

**Examples**:

❌ **Bad**: "Medication reminder alert. Acknowledge receipt."
✅ **Good**: "Hi Maggie! It's time for your morning pill - the yellow one on the kitchen table."

❌ **Bad**: "Affirmative. Task logged."
✅ **Good**: "Perfect! Thanks for letting me know, Maggie."

❌ **Bad**: "Please clarify your previous statement."
✅ **Good**: "I'm not sure I understood. Did you mean [interpretation]?"

**Handling confusion**:
- If patient seems confused, don't repeat exact same phrase
- Rephrase more simply
- Offer specific options instead of open-ended questions
- Example:
  - Patient: "What medicine?"
  - AI: "Your blood pressure medicine - the yellow pill that's usually on your kitchen table. Do you see it?"

**Handling distress**:
- Immediate empathy
- Clear action steps
- Reassurance that help is coming
- Example:
  - Patient: "I feel really dizzy and my chest hurts"
  - AI: "I'm concerned about your chest pain, Maggie. I'm alerting Sarah right now. Can you sit down somewhere safe? Should I call 911 for you?"

---

### Feature 3: Medication Management

**What**: Intelligent reminder system that learns and adapts

#### 3.1 Reminder Configuration

**Setup by caregiver**:
- Medication name
- Dosage
- Schedule (times, days of week)
- Visual description (color, shape, location)
- Special instructions ("take with food")

**Advanced options**:
- Advance warning (5 min before)
- Retry attempts (default: 2)
- Retry interval (default: 10 min)
- Link to refill tracking (future feature)

#### 3.2 Adaptive Reminders

**What Letta learns over time**:
- Best times for this patient (even if different from prescription)
- How many reminders needed (some people need 1, others need 3)
- Preferred reminder style (gentle vs firm)
- Warning signs of resistance ("I'll do it later" = usually forgotten)

**Adaptations**:
- Adjust reminder time: If patient consistently takes it 30 min late, suggest time change
- Adjust frequency: If patient never needs reminders for morning pills, reduce emphasis
- Adjust wording: If patient responds better to "heart medicine" than "lisinopril", use that

**Example adaptation**:
```
Week 1: "Time for your lisinopril" → No response, needs 2 reminders
Week 2: "Time for your blood pressure medicine" → Better response
Week 3: Letta learns → Claude now says "Time for your heart pill - the yellow one"
Week 4: Patient responds immediately, every time ✅
```

#### 3.3 Error Detection

**What Claude watches for**:
- Wrong medication: "I took the blue one" when yellow was prescribed
- Wrong dosage: "I took two" when dosage is one
- Timing issues: "I already took it" when reminder was sent 2 minutes ago (unlikely)

**Actions on error detection**:
1. Alert caregiver immediately (SMS)
2. Ask patient clarifying questions
3. Log incident in database
4. Suggest corrective action if safe

**Example**:
```
System: "Time for your yellow heart pill"
Patient: "I took the blue one"
Claude detects: Wrong medication
System: "Maggie, your heart medication is the YELLOW pill, not the blue one. Can you please take the yellow pill from the kitchen table? I'm letting Sarah know just to be safe."
Alert sent to caregiver: "⚠️ Medication confusion detected. Maggie took blue pill instead of yellow heart medication. Please follow up."
```

---

### Feature 4: Caregiver Context & Family Awareness

**What**: AI knows about family members and can discuss them naturally

#### 4.1 Personal Context Setup

**Caregiver fills out during patient setup**:

**Family Members Section**:
- For each family member:
  - Name
  - Relationship
  - Free-form description (AI will parse this)
  - Contact info (phone, email)
  - Is primary contact? (checkbox)

**Example**:
```
Name: Sarah
Relationship: Daughter
Description: Lives in Seattle, works as a nurse, calls every Sunday evening, has two kids - Tommy (7) loves dinosaurs, Emma (5) likes art. Visits once a month.
Contact: +1234567890
Primary: Yes
```

**Important Dates**:
- Birthdays
- Anniversaries
- Other significant dates
- Notes about each (e.g., "Wedding anniversary - husband passed 2 years ago, may be emotional")

**Hobbies & Interests**:
- Free-form list
- AI uses for conversation topics
- Example: "Gardening (roses especially), Knitting, Watching Jeopardy"

**Favorite Topics**:
- What patient loves to talk about
- Example: "Grandchildren, her rose garden, old movies from the 1950s"

**Sensitive Topics**:
- What to avoid or handle carefully
- Example: "Late husband (passed 2022), difficulty walking after hip surgery"

**Special Notes**:
- Any other context
- Example: "Gets emotional about husband but appreciates when you ask about happy memories. Loves when you ask about her roses."

#### 4.2 How AI Uses This Context

**In conversations**:
```
Patient: "Is Sarah coming this weekend?"
AI: [Checks personal_context → Sarah visits once a month, last visit was 3 weeks ago]
Response: "Sarah usually visits once a month, and it's been about three weeks since her last visit. Would you like me to help you call her to ask?"
```
```
Patient: "I'm worried about Tommy"
AI: [Checks personal_context → Tommy is Sarah's son, age 7, loves dinosaurs]
Response: "That's Sarah's son, right? The one who loves dinosaurs? What are you worried about?"
```

**In conversation starters**:
```
AI: "Good morning, Maggie! How's your rose garden doing? Did you water it this week?"
[Uses: hobbies includes "Gardening (roses especially)"]
```
```
AI: "I know Sundays are when Sarah usually calls. Looking forward to talking with her today?"
[Uses: Sarah "calls every Sunday evening"]
```

**Handling sensitive topics**:
```
Patient mentions late husband
AI: [Sees "Late husband" in sensitive_topics with note about appreciating happy memories]
Response: "I know you miss him. Would you like to tell me a happy memory about him? I'd love to hear."
[Instead of awkwardly avoiding the topic]
```

#### 4.3 Context Updates

**Letta learns additional context**:
- Patient mentions Sarah had a baby → Letta adds to memory
- Patient talks about Tommy's soccer game → Letta notes grandson plays soccer
- Patient seems happier on days Sarah calls → Letta notes this pattern

**Caregiver can update**:
- Edit family member info anytime
- Add new family members
- Mark dates (birthdays, etc.)
- Update special notes

---

### Feature 5: Caregiver Dashboard

**What**: Web interface for managing patients and staying informed

#### 5.1 Dashboard Home (Overview Page)

**Layout**:

**Top Section - Patient Cards**:
- Shows all patients assigned to this caregiver
- Each card shows:
  - Photo
  - Name and age
  - Status indicator (green = active today, yellow = some missed items, red = alert)
  - Last activity timestamp
  - Quick stats (reminders today: 8/10 completed)
  - "View Details" button

**Main Section - Selected Patient View**:

**Activity Feed (Real-time)**:
- Timeline of today's events
- Each entry shows:
  - Time
  - Event type (reminder, conversation, alert)
  - Status (completed, missed, ongoing)
  - Patient's response (if any)
  - Quick actions (view details, acknowledge)

**Example entries**:
```
08:00 AM - ✅ Morning Medication
Completed in 3 minutes
Patient said: "I took it"

12:30 PM - 🍽️ Lunch Reminder
Completed in 15 minutes
Patient seemed tired, mentioned knee pain

02:00 PM - 💬 Casual Conversation
Duration: 2 minutes
Topics: Weather, grandchildren
Mood: Happy

06:00 PM - ⚠️ Evening Medication
Missed after 2 attempts
Alert sent to you at 6:25 PM
```

**Right Sidebar - Quick Info**:
- Today's schedule (upcoming reminders)
- Active alerts (if any)
- Mood indicator (emoji + text)
- Quick actions:
  - Call patient
  - Send message
  - Add note
  - Emergency contact

**Statistics Cards**:
- Medications: 7/8 taken today
- Meals: 3/3 completed
- Conversations: 4 total
- Mood: Good (stable)

#### 5.2 Patient Profile Management

**Page sections**:

**Basic Information**:
- Editable fields: name, DOB, contact info, photo
- Medical conditions (add/remove)
- Allergies
- Emergency notes

**Personal Context Tab**:
- Family members (add/edit/remove)
- Important dates
- Hobbies and interests
- Favorite topics
- Sensitive topics
- Special notes

**Communication Preferences**:
- Preferred name
- Voice type (male/female/neutral)
- Communication style (friendly/formal/casual)
- Language

**Device Information** (read-only):
- App version
- Last active
- Device type
- Push notification status

#### 5.3 Schedule Management

**Weekly Calendar View**:
- Shows all scheduled reminders
- Color-coded by category (medication, meals, exercise, etc.)
- Drag-to-adjust timing (future feature)

**Add/Edit Schedule Modal**:
- Basic info: Title, description, category
- Timing: Type (daily/weekly/one-time), time, days
- Medication details (if applicable)
- Reminder settings: Method, retries, intervals
- Active date range

**Bulk Operations**:
- Duplicate schedule to another day
- Temporarily disable all schedules (e.g., during hospital stay)
- Import/export schedules

#### 5.4 Conversation History

**List View**:
- Filterable by date range, type, keywords
- Each conversation shows:
  - Timestamp
  - Type (reminder response, casual chat, etc.)
  - First line preview
  - Sentiment indicator
  - Expand button

**Detail View**:
- Full conversation transcript
- Audio playback (if recorded)
- Claude's analysis (intent, sentiment, concerns)
- Related reminders or alerts
- Add caregiver notes

**Search**:
- Semantic search (powered by Chroma)
- Find conversations about specific topics
- Example: "knee pain" → Shows all times patient mentioned knee pain

#### 5.5 Daily Summary Reports

**Accessed from**:
- Reports page (list of all daily summaries)
- Emailed to caregiver (optional, at configured time)

**Report Contents**:

**Header**:
- Date
- Patient name and photo
- Overall status (good/concerning)

**Statistics Section**:
- Reminders: sent, acknowledged, missed
- Medications: taken, missed, errors
- Meals: completed
- Conversations: patient-initiated, AI-initiated
- Alerts: count and severity breakdown

**Narrative Summary** (generated by Claude):
```
"Margaret had a good day overall. She responded to all morning reminders 
promptly and completed all three meals. She initiated a conversation in 
the afternoon about her grandchildren and seemed happy. However, she 
missed her evening medication despite two reminders, which is unusual for 
her. She mentioned knee pain twice today, which may be worth monitoring."
```

**Mood Analysis**:
- Overall mood: Good
- Trend: Stable (compared to yesterday and last week)
- Supporting evidence: Tone analysis from conversations

**Timeline** (expandable):
- Hour-by-hour breakdown
- Each event with status and notes

**AI Insights**:
- Key observations: ["Responded faster than usual to morning reminders", "Mentioned knee pain twice"]
- Concerns: ["Missed evening medication - unusual pattern"]
- Positive notes: ["Engaged happily about grandchildren", "Completed exercise routine"]

**Recommendations**:
- "Consider following up about knee pain"
- "May want to adjust evening medication reminder time"

#### 5.6 Alerts Management

**Alert List**:
- All alerts, newest first
- Filterable by: severity, status (acknowledged/unacknowledged), type, date range
- Each alert shows:
  - Severity badge (color-coded)
  - Type icon
  - Title and preview
  - Timestamp
  - Status
  - Quick actions (acknowledge, view details)

**Alert Detail View**:
- Full description
- Context (related reminder, conversation, etc.)
- What triggered it
- Recommended actions
- Timeline of events leading to alert
- Resolution section:
  - Mark as acknowledged
  - Add resolution notes
  - Mark as resolved

**Alert Settings** (per patient):
- Alert threshold: Only critical, Medium and above, All
- Quiet hours: Don't send non-critical alerts during specified times
- Delivery methods: SMS, email, dashboard only

---

### Feature 6: Daily Summary Generation

**What**: Automated end-of-day report with AI-generated insights

#### 6.1 Generation Process

**Trigger**: Scheduled job runs at midnight (or configured time) for each patient

**Data Collection**:
- Query all reminders for the day
- Query all conversations for the day
- Query all alerts for the day
- Query activity logs for the day

**Statistical Analysis**:
- Count reminders sent, acknowledged, missed
- Calculate response times
- Count medication adherence
- Measure engagement (conversations, interactions)

**AI Analysis (Claude)**:
- Prompt Claude with full day's data
- Ask for:
  - Narrative summary (3-4 sentences)
  - Mood assessment
  - Key observations (bullet points)
  - Concerns (bullet points)
  - Positive notes (bullet points)
  - Recommendations (actionable items)

**Letta Input**:
- Query Letta for comparative insights
- "How does today compare to typical patterns?"
- "Are there any concerning changes?"

**Storage**:
- Save to daily_summaries table
- Generate PDF (optional)

**Delivery**:
- Display in dashboard
- Email to caregiver (if enabled)
- SMS summary for critical items (if configured)

#### 6.2 Summary Content Structure

**Executive Summary** (Top of page):
- Overall status: ● Good / ⚠️ Needs Attention / 🚨 Concerning
- One-sentence takeaway
- Key metric: "8/10 reminders completed"

**Statistics** (Visual cards):
- Reminders (donut chart showing completed/missed)
- Medications (progress bar)
- Meals (checkmarks)
- Engagement (conversation count)
- Mood (emoji + trend arrow)

**Narrative** (Claude-generated):
Natural language summary of the day, written as if from caring observer

**Timeline** (Expandable accordion):
- Hour-by-hour breakdown
- Show only key events by default
- Expand to see all details

**Insights Section**:
- **Observations**: Notable patterns or changes
- **Concerns**: Items needing attention
- **Positives**: Good news to celebrate
- **Recommendations**: Specific actionable items

**Comparison** (Letta-powered):
- vs. Yesterday: Better/Worse/Same
- vs. Last Week: Notable changes
- vs. Typical: Any deviations from patterns

---

### Feature 7: Emergency Alert System

**What**: Multi-channel notification system for critical situations

#### 7.1 Alert Triggers

**Trigger Types**:

1. **Emergency Button** (Severity: CRITICAL)
   - Patient presses "I NEED HELP" button
   - Immediate alert, no delays

2. **No Response** (Severity: MEDIUM to HIGH)
   - Patient doesn't respond to check-ins after max retries
   - Severity increases with time

3. **Distress Detected** (Severity: HIGH to CRITICAL)
   - Claude detects concerning phrases: "I fell", "chest pain", "can't breathe"
   - AI determines severity based on context

4. **Unusual Inactivity** (Severity: MEDIUM)
   - No app activity for 4+ hours during daytime
   - Escalates to HIGH if 6+ hours

5. **Medication Error** (Severity: MEDIUM to HIGH)
   - Wrong medication taken
   - Wrong dosage
   - Critical medication missed multiple times

6. **Health Concern Pattern** (Severity: LOW to MEDIUM)
   - Patient repeatedly mentions same health issue
   - Letta detects behavioral change suggesting health decline

7. **Device Issues** (Severity: LOW)
   - App offline for extended period
   - Battery critically low
   - Location services disabled (if relevant)

#### 7.2 Alert Actions

**Immediate Actions** (within seconds):
1. Create alert record in database
2. Determine caregiver(s) to notify based on severity and alert type
3. Send notifications via configured channels
4. Update dashboard (real-time)
5. Log event in system_logs

**Notification Channels**:

**SMS (via Twilio)**:
- For: MEDIUM, HIGH, CRITICAL alerts
- Message format:
```
  [Severity Emoji] ALERT: [Patient Name]
  [Brief description]
  Time: [timestamp]
  Action: [What caregiver should do]
  Link: [dashboard link]
```

**Voice Call (via Twilio)**:

-   For: HIGH, CRITICAL alerts
-   Automated message with details
-   Option to press 1 to call patient directly
-   Option to press 2 to call 911
-   Retry if no answer (up to 3 times)

**Push Notification**:

-   For: All alerts
-   To caregiver's phone (if they have the app or dashboard PWA installed)

**Email**:

-   For: All alerts
-   Detailed information
-   Links to relevant conversations/data
-   Attach context (recent activity, conversations)

**Dashboard**:

-   For: All alerts
-   Real-time update via polling (every 5-10 seconds)
-   Visual/audio notification if caregiver is logged in
-   Persistent until acknowledged

#### 7.3 Alert Management

**Caregiver Actions**:

-   **Acknowledge**: "I've seen this"
-   **Resolve**: "Issue addressed" + notes
-   **Escalate**: Convert to higher priority
-   **Dismiss**: False alarm + reason

**Alert Lifecycle**:

1.  Created → Unacknowledged
2.  Acknowledged → In progress
3.  Resolved → Closed (with resolution notes)

**Follow-up**:

-   If alert not acknowledged in X minutes (configurable), escalate to secondary caregiver
-   If CRITICAL alert not acknowledged in 5 minutes, call secondary contacts
-   Track resolution time for analytics

#### 7.4 Alert Intelligence

**Reduce False Positives**:

-   Don't alert for patterns that are normal for this patient (Letta helps)
-   Allow "snooze" for expected situations (e.g., doctor appointment)
-   Learn from dismissed alerts (Letta tracks)

**Smart Escalation**:

-   Alert starts as MEDIUM
-   If patient doesn't respond to follow-up, escalate to HIGH
-   If prolonged issue, escalate to CRITICAL

**Alert Grouping**:

-   Don't send 10 alerts for same issue
-   Group related alerts: "3 missed medication reminders" instead of 3 separate alerts

----------

### Feature 8: Activity Monitoring & Tracking

**What**: Passive monitoring to detect unusual patterns without being intrusive

#### 8.1 Heartbeat System

**Mobile App sends heartbeat every 15 minutes**:

json

```json
{
  "patient_id": "uuid",
  "timestamp": "2025-10-24T14:30:00Z",
  "activity_type": "heartbeat",
  "app_state": "background",  // active, background, inactive
  "last_interaction_at": "2025-10-24T14:15:00Z",
  "context": {
    "battery_level": 0.75,
    "movement_detected": true,  // from accelerometer
    "location": {"lat": 37.7749, "lng": -122.4194},  // if permissions granted
    "network_type": "wifi"
  }
}
```

**Backend Processing**:

-   Store in activity_logs table
-   Update patient.last_heartbeat_at
-   No action needed unless monitoring job detects inactivity

#### 8.2 Explicit Activity Tracking

**App tracks and sends immediately**:

-   App opened
-   Reminder acknowledged
-   Voice interaction started
-   Button pressed
-   Screen interaction
-   Background → Foreground transition

**Example**:

json

```json
{
  "patient_id": "uuid",
  "timestamp": "2025-10-24T14:32:15Z",
  "activity_type": "voice_interaction",
  "app_state": "active",
  "context": {
    "interaction_duration_seconds": 45,
    "interaction_type": "manual_conversation"
  }
}
```

#### 8.3 Inactivity Detection

**Scheduled Job (runs every 30 minutes)**:

**Logic**:
```
For each active patient:
  1. Get last activity timestamp
  2. Calculate hours since last activity
  3. Check if it's daytime (8 AM - 8 PM in patient's timezone)
  4. If daytime AND hours >= 4:
     a. Check for recent alert (don't spam)
     b. Check for known reasons (hospital visit, etc.)
     c. If no recent alert and no known reason:
        → Create "unusual_inactivity" alert
        → Severity: MEDIUM
        → Notify caregiver
  5. If hours >= 6:
     → Escalate severity to HIGH
  6. If hours >= 8:
     → Escalate severity to CRITICAL (call caregiver)
```

**Context Factors** (reduce false positives):
- Known appointments from schedule
- Typical sleep/nap times (learned by Letta)
- Device battery level (if phone died, not patient issue)
- Recent caregiver interaction (if caregiver visited in person)

#### 8.4 Motion Detection (Optional)

**If implemented**:
- Use device accelerometer
- Detect if phone is moving
- If phone hasn't moved in 6+ hours during daytime → Higher concern
- Helps differentiate between:
  - Patient left phone in one spot but is active elsewhere (OK)
  - Patient and phone both stationary (concerning)

**Implementation**:
- Use react-native-sensors library
- Sample accelerometer every 5 minutes
- If movement detected, send activity log
- If no movement for extended period, flag in heartbeat

---

## AI Integration Strategy

### The Three AI Components Working Together
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                        CLAUDE                           │
│                                                         │
│  Role: Real-time Understanding & Response               │
│                                                         │
│  What it does:                                          │
│  • Analyzes patient messages RIGHT NOW                  │
│  • Understands intent, emotion, urgency                 │
│  • Generates appropriate responses                      │
│  • Detects emergencies and concerns                     │
│  • Answers questions                                    │
│                                                         │
│  Think of Claude as: The brain processing current input │
│                                                         │
└────────────┬────────────────────────────────────────────┘
             │
             │ Claude asks Letta:
             │ "What should I know about this patient?"
             ↓
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                        LETTA                            │
│                                                         │
│  Role: Long-term Memory & Pattern Recognition           │
│                                                         │
│  What it stores:                                        │
│  • Patient preferences (name, communication style)      │
│  • Behavioral patterns (response times, reliability)    │
│  • Health patterns (recurring mentions of pain, etc.)   │
│  • Family context and relationships                     │
│  • Historical trends (mood changes, routine shifts)     │
│                                                         │
│  Think of Letta as: The memory that makes Claude smart  │
│                     about THIS specific patient         │
│                                                         │
└────────────┬────────────────────────────────────────────┘
             │
             │ Letta can search through:
             │ "Find similar past situations"
             ↓
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                       CHROMA                            │
│                                                         │
│  Role: Semantic Search Engine                           │
│                                                         │
│  What it enables:                                       │
│  • Find conversations about specific topics             │
│  • Search: "When did patient mention knee pain?"        │
│  • Cluster: Group similar interactions                  │
│  • Similarity: "Find situations like this one"          │
│                                                         │
│  Think of Chroma as: The search engine for all          │
│                     historical data                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

### Detailed: How They Work Together

#### Scenario: Patient Says "I'm feeling dizzy"

**STEP 1: Letta Provides Context**

Backend queries Letta:
```
"What do you know about Patient #123?"
```

Letta responds:

json

```json
{
  "patient_preferences": {
    "preferred_name": "Maggie",
    "communication_style": "warm and conversational",
    "responds_well_to": "direct questions rather than open-ended"
  },
  "health_patterns": {
    "blood_pressure_medication": {
      "name": "Lisinopril",
      "adherence": "95% - very reliable",
      "timing": "morning, usually takes around 8:30 AM"
    },
    "past_health_mentions": [
      "Mentioned dizziness 3 times in past month",
      "Usually happens in afternoon",
      "Often related to not drinking enough water"
    ]
  },
  "response_patterns": {
    "typical_response_time": "within 5 minutes",
    "reliability_score": 0.92,
    "communication_traits": [
      "Direct and honest about symptoms",
      "Sometimes downplays discomfort"
    ]
  },
  "recent_observations": [
    "Hasn't mentioned dizziness in 2 weeks",
    "Had blood pressure medication 2 hours ago",
    "Completed lunch 30 minutes ago"
  ]
}
```

----------

**STEP 2: Get Current Context**

From database:

json

```json
{
  "patient_profile": {
    "name": "Margaret",
    "preferred_name": "Maggie",
    "age": 78,
    "medical_conditions": ["hypertension", "mild cognitive impairment"],
    "current_medications": [
      {
        "name": "Lisinopril",
        "for": "blood pressure",
        "timing": "8:00 AM daily"
      }
    ]
  },
  "today_context": {
    "current_time": "14:30",
    "completed_activities": [
      "Morning medication - 8:32 AM",
      "Breakfast - 9:15 AM",
      "Check-in conversation - 10:00 AM (mood: good)",
      "Lunch - 12:45 PM"
    ],
    "upcoming_activities": [
      "Afternoon medication - 18:00"
    ]
  },
  "recent_conversations": [
    {
      "time": "10:00 AM",
      "patient_said": "I'm feeling good today",
      "mood": "positive"
    }
  ]
}
```

---

**STEP 3: Send Everything to Claude**

Construct comprehensive prompt:
```
You are a caring AI companion for an elderly patient.

PATIENT PROFILE:
- Name: Margaret, prefers "Maggie"
- Age: 78
- Conditions: Hypertension, mild cognitive impairment
- Medications: Lisinopril (blood pressure) at 8 AM daily

WHAT LETTA KNOWS (Long-term Memory):
[Include all of Letta's response from Step 1]

CURRENT CONTEXT:
- Current time: 2:30 PM
- Completed today: [list from above]
- Recent conversations: [list from above]

PATIENT JUST SAID:
"I'm feeling dizzy"

ANALYZE:
1. What is the likely cause? (Consider Letta's pattern: dizziness usually afternoon, often dehydration)
2. How urgent is this? (Scale: low/medium/high/critical)
3. What questions should you ask to assess better?
4. What's your response to the patient?
5. Should caregiver be alerted? If yes, how urgently?
6. Any other actions needed?

Respond in JSON format with clear reasoning.
```

----------

**STEP 4: Claude Analyzes**

Claude returns:

json

```json
{
  "analysis": {
    "intent": "health_concern",
    "severity": "medium",  // Not critical but needs attention
    "likely_causes": [
      "Dehydration (most likely based on Letta's pattern)",
      "Blood pressure medication effect",
      "Low blood sugar after lunch"
    ],
    "reasoning": "Patient mentions dizziness in afternoon, which Letta data shows is recurring pattern often linked to dehydration. Patient took BP medication this morning which can cause dizziness. Not an emergency based on single symptom, but needs monitoring."
  },
  
  "response_to_patient": "I'm concerned about your dizziness, Maggie. This has happened before, remember? Let's figure out what's going on. First, have you had water to drink in the last couple hours? When you stand up, does the dizziness get worse?",
  
  "follow_up_questions": [
    "Have you had water recently?",
    "Does it get worse when you stand?",
    "Do you feel nauseous or have a headache?",
    "Is the room spinning or do you feel lightheaded?"
  ],
  
  "recommended_actions": {
    "immediate": [
      "Ask follow-up questions",
      "Suggest patient sits down if standing",
      "Suggest drinking water"
    ],
    "monitoring": [
      "Track response to water/rest",
      "Ask again in 15 minutes if symptoms persist"
    ],
    "escalation": "Alert caregiver if symptoms worsen or persist after 30 minutes"
  },
  
  "alert_caregiver": {
    "immediately": false,
    "if_no_improvement": true,
    "severity_if_alerted": "medium",
    "message_to_caregiver": "Maggie reported dizziness at 2:30 PM. This is a recurring pattern (3rd time this month). Asked follow-up questions. Monitoring situation. Will alert again if symptoms worsen or persist."
  }
}
```

---

**STEP 5: App Responds to Patient**

Text-to-speech plays:
```
"I'm concerned about your dizziness, Maggie. This has happened 
before, remember? Let's figure out what's going on. First, have 
you had water to drink in the last couple hours?"
```

App continues listening for response...

---

**STEP 6: Patient Responds**

Patient: "No, I haven't had much water today"

This goes back through the same pipeline:
- Letta context (same as before)
- Claude analyzes: "Patient confirms likely cause (dehydration)"
- Claude responds: "That's probably why you're dizzy! Can you get a glass of water right now? I'll check on you in 15 minutes to make sure you're feeling better."

---

**STEP 7: Update Letta's Memory**

After interaction concludes, send to Letta:
```
Update memory for Patient #123:

INTERACTION SUMMARY:
- Time: 2:30 PM
- Context: Routine day, no issues until now
- Patient reported: Dizziness
- Root cause: Likely dehydration (patient confirmed minimal water intake)
- Patient response: Cooperative, got water as suggested
- Outcome: Symptoms improved after hydration (checked at 2:45 PM)

PATTERNS TO REINFORCE:
- Dizziness pattern: Almost always afternoon, almost always dehydration
- Patient forgets to drink water during day
- Responds well to gentle reminders about hydration

SUGGESTED ADAPTATIONS:
- Add proactive hydration reminders in afternoon (around 2 PM)
- When patient reports dizziness, immediately ask about water intake
- Consider tracking water intake as part of routine check-ins
```

Letta processes and updates its long-term memory. Next time this happens, Claude will have even better context.

---

**STEP 8: Use Chroma for Deeper Analysis (Required for Prize)**

Query Chroma for similar past situations:
```
"Find all past conversations where patient mentioned dizziness"
```

Chroma returns:

json

```json
{
  "similar_conversations": [
    {
      "date": "2025-10-10",
      "patient_said": "I feel dizzy",
      "context": "Afternoon, hadn't drunk water",
      "resolution": "Hydration helped",
      "similarity_score": 0.92
    },
    {
      "date": "2025-09-28",
      "patient_said": "Feeling lightheaded",
      "context": "Mid-afternoon",
      "resolution": "Drank water, felt better",
      "similarity_score": 0.89
    },
    {
      "date": "2025-09-15",
      "patient_said": "Room is spinning a bit",
      "context": "After standing up quickly",
      "resolution": "Sat down, passed in 5 minutes",
      "similarity_score": 0.76
    }
  ],
  "pattern_identified": "All 3 instances were afternoon, 2/3 related to dehydration"
}
```

**How Chroma Complements Letta:**
- **Letta**: Stores structured patterns and learnings (e.g., "Patient has dizziness pattern")
- **Chroma**: Enables semantic search to find specific conversation examples that support Letta's patterns
- **Together**: Letta identifies the pattern, Chroma provides the evidence

----------

### Why This Three-Layer Approach Works

**Claude alone**:

-   ❌ Would forget patient prefers "Maggie"
-   ❌ Wouldn't know about dehydration pattern
-   ❌ Would treat each dizziness report as new issue
-   ✅ Would understand intent and generate response

**Claude + Letta**:

-   ✅ Remembers preferences
-   ✅ Knows historical patterns
-   ✅ Provides personalized context
-   ✅ Adapts over time
-   ⚠️ Limited search through specific past events
-   ⚠️ Can't find "similar situations" semantically

**Claude + Letta + Chroma** (Our Implementation):

-   ✅ All of the above PLUS
-   ✅ **Semantic Search**: "find all times patient mentioned knee pain" → finds "leg hurts", "trouble walking", "knee bothering"
-   ✅ **Pattern Evidence**: Letta says "patient has dizziness pattern", Chroma provides all 5 specific examples
-   ✅ **Caregiver Search**: Dashboard search "confusion" finds relevant conversations even if exact word not used
-   ✅ **Deep History**: Find similar situations from months ago to inform current response
-   ✅ **Prize Winner**: Demonstrates clear value of vector search over keyword search

**Key Insight: Letta and Chroma DON'T Duplicate - They Collaborate**
- **Letta**: "I know this patient tends to get dizzy in afternoons" (abstract pattern)
- **Chroma**: "Here are the 5 specific times they mentioned dizziness" (concrete evidence)
- **Claude**: Uses both to generate informed, contextual response
- **Result**: Better care through complementary AI capabilities

----------

### Implementation Details for Each AI Component

#### Claude Integration

**When to call Claude**:

-   Every patient message (voice or text)
-   Generating reminder messages (personalization)
-   Analyzing reminder responses
-   Creating daily summaries
-   Detecting emergencies

**How to call**:

-   Use Anthropic Python SDK
-   Model: claude-sonnet-4
-   Include comprehensive context in prompt
-   Request structured JSON responses
-   Handle rate limits gracefully

**Prompt Engineering Principles**:

-   Be specific about desired output format
-   Provide patient context upfront
-   Include Letta's insights
-   Give examples of good responses
-   Ask for reasoning (helps debug)

**Error Handling**:

-   If Claude API down: Use fallback responses
-   If unexpected response: Log and use safe default
-   Always validate JSON structure
-   Have timeout (max 10 seconds)

----------

#### Letta Integration

**Setup**:

-   Create one Letta agent per patient
-   Store agent_id in patients.letta_agent_id field
-   Initialize agent with patient profile

**When to update Letta**:

-   After every conversation
-   After every reminder response
-   After daily summary generation
-   When caregiver updates patient info

**What to tell Letta**:

json

```json
{
  "timestamp": "ISO datetime",
  "interaction_type": "reminder_response | casual_chat | check_in | emergency",
  "context": "What was happening",
  "patient_said": "Exact transcript",
  "patient_mood": "From Claude analysis",
  "outcome": "completed | missed | partial | concerning",
  "notable_details": ["Any observations worth remembering"],
  "health_mentions": ["dizziness", "knee pain"],
  "family_mentions": ["Sarah", "grandchildren"],
  "response_quality": "How well patient engaged"
}
```

**When to query Letta**:
- Before sending any message to Claude
- When generating reminders (for personalization)
- When caregiver requests insights
- For daily summary generation

**What to ask Letta**:
```
"What do you know about this patient?"
"How does this situation compare to past patterns?"
"Any relevant insights for this scenario?"
"Has patient mentioned [topic] before?"
"What's the trend in [behavior/mood/health]?"
```

----------

#### Chroma Integration

**Setup**:

-   Create collections:
    -   `conversations_{patient_id}`: All conversation texts
    -   `health_mentions`: Health-related excerpts
    -   `insights`: Learned patterns

**When to add to Chroma**:

-   After every conversation (store embedding)
-   When Letta generates insight (store insight text)
-   When caregiver adds notes

**What to store**:

json

```json
{
  "id": "conversation_uuid",
  "text": "Full conversation or excerpt",
  "embedding": [generated by Chroma],
  "metadata": {
    "patient_id": "uuid",
    "timestamp": "ISO datetime",
    "type": "conversation | reminder | insight",
    "sentiment": "positive | neutral | negative",
    "topics": ["health", "family", "mood"],
    "participants": ["patient", "ai", "caregiver"]
  }
}
```

**When to query Chroma**:
- When caregiver searches conversations
- When generating insights for daily summary
- When looking for patterns (recurring topics)
- When Claude needs historical context beyond what Letta provides

**Query examples**:
```
"Find conversations about knee pain"
"Find similar situations to current scenario"
"Find all mentions of Sarah (patient's daughter)"
"Find conversations where patient seemed confused"
```

---

### Vapi Integration (Optional Enhancement)

**What Vapi adds**:
- More natural voice interactions (better than basic TTS)
- Better accent/speech pattern handling
- Conversational flow management
- Interruption handling

**When to use Vapi**:
- Instead of expo-speech for voice output
- For more complex back-and-forth conversations
- When voice quality matters most

**Implementation**:
- Replace TTS calls with Vapi API
- Vapi handles voice generation
- Can still use Claude for understanding
- Think of Vapi as "voice layer" on top of Claude's brain

**Priority**: Nice-to-have, not essential for MVP. If time permits, add for one showcase conversation.

---

## Communication Flow

### Patient → AI → Caregiver Flow
```
┌──────────────────────────────────────────────────────────┐
│ PATIENT SIDE (Mobile App)                                │
└──────────────────────────────────────────────────────────┘
                      ↓
          Patient speaks or taps button
                      ↓
          Voice → Text (STT on device)
                      ↓
          Send to backend API
                      ↓
┌──────────────────────────────────────────────────────────┐
│ BACKEND PROCESSING                                        │
│                                                           │
│ 1. Receive message                                        │
│ 2. Query Letta for patient context                        │
│ 3. Get current context from database                      │
│ 4. Send all context + message to Claude                   │
│ 5. Claude analyzes and generates response                 │
│ 6. Execute any recommended actions:                       │
│    - Create alerts if needed                              │
│    - Update database                                      │
│    - Notify caregivers if needed                          │
│ 7. Update Letta's memory with interaction                 │
│ 8. Store in Chroma for future search                      │
│ 9. Return response to mobile app                          │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ├─────────────────────────────────┐
                       ↓                                 ↓
┌──────────────────────────────────┐    ┌──────────────────────────────────┐
│ PATIENT SIDE (Mobile App)        │    │ CAREGIVER SIDE (If alerted)      │
│                                  │    │                                  │
│ Receive response                 │    │ Receive notification:            │
│     ↓                            │    │ - SMS (Twilio)                   │
│ Text → Speech (TTS on device)    │    │ - Voice call (Twilio)            │
│     ↓                            │    │ - Dashboard update (polling)     │
│ App speaks response              │    │                                  │
│     ↓                            │    │ Caregiver can:                   │
│ Patient hears and can respond    │    │ - View full context              │
│ (loop continues if needed)       │    │ - Acknowledge alert              │
│                                  │    │ - Call patient                   │
│                                  │    │ - Add notes                      │
└──────────────────────────────────┘    └──────────────────────────────────┘
```

---

### Polling Strategy (Mobile Heartbeat)

**Why Polling (Not WebSocket) for Mobile**:
- Battery efficiency (WebSocket keeps connection open)
- Simpler implementation
- Reliable on unstable mobile networks
- Activity tracking doesn't need real-time (15 min interval is fine)

**How It Works**:

**Background Task** (runs even when app closed):
```
Every 15 minutes:
  1. Collect current state:
     - App state (foreground/background/inactive)
     - Last user interaction timestamp
     - Battery level
     - Movement detection (if accelerometer used)
     - Location (if permissions granted)
  
  2. Send heartbeat to backend:
     POST /api/mobile/heartbeat
     {
       "patient_id": "uuid",
       "timestamp": "2025-10-24T14:30:00Z",
       "activity_type": "heartbeat",
       "app_state": "background",
       "last_interaction_at": "2025-10-24T14:15:00Z",
       "context": {...}
     }
  
  3. Backend responds:
     - 200 OK (stored successfully)
     - May include: pending notifications, schedule updates
  
  4. If response includes pending items, handle them
```

**Libraries**:
- `react-native-background-fetch` (iOS & Android)
- Permissions needed: Background app refresh

---

### Polling Strategy (Dashboard Real-time Updates)

**Why Polling for Dashboard**:
- Simpler than WebSocket for hackathon
- Works across all browsers
- Easy to implement
- Good enough for dashboard use case (not mission-critical milliseconds)

**How It Works**:

**When caregiver dashboard is open**:
```
Every 5-10 seconds:
  1. Poll backend for updates:
     GET /api/dashboard/updates?since={last_update_timestamp}
  
  2. Backend returns:
     {
       "new_alerts": [...],
       "updated_reminders": [...],
       "new_conversations": [...],
       "patient_status_changes": [...]
     }
  
  3. Dashboard updates UI:
     - Add new alerts (with notification sound/visual)
     - Update reminder statuses
     - Add new conversations to history
     - Update patient status indicators
```

**Optimizations**:
- Only poll when tab is active (use Page Visibility API)
- Use If-Modified-Since header to reduce bandwidth
- Backend caches recent updates (don't requery database every time)
- Exponential backoff if errors occur

**User Experience**:
- New alerts appear within 5-10 seconds (acceptable latency)
- Visual indicator shows "live" status
- No page refresh needed
- Sound/visual notification for important updates

---

### Twilio Communication (Caregiver Alerts Only)

**When Twilio is Used**:
- ❌ NOT for patient communication (all in-app)
- ✅ SMS to caregivers (alerts)
- ✅ Voice calls to caregivers (critical alerts)

---

#### SMS Flow

**Trigger**: Alert created with severity ≥ MEDIUM

**Process**:
```
1. Backend determines recipients:
   - Primary caregiver always included
   - Secondary caregivers if CRITICAL
   - Respect caregiver notification preferences
   - Check quiet hours

2. Construct SMS message:
   [Severity emoji] ALERT: [Patient name]
   [Brief description]
   Time: [timestamp]
   [Action item]
   View details: [dashboard link]

3. Send via Twilio API:
   POST to Twilio messaging endpoint
   
4. Store notification_id in alerts table

5. Handle response:
   - Success: Log sent_at timestamp
   - Failure: Retry with exponential backoff
   - If SMS fails, escalate to voice call
```

**Example Messages**:

**Medium Severity**:
```
⚠️ ALERT: Margaret
No response to evening medication after 2 attempts.
Time: 6:25 PM
Please check in with her.
View: https://dashboard.com/alerts/123
```

**High Severity**:
```
🚨 HIGH ALERT: Margaret
Reported dizziness and chest discomfort.
Time: 2:34 PM
Call her immediately: +1234567890
View: https://dashboard.com/alerts/124
```

**Critical Severity**:
```
🚨🚨 EMERGENCY: Margaret
Emergency button pressed!
Time: 3:45 PM
Last location: Home
CALL NOW: +1234567890
View: https://dashboard.com/alerts/125
```

---

#### Voice Call Flow

**Trigger**: Alert created with severity = HIGH or CRITICAL

**Process**:
```
1. Construct TwiML (Twilio Markup Language):
   <Response>
     <Say voice="Polly.Joanna">
       This is an urgent alert from Elder Companion.
       [Patient name] [situation description].
       Last activity: [time].
       Press 1 to call [patient name] now.
       Press 2 to call 911.
       Press 3 to hear this message again.
     </Say>
     <Gather numDigits="1" action="/api/twilio/alert-response">
       <Say>Press a number now.</Say>
     </Gather>
   </Response>

2. Make call via Twilio API:
   POST to Twilio voice endpoint
   
3. Handle caregiver response:
   If pressed 1: Connect call to patient
   If pressed 2: Connect call to 911 + log incident
   If pressed 3: Repeat message
   If no response: Retry in 2 minutes (up to 3 times)

4. Log all call details in database
```

**Important**: Voice calls ONLY for HIGH/CRITICAL. Don't abuse or caregivers will ignore.

---

### Firebase Push Notifications (Patient App)

**When Used**:
- Scheduled check-ins
- Reminders
- Wake app from background for voice interaction

**Flow**:
```
1. Backend determines notification needed (scheduler)

2. Construct notification payload:
   {
     "title": "Check-in Time",
     "body": "Hi Maggie, just checking in! How are you?",
     "data": {
       "type": "check_in",
       "patient_id": "uuid",
       "speak": true,  // Trigger TTS
       "message": "Hi Maggie, just checking in! How are you feeling?"
     }
   }

3. Send via Firebase Cloud Messaging:
   - To patient's device_token
   - Priority: high (wake device)

4. Mobile app receives notification:
   - Even if app in background
   - Play TTS message
   - Start listening for response
   - Send interaction to backend
```

**Important**: Configure FCM to wake app even when in background (high priority + data payload).

---

## Mobile App Specifications

### Design Principles

**Elderly-Friendly UX**:
- ✅ Large text (minimum 18pt, preferably 24pt)
- ✅ High contrast (black text on white, or vice versa)
- ✅ Big buttons (minimum 60x60 dp)
- ✅ Simple navigation (minimal screens)
- ✅ Voice-first (reduce need to read/type)
- ✅ Persistent elements (emergency button always visible)
- ✅ Clear feedback (visual + audio + haptic)

**Avoid**:
- ❌ Swipe gestures (use buttons instead)
- ❌ Small tap targets
- ❌ Low contrast colors
- ❌ Tiny text
- ❌ Complex navigation
- ❌ Hidden features

---

### Screen Specifications

#### Screen 1: Home Screen

**Layout**:
```
┌─────────────────────────────────────────────┐
│  [Time: 2:30 PM]          [Battery: 75%]    │
│                                              │
│           👋 Hello, Maggie!                  │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │                                      │   │
│  │     Next: Evening Medication         │   │
│  │     ⏰ In 3 hours                     │   │
│  │                                      │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  Today's Activities:                         │
│  ✅ Morning Medication (Done)                │
│  ✅ Breakfast (Done)                         │
│  ✅ Lunch (Done)                             │
│  ⏰ Evening Medication (Upcoming)            │
│  ⏰ Dinner (Upcoming)                        │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │                                      │   │
│  │       🎤 TALK TO ME                  │   │
│  │                                      │   │
│  │    Tap to start conversation         │   │
│  │                                      │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │                                      │   │
│  │    🚨 I NEED HELP 🚨                 │   │
│  │                                      │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  [⚙️ Settings]                              │
└─────────────────────────────────────────────┘
```

**Components**:

**Header**:
- Time (large, clear)
- Battery indicator (important - if battery low, may explain inactivity)
- Greeting with preferred name

**Next Reminder Card**:
- Shows upcoming reminder
- Time until reminder
- Brief description
- Color-coded by category (medication=red, meal=green, etc.)

**Activity Checklist**:
- Today's completed and upcoming activities
- ✅ for completed
- ⏰ for upcoming
- Large, easy-to-read list

**Talk Button**:
- Giant button (takes up 1/4 of screen)
- Microphone icon
- Clear label
- Primary action color (blue/green)

**Emergency Button**:
- Giant red button
- Always visible
- 🚨 icon
- High contrast

**Settings Button**:
- Small, bottom corner
- Gear icon
- Opens settings screen

**Behavior**:
- Auto-refresh every minute (update "in X hours")
- Haptic feedback on all button presses
- Voice feedback: "Opening chat" / "Emergency alert sent"

---

#### Screen 2: Voice Chat Screen

**Layout**:
```
┌─────────────────────────────────────────────┐
│  [← Back]                                    │
│                                              │
│                                              │
│           🎤 I'm Listening...                │
│                                              │
│       [Pulsing microphone animation]         │
│                                              │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │ AI: Hi Maggie! How can I help?       │   │
│  │                                      │   │
│  │ You: I already took my medicine       │   │
│  │                                      │   │
│  │ AI: Perfect! Thanks for letting      │   │
│  │     me know. I've marked it down.    │   │
│  └──────────────────────────────────────┘   │
│                                              │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │                                      │   │
│  │     🎤 Hold to Speak                 │   │
│  │                                      │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │        End Chat                      │   │
│  └──────────────────────────────────────┘   │
│                                              │
└─────────────────────────────────────────────┘
```

**Components**:

**Status Indicator**:
- Large icon showing current state
- "I'm Listening..." (pulsing mic)
- "Thinking..." (spinning brain icon)
- "Speaking..." (sound waves)

**Conversation History**:
- Scrollable text area
- Clear labels: "AI:" and "You:"
- Large, readable font
- Auto-scroll to latest

**Voice Button**:
- Large button
- Hold to speak (simpler than tap to start/stop)
- Visual feedback while held
- Release to process

**End Chat Button**:
- Clear way to exit
- Returns to home screen
- Saves conversation

**Behavior**:
- Auto-activate when screen opens (start listening immediately)
- Clear audio feedback for all states
- Haptic feedback when button pressed/released
- Screen stays awake during conversation

---

#### Screen 3: Emergency Confirmation

**Layout**:
```
┌─────────────────────────────────────────────┐
│                                              │
│                                              │
│                                              │
│            🚨 Emergency Alert 🚨             │
│                                              │
│                                              │
│      Alert your family and get help?         │
│                                              │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │                                      │   │
│  │      ✅ YES, GET HELP NOW            │   │
│  │                                      │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │                                      │   │
│  │      ❌ Cancel - I'm OK              │   │
│  │                                      │   │
│  └──────────────────────────────────────┘   │
│                                              │
│                                              │
│         Auto-confirming in 3 seconds...      │
│                                              │
└─────────────────────────────────────────────┘
```

**After Confirmation**:
```
┌─────────────────────────────────────────────┐
│                                              │
│                                              │
│                                              │
│            ✅ Help Is On The Way!            │
│                                              │
│                                              │
│         Sarah has been alerted.              │
│         She will call you shortly.           │
│                                              │
│         Stay where you are.                  │
│         You're going to be okay.             │
│                                              │
│                                              │
│  [Calling Sarah now...]                      │
│                                              │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │     Cancel - False Alarm             │   │
│  └──────────────────────────────────────┘   │
│                                              │
└─────────────────────────────────────────────┘
```

**Behavior**:
- Show confirmation screen for 3 seconds
- Auto-confirm if no action (assume patient unable to cancel)
- Vibrate phone continuously
- Play alert sound
- Bright red background
- After confirmed:
  - Send alert to backend
  - Show reassurance message
  - Stay on screen until caregiver acknowledges
  - Option to cancel (in case accidental)

---

#### Screen 4: Settings

**Layout**:
```
┌─────────────────────────────────────────────┐
│  [← Back to Home]                            │
│                                              │
│               ⚙️ Settings                    │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │  Volume                              │   │
│  │  🔊 ─────●─────                      │   │
│  │                                      │   │
│  │  [Test Voice]                        │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │  Voice Speed                         │   │
│  │  🐢 ──────●── 🐇                     │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │  📞 Call Sarah                       │   │
│  │  (Your daughter)                     │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │  About                               │   │
│  │  App Version: 1.0.0                  │   │
│  │  Last Sync: 2 minutes ago            │   │
│  └──────────────────────────────────────┘   │
│                                              │
└─────────────────────────────────────────────┘
```

**Settings Options**:

**Voice Volume**:
- Slider control
- Test button to hear sample
- Adjusts TTS volume

**Voice Speed**:
- Slider from slow to fast
- Turtle to rabbit icons
- Affects TTS speech rate

**Contact Caregiver**:
- Quick button to call primary caregiver
- Shows name and relationship
- Direct dial

**About**:
- App version
- Last sync time (when last heartbeat sent)
- Help/support info

**Minimal**:
- Keep settings simple
- No complex configurations
- Most settings managed by caregiver via dashboard

---

### Voice Interaction Specifications

#### Voice Input (Speech-to-Text)

**Library**: `@react-native-voice/voice` or `expo-speech-recognition`

**Configuration**:
- Language: Set to patient's preferred language (from profile)
- Continuous: No (discrete utterances)
- Interim results: Yes (show what's being said in real-time)
- Timeout: 5 seconds of silence = end of input

**Implementation Considerations**:
- Request microphone permission on first launch
- Handle permission denials gracefully
- Show visual feedback (mic icon pulsing)
- Display transcribed text as user speaks
- Handle errors (no speech detected, too much noise, etc.)

**Example States**:
```
IDLE → User taps "Talk to Me"
  ↓
LISTENING → Show "I'm listening...", pulsing mic
  ↓
TRANSCRIBING → Show partial text as user speaks
  ↓
PROCESSING → Show "Thinking...", send to backend
  ↓
RESPONDING → Play TTS response
  ↓
LISTENING (if conversation continues)
  OR
IDLE (if conversation ends)
```

----------

#### Voice Output (Text-to-Speech)

**Library**: `expo-speech` (built-in to Expo)

**Configuration**:

-   Voice: Set based on patient preference (male/female/neutral)
-   Rate: 0.8 (slightly slower than normal - elderly may process better)
-   Pitch: 1.0 (normal)
-   Language: Patient's preferred language
-   Volume: Adjustable in settings

**Implementation**:

-   Queue messages (don't interrupt ongoing speech)
-   Provide stop/pause controls (if patient wants to interrupt)
-   Highlight text being spoken (visual feedback)
-   Adjust rate based on patient settings

**Speech Priority**:

1.  Emergency/critical messages (interrupt everything)
2.  Reminder/check-in messages (important)
3.  Casual conversation responses (normal)

----------

### Background Tasks

#### Heartbeat Service

**Purpose**: Keep backend informed of patient's activity status

**Frequency**: Every 15 minutes

**Implementation**: `react-native-background-fetch`

**What It Does**:

javascript

```javascript
BackgroundFetch.configure({
  minimumFetchInterval: 15, // minutes
  stopOnTerminate: false,
  startOnBoot: true,
  enableHeadless: true  // Run even if app fully closed
}, async (taskId) => {
  // Collect data
  const heartbeat = {
    patient_id: patientId,
    timestamp: new Date().toISOString(),
    activity_type: 'heartbeat',
    app_state: AppState.currentState,
    last_interaction_at: getLastInteractionTimestamp(),
    context: {
      battery_level: await getBatteryLevel(),
      movement_detected: await getAccelerometerData(),
      // location: await getLocation()  // if permissions granted
    }
  };
  
  // Send to backend
  await sendHeartbeat(heartbeat);
  
  // Finish task
  BackgroundFetch.finish(taskId);
});
```

**Permissions Needed**:

-   Background app refresh (iOS)
-   Background execution (Android)

----------

#### Push Notification Handler

**Purpose**: Receive and process notifications from backend

**Implementation**: Firebase Cloud Messaging

**Types of Notifications**:

1.  **Scheduled Check-in**:

json

```json
{
  "type": "check_in",
  "message": "Hi Maggie, just checking in! How are you feeling?",
  "speak": true,
  "requires_response": true
}
```

Action: Play TTS, start listening for response

2.  **Reminder**:

json

```json
{
  "type": "reminder",
  "reminder_id": "uuid",
  "message": "Time for your yellow pill on the kitchen table",
  "speak": true,
  "requires_response": true
}
```

Action: Play TTS, start listening for acknowledgment

3.  **Silent Update**:

json

```json
{
  "type": "sync",
  "data": {...}
}
```

Action: Update local cache, no user interaction

**Handler Logic**:

javascript

```javascript
messaging().onMessage(async remoteMessage => {
  const { type, message, speak } = remoteMessage.data;
  
  if (speak) {
    // Play TTS
    await Speech.speak(message, {
      rate: voiceSpeed,
      pitch: 1.0
    });
    
    // Start listening if requires_response
    if (remoteMessage.data.requires_response) {
      startVoiceRecognition();
    }
  }
  
  // Update UI
  updateNotifications(remoteMessage);
});
```

---

### Local Data Storage

**What to Store Locally** (AsyncStorage):
- Patient ID (assigned at setup)
- Device token (for push notifications)
- Last sync timestamp
- Voice preferences (volume, speed)
- Cached schedule (today's reminders)
- Pending interactions (if offline)

**What NOT to Store Locally**:
- Medical information (keep in backend)
- Conversation history (too large, query from backend as needed)
- Caregiver information (privacy)

---

### Offline Handling

**If App Offline**:
- Queue interactions locally
- Show "Connecting..." indicator
- Display cached schedule
- Allow voice input (save locally)
- When connection restored:
  - Upload queued interactions
  - Sync latest data
  - Show "Back online" message

**Critical**: Emergency button should work offline by:
- Dialing caregiver's phone number directly (no API needed)
- Queuing alert for when back online

---

## Web Dashboard Specifications

### Technology Choices

**Framework**: Next.js 14
- Server-side rendering for fast initial load
- API routes (optional backend-for-frontend)
- Built-in optimization
- Easy deployment to Vercel

**Styling**: Tailwind CSS
- Rapid development
- Consistent design system
- Responsive by default
- Custom theming

**Components**: Headless UI or Shadcn/UI
- Accessible by default
- Customizable
- Works well with Tailwind

**Data Fetching**: React Query (TanStack Query)
- Server state management
- Automatic caching
- Background refetching
- Optimistic updates

---

### Authentication Flow

**Login Page** (`/login`):
- Email input
- Password input
- "Remember me" checkbox
- "Forgot password" link
- Login button

**Registration Page** (`/register`):
- First name, last name
- Email
- Password (with strength indicator)
- Confirm password
- Phone number
- Relationship to patient (dropdown)
- Agree to terms checkbox
- Register button

**Authentication Implementation**:
- JWT tokens stored in httpOnly cookies
- Refresh token mechanism
- Auto-logout after 7 days of inactivity
- Session management

**Protected Routes**:
- All dashboard pages require authentication
- Redirect to /login if not authenticated
- Remember intended destination

---

### Dashboard Layout

**Main Layout** (all pages except login/register):
```
┌────────────────────────────────────────────────────────────┐
│  [Logo] Elder Companion        [Search] [Alerts] [Profile] │
├────────────┬───────────────────────────────────────────────┤
│            │                                               │
│  SIDEBAR   │           MAIN CONTENT AREA                  │
│            │                                               │
│  Dashboard │                                               │
│  Patients  │                                               │
│  Alerts    │                                               │
│  Reports   │                                               │
│  Settings  │                                               │
│            │                                               │
│            │                                               │
│  [Logout]  │                                               │
└────────────┴───────────────────────────────────────────────┘
```

**Header**:
- Logo/brand (left)
- Global search (center) - search patients, conversations
- Alert indicator (right) - badge showing unread alert count
- User profile dropdown (right)
  - Account settings
  - Logout

**Sidebar Navigation**:
- Dashboard (home icon)
- Patients (people icon)
- Alerts (bell icon with badge if unread)
- Reports (chart icon)
- Settings (gear icon)
- Logout (bottom)

**Responsive**:
- Desktop: Sidebar always visible
- Tablet: Sidebar collapsible
- Mobile: Sidebar becomes hamburger menu

---

### Dashboard Home Page

**Purpose**: Overview of all patients at a glance

**Layout**:

**Top Section - Summary Cards**:
```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ 👥 Patients │ │ ✅ Active   │ │ ⚠️ Alerts   │ │ 📊 This Week│
│     3       │ │  Today: 2   │ │  Unread: 1  │ │  92% Rate   │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

**Patient Cards Section**:
Each patient gets a card:
```
┌──────────────────────────────────────────────────────┐
│ [Photo] Margaret Chen, 78                            │
│         ● Active now                                 │
│                                                      │
│ Today: 8/10 reminders ✅  |  Mood: 😊 Good          │
│                                                      │
│ Recent: Completed lunch (12:45 PM)                   │
│         Mentioned knee pain                          │
│                                                      │
│ [View Details]                                       │
└──────────────────────────────────────────────────────┘
```

Status indicators:
- ● Green = Active today, all good
- ● Yellow = Some missed items
- ● Red = Alerts pending
- ● Gray = Offline/inactive

**Quick Actions**:
- Add new patient button (prominent)
- Filter patients (by status, alerts)
- Sort patients (by last activity, name, alerts)

**Implementation**:
- Polling every 10 seconds for updates
- Show loading skeleton while fetching
- Smooth transitions when data updates
- Cache patient list locally

---

### Patient Detail Page

**Purpose**: Deep dive into one patient's data

**URL**: `/patients/[patient_id]`

**Layout**:

**Header Section**:
```
┌──────────────────────────────────────────────────────┐
│ [Photo] Margaret Chen                                │
│         78 years old • Last active: 2 min ago        │
│         ● Active                                     │
│                                                      │
│ [Call Patient] [Add Note] [Edit Profile] [•••More]  │
└──────────────────────────────────────────────────────┘
```

**Tab Navigation**:
- Today (default)
- Schedule
- Conversations
- Insights
- Profile

---

**Tab 1: Today View**

**Activity Timeline** (main section, left):
```
Timeline for Friday, October 24, 2025

08:00 AM ✅ Morning Medication
          Completed in 3 minutes
          Patient said: "I took it"
          
09:15 AM ✅ Breakfast
          Completed
          
10:00 AM 💬 Check-in Conversation
          Duration: 2 min
          Mood: Happy
          Topics: Weather, grandchildren
          [View transcript]
          
12:45 PM ✅ Lunch
          Completed
          Mentioned: Knee pain
          
02:30 PM ⚠️ Health Concern
          Patient reported dizziness
          Action: Suggested hydration
          Follow-up: Felt better after water
          [View conversation]
          
06:00 PM ❌ Evening Medication
          Missed after 2 attempts
          Alert sent at 6:25 PM
          [Retry now]
```

**Right Sidebar**:

**Upcoming**:
```
Next: Dinner reminder
⏰ In 1 hour 15 minutes
```

**Today's Stats**:
```
Reminders: 7/8
Medications: 6/7
Meals: 3/3
Conversations: 4
Mood: 😊 Good
```

**Quick Actions**:
```
[Send Message]
[Call Patient]
[Add Reminder]
```

---

**Tab 2: Schedule View**

**Weekly Calendar**:
```
        Mon    Tue    Wed    Thu    Fri    Sat    Sun
08:00   💊     💊     💊     💊     💊     💊     💊   Morning Meds
09:00   🍽️     🍽️     🍽️     🍽️     🍽️     🍽️     🍽️   Breakfast
12:30   🍽️     🍽️     🍽️     🍽️     🍽️     🍽️     🍽️   Lunch
18:00   💊     💊     💊     💊     💊     💊     💊   Evening Meds
19:00   🍽️     🍽️     🍽️     🍽️     🍽️     🍽️     🍽️   Dinner
```

**Schedule List** (filterable):
- All schedules
- Filter by category (medication, meals, exercise, etc.)
- Each item shows:
  - Title
  - Time
  - Days of week
  - Category
  - Active status
  - Edit/Delete buttons

**Add Schedule Button** (prominent):
Opens modal to create new schedule

---

**Tab 3: Conversations View**

**List of Conversations**:
```
Filters: [All] [Today] [This Week] [Concerning Only]
Search: [________________]

Oct 24, 2:30 PM - Health Concern ⚠️
  Patient: "I'm feeling dizzy"
  AI: "I'm concerned about your dizziness..."
  Outcome: Resolved with hydration
  [View Full Conversation]

Oct 24, 10:00 AM - Check-in ✅
  AI: "Hi Maggie, how are you feeling?"
  Patient: "I'm good! Enjoying the sunshine"
  Mood: Happy
  [View Full Conversation]

Oct 23, 6:45 PM - Medication Reminder ❌
  AI: "Time for your evening pill"
  Patient: [No response after 3 attempts]
  Alert sent to caregiver
  [View Details]
```

**Conversation Detail Modal**:
Opens when "View Full Conversation" clicked
- Shows complete transcript
- Timestamps for each message
- Claude's analysis (intent, sentiment, concerns)
- Audio playback if available
- Caregiver notes section
- Related reminders/alerts

---

**Tab 4: Insights View**

**AI-Generated Insights** (from Letta):
```
Behavioral Patterns
───────────────────
✓ Responds to morning reminders within 5 minutes (95% reliable)
✓ Prefers conversational tone over formal reminders
⚠️ Often forgets evening medication (needs 2-3 reminders)
✓ More alert and engaged in mornings
⚠️ Mentions knee pain 2-3 times per week (pattern started 3 weeks ago)

Communication Preferences
─────────────────────────
✓ Prefers being called "Maggie" not "Margaret"
✓ Responds well to questions about grandchildren
✓ Appreciates when AI remembers previous conversations

Health Observations
───────────────────
⚠️ Recurring dizziness episodes (3 times this month)
  └─ Pattern: Always afternoon, usually related to dehydration
⚠️ Knee pain mentions increasing
  └─ Recommendation: Suggest medical follow-up

Recommendations
───────────────
- Consider adjusting evening medication reminder to 6:30 PM (currently 6:00 PM)
- Add proactive hydration reminders in afternoon (around 2 PM)
- Follow up with doctor about recurring knee pain
```

**Confidence Scores**:
Each insight shows confidence level (from Letta)
- High (90%+): 🟢
- Medium (70-90%): 🟡
- Low (<70%): 🟠

**Actionable Insights**:
Insights marked "actionable" have [Apply] button:
- Apply = Auto-adjust schedule based on recommendation
- Caregiver confirms before applied

---

**Tab 5: Profile View**

**Sections**:

**Basic Information** (editable):
- Name, preferred name
- Date of birth
- Gender
- Photo
- Contact info
- Address

**Medical Information** (editable):
- Medical conditions (add/remove tags)
- Allergies (add/remove)
- Emergency notes (free text)

**Personal Context** (editable):

**Family Members**:
```
┌─────────────────────────────────────────────────┐
│ Sarah Chen - Daughter                           │
│ Lives in Seattle, nurse, calls Sundays          │
│ Has 2 kids: Tommy (7), Emma (5)                │
│ Phone: +1234567890                              │
│ Primary Contact: ✓                              │
│ [Edit] [Remove]                                 │
└─────────────────────────────────────────────────┘

[+ Add Family Member]
```

**Important Dates**:
```
Jun 15 - Wedding Anniversary (husband deceased 2022)
Mar 22 - Sarah's Birthday
Aug 10 - John's Birthday (son)
```

**Hobbies & Interests**:
```
- Gardening (especially roses)
- Knitting
- Watching Jeopardy
```

**Favorite Topics**:
```
- Grandchildren
- Old movies from 1950s
- Her rose garden
```

**Sensitive Topics**:
```
- Late husband (passed 2022) - handle gently but OK to discuss happy memories
- Difficulty walking after hip surgery
```

**Special Notes**:
```
Free-form text area for any additional context...
```

**Communication Preferences**:
- Preferred name
- Voice type (male/female/neutral)
- Communication style (friendly/formal/casual)
- Language

---

### Alerts Page

**Purpose**: Centralized alert management

**Layout**:

**Filter Bar**:
```
[All] [Unread] [Critical] [High] [Medium] [Low]
Sort by: [Newest First ▼]
```

**Alert List**:
```
┌──────────────────────────────────────────────────────┐
│ 🚨 CRITICAL - Margaret Chen                          │
│ Emergency button pressed                             │
│ Today at 3:45 PM • Unread                            │
│                                                      │
│ Patient pressed emergency button. Last location:     │
│ Home. No follow-up received yet.                     │
│                                                      │
│ [Acknowledge] [View Details] [Call Patient]          │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ ⚠️ MEDIUM - John Smith                               │
│ No response to check-in                              │
│ Today at 2:00 PM • Acknowledged by you              │
│                                                      │
│ Patient didn't respond to 2 PM check-in after        │
│ 2 attempts.                                          │
│                                                      │
│ Resolution: Called patient, he was napping.          │
│ [View Details]                                       │
└──────────────────────────────────────────────────────┘
```

**Alert Details Modal**:
```
┌──────────────────────────────────────────────────────┐
│ Alert Details                                    [×] │
├──────────────────────────────────────────────────────┤
│                                                      │
│ 🚨 CRITICAL                                          │
│ Emergency Button Pressed                             │
│                                                      │
│ Patient: Margaret Chen                               │
│ Time: Friday, Oct 24, 2025 at 3:45 PM              │
│                                                      │
│ Description:                                         │
│ Patient pressed the emergency help button in the app.│
│                                                      │
│ Context:                                             │
│ • Last activity: 15 minutes before alert            │
│ • Last conversation: Mentioned dizziness at 2:30 PM │
│ • Location: Home (GPS coordinates available)        │
│                                                      │
│ Actions Taken:                                       │
│ ✓ SMS sent to you at 3:45 PM                       │
│ ✓ Voice call placed to you at 3:46 PM              │
│ ✓ Dashboard notification sent                       │
│                                                      │
│ ┌────────────────────────────────────────────────┐ │
│ │ Resolution Notes                               │ │
│ │ [Text area for caregiver to add notes...]     │ │
│ └────────────────────────────────────────────────┘ │
│                                                      │
│ [Acknowledge] [Mark as Resolved] [Cancel]           │
└──────────────────────────────────────────────────────┘
```

**Status Workflow**:
1. Created → Unread
2. Acknowledged → In Progress (caregiver aware)
3. Resolved → Closed (with notes)

---

### Reports Page

**Purpose**: View daily summaries and trends

**Daily Summary View**:

**Date Selector**:
```
[<] Friday, October 24, 2025 [>]
      [Select Date...]
```

**Patient Selector** (if managing multiple):
```
Patient: [Margaret Chen ▼]
```

**Report Content**:
(Same structure as daily_summaries specification above)

**Executive Summary Card**:
```
┌──────────────────────────────────────────────────────┐
│ Daily Summary - Margaret Chen                        │
│ Friday, October 24, 2025                             │
│                                                      │
│ Status: ● Good                                       │
│                                                      │
│ Key Takeaway:                                        │
│ Margaret had a good day overall. Responded to all    │
│ morning reminders promptly. However, she missed her  │
│ evening medication and mentioned knee pain twice.    │
│                                                      │
│ Reminders: 8/10 completed (80%)                      │
└──────────────────────────────────────────────────────┘
```

**Statistics Section** (visual cards with charts):
- Medications (donut chart)
- Meals (progress bar)
- Engagement (number)
- Mood (emoji + trend)

**Narrative Section**:
Claude-generated summary paragraph

**Timeline Section** (expandable):
Hour-by-hour breakdown

**Insights Section**:
- Observations
- Concerns
- Positives
- Recommendations

**Actions**:
- [Download PDF]
- [Email to Family]
- [Print]

---

**Trends View** (separate tab on Reports page):

**Date Range Selector**:
```
[Last 7 Days] [Last 30 Days] [Last 90 Days] [Custom Range]
```

**Charts**:

**Medication Adherence Over Time**:
Line chart showing daily completion rate

**Mood Trends**:
Line chart showing mood scores over time

**Activity Level**:
Bar chart showing daily interactions

**Top Concerns**:
Word cloud or list of most mentioned topics

**Insights**:
- Improvement areas
- Emerging patterns
- Recommendations

---

### Settings Page

**Sections**:

**Account Settings**:
- Name, email
- Phone number
- Change password
- Profile photo

**Notification Preferences**:
```
When should we notify you?
☑ Critical alerts only
☐ High and critical alerts
☐ All alerts

Notification Methods:
☑ SMS
☑ Email
☐ Push notifications (install mobile app)

Quiet Hours:
☑ Enable quiet hours
From: [22:00] To: [07:00]
(Critical alerts will still come through)
```

**Daily Summary Settings**:
```
Daily Summary Delivery:
☑ Email to inbox
☐ SMS summary
Time to send: [20:00]
```

**Managed Patients**:
List of patients with options to:
- Transfer to another caregiver
- Remove (if multiple caregivers)
- Adjust access level

**Billing** (if applicable):
- Current plan
- Usage statistics
- Upgrade options

**Support**:
- Help documentation
- Contact support
- Report a bug
- Feature requests

---

## API Design

### API Structure

**Base URL**: `https://api.eldercompanion.com/v1`

**Authentication**: JWT Bearer Token in Authorization header
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response Format**: JSON

json

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2025-10-24T14:30:00Z",
    "version": "1.0.0"
  }
}
```

**Error Format**:

json

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Patient not found",
    "details": {}
  },
  "meta": {
    "timestamp": "2025-10-24T14:30:00Z"
  }
}
```

----------

### API Endpoints

#### Authentication Endpoints

**POST /auth/register** Register new caregiver account

Request:

json

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "phone_number": "+1234567890",
  "relationship": "son"
}
```

Response:

json

```json
{
  "success": true,
  "data": {
    "caregiver_id": "uuid",
    "email": "john@example.com",
    "access_token": "jwt_token",
    "refresh_token": "refresh_token"
  }
}
```

----------

**POST /auth/login** Login caregiver

Request:

json

```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

Response:

json

```json
{
  "success": true,
  "data": {
    "caregiver_id": "uuid",
    "email": "john@example.com",
    "first_name": "John",
    "access_token": "jwt_token",
    "refresh_token": "refresh_token"
  }
}
```

----------

**POST /auth/refresh** Refresh JWT token

Request:

json

```json
{
  "refresh_token": "refresh_token"
}
```

Response:

json

```json
{
  "success": true,
  "data": {
    "access_token": "new_jwt_token",
    "refresh_token": "new_refresh_token"
  }
}
```

----------

#### Patient Endpoints

**GET /patients** List all patients for authenticated caregiver

Query Parameters:

-   `status` (optional): active, inactive, all
-   `page` (optional): pagination
-   `limit` (optional): items per page

Response:

json

```json
{
  "success": true,
  "data": {
    "patients": [
      {
        "id": "uuid",
        "first_name": "Margaret",
        "last_name": "Chen",
        "preferred_name": "Maggie",
        "age": 78,
        "profile_photo_url": "https://...",
        "status": "active",
        "last_active_at": "2025-10-24T14:28:00Z",
        "today_stats": {
          "reminders_completed": 8,
          "reminders_total": 10,
          "mood": "good"
        },
        "active_alerts_count": 1
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 3
    }
  }
}
```

----------

**POST /patients** Create new patient

Request:

json

```json
{
  "first_name": "Margaret",
  "last_name": "Chen",
  "date_of_birth": "1947-03-15",
  "gender": "female",
  "phone_number": "+1234567890",
  "email": "margaret@example.com",
  "address": "123 Main St, Oakland, CA",
  "timezone": "America/Los_Angeles",
  "medical_conditions": ["hypertension", "mild cognitive impairment"],
  "allergies": ["penicillin"],
  "emergency_notes": "Has pacemaker. Wears hearing aids.",
  "preferred_voice": "female",
  "communication_style": "friendly",
  "language": "en",
  "personal_context": {
    "family_members": [...],
    "important_dates": [...],
    "hobbies": [...],
    "favorite_topics": [...],
    "sensitive_topics": [...],
    "special_notes": "..."
  }
}
```

Response:

json

```json
{
  "success": true,
  "data": {
    "patient_id": "uuid",
    "letta_agent_id": "letta_uuid",
    "created_at": "2025-10-24T14:30:00Z"
  }
}
```

----------

**GET /patients/{patient_id}** Get patient details

Response:

json

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "first_name": "Margaret",
    "last_name": "Chen",
    "preferred_name": "Maggie",
    // ... all patient fields
    "caregivers": [
      {
        "caregiver_id": "uuid",
        "name": "John Doe",
        "relationship": "son",
        "is_primary": true,
        "access_level": "full"
      }
    ]
  }
}
```

----------

**PUT /patients/{patient_id}** Update patient information

Request: (any fields to update)

json

```json
{
  "preferred_name": "Maggie",
  "personal_context": {
    "family_members": [...updated...]
  }
}
```

Response:

json

```json
{
  "success": true,
  "data": {
    "patient_id": "uuid",
    "updated_at": "2025-10-24T14:35:00Z"
  }
}
```

----------

#### Schedule Endpoints

**GET /patients/{patient_id}/schedules** Get all schedules for a patient

Query Parameters:

-   `active_only` (optional): boolean
-   `category` (optional): medication, meal, exercise, etc.

Response:

json

```json
{
  "success": true,
  "data": {
    "schedules": [
      {
        "id": "uuid",
        "title": "Morning Medication",
        "description": "Lisinopril for blood pressure",
        "category": "medication",
        "schedule_type": "daily",
        "time_of_day": "08:00:00",
        "days_of_week": null,
        "reminder_method": "push_with_voice",
        "max_retry_attempts": 3,
        "medication_name": "Lisinopril",
        "dosage": "10mg",
        "medication_color": "yellow pill",
        "medication_location": "kitchen table",
        "is_active": true,
        "created_at": "2025-10-20T10:00:00Z"
      }
    ]
  }
}
```

----------

**POST /patients/{patient_id}/schedules** Create new schedule

Request:

json

```json
{
  "title": "Morning Medication",
  "description": "Lisinopril for blood pressure",
  "category": "medication",
  "schedule_type": "daily",
  "time_of_day": "08:00:00",
  "reminder_method": "push_with_voice",
  "max_retry_attempts": 3,
  "retry_interval_minutes": 10,
  "medication_name": "Lisinopril",
  "dosage": "10mg",
  "medication_color": "yellow pill",
  "medication_location": "kitchen table"
}
```

Response:

json

```json
{
  "success": true,
  "data": {
    "schedule_id": "uuid",
    "created_at": "2025-10-24T14:40:00Z"
  }
}
```

----------

**PUT /schedules/{schedule_id}** Update schedule

**DELETE /schedules/{schedule_id}** Delete schedule (soft delete, sets is_active=false)

----------

#### Reminder Endpoints

**GET /patients/{patient_id}/reminders** Get reminder history

Query Parameters:

-   `date` (optional): specific date (YYYY-MM-DD)
-   `start_date`, `end_date` (optional): date range
-   `status` (optional): completed, missed, pending
-   `page`, `limit` (optional): pagination

Response:

json

```json
{
  "success": true,
  "data": {
    "reminders": [
      {
        "id": "uuid",
        "schedule_id": "uuid",
        "schedule_title": "Morning Medication",
        "scheduled_time": "2025-10-24T08:00:00Z",
        "sent_at": "2025-10-24T08:00:05Z",
        "responded_at": "2025-10-24T08:03:12Z",
        "delivery_method": "push",
        "delivery_status": "delivered",
        "acknowledged": true,
        "response_text": "I took it",
        "claude_analysis": {
          "intent": "task_completed",
          "confidence": 0.95,
          "sentiment": "positive",
          "completion_status": "completed"
        },
        "retry_count": 0
      }
    ],
    "pagination": {...}
  }
}
```

----------

**GET /reminders/{reminder_id}** Get specific reminder details

**POST /reminders/{reminder_id}/retry** Manually retry a missed reminder

----------

#### Conversation Endpoints

**GET /patients/{patient_id}/conversations** Get conversation history

Query Parameters:

-   `date` (optional): specific date
-   `type` (optional): filter by conversation_type
-   `search` (required for semantic search): semantic search via Chroma (enables finding conversations by meaning, not just keywords)
-   `page`, `limit` (optional): pagination

Response:

json

```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "uuid",
        "conversation_type": "casual_chat",
        "timestamp": "2025-10-24T10:00:00Z",
        "messages": [
          {
            "from": "ai",
            "text": "Hi Maggie! How are you feeling today?",
            "timestamp": "2025-10-24T10:00:00Z"
          },
          {
            "from": "patient",
            "text": "I'm good! Enjoying the sunshine",
            "timestamp": "2025-10-24T10:00:15Z",
            "audio_url": "https://..."
          }
        ],
        "claude_analysis": {
          "intent": "casual_greeting",
          "sentiment": "positive",
          "mood": "happy",
          "topics": ["weather", "wellbeing"]
        },
        "duration_seconds": 45
      }
    ]
  }
}
```

----------

**GET /conversations/{conversation_id}** Get specific conversation with full details

**POST /conversations/patient** Submit patient message (from mobile app)

Request:

json

```json
{
  "patient_id": "uuid",
  "message": "I'm feeling dizzy",
  "timestamp": "2025-10-24T14:30:00Z",
  "context": {
    "triggered_by": "manual",  // or "reminder_response", "check_in"
    "related_reminder_id": "uuid"  // optional
  }
}
```

Response:

json

```json
{
  "success": true,
  "data": {
    "conversation_id": "uuid",
    "response": "I'm concerned about your dizziness, Maggie. Have you had water to drink recently?",
    "speak": true,
    "keep_listening": true,
    "alert_sent": false,
    "follow_up_questions": [
      "Have you had water recently?",
      "Does it get worse when you stand?"
    ]
  }
}
```

----------

#### Alert Endpoints

**GET /alerts** Get alerts for caregiver

Query Parameters:

-   `patient_id` (optional): filter by patient
-   `severity` (optional): critical, high, medium, low
-   `acknowledged` (optional): true, false
-   `start_date`, `end_date` (optional): date range
-   `page`, `limit` (optional): pagination

Response:

json

```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "id": "uuid",
        "patient_id": "uuid",
        "patient_name": "Margaret Chen",
        "alert_type": "no_response",
        "severity": "medium",
        "title": "No response to evening medication",
        "description": "Patient did not respond to evening medication reminder after 3 attempts.",
        "created_at": "2025-10-24T18:25:00Z",
        "acknowledged": false,
        "acknowledged_by": null,
        "acknowledged_at": null,
        "related_reminder_id": "uuid",
        "trigger_data": {...}
      }
    ],
    "pagination": {...}
  }
}
```

----------

**GET /alerts/{alert_id}** Get specific alert details

**PUT /alerts/{alert_id}/acknowledge** Acknowledge alert

Request:

json

```json
{
  "notes": "Called patient, she was napping. All good."
}
```

Response:

json

```json
{
  "success": true,
  "data": {
    "alert_id": "uuid",
    "acknowledged": true,
    "acknowledged_at": "2025-10-24T18:30:00Z"
  }
}
```

----------

**PUT /alerts/{alert_id}/resolve** Mark alert as resolved

Request:

json

```json
{
  "resolution_notes": "Issue addressed. Patient took medication."
}
```

Response:

json

```json
{
  "success": true,
  "data": {
    "alert_id": "uuid",
    "resolved_at": "2025-10-24T18:35:00Z"
  }
}
```

----------

#### Daily Summary Endpoints

**GET /patients/{patient_id}/daily-summary** Get today's summary (auto-generates if not exists yet)

**GET /patients/{patient_id}/daily-summary/{date}** Get summary for specific date (YYYY-MM-DD)

Response:

json

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "patient_id": "uuid",
    "summary_date": "2025-10-24",
    "total_reminders_sent": 10,
    "reminders_acknowledged": 8,
    "reminders_missed": 2,
    "medications_taken": 7,
    "medications_missed": 1,
    "meals_completed": 3,
    "conversations_initiated": 2,
    "overall_mood": "good",
    "mood_trend": "stable",
    "key_observations": [
      "Responded to all morning reminders within 5 minutes",
      "Mentioned knee pain twice"
    ],
    "concerns": [
      "Missed evening medication despite 2 reminders"
    ],
    "positive_notes": [
      "Engaged in pleasant conversation about grandchildren",
      "Completed all meals"
    ],
    "caregiver_recommendations": [
      "Consider adjusting evening reminder time",
      "Follow up about knee pain"
    ],
    "detailed_timeline": [...],
    "sent_to_caregiver": true,
    "created_at": "2025-10-25T00:05:00Z"
  }
}
```

----------

**POST /patients/{patient_id}/generate-summary** Force generate summary (useful for testing or regenerating)

----------

#### Insights Endpoints

**GET /patients/{patient_id}/insights** Get all insights for a patient

Query Parameters:

-   `active_only` (optional): boolean
-   `category` (optional): behavior, health, communication, routine
-   `reviewed` (optional): boolean

Response:

json

```json
{
  "success": true,
  "data": {
    "insights": [
      {
        "id": "uuid",
        "insight_type": "response_pattern",
        "insight_category": "behavior",
        "title": "Morning Responsiveness",
        "description": "Patient consistently responds to morning medication reminders within 5 minutes, showing 95% reliability.",
        "confidence_score": 0.95,
        "based_on_interactions": 28,
        "first_observed_at": "2025-09-25T08:00:00Z",
        "last_observed_at": "2025-10-24T08:03:00Z",
        "is_actionable": false,
        "is_active": true,
        "reviewed_by_caregiver": false
      }
    ]
  }
}
```

----------

**PUT /insights/{insight_id}/review** Mark insight as reviewed

Request:

json

```json
{
  "notes": "Noted. Will keep monitoring."
}
```

----------

#### Activity Log Endpoints

**POST /mobile/heartbeat** Mobile app sends heartbeat

Request:

json

```json
{
  "patient_id": "uuid",
  "timestamp": "2025-10-24T14:30:00Z",
  "activity_type": "heartbeat",
  "app_state": "background",
  "last_interaction_at": "2025-10-24T14:15:00Z",
  "context": {
    "battery_level": 0.75,
    "movement_detected": true,
    "location": {"lat": 37.7749, "lng": -122.4194}
  }
}
```

Response:

json

```json
{
  "success": true,
  "data": {
    "received_at": "2025-10-24T14:30:01Z",
    "pending_notifications": [],  // Any notifications app should display
    "sync_needed": false  // If app should pull new data
  }
}
```

----------

**POST /mobile/activity** Log explicit activity

Request:

json

```json
{
  "patient_id": "uuid",
  "activity_type": "voice_interaction",
  "timestamp": "2025-10-24T14:32:00Z",
  "context": {
    "duration_seconds": 45,
    "interaction_type": "manual_conversation"
  }
}
```

----------

**POST /mobile/emergency** Emergency button pressed

Request:

json

```json
{
  "patient_id": "uuid",
  "timestamp": "2025-10-24T15:45:00Z",
  "location": {"lat": 37.7749, "lng": -122.4194},
  "battery_level": 0.80
}
```

Response:

json

```json
{
  "success": true,
  "data": {
    "alert_id": "uuid",
    "alert_sent": true,
    "caregiver_notified": true,
    "message": "Help is on the way. Sarah has been alerted."
  }
}
```

----------

#### Dashboard Update Endpoint

**GET /dashboard/updates** Poll for dashboard updates

Query Parameters:

-   `since` (optional): timestamp to get updates after
-   `patient_id` (optional): filter by patient

Response:

json

```json
{
  "success": true,
  "data": {
    "last_update": "2025-10-24T14:30:05Z",
    "new_alerts": [...],  // Alerts created since 'since'
    "updated_reminders": [...],  // Reminders that changed status
    "new_conversations": [...],  // New conversations
    "patient_status_changes": [
      {
        "patient_id": "uuid",
        "old_status": "active",
        "new_status": "inactive_4hrs",
        "timestamp": "2025-10-24T14:00:00Z"
      }
    ]
  }
}
```

----------

### API Error Codes

Standard HTTP status codes + custom error codes:

**Authentication Errors** (401):

-   `INVALID_CREDENTIALS`: Email/password incorrect
-   `TOKEN_EXPIRED`: JWT expired
-   `TOKEN_INVALID`: JWT malformed
-   `ACCOUNT_DISABLED`: Caregiver account deactivated

**Authorization Errors** (403):

-   `INSUFFICIENT_PERMISSIONS`: Can't access this resource
-   `PATIENT_NOT_ASSIGNED`: Not caregiver for this patient

**Not Found Errors** (404):

-   `RESOURCE_NOT_FOUND`: Generic not found
-   `PATIENT_NOT_FOUND`: Patient ID doesn't exist
-   `REMINDER_NOT_FOUND`: Reminder ID doesn't exist

**Validation Errors** (400):

-   `INVALID_INPUT`: Request body validation failed
-   `MISSING_REQUIRED_FIELD`: Required field not provided
-   `INVALID_DATE_FORMAT`: Date format incorrect

**Server Errors** (500):

-   `INTERNAL_SERVER_ERROR`: Generic server error
-   `AI_SERVICE_ERROR`: Claude/Letta API failed
-   `DATABASE_ERROR`: Database operation failed
-   `EXTERNAL_SERVICE_ERROR`: Twilio/Firebase failed

----------

## Security & Privacy

### Data Protection

**Encryption**:

-   All data encrypted at rest (database encryption)
-   All API communication over HTTPS/TLS
-   Passwords hashed with bcrypt (cost factor 12)
-   JWT tokens include expiration

**Sensitive Data Handling**:

-   Medical information never logged
-   Audio recordings encrypted
-   Location data optional and encrypted
-   Personal context stored securely

**Access Control**:

-   Caregivers can only access assigned patients
-   Multi-caregiver support with access levels
-   Primary caregiver has full access
-   Secondary caregivers can have view-only access

**HIPAA Considerations** (for production):

-   Business Associate Agreement (BAA) with hosting provider
-   Audit logs for all data access
-   Patient consent forms
-   Data retention policies
-   Right to deletion

----------

### Authentication Security

**JWT Tokens**:

-   Short-lived access tokens (1 hour)
-   Long-lived refresh tokens (7 days)
-   Tokens include user ID and role
-   Refresh token rotation
-   Token revocation on logout

**Password Requirements**:

-   Minimum 8 characters
-   Must include: uppercase, lowercase, number
-   No common passwords (check against known list)
-   Password reset via email

**Session Management**:

-   Track active sessions
-   Allow caregiver to view/revoke sessions
-   Auto-logout after 7 days inactivity
-   Remember device (optional)

----------

### API Security

**Rate Limiting**:

-   Authentication endpoints: 5 requests/minute
-   Patient data endpoints: 100 requests/minute
-   Heartbeat endpoint: No limit (needs to be always available)
-   Dashboard polling: 12 requests/minute (every 5 seconds)

**Input Validation**:

-   All inputs validated with Pydantic
-   SQL injection prevention (ORM parameterized queries)
-   XSS prevention (sanitize outputs)
-   File upload validation (size, type)

**CORS**:

-   Only allow requests from dashboard domain
-   Mobile app uses API key
-   No wildcard origins

----------

### Privacy

**Data Minimization**:

-   Only collect data necessary for functionality
-   Don't store raw audio unless specifically needed
-   Location optional (only if caregiver enables)
-   Conversation history retention policy (keep 90 days)

**User Rights**:

-   Caregivers can download all data
-   Caregivers can delete patient account
-   Patients can request data deletion
-   Opt-out of analytics

**Third-Party Services**:

-   Claude API: Only send necessary context
-   Letta: Encrypted agent memory
-   Twilio: Phone numbers masked in logs
-   Firebase: Device tokens rotated

**Compliance**:

-   GDPR compliant (if serving EU users)
-   CCPA compliant (California users)
-   ADA accessibility standards
-   Age verification for caregivers (18+)

----------

## Implementation Timeline

### Hour 0-2: Project Setup & Infrastructure

**Backend Setup**:

-   Create FastAPI project structure
-   Set up virtual environment
-   Install dependencies (FastAPI, SQLAlchemy, APScheduler, etc.)
-   Configure environment variables
-   Set up Railway account
-   Provision PostgreSQL database on Railway
-   Test database connection

**Frontend Setup**:

-   Create Next.js project for dashboard
-   Install Tailwind CSS
-   Set up React Query
-   Create Expo React Native project for mobile app
-   Install mobile dependencies (voice, speech, etc.)

**API Keys & Services**:

-   Get Claude API key (from Anthropic)
-   Set up Letta Cloud account and get API key
-   Set up Chroma (can run locally or hosted)
-   Get Twilio account (trial is fine) and phone number
-   Set up Firebase project for push notifications
-   (Optional) Get Vapi API key

**Version Control**:

-   Initialize Git repository
-   Create .gitignore files
-   Push to GitHub
-   Set up branches (main, development)

**Deliverable**: All projects initialized, database connected, API keys obtained

----------

### Hour 2-6: Backend Core (Database + Basic APIs)

**Database**:

-   Define SQLAlchemy models for all 11 tables
-   Create Alembic migration scripts
-   Run migrations to create tables
-   Add indexes
-   Test with sample data

**Authentication**:

-   Implement caregiver registration endpoint
-   Implement login endpoint
-   Implement JWT token generation/validation
-   Implement refresh token endpoint
-   Add authentication dependency for protected routes

**Patient CRUD**:

-   Create patient endpoint
-   Get patient(s) endpoint
-   Update patient endpoint
-   Link patient to caregiver

**Schedule CRUD**:

-   Create schedule endpoint
-   Get schedules endpoint
-   Update schedule endpoint
-   Delete (soft) schedule endpoint

**Testing**:

-   Test all endpoints with Postman/Thunder Client
-   Verify database records created correctly

**Deliverable**: Working REST API with authentication and core CRUD operations

----------

### Hour 6-10: AI Integration & Reminder System

**Claude Integration**:

-   Create ClaudeService class
-   Implement prompt templates
-   Test Claude API with sample queries
-   Implement conversation analysis function
-   Implement daily summary generation function

**Letta Integration**:

-   Create LettaService class
-   Implement agent creation (one per patient)
-   Implement memory update function
-   Implement context retrieval function
-   Test Letta API

**Chroma Integration** (REQUIRED for "Best AI Application Using Chroma" Prize - $200/person):

-   Set up Chroma vector database (local or hosted)
-   Create collections per patient (conversations_{patient_id}, health_mentions, insights)
-   Implement add_conversation function (store after each interaction)
-   Implement semantic_search function (for dashboard search feature)
-   Implement find_similar_situations (for Claude context enhancement)
-   Test semantic search with sample queries
-   **Demo preparation**: Create test conversations showing semantic vs keyword search differences

**Reminder Scheduler**:

-   Set up APScheduler
-   Implement check-reminders job (runs every minute)
-   Implement schedule-to-reminder generation logic
-   Implement retry logic
-   Test scheduler with sample schedules

**Twilio Integration**:

-   Create TwilioService class
-   Implement SMS sending function (for caregiver alerts)
-   Implement voice call function (for caregiver alerts)
-   Test with your phone number

**Firebase Integration**:

-   Set up Firebase Cloud Messaging
-   Implement push notification sending function
-   Test with mobile app (see mobile section)

**Conversation Endpoint**:

-   Implement `/conversations/patient` POST endpoint
-   Flow: Receive message → Query Letta → Send to Claude → Update Letta → Return response
-   Test full flow with sample patient message

**Deliverable**: Working AI pipeline and reminder system

----------

### Hour 10-13: AI Intelligence Layer (Letta + Chroma Integration)

**Letta Enhancement**:

-   Improve Letta prompts for better pattern recognition
-   Implement insight extraction from Letta
-   Create insights storage in database
-   Implement recommendations generation

**Daily Summary**:

-   Implement daily summary generation service
-   Schedule job to run at midnight
-   Test with sample day's data
-   Implement summary retrieval endpoints

**Activity Monitoring**:

-   Implement heartbeat endpoint (`/mobile/heartbeat`)
-   Implement activity logging
-   Implement inactivity detection job (runs every 30 min)
-   Test inactivity alert creation

**Alert System**:

-   Implement alert creation function
-   Implement alert notification dispatch (Twilio SMS + calls)
-   Implement alert management endpoints (acknowledge, resolve)
-   Test full alert flow

**Chroma Integration (Core Feature for Prize)**:

-   Initialize Chroma client and create collections
-   Integrate Chroma into conversation_service.py:
    * Store conversation embeddings after each interaction
    * Query for similar situations before sending to Claude
-   Implement semantic search API endpoint for dashboard
-   Create demo data showing Chroma's advantage:
    * Store variations: "knee hurts", "leg bothering", "trouble walking"
    * Show search for "knee pain" finds all related conversations
-   Test integration: Letta patterns + Chroma evidence = Better Claude responses
-   **Deliverable**: Working semantic search that wins Chroma prize

**Deliverable**: AI that learns from interactions and generates insights

----------

### Hour 13-16: Mobile App

**Setup**:

-   Configure Expo project for device testing
-   Set up navigation (React Navigation)
-   Configure voice permissions

**Home Screen**:

-   Build UI layout
-   Implement next reminder display (fetch from API)
-   Implement activity checklist (fetch from API)
-   Add Talk to Me button
-   Add Emergency button
-   Test navigation

**Voice Chat Screen**:

-   Implement voice input (react-native-voice)
-   Implement voice output (expo-speech)
-   Implement conversation state management
-   Connect to backend API (`/conversations/patient`)
-   Show transcript in UI
-   Test full conversation flow

**Emergency Feature**:

-   Build confirmation screen
-   Implement auto-confirm logic (3 second countdown)
-   Connect to backend API (`/mobile/emergency`)
-   Show "Help is on the way" screen
-   Test emergency flow

**Background Tasks**:

-   Implement heartbeat background service
-   Send heartbeat every 15 minutes
-   Test that it works even when app closed

**Push Notifications**:

-   Configure Firebase in Expo
-   Implement notification handler
-   Test receiving notifications
-   Test triggering TTS from notification
-   Test starting voice recognition from notification

**Settings Screen** (basic):

-   Volume slider
-   Test voice button
-   About section

**Testing**:

-   Test on at least one physical device
-   Test all user flows
-   Test voice recognition with different phrases
-   Test TTS clarity and volume

**Deliverable**: Working mobile app that can receive reminders and respond

----------

### Hour 16-18: Caregiver Dashboard

**Authentication Pages**:

-   Build login page
-   Build registration page
-   Implement auth flow with JWT
-   Set up protected routes

**Dashboard Layout**:

-   Build main layout (header + sidebar + content)
-   Implement navigation
-   Add logout functionality

**Dashboard Home**:

-   Fetch patients list from API
-   Display patient cards
-   Show status indicators
-   Implement patient selection
-   Set up polling (every 5-10 seconds)

**Patient Detail Page**:

-   Build tab navigation
-   Implement Today view (activity timeline)
-   Fetch reminders and conversations from API
-   Display timeline with status icons
-   Add right sidebar (upcoming, stats)

**Schedule Management**:

-   Build schedule list view
-   Implement add schedule modal/form
-   Connect to API (CRUD operations)
-   Test creating/editing schedules

**Conversations View**:

-   Fetch conversation history
-   Display list with filters
-   Implement conversation detail modal
-   Show Claude analysis

**Insights View** (basic):

-   Fetch insights from API
-   Display list of insights
-   Show confidence scores

**Alerts Page**:

-   Fetch alerts from API
-   Display alert list with filters
-   Implement acknowledge/resolve actions
-   Test alert flow

**Profile Page** (basic):

-   Display patient profile
-   Allow editing basic info
-   Allow editing personal context (family members, etc.)

**Styling**:

-   Apply consistent Tailwind styling
-   Ensure responsive design
-   Add loading states
-   Add error handling

**Deliverable**: Functional web dashboard for caregivers

----------

### Hour 18-20: Polish, Testing & Demo Prep

**End-to-End Testing**:

-   Test complete flow: Create patient → Add schedule → Receive reminder on mobile → Respond → See in dashboard
-   Test emergency button flow
-   Test alert generation and notification
-   Test daily summary generation
-   Test conversation flow (manual chat)

**Bug Fixes**:

-   Fix any critical bugs found during testing
-   Handle edge cases
-   Improve error handling

**UI/UX Polish**:

-   Increase font sizes on mobile (elderly-friendly)
-   Improve button sizes and contrast
-   Add loading spinners
-   Add success/error messages
-   Improve navigation clarity

**Create Demo Data**:

-   Create test patient profile ("Maggie Chen")
-   Add realistic personal context (family members, etc.)
-   Create sample schedules
-   Generate sample conversation history
-   Create sample daily summary

**Demo Video** (Backup):

-   Record 3-minute demo video showing:
    1.  Dashboard overview
    2.  Mobile app receiving reminder
    3.  Voice conversation
    4.  Alert being generated
    5.  Daily summary
-   Upload to YouTube (unlisted)

**Pitch Deck**:

-   Slide 1: Problem (elderly care challenges)
-   Slide 2: Solution (Elder Companion AI)
-   Slide 3: How it works (system diagram)
-   Slide 4: Technology (Claude + Letta + Chroma)
-   Slide 5: Demo
-   Slide 6: Impact (lives saved, independence maintained)
-   Slide 7: Prizes we're targeting

**Practice Presentation**:

-   Run through 5-minute pitch 3 times
-   Time it
-   Prepare answers to likely questions:
    -   How does AI learn?
    -   What about privacy?
    -   How is this different from existing solutions?
    -   What's your business model?
    -   Can it integrate with IoT devices?

**Deployment**:

-   Deploy backend to Railway
-   Deploy dashboard to Vercel
-   Update API URLs to production
-   Test production deployments
-   Build mobile app (or use Expo Go for demo)

**Documentation**:

-   Write README for GitHub
-   Create Devpost submission
-   List all technologies used
-   Explain prizes we're targeting
-   Add screenshots/video
-   Include links to live demo

**Final Checklist**:

-   All code committed to GitHub
-   Deployments working
-   Demo video uploaded
-   Pitch deck ready
-   Devpost submitted
-   Mobile app on demo device ready
-   Dashboard accessible from presentation laptop
-   Backup plan if WiFi fails (video + local demo)

**Deliverable**: Polished MVP ready to demo and win prizes!

----------
```