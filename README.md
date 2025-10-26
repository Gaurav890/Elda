# Elder Companion AI - Complete Project Specification 

## Project Overview

**Elder Companion AI** is a voice-first mobile application designed to help elderly individuals (especially those with Alzheimer's, dementia, or living alone) maintain their daily routines through intelligent reminders, conversational AI companionship, and caregiver oversight.

### Core Innovation

-   **Voice-first interaction**: All patient communication happens in-app through voice
-   **AI that learns**: System adapts to each patient's patterns over time
-   **Proactive monitoring**: Multiple detection methods ensure safety
-   **Family connection**: Caregivers stay informed without being intrusive

### Target Prizes

-   ✅ **Social Impact** (Apple Watches) - Helping vulnerable elderly population
-   ✅ **Best Use of Claude** ($5K API credits + Tungsten Cube) - Advanced conversation understanding
-   ✅ **Best Use of Letta** (AirPods + swag) - Memory and personalization
-   ✅ **Best AI application using Chroma** ($200/person) - Semantic search through interactions
-   ✅ **Best Use of Vapi** (Swag + credits) - Natural voice AI (optional enhancement)

### What Makes This Special

-   **NOT just a reminder app**: It's a companion that learns, adapts, and cares
-   **NOT an alarm system**: It's conversational and empathetic
-   **NOT a replacement for caregivers**: It's a tool to enhance care and maintain independence

----------

## System Architecture

### High-Level Architecture

─────────────────────────────────────────────────────────────┐
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


#### 2. Manual Conversation Flow
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

## Document Structure

```
documents/
├── README.md                    # This file - navigation hub
├── architecture.md              # Complete system architecture
├── deployment.md                # Full deployment guide (Railway + Vercel + Expo)
├── file-structure.md            # Backend file structure (update when changes occur)
└── (future documents)
```

---

## Quick Navigation

###  Architecture & Design

**[architecture.md](./architecture.md)**
- High-level system architecture
- Component interactions
- Data flow diagrams (reminders, conversations, emergencies)
- AI integration architecture (Claude + Letta + Chroma)
- Database schema with relationships
- API architecture
- Security architecture
- Background jobs (APScheduler)

**When to use:** Understanding how components interact, planning new features, debugging cross-system issues

---

###  Deployment

**[deployment.md](./deployment.md)**
- Complete deployment architecture diagram
- Step-by-step Railway deployment (backend + PostgreSQL)
- Step-by-step Vercel deployment (web dashboard)
- Mobile app deployment (Expo Go vs EAS Build)
- External services configuration (Claude, Letta, Chroma, Twilio, Firebase)
- Environment variables guide
- Post-deployment checklist
- Monitoring and debugging
- Cost breakdown (~$10-20 for hackathon)

**When to use:** Deploying to production, configuring external services, troubleshooting deployment issues

---

###  File Structure

**[file-structure.md](./file-structure.md)**
- Complete backend file structure tree
- Purpose of each directory and key files
- Import conventions
- Testing structure
- Database migrations
- Configuration files
- **IMPORTANT:** Update this file whenever you add/remove/reorganize files

**When to use:** Finding where to add new code, understanding project organization, onboarding new developers


## Key Context Files (Root Level)

### context.md
**Location:** `/Users/gaurav/Elda/context.md`

**What's inside:**
- Complete project specification (6,187 lines)
- All features, requirements, and implementation details
- AI integration strategy (Claude + Letta + Chroma working together)
- Database schema (11 tables)
- API design
- Implementation timeline (20 hours)
- Testing strategy
- Demo preparation

**Recent updates:**
-  Chroma integrated as REQUIRED component (not optional)
-  Clear explanation of how Chroma and Letta complement each other
-  Updated implementation timeline to include Chroma in Hours 10-13
-  Enhanced judging criteria section for Chroma prize ($200/person)

**When to use:** Reference for any project detail, planning work, understanding requirements

---

## How Chroma, Letta, and Claude Work Together

**Updated in context.md to show complementary roles (NOT contradictory):**

### Claude (Anthropic)
**Role:** Real-time understanding and response generation
**What it does:**
- Analyzes patient messages RIGHT NOW
- Understands intent, emotion, urgency
- Generates appropriate responses
- Detects emergencies

### Letta (Cloud)
**Role:** Long-term memory and pattern recognition
**What it stores:**
- Patient preferences (name, communication style)
- Behavioral patterns (response times, reliability)
- Health patterns (recurring mentions)
- Family context

### Chroma (Vector DB)
**Role:** Semantic search engine
**What it enables:**
- Find conversations by MEANING, not just keywords
- Search: "knee pain" → finds "leg hurts", "trouble walking", "knee bothering"
- Provide evidence for Letta's patterns
- Power dashboard search feature

### How They Collaborate (Not Duplicate):
1. **Patient says:** "I'm feeling dizzy"
2. **Letta provides:** "Patient has dizziness pattern, usually afternoons, often dehydration"
3. **Chroma provides:** "Here are the 5 specific past conversations about dizziness"
4. **Claude analyzes:** Uses both Letta's pattern + Chroma's evidence → Generates informed response
5. **Result:** Better care through complementary AI capabilities

**Key Insight:**
- Letta = Abstract patterns ("patient tends to...")
- Chroma = Concrete evidence ("here are the specific times...")
- Claude = Real-time understanding with full context

