# Elder Companion AI - System Architecture

## Document Purpose

This document provides a comprehensive view of the Elder Companion AI system architecture, including all components, data flows, and integration patterns. Reference this document when:
- Understanding how components interact
- Debugging cross-system issues
- Planning new features
- Onboarding new developers

**Last Updated:** 2025-10-24

---

## Table of Contents

1. [High-Level Architecture](#high-level-architecture)
2. [System Components](#system-components)
3. [Data Flow Diagrams](#data-flow-diagrams)
4. [AI Integration Architecture](#ai-integration-architecture)
5. [Database Architecture](#database-architecture)
6. [API Architecture](#api-architecture)
7. [Security Architecture](#security-architecture)
8. [Background Jobs Architecture](#background-jobs-architecture)

---

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                            ELDER COMPANION AI                                 │
│                       Multi-Tier Healthcare Platform                          │
└──────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────┐          ┌───────────────────────────────┐
│     PATIENT TIER              │          │     CAREGIVER TIER            │
│     (Mobile App)              │          │     (Web Dashboard)           │
│                               │          │                               │
│  - Voice-first interface      │          │  - Patient management         │
│  - Reminder notifications     │          │  - Schedule configuration     │
│  - Emergency button           │          │  - Real-time monitoring       │
│  - Activity tracking          │          │  - Alert management           │
│  - Offline-capable            │          │  - Semantic search (Chroma)   │
│                               │          │  - AI insights (Letta)        │
│  React Native + Expo          │          │  Next.js 14 + Tailwind        │
└───────────────┬───────────────┘          └───────────────┬───────────────┘
                │                                          │
                │                                          │
                └──────────────┬───────────────────────────┘
                               │
                               ↓
            ┌──────────────────────────────────────────────────────┐
            │              BACKEND API LAYER                       │
            │              (FastAPI + PostgreSQL)                  │
            │                                                      │
            │  - RESTful API (v1)                                 │
            │  - JWT Authentication                               │
            │  - Request validation (Pydantic)                    │
            │  - Background jobs (APScheduler)                    │
            │  - Real-time processing                             │
            │                                                      │
            │  Hosted on: Railway.app                             │
            └──────────────────┬───────────────────────────────────┘
                               │
                               ↓
            ┌──────────────────────────────────────────────────────┐
            │            AI & INTELLIGENCE LAYER                   │
            │                                                      │
            │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
            │  │  CLAUDE  │  │  LETTA   │  │  CHROMA  │          │
            │  │          │  │          │  │          │          │
            │  │ Real-time│  │Long-term │  │ Semantic │          │
            │  │ Analysis │  │ Memory   │  │  Search  │          │
            │  └──────────┘  └──────────┘  └──────────┘          │
            │                                                      │
            │  How they work together:                            │
            │  1. Letta provides patient context/memory           │
            │  2. Claude analyzes with that context               │
            │  3. Chroma finds relevant historical data           │
            │  4. Results stored back in Letta & Chroma           │
            └──────────────────────────────────────────────────────┘
                               │
                               ↓
            ┌──────────────────────────────────────────────────────┐
            │           COMMUNICATION LAYER                        │
            │                                                      │
            │  ┌──────────────────┐  ┌──────────────────┐         │
            │  │     TWILIO       │  │    FIREBASE      │         │
            │  │                  │  │                  │         │
            │  │ - SMS to         │  │ - Push notifs to │         │
            │  │   caregivers     │  │   patient app    │         │
            │  │ - Voice calls    │  │                  │         │
            │  └──────────────────┘  └──────────────────┘         │
            └──────────────────────────────────────────────────────┘
```

---

## System Components

### 1. Patient Mobile Application (React Native)

**Purpose:** Voice-first interface for elderly patients to interact with AI companion

**Key Features:**
- Voice input (Speech-to-Text)
- Voice output (Text-to-Speech)
- Reminder notifications
- Emergency button (one-tap SOS)
- Background activity tracking

**Technology Stack:**
```javascript
{
  "framework": "React Native + Expo",
  "voice": {
    "input": "@react-native-voice/voice",  // STT
    "output": "expo-speech"                 // TTS
  },
  "navigation": "@react-navigation/native",
  "state": "React Context + AsyncStorage",
  "api": "axios",
  "background": "react-native-background-fetch",
  "notifications": "expo-notifications + Firebase"
}
```

**Screens:**
1. Home Screen - Next reminder, quick actions
2. Voice Chat Screen - Conversation interface
3. Emergency Screen - One-tap help button
4. Settings - Volume, test voice

**Data Storage (Local):**
- Patient ID (AsyncStorage)
- Device token (Firebase)
- Pending messages queue (offline support)
- Last sync timestamp

**Background Tasks:**
- Heartbeat every 15 minutes
- Push notification handler
- Offline message queue processor

---

### 2. Caregiver Web Dashboard (Next.js)

**Purpose:** Comprehensive monitoring and management interface for caregivers

**Key Features:**
- Patient management (CRUD)
- Schedule configuration
- Real-time activity monitoring (polling every 5-10s)
- Alert management
- Conversation history with semantic search (Chroma)
- AI-generated insights (Letta)
- Daily summaries

**Technology Stack:**
```javascript
{
  "framework": "Next.js 14 (App Router)",
  "styling": "Tailwind CSS",
  "components": "Shadcn/UI or Headless UI",
  "state": "React Query (TanStack Query)",
  "charts": "Recharts",
  "api": "fetch with React Query",
  "auth": "JWT in httpOnly cookies"
}
```

**Pages:**
- `/login` - Authentication
- `/dashboard` - Overview of all patients
- `/patients` - Patient list
- `/patients/[id]` - Patient detail (tabs: Today, Schedule, Conversations, Insights, Profile)
- `/alerts` - Alert management
- `/reports` - Daily summaries
- `/settings` - Account settings

**Real-Time Updates:**
- Polling strategy (every 5-10 seconds)
- Optimistic updates for better UX
- Background refetch on window focus

---

### 3. Backend API Server (FastAPI)

**Purpose:** Central orchestration layer handling all business logic, data persistence, and external integrations

**Architecture Layers:**

```
┌──────────────────────────────────────────────────────────────┐
│                      API LAYER                               │
│  /api/v1/auth       - Authentication endpoints               │
│  /api/v1/patients   - Patient CRUD                           │
│  /api/v1/schedules  - Schedule management                    │
│  /api/v1/reminders  - Reminder history                       │
│  /api/v1/conversations - Conversation history & submission   │
│  /api/v1/alerts     - Alert management                       │
│  /api/v1/summaries  - Daily summaries                        │
│  /api/v1/insights   - AI insights from Letta                 │
│  /api/v1/mobile     - Mobile-specific endpoints              │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                             │
│  - conversation_service: Process patient messages            │
│  - alert_service: Create and dispatch alerts                 │
│  - summary_service: Generate daily summaries                 │
│  - activity_service: Monitor patient activity                │
│  - patient_service: Patient business logic                   │
│                                                              │
│  AI Services:                                                │
│  - claude_service: Real-time understanding & response        │
│  - letta_service: Long-term memory & pattern recognition     │
│  - chroma_service: Semantic search through conversations     │
│                                                              │
│  Communication Services:                                     │
│  - twilio_service: SMS & voice calls to caregivers          │
│  - firebase_service: Push notifications to patients         │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                │
│  - SQLAlchemy ORM models                                     │
│  - Database session management                               │
│  - Connection pooling                                        │
│  - Alembic migrations                                        │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                  POSTGRESQL DATABASE                         │
│  11 Tables: patients, caregivers, schedules, reminders,      │
│  conversations, alerts, daily_summaries, patient_insights,   │
│  activity_logs, system_logs, patient_caregiver_relationship  │
└──────────────────────────────────────────────────────────────┘
```

**Background Jobs (APScheduler):**
1. **Reminder Scheduler** - Runs every minute
   - Checks schedules
   - Generates reminders
   - Sends push notifications

2. **Activity Monitor** - Runs every 30 minutes
   - Checks for unusual inactivity
   - Creates alerts if needed

3. **Daily Summary Generator** - Runs at midnight
   - Aggregates day's data
   - Generates AI summary via Claude
   - Stores and delivers to caregivers

---

## Data Flow Diagrams

### Flow 1: Scheduled Reminder (End-to-End)

```
EVERY 2 HOURS OR AS SCHEDULED:

┌─────────────────────────────────────────────────────────────────┐
│ 1. BACKEND: APScheduler triggers reminder check                │
│    - Query schedules table for due reminders                    │
│    - Create reminder record (status: pending)                   │
│    - Call Firebase service to send push notification            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. FIREBASE: Push notification sent to mobile device           │
│    - Notification payload includes reminder details             │
│    - Firebase delivers to patient's device                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. MOBILE APP: Receives notification                           │
│    - Notification handler wakes app                             │
│    - Play TTS: "Hi Maggie, time for your morning medication"   │
│    - Start listening for voice response (30s timeout)           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓ (Patient responds OR no response)
                         │
      ┌──────────────────┴──────────────────┐
      │                                     │
      ↓ RESPONSE                            ↓ NO RESPONSE
┌──────────────────────┐          ┌──────────────────────┐
│ 4a. Patient speaks:  │          │ 4b. No response after│
│     "I took it"      │          │     30 seconds       │
│                      │          │                      │
│ - STT converts to    │          │ - Send retry attempt │
│   text               │          │ - Wait another 30s   │
│ - Send to backend    │          │ - After 2 retries:   │
│   API                │          │   Create ALERT       │
└──────┬───────────────┘          └──────┬───────────────┘
       │                                 │
       ↓                                 ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. BACKEND: Process response                                    │
│                                                                  │
│    a. Query Letta for patient context:                          │
│       - "What do I know about this patient?"                    │
│       - Letta returns: preferences, patterns, reliability       │
│                                                                  │
│    b. Get current context from database:                        │
│       - Patient profile                                          │
│       - Today's schedule                                         │
│       - Recent conversations                                     │
│       - Family information                                       │
│                                                                  │
│    c. Send everything to Claude:                                │
│       - Patient message: "I took it"                            │
│       - Letta's memory                                          │
│       - Current context                                          │
│       - Ask: Analyze intent, assess validity, generate response │
│                                                                  │
│    d. Claude analyzes and returns:                              │
│       {                                                          │
│         "intent": "task_completed",                             │
│         "confidence": 0.95,                                     │
│         "reasoning": "Patient reliably confirms medication",    │
│         "response": "Great! Thanks for letting me know, Maggie",│
│         "recommended_actions": ["mark_completed"],              │
│         "needs_escalation": false                               │
│       }                                                          │
│                                                                  │
│    e. Execute actions:                                          │
│       - Update reminder status: completed                        │
│       - Update reminder.acknowledged = true                      │
│       - Update reminder.response_text = "I took it"             │
│       - Store Claude analysis in reminder.claude_analysis       │
│                                                                  │
│    f. Update Letta's memory:                                    │
│       - "Patient took morning medication at 8:03 AM"            │
│       - "Response time: 3 minutes (within normal range)"        │
│       - "Cooperation level: high"                               │
│                                                                  │
│    g. Store in Chroma:                                          │
│       - Store conversation embedding                             │
│       - Metadata: timestamp, sentiment, topics                   │
│       - Enables future semantic search                           │
│                                                                  │
│    h. Return response to mobile app                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. MOBILE APP: Receive response                                │
│    - Text response: "Great! Thanks for letting me know, Maggie"│
│    - Convert to speech (TTS)                                    │
│    - Play audio                                                 │
│    - Update UI: Mark reminder as completed                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. DASHBOARD: Real-time update (via polling)                   │
│    - Dashboard polls every 5-10 seconds                         │
│    - GET /api/v1/patients/{id}/activity?since={timestamp}      │
│    - Backend returns new reminder completion                    │
│    - Dashboard UI updates:                                      │
│      "08:00 AM ✅ Morning Medication - Completed in 3 minutes" │
│      "Patient said: 'I took it'"                               │
└─────────────────────────────────────────────────────────────────┘
```

---

### Flow 2: Manual Conversation (Patient Initiates)

```
PATIENT INITIATES:

┌─────────────────────────────────────────────────────────────────┐
│ 1. MOBILE APP: Patient taps "Talk to Me" button                │
│    - Start listening immediately                                │
│    - Show pulsing microphone icon                               │
│    - Visual feedback: "I'm listening..."                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. PATIENT: Speaks "I'm feeling dizzy"                         │
│    - STT converts speech to text                                │
│    - Send to backend with context:                              │
│      {                                                           │
│        "patient_id": "uuid",                                    │
│        "message": "I'm feeling dizzy",                          │
│        "timestamp": "2025-10-24T14:30:00Z",                     │
│        "context": {                                             │
│          "triggered_by": "manual",                              │
│          "last_interaction": "12:45 PM"                         │
│        }                                                         │
│      }                                                           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. BACKEND: AI Processing Pipeline                             │
│                                                                  │
│    STEP 1: Query Letta for context                             │
│    ────────────────────────────────                             │
│    Request: "What do you know about Patient #123?"              │
│    Response from Letta:                                         │
│    {                                                             │
│      "health_patterns": {                                       │
│        "past_dizziness": [                                      │
│          "Mentioned 3 times this month",                        │
│          "Always afternoon",                                    │
│          "Usually related to dehydration"                       │
│        ]                                                         │
│      },                                                          │
│      "communication_preferences": {                             │
│        "preferred_name": "Maggie",                              │
│        "responds_well_to": "direct questions"                   │
│      },                                                          │
│      "reliability": {                                           │
│        "medication_adherence": 0.95,                            │
│        "reports_symptoms_accurately": true                      │
│      }                                                           │
│    }                                                             │
│                                                                  │
│    STEP 2: Get current context from database                   │
│    ────────────────────────────────────────                     │
│    Query: Patient profile, today's schedule, recent activity    │
│    {                                                             │
│      "medications_today": ["Lisinopril at 8:00 AM - taken"],   │
│      "last_meal": "12:45 PM",                                   │
│      "mood_earlier": "good"                                     │
│    }                                                             │
│                                                                  │
│    STEP 3: Query Chroma for similar past situations            │
│    ────────────────────────────────────────────────            │
│    Semantic search: "dizziness"                                 │
│    Chroma returns:                                              │
│    [                                                             │
│      "Oct 10: Felt dizzy → hadn't drunk water → felt better",  │
│      "Sep 28: Lightheaded → mid-afternoon → drank water",      │
│      "Sep 15: Room spinning → stood up too fast → passed"      │
│    ]                                                             │
│                                                                  │
│    STEP 4: Send everything to Claude                           │
│    ────────────────────────────────────                         │
│    Prompt to Claude:                                            │
│    "You are a caring AI companion for Maggie (78 years old).   │
│     She just said: 'I'm feeling dizzy'                         │
│                                                                  │
│     LETTA'S MEMORY:                                             │
│     [Include all Letta context from Step 1]                     │
│                                                                  │
│     CURRENT CONTEXT:                                            │
│     [Include database context from Step 2]                      │
│                                                                  │
│     SIMILAR PAST SITUATIONS (from Chroma):                      │
│     [Include Chroma results from Step 3]                        │
│                                                                  │
│     ANALYZE:                                                    │
│     1. What's the likely cause? (Consider pattern: usually      │
│        dehydration, afternoon)                                  │
│     2. How urgent is this? (low/medium/high/critical)          │
│     3. What questions should you ask?                           │
│     4. Generate empathetic response                             │
│     5. Should caregiver be alerted?                             │
│     6. Recommended actions?                                     │
│                                                                  │
│     Respond in JSON format."                                    │
│                                                                  │
│    Claude's Response:                                           │
│    {                                                             │
│      "analysis": {                                              │
│        "intent": "health_concern",                              │
│        "severity": "medium",                                    │
│        "likely_causes": [                                       │
│          "Dehydration (most likely based on pattern)",          │
│          "Blood pressure medication effect",                    │
│          "Low blood sugar"                                      │
│        ],                                                        │
│        "reasoning": "Patient has pattern of afternoon           │
│         dizziness related to dehydration. Not critical but      │
│         needs attention."                                       │
│      },                                                          │
│      "response_to_patient": "I'm concerned about your          │
│       dizziness, Maggie. This has happened before, remember?    │
│       Let's figure out what's going on. First, have you had     │
│       water to drink in the last couple hours?",                │
│      "follow_up_questions": [                                   │
│        "Have you had water recently?",                          │
│        "Does it get worse when you stand?",                     │
│        "Do you feel nauseous?"                                  │
│      ],                                                          │
│      "recommended_actions": {                                   │
│        "immediate": [                                           │
│          "Ask follow-up questions",                             │
│          "Suggest patient sits down",                           │
│          "Suggest drinking water"                               │
│        ],                                                        │
│        "monitoring": "Check again in 15 minutes",               │
│        "escalation": "Alert caregiver if persists 30+ min"     │
│      },                                                          │
│      "alert_caregiver": {                                       │
│        "immediately": false,                                    │
│        "if_no_improvement": true,                               │
│        "severity": "medium",                                    │
│        "message": "Maggie reported dizziness at 2:30 PM.        │
│         This is recurring pattern. Monitoring situation."       │
│      },                                                          │
│      "needs_escalation": false  # For now                       │
│    }                                                             │
│                                                                  │
│    STEP 5: Execute actions based on Claude's analysis          │
│    ──────────────────────────────────────────────              │
│    - Store conversation in database                             │
│    - Store Claude's analysis                                    │
│    - Create alert (severity: medium, status: monitoring)        │
│    - Send notification to caregiver: "FYI: Monitoring          │
│      dizziness report"                                          │
│                                                                  │
│    STEP 6: Update Letta's memory                               │
│    ───────────────────────────────                             │
│    Send to Letta:                                               │
│    "UPDATE MEMORY: Patient reported dizziness at 2:30 PM.      │
│     Context: Routine day, had medication and meals.             │
│     Pattern continues: 4th time this month, always afternoon.   │
│     Response: Suggested hydration.                              │
│     Recommendation: Add proactive water reminders at 2 PM."     │
│                                                                  │
│    Letta processes and strengthens pattern recognition          │
│                                                                  │
│    STEP 7: Store in Chroma for future search                   │
│    ───────────────────────────────────────                     │
│    Add to Chroma:                                               │
│    {                                                             │
│      "text": "Patient: I'm feeling dizzy. AI: Concerned about   │
│       dizziness... have you had water?",                        │
│      "metadata": {                                              │
│        "timestamp": "2025-10-24T14:30:00Z",                     │
│        "topics": ["health", "dizziness", "hydration"],          │
│        "sentiment": "concerned",                                │
│        "outcome": "monitoring"                                  │
│      }                                                           │
│    }                                                             │
│                                                                  │
│    STEP 8: Return response to mobile app                       │
│    ───────────────────────────────────                         │
│    {                                                             │
│      "response": "I'm concerned about your dizziness, Maggie... │
│       have you had water to drink?",                            │
│      "speak": true,                                             │
│      "keep_listening": true,                                    │
│      "alert_sent": true,                                        │
│      "alert_severity": "medium"                                 │
│    }                                                             │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. MOBILE APP: Speak response and continue listening           │
│    - TTS plays: "I'm concerned about your dizziness..."        │
│    - Automatically starts listening for follow-up               │
│    - Patient responds: "No, I haven't had much water"          │
│    - Loop continues with same pipeline                          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. DASHBOARD: Update in real-time                              │
│    - Polling detects new conversation                           │
│    - Shows in activity feed:                                    │
│      "02:30 PM ⚠️ Health Concern                               │
│       Patient reported dizziness                                │
│       Action: Monitoring, suggested hydration                   │
│       [View Full Conversation]"                                 │
│    - Alert badge shows: "1 medium alert"                        │
└─────────────────────────────────────────────────────────────────┘
```

---

### Flow 3: Emergency Alert

```
EMERGENCY BUTTON PRESSED:

┌─────────────────────────────────────────────────────────────────┐
│ 1. MOBILE APP: Patient presses "I NEED HELP" button            │
│    - Show confirmation: "Alert your family? Press again"       │
│    - Auto-confirm after 3 seconds                               │
│    - Vibration + audio feedback                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. MOBILE APP: Send emergency request to backend               │
│    POST /api/v1/mobile/emergency                                │
│    {                                                             │
│      "patient_id": "uuid",                                      │
│      "timestamp": "2025-10-24T15:45:23Z",                       │
│      "location": {"lat": 37.7749, "lng": -122.4194},           │
│      "battery_level": 0.45,                                     │
│      "alert_type": "emergency_button"                           │
│    }                                                             │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. BACKEND: Immediate emergency response (< 5 seconds)         │
│                                                                  │
│    a. Create CRITICAL alert in database:                        │
│       {                                                          │
│         "alert_type": "emergency_button",                       │
│         "severity": "critical",                                 │
│         "title": "EMERGENCY: Help button pressed",              │
│         "description": "Maggie pressed emergency button",       │
│         "patient_id": "uuid",                                   │
│         "created_at": "2025-10-24T15:45:24Z",                   │
│         "acknowledged": false                                   │
│       }                                                          │
│                                                                  │
│    b. Get ALL caregivers for this patient:                      │
│       - Primary caregiver                                        │
│       - Secondary caregivers                                     │
│                                                                  │
│    c. Send SMS via Twilio (to ALL caregivers):                 │
│       "🚨 EMERGENCY: Maggie pressed help button at 3:45 PM.    │
│        Call her now: +1234567890                                │
│        Location: [map link]                                     │
│        Dashboard: [link]"                                       │
│                                                                  │
│    d. Make voice call via Twilio (to primary caregiver):       │
│       "This is Elder Companion AI. Maggie has pressed the       │
│        emergency help button at 3:45 PM. Please call her        │
│        immediately at [phone number]. Press 1 to call her now,  │
│        press 2 to call 911, or press 3 to dismiss."            │
│                                                                  │
│    e. Update system logs with full context                      │
│                                                                  │
│    f. Update Letta:                                             │
│       "EMERGENCY: Patient pressed help button at 3:45 PM.       │
│        All caregivers notified. Awaiting response."             │
│                                                                  │
│    g. Store in Chroma (for pattern analysis):                  │
│       Track emergency events over time                           │
│                                                                  │
│    h. Return success to mobile app                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. MOBILE APP: Show reassurance                                │
│    - Large text: "Help is on the way!"                         │
│    - "Sarah has been alerted and will call you soon."          │
│    - Keep screen on                                             │
│    - Play calming audio (optional)                              │
│    - Wait for caregiver to acknowledge                          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. DASHBOARD: Flash alert (real-time)                          │
│    - Polling immediately detects critical alert                 │
│    - Full-screen modal:                                         │
│      "🚨 EMERGENCY ALERT"                                       │
│      "Maggie pressed emergency button at 3:45 PM"               │
│      "[Call Patient] [Call 911] [Acknowledge]"                  │
│    - Auto-play alert sound                                      │
│    - Flash browser tab                                          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. CAREGIVER: Acknowledges alert                               │
│    - Clicks "Acknowledge" in dashboard                          │
│    - Adds note: "Called Maggie, she fell but is okay"          │
│    - Marks alert as resolved                                    │
│                                                                  │
│    POST /api/v1/alerts/{alert_id}/acknowledge                   │
│    {                                                             │
│      "acknowledged_by": "caregiver_id",                         │
│      "resolution_notes": "Called patient, she fell but okay",   │
│      "resolution_action": "called_patient"                      │
│    }                                                             │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. BACKEND: Update alert status                                │
│    - Mark alert as acknowledged                                 │
│    - Store resolution notes                                     │
│    - Update Letta: "Emergency resolved, patient fell but okay"  │
│    - Log in system for analytics                                │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 8. MOBILE APP: Update status                                   │
│    - Polling detects alert acknowledged                         │
│    - Update screen: "Sarah has been reached. Help is coming."  │
└─────────────────────────────────────────────────────────────────┘
```

---

## AI Integration Architecture

### Three-Layer AI System

```
┌───────────────────────────────────────────────────────────────────┐
│                         INTEGRATION LAYER                         │
│                      (conversation_service.py)                    │
│                                                                   │
│  Orchestrates all three AI components:                           │
│  1. Query Letta for patient context                              │
│  2. Query Chroma for similar past conversations                  │
│  3. Send combined context to Claude                              │
│  4. Execute Claude's recommendations                              │
│  5. Update Letta with new learnings                              │
│  6. Store conversation in Chroma                                  │
└───────────────────────────────────────────────────────────────────┘
           │                    │                    │
           │                    │                    │
           ↓                    ↓                    ↓
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│     CLAUDE      │  │      LETTA      │  │     CHROMA      │
│   (Anthropic)   │  │     (Cloud)     │  │  (Vector DB)    │
├─────────────────┤  ├─────────────────┤  ├─────────────────┤
│                 │  │                 │  │                 │
│ PURPOSE:        │  │ PURPOSE:        │  │ PURPOSE:        │
│ Real-time       │  │ Long-term       │  │ Semantic        │
│ understanding   │  │ memory &        │  │ search through  │
│ & response      │  │ patterns        │  │ conversations   │
│                 │  │                 │  │                 │
│ WHEN USED:      │  │ WHEN USED:      │  │ WHEN USED:      │
│ - Every patient │  │ - Before every  │  │ - Dashboard     │
│   message       │  │   Claude call   │  │   search        │
│ - Daily         │  │ - After every   │  │ - Pattern       │
│   summaries     │  │   conversation  │  │   detection     │
│ - Reminder      │  │ - Insight       │  │ - Similar       │
│   analysis      │  │   generation    │  │   situations    │
│                 │  │                 │  │                 │
│ WHAT IT KNOWS:  │  │ WHAT IT STORES: │  │ WHAT IT STORES: │
│ - Current       │  │ - Patient       │  │ - Conversation  │
│   context only  │  │   preferences   │  │   embeddings    │
│ - No memory     │  │ - Behavioral    │  │ - Metadata      │
│   between calls │  │   patterns      │  │   (topics,      │
│                 │  │ - Health        │  │   sentiment)    │
│                 │  │   observations  │  │ - Timestamps    │
│                 │  │ - Family        │  │                 │
│                 │  │   context       │  │                 │
│                 │  │ - Communication │  │                 │
│                 │  │   style         │  │                 │
│                 │  │ - Response      │  │                 │
│                 │  │   reliability   │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘

HOW THEY COMPLEMENT EACH OTHER:

┌─────────────────────────────────────────────────────────────────┐
│ Example: Patient says "I'm feeling dizzy"                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 1. LETTA provides:                                              │
│    ✅ "Patient name is Maggie"                                 │
│    ✅ "Has mentioned dizziness 3 times before"                 │
│    ✅ "Pattern: Always afternoon, usually dehydration"         │
│    ✅ "Responds well to direct questions"                      │
│    ✅ "Medication adherence is 95% reliable"                   │
│                                                                 │
│ 2. CHROMA finds similar past conversations:                    │
│    ✅ "Oct 10: Dizzy → hadn't drunk water → felt better"      │
│    ✅ "Sep 28: Lightheaded → drank water → resolved"          │
│    ✅ Pattern confirmed across multiple instances              │
│                                                                 │
│ 3. CLAUDE analyzes with full context:                          │
│    ✅ Understands: "This is recurring pattern"                 │
│    ✅ Generates: Empathetic, context-aware response            │
│    ✅ Recommends: Ask about water, suggest hydration           │
│    ✅ Decides: Medium severity, monitor but don't panic        │
│                                                                 │
│ WITHOUT LETTA & CHROMA:                                         │
│    ❌ Claude would treat each dizziness report as new           │
│    ❌ Wouldn't know about dehydration pattern                   │
│    ❌ Might over-react or under-react                           │
│    ❌ Wouldn't use patient's preferred name                     │
│                                                                 │
│ WITHOUT CLAUDE:                                                 │
│    ❌ Letta can't generate natural responses                    │
│    ❌ Chroma only finds similar text, doesn't analyze           │
│    ❌ No real-time understanding or decision-making             │
└─────────────────────────────────────────────────────────────────┘
```

### Detailed Service Implementations

**1. Claude Service (`claude_service.py`)**

```python
class ClaudeService:
    """Real-time AI understanding and response generation"""

    async def analyze_conversation(
        self,
        patient_message: str,
        patient_profile: dict,
        letta_context: dict,
        chroma_similar: list,
        current_context: dict
    ) -> dict:
        """
        Send comprehensive prompt to Claude for analysis

        Returns:
        {
            "intent": "health_concern" | "casual_chat" | "question" | ...,
            "severity": "low" | "medium" | "high" | "critical",
            "confidence": 0.0-1.0,
            "sentiment": "positive" | "neutral" | "negative" | "concerned",
            "emotional_state": "happy" | "sad" | "anxious" | "neutral",
            "response": "Generated response text",
            "topics": ["health", "family", ...],
            "recommended_actions": [...],
            "needs_escalation": bool,
            "escalation_reason": "..."
        }
        """

    async def generate_daily_summary(
        self,
        patient_id: str,
        day_data: dict,
        letta_insights: dict
    ) -> dict:
        """
        Generate comprehensive daily summary

        Returns narrative, statistics, insights, recommendations
        """
```

**2. Letta Service (`letta_service.py`)**

```python
class LettaService:
    """Long-term memory and pattern recognition"""

    async def create_agent(self, patient_id: str, patient_profile: dict) -> str:
        """
        Create Letta agent for new patient
        Returns agent_id to store in database
        """

    async def get_context(self, agent_id: str) -> dict:
        """
        Query Letta for patient context before conversation

        Returns:
        {
            "patient_preferences": {...},
            "behavioral_patterns": {...},
            "health_observations": {...},
            "communication_traits": {...},
            "family_context": {...},
            "recent_observations": [...]
        }
        """

    async def update_memory(
        self,
        agent_id: str,
        interaction_summary: str,
        outcomes: dict,
        patterns_observed: list
    ):
        """
        Update Letta's memory after each interaction
        Letta processes and updates long-term patterns
        """

    async def generate_insights(self, agent_id: str) -> list:
        """
        Query Letta for actionable insights

        Returns list of insights with:
        - Pattern description
        - Confidence score
        - Recommended action
        - Evidence (interaction references)
        """
```

**3. Chroma Service (`chroma_service.py`)**

```python
class ChromaService:
    """Semantic search through conversation history"""

    def __init__(self):
        self.client = chromadb.Client()
        # Create collections per patient
        # conversations_{patient_id}: All conversation text
        # health_mentions: Health-related excerpts
        # insights: Letta-generated insights

    async def add_conversation(
        self,
        patient_id: str,
        conversation_id: str,
        text: str,
        metadata: dict
    ):
        """
        Store conversation in Chroma for semantic search

        Metadata includes:
        - timestamp
        - sentiment
        - topics
        - participants
        - conversation_type
        """

    async def semantic_search(
        self,
        patient_id: str,
        query: str,
        n_results: int = 5
    ) -> list:
        """
        Search conversations semantically

        Example queries:
        - "knee pain"
        - "mentions of Sarah (daughter)"
        - "confused about medication"
        - "happy conversations about grandchildren"

        Returns list of similar conversations with:
        - conversation_id
        - text snippet
        - similarity score
        - metadata
        """

    async def find_similar_situations(
        self,
        patient_id: str,
        current_message: str,
        n_results: int = 3
    ) -> list:
        """
        Find past conversations similar to current situation
        Used to provide Claude with historical context
        """
```

---

## Database Architecture

### Entity-Relationship Diagram

```
┌─────────────────┐
│   caregivers    │
│─────────────────│
│ id (PK)         │
│ email (unique)  │
│ password_hash   │
│ first_name      │
│ last_name       │
│ phone_number    │
│ relationship    │
└────────┬────────┘
         │
         │ many-to-many
         │
         ↓
┌──────────────────────────────────┐
│ patient_caregiver_relationship   │
│──────────────────────────────────│
│ id (PK)                          │
│ patient_id (FK)                  │
│ caregiver_id (FK)                │
│ is_primary                       │
│ access_level                     │
└──────────────┬───────────────────┘
               │
               │ many-to-many
               │
               ↓
      ┌─────────────────┐
      │    patients     │
      │─────────────────│
      │ id (PK)         │
      │ first_name      │
      │ preferred_name  │
      │ date_of_birth   │
      │ medical_conditions (array)
      │ letta_agent_id  │───────┐
      │ personal_context (JSONB)│ References Letta Cloud
      └────────┬────────┘        │
               │                 │
               │ one-to-many     │
               │                 │
   ┌───────────┼─────────────┐   │
   │           │             │   │
   ↓           ↓             ↓   ↓
┌──────────┐ ┌──────────┐ ┌──────────────┐ ┌──────────────────┐
│schedules │ │reminders │ │conversations │ │ patient_insights │
│──────────│ │──────────│ │──────────────│ │──────────────────│
│ id       │ │ id       │ │ id           │ │ id               │
│patient_id│ │schedule_id│ │ patient_id  │ │ patient_id       │
│ title    │ │patient_id │ │ message_text│ │ insight_type     │
│ time     │ │sent_at    │ │ claude_     │ │ description      │
│ category │ │responded  │ │ analysis    │ │ confidence_score │
│ is_active│ │  _at      │ │ (JSONB)     │ │ is_actionable    │
└──────────┘ │acknowledged│ └──────────────┘ └──────────────────┘
             │ claude_    │
             │ analysis   │        ┌──────────────────┐
             │ (JSONB)    │        │ daily_summaries  │
             └──────────┘        │──────────────────│
                                  │ id               │
                  ┌───────────────│ patient_id       │
                  │               │ summary_date     │
                  │               │ key_observations │
                  │               │ (TEXT ARRAY)     │
                  │               │ claude_narrative │
                  │               │ (TEXT)           │
                  ↓               └──────────────────┘
         ┌──────────────┐
         │   alerts     │         ┌──────────────────┐
         │──────────────│         │ activity_logs    │
         │ id           │         │──────────────────│
         │ patient_id   │         │ id               │
         │ alert_type   │         │ patient_id       │
         │ severity     │         │ activity_type    │
         │ acknowledged │         │ timestamp        │
         │ acknowledged │         │ context (JSONB)  │
         │  _by (FK)    │         └──────────────────┘
         └──────────────┘

Chroma Collections (External):
┌─────────────────────────────────────┐
│ conversations_{patient_id}          │
│ - Full conversation embeddings      │
│ - Metadata: timestamp, sentiment... │
└─────────────────────────────────────┘

Letta Agents (External):
┌─────────────────────────────────────┐
│ One agent per patient               │
│ - Stores in Letta Cloud             │
│ - Referenced by letta_agent_id      │
└─────────────────────────────────────┘
```

### Key Design Decisions

1. **JSONB fields** for flexible data:
   - `patients.personal_context`: Family info, hobbies, sensitive topics
   - `reminders.claude_analysis`: AI analysis results
   - `activity_logs.context`: Activity metadata

2. **Many-to-many relationship** between patients and caregivers:
   - One patient can have multiple caregivers
   - One caregiver can manage multiple patients
   - `is_primary` flag indicates primary contact

3. **Separate tables for schedules vs reminders**:
   - `schedules`: Templates (recurring reminders)
   - `reminders`: Instances (individual occurrences)

4. **External AI storage**:
   - Letta memory: Stored in Letta Cloud
   - Chroma vectors: Stored in Chroma database
   - PostgreSQL only stores references (agent_id, collection names)

---

## API Architecture

### REST API Design Principles

1. **Versioning**: `/api/v1/` prefix for all endpoints
2. **Resource-based URLs**: `/patients`, `/schedules`, not `/getPatients`
3. **HTTP methods**: GET (read), POST (create), PUT (update), DELETE (remove)
4. **Status codes**: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 404 (Not Found), 500 (Server Error)
5. **Consistent response format**:

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

### Authentication Flow

```
┌──────────────────────────────────────────────────────────────┐
│ 1. LOGIN: POST /api/v1/auth/login                           │
│    Request: { "email": "...", "password": "..." }           │
│    Response: {                                               │
│      "access_token": "jwt...",   # Valid for 30 minutes     │
│      "refresh_token": "jwt...",  # Valid for 7 days         │
│      "caregiver_id": "uuid"                                  │
│    }                                                         │
└──────────────────────────────────────────────────────────────┘
                         │
                         ↓
┌──────────────────────────────────────────────────────────────┐
│ 2. AUTHENTICATED REQUESTS                                    │
│    All subsequent requests include:                          │
│    Header: Authorization: Bearer {access_token}              │
│                                                              │
│    Backend validates:                                        │
│    - Token signature                                         │
│    - Token expiration                                        │
│    - User exists                                             │
└──────────────────────────────────────────────────────────────┘
                         │
                         ↓
┌──────────────────────────────────────────────────────────────┐
│ 3. TOKEN REFRESH (when access_token expires)                │
│    POST /api/v1/auth/refresh                                 │
│    Request: { "refresh_token": "..." }                       │
│    Response: {                                               │
│      "access_token": "new_jwt...",                           │
│      "refresh_token": "new_jwt..."                           │
│    }                                                         │
└──────────────────────────────────────────────────────────────┘
```

### API Endpoint Categories

**Authentication** (`/api/v1/auth`)
- POST `/register` - Create caregiver account
- POST `/login` - Login
- POST `/refresh` - Refresh token
- POST `/logout` - Logout (invalidate tokens)

**Patients** (`/api/v1/patients`)
- GET `/` - List patients for logged-in caregiver
- POST `/` - Create new patient
- GET `/{id}` - Get patient details
- PUT `/{id}` - Update patient
- DELETE `/{id}` - Soft delete patient

**Schedules** (`/api/v1/schedules` or `/api/v1/patients/{id}/schedules`)
- GET `/patients/{id}/schedules` - List schedules for patient
- POST `/patients/{id}/schedules` - Create schedule
- PUT `/schedules/{id}` - Update schedule
- DELETE `/schedules/{id}` - Delete schedule

**Reminders** (`/api/v1/reminders`)
- GET `/patients/{id}/reminders` - Reminder history
- GET `/reminders/{id}` - Reminder details
- POST `/reminders/{id}/retry` - Manual retry

**Conversations** (`/api/v1/conversations`)
- POST `/patient` - Submit patient message (from mobile)
- GET `/patients/{id}/conversations` - Conversation history
- GET `/{id}` - Conversation details
- GET `/search` - Semantic search via Chroma

**Alerts** (`/api/v1/alerts`)
- GET `/` - List alerts (filterable)
- POST `/{id}/acknowledge` - Acknowledge alert
- POST `/{id}/resolve` - Resolve alert

**Summaries** (`/api/v1/summaries`)
- GET `/patients/{id}/summaries` - Daily summaries
- GET `/{id}` - Summary details

**Insights** (`/api/v1/insights`)
- GET `/patients/{id}/insights` - Letta insights

**Mobile** (`/api/v1/mobile`)
- POST `/heartbeat` - Activity tracking
- POST `/emergency` - Emergency button

---

## Security Architecture

### Authentication & Authorization

**JWT Token Structure:**
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "caregiver_id",
    "email": "caregiver@example.com",
    "iat": 1640000000,
    "exp": 1640003600,
    "type": "access"  // or "refresh"
  },
  "signature": "..."
}
```

**Access Control:**
- Caregivers can only access their assigned patients
- Patient IDs are validated against `patient_caregiver_relationship` table
- Mobile app doesn't require authentication (patient_id stored locally)

### Data Protection

**Sensitive Data:**
- Passwords: bcrypt hashing
- API keys: Environment variables (never in code)
- Patient data: Encrypted at rest (PostgreSQL)
- Communications: HTTPS only

**Privacy:**
- No patient data leaves system except to:
  - Claude API (for analysis)
  - Letta API (for memory)
  - Chroma (for search)
- All external APIs use HTTPS
- Data retention: 90 days for logs, indefinite for patient data

---

## Background Jobs Architecture

### APScheduler Configuration

```python
# app/main.py

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.services.scheduler import (
    reminder_scheduler,
    monitoring_scheduler,
    summary_scheduler
)

scheduler = AsyncIOScheduler()

# Job 1: Check reminders (every minute)
scheduler.add_job(
    reminder_scheduler.check_due_reminders,
    'interval',
    minutes=1,
    id='check_reminders'
)

# Job 2: Monitor inactivity (every 30 minutes)
scheduler.add_job(
    monitoring_scheduler.check_inactivity,
    'interval',
    minutes=30,
    id='monitor_inactivity'
)

# Job 3: Generate daily summaries (at midnight)
scheduler.add_job(
    summary_scheduler.generate_summaries,
    'cron',
    hour=0,
    minute=0,
    id='daily_summaries'
)

scheduler.start()
```

### Job Details

**1. Reminder Scheduler (every 1 minute)**
- Query schedules for due reminders
- Create reminder records
- Send push notifications via Firebase
- Handle retries

**2. Activity Monitor (every 30 minutes)**
- Check last heartbeat for each patient
- Calculate hours of inactivity
- Create alerts if thresholds exceeded
- Notify caregivers

**3. Daily Summary Generator (midnight)**
- For each patient:
  - Collect day's data
  - Query Letta for insights
  - Generate summary via Claude
  - Store in database
  - Email to caregivers (if configured)

---

## Conclusion

This architecture is designed for:
- ✅ **Scalability**: Microservices-ready (each AI service is external)
- ✅ **Maintainability**: Clear separation of concerns
- ✅ **Reliability**: Background jobs, retries, error handling
- ✅ **Performance**: Polling strategy, caching (React Query)
- ✅ **Security**: JWT auth, HTTPS, data encryption

**For more details, see:**
- `documents/deployment.md` - Deployment instructions
- `documents/file-structure.md` - Backend file structure
- `documents/postman-collections.md` - API testing guide
- `context.md` - Complete project specification

**Last Updated:** 2025-10-24
