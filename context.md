# Elder Companion AI - Project Plan for Claude Code

## Project Overview

**Elder Companion AI** is a voice-first mobile application that helps elderly individuals (especially those with Alzheimer's, dementia, or living alone) maintain daily routines through intelligent AI reminders, conversational companionship, and caregiver oversight.

**Target**: Build MVP in 20 hours for Cal Hacks 12.0

**Note**: IoT integration (Alexa, Google Home, smart devices) is **NOT** part of this hackathon build. Mobile-only implementation.

----------

## Prize Targets

✅ Social Impact (Apple Watches)  
✅ Best Use of Claude ($5K API credits + Tungsten Cube)  
✅ Best Use of Letta (AirPods + swag)  
✅ Best AI application using Chroma ($200/person)  
✅ Best Use of Vapi (Swag + credits)

----------

## Tech Stack

### Backend

-   FastAPI (Python 3.11+)
-   PostgreSQL database
-   SQLAlchemy ORM
-   APScheduler (for reminder scheduling)
-   JWT authentication

### AI Services

-   Anthropic Claude API (conversation understanding)
-   Letta Cloud (memory and learning)
-   Chroma (vector database for semantic search)

### Communication

-   Twilio (voice calls + SMS)
-   Firebase Cloud Messaging (push notifications)
-   Vapi (optional voice AI enhancement)

### Mobile App

-   React Native with Expo
-   expo-speech (text-to-speech)
-   react-native-voice (voice input)
-   React Navigation

### Web Dashboard

-   Next.js 14 with TypeScript
-   Tailwind CSS
-   Recharts (for visualizations)

### Deployment

-   Railway.app (backend + database)
-   Vercel (web dashboard)
-   Expo EAS (mobile builds)

----------

## System Architecture

```
Caregiver Web Dashboard
    ↓ (manages)
Backend Server (FastAPI)
    ├── Scheduler (triggers reminders)
    ├── Claude AI (understands responses)
    ├── Letta (learns patterns)
    └── Alert System (notifies caregivers)
    ↓ (sends via)
Communication Layer
    ├── Twilio (voice calls)
    ├── Firebase (push notifications)
    └── Vapi (voice AI)
    ↓ (to)
Mobile App (Patient's Phone)
    ├── Voice input/output
    ├── Large simple UI
    └── Emergency button
```

---

## Database Schema Requirements

### Tables Needed

1. **patients** - Store patient profiles
   - Basic info (name, DOB, gender, photo)
   - Contact (phone, email, address, timezone)
   - Medical info (conditions, allergies, notes)
   - AI preferences (voice type, communication style, language)
   - Device info (push token, app version, last active)
   - Letta agent ID (for memory system)

2. **caregivers** - Store caregiver information
   - Basic info (name, relationship to patient)
   - Contact (phone, email)
   - Authentication (password hash)
   - Notification preferences (email/SMS/push)
   - Alert threshold settings

3. **patient_caregiver_relationship** - Link patients to caregivers
   - Many-to-many relationship
   - Primary contact flag
   - Access level (full, view_only, emergency_only)

4. **schedules** - Define recurring reminders
   - Title, description, category (medication/meal/exercise/other)
   - Timing (daily/weekly/specific date, time of day, days of week)
   - Reminder method (push/voice/both)
   - Retry configuration (max attempts, interval)
   - Medication details (name, dosage, color, location)
   - Active status, start/end dates

5. **reminders** - Individual reminder instances
   - Links to schedule and patient
   - Scheduled time, sent time, responded time
   - Delivery method and status
   - Patient response (text + audio URL)
   - Claude analysis (JSON)
   - Sentiment and completion status
   - Retry count and next retry time

6. **conversations** - All chat interactions
   - Conversation type (reminder_followup/casual_chat/emergency)
   - Messages from patient, AI, or caregiver
   - Intent detection
   - Escalation flag

7. **daily_summaries** - Generated daily reports
   - Statistics (reminders sent/acknowledged/missed)
   - Mood and sentiment analysis
   - AI-generated insights and concerns
   - Recommendations for caregiver
   - Detailed timeline (JSON)

8. **alerts** - Critical notifications
   - Alert type (no_response/distress/medication_error/emergency_button)
   - Severity level
   - Context and trigger data
   - Acknowledgment status
   - Resolution notes

9. **patient_insights** - Learned patterns from Letta
   - Insight type and category
   - Description and confidence score
   - Evidence (number of interactions, dates)
   - Actionable recommendations

10. **system_logs** - Application logs
    - Log level and type
    - Associated patient/caregiver
    - Message and structured details
    - Source component

**Task**: Create PostgreSQL schema with appropriate indexes, constraints, and relationships

---

## Core Features to Build

### Feature 1: Voice-Based Reminder System

**What it does**: Automatically sends voice reminders at scheduled times

**Requirements**:
- Scheduler checks every minute for due reminders
- Generate personalized voice messages using patient name, time of day
- Support for medication (with color/location), meals, exercise, other activities
- Deliver via Twilio voice call OR push notification with TTS
- Retry up to 3 times if no response (configurable interval)
- Log all attempts and outcomes

**Components**:
- Reminder scheduling service
- Message generation logic (personalized, contextual)
- Twilio integration for voice calls
- Firebase integration for push notifications
- Retry mechanism with exponential backoff option

---

### Feature 2: Two-Way Voice Conversation

**What it does**: Patient responds to reminders, AI understands and learns

**Requirements**:
- Capture voice responses via Twilio or mobile app
- Convert speech to text
- Send to Claude for intent analysis
- Determine: task completed (yes/no/unclear), patient mood, need for caregiver alert
- Generate appropriate AI response
- Continue conversation if needed (e.g., patient confused)
- Log entire conversation

**Claude's Job**:
- Understand natural language: "I took the yellow one" vs "I took the blue one" (detect if wrong medication)
- Detect confusion: "What medicine?" → respond helpfully
- Detect distress: "I don't feel good" → alert caregiver
- Confirm completion: "Done" / "Already did it" / "I'll do it in 5 minutes"
- Handle off-topic: "How's the weather?" → engage briefly, redirect gently

**Components**:
- Speech-to-text endpoint
- Claude integration with structured prompts
- Response generation
- Conversation state management
- Escalation logic

---

### Feature 3: AI Learning & Personalization (Letta)

**What it does**: System learns each patient's patterns and adapts

**What Letta should learn**:
- Response patterns: "Patient needs 2 reminders for lunch but only 1 for dinner"
- Communication preferences: "Prefers phone calls over push notifications"
- Timing patterns: "Usually wakes up at 8:30am, not 8:00am"
- Language patterns: "Says 'I'm good' when done, says 'okay okay' when annoyed"
- Health patterns: "Mentions knee pain on rainy days"
- Confusion triggers: "Gets confused about blue vs yellow pills"

**How it works**:
- Each patient gets unique Letta agent (store agent ID in database)
- After each interaction, send context to Letta
- Letta updates internal memory
- Query Letta for insights before sending reminders
- Use insights to personalize timing, wording, frequency

**Components**:
- Letta agent initialization per patient
- Memory update after each interaction
- Insight extraction API
- Apply insights to reminder generation

---

### Feature 4: Casual Check-In Conversations

**What it does**: Beyond reminders, AI chats with patient to reduce loneliness

**Examples**:
- Morning: "Good morning! How did you sleep?"
- Midday: "How are you feeling today?"
- Weather-based: "It's raining today, staying warm?"
- Memory prompts: "Tell me about your grandchildren"

**Requirements**:
- Patient can initiate chat anytime via app
- AI maintains context of ongoing conversation
- Detect if patient seems confused, sad, or distressed
- Keep conversations brief but meaningful (elderly may tire)
- Option for patient to request specific topics (hobbies, family, memories)

**Components**:
- Open-ended conversation endpoint
- Claude with conversational prompts
- Mood/sentiment tracking
- Emergency detection in casual chat

---

### Feature 5: Caregiver Dashboard

**What it shows**:
- Patient overview (photo, age, last active)
- Today's schedule with status indicators
- Real-time activity feed
- Daily summary statistics
- Mood trends chart
- Conversation history
- Active alerts
- AI insights and patterns
- Quick actions (call patient, add reminder, edit schedule)

**Pages needed**:
1. Dashboard home (overview)
2. Patient profile management
3. Schedule management (CRUD reminders)
4. Reports and history
5. Settings

**Components**:
- Authentication (login/signup)
- Real-time updates (WebSocket or polling)
- Data visualizations
- CRUD forms for schedules
- Alert management

---

### Feature 6: Daily Summary Reports

**What it does**: At end of day, generate comprehensive report for caregiver

**Content**:
- Statistics: X/Y reminders acknowledged, Z medications taken
- Timeline: Hour-by-hour activity log
- Mood assessment: "Overall mood: Good, stable throughout day"
- Key observations: "Took longer to respond in afternoon", "Mentioned feeling tired"
- Concerns: "Missed evening medication despite 3 reminders"
- Positive notes: "Completed all meals", "Engaged in pleasant conversation"
- Recommendations: "Consider adjusting dinner reminder to 6:30pm instead of 6:00pm"

**Delivery**:
- Displayed in dashboard
- Emailed to caregiver (optional)
- SMS summary for critical items (optional)

**Components**:
- Daily aggregation service (runs at midnight)
- Claude generates narrative summary from data
- Email/SMS integration
- PDF generation (nice to have)

---

### Feature 7: Emergency Alert System

**What triggers alerts**:
- Patient doesn't respond after maximum retries
- Patient presses emergency button in app
- AI detects distress in conversation ("I fell", "I'm scared", "Help")
- Unusual inactivity (no app usage for 4+ hours during daytime)
- Medication error detected (took wrong pill)

**Alert severity levels**:
- Low: Single missed reminder
- Medium: Multiple missed reminders, unusual patterns
- High: Distress detected, prolonged no response
- Critical: Emergency button, fall detection

**Alert actions**:
- Immediate notification to primary caregiver (SMS + call)
- Log in dashboard with context
- Option to escalate to 911 (with confirmation)
- Mark as acknowledged when caregiver responds

**Components**:
- Alert detection logic
- Priority queue for alerts
- Multi-channel notification (Twilio SMS + calls)
- Alert management UI
- Escalation workflows

---

### Feature 8: Mobile App (Patient-Facing)

**Must be**:
- EXTREMELY simple (elderly-friendly)
- Large text and buttons
- Voice-first interaction
- Minimal navigation

**Screens**:

1. **Home Screen**
   - Welcome message with patient name
   - Next upcoming reminder (time + title)
   - Recent activity checklist (✓ completed tasks)
   - Big "Chat with Me" button
   - Emergency button (always visible)

2. **Voice Chat Screen**
   - Large microphone button (hold to speak)
   - Visual feedback (listening, processing, speaking)
   - Text transcript of conversation
   - Simple "End Chat" button

3. **Emergency Screen**
   - Giant red "I NEED HELP" button
   - Confirmation dialog
   - Immediately calls primary caregiver + sends alert
   - Shows "Help is on the way" message

4. **Settings Screen** (minimal)
   - Adjust voice volume
   - Test voice
   - Contact caregiver
   - About/version

**Key UX Principles**:
- No login required (device is assigned to patient)
- Automatic text-to-speech for all notifications
- High contrast, large fonts (minimum 18pt)
- Simple color coding (green = done, yellow = pending, red = urgent)
- Voice feedback for all button presses
- No complex gestures (no swipe, pinch, etc.)

---

## API Endpoints

### Authentication
- `POST /api/auth/caregiver/register` - Caregiver signup
- `POST /api/auth/caregiver/login` - Caregiver login
- `POST /api/auth/refresh` - Refresh JWT token

### Patients
- `GET /api/patients` - List all patients for caregiver
- `POST /api/patients` - Create patient profile
- `GET /api/patients/{id}` - Get patient details
- `PUT /api/patients/{id}` - Update patient
- `DELETE /api/patients/{id}` - Deactivate patient

### Schedules
- `GET /api/patients/{id}/schedules` - Get patient's schedules
- `POST /api/patients/{id}/schedules` - Create schedule
- `PUT /api/schedules/{id}` - Update schedule
- `DELETE /api/schedules/{id}` - Delete schedule

### Reminders
- `GET /api/patients/{id}/reminders` - Get reminder history
- `GET /api/reminders/{id}` - Get specific reminder
- `POST /api/reminders/{id}/acknowledge` - Mark reminder as done
- `POST /api/reminders/{id}/retry` - Manual retry

### Conversations
- `GET /api/patients/{id}/conversations` - Get chat history
- `POST /api/conversations` - Send message (from caregiver)
- `POST /api/conversations/patient` - Patient message (from app)

### Voice (Twilio webhooks)
- `POST /api/voice/call/{reminder_id}` - Initiate voice call
- `POST /api/voice/response/{reminder_id}` - Handle voice response
- `POST /api/voice/status` - Call status updates

### AI
- `POST /api/ai/analyze-response` - Send patient response to Claude
- `POST /api/ai/generate-message` - Generate personalized message
- `GET /api/ai/insights/{patient_id}` - Get Letta insights

### Reports
- `GET /api/patients/{id}/daily-summary` - Get daily summary
- `GET /api/patients/{id}/daily-summary/{date}` - Historical summary
- `POST /api/patients/{id}/generate-summary` - Force generate summary

### Alerts
- `GET /api/alerts` - Get all alerts for caregiver
- `GET /api/alerts/{id}` - Get specific alert
- `PUT /api/alerts/{id}/acknowledge` - Acknowledge alert
- `PUT /api/alerts/{id}/resolve` - Resolve alert

### Mobile App
- `GET /api/mobile/init` - Initialize app (get patient info)
- `POST /api/mobile/device-token` - Register push notification token
- `POST /api/mobile/emergency` - Emergency button pressed
- `GET /api/mobile/next-reminder` - Get upcoming reminder
- `POST /api/mobile/heartbeat` - App activity ping

---

## Integration Requirements

### Claude Integration

**Purpose**: Understand patient responses and generate contextual conversations

**Key prompts needed**:

1. **Analyze Reminder Response**
   - Input: Reminder context (medication name, time, etc.) + patient response text
   - Output: JSON with completion status, sentiment, concerns, recommended response

2. **Generate Personalized Message**
   - Input: Patient profile, schedule details, time of day, Letta insights
   - Output: Natural, warm reminder message

3. **Casual Conversation**
   - Input: Conversation history, patient message
   - Output: Appropriate, caring response

4. **Daily Summary Generation**
   - Input: All day's interactions, statistics
   - Output: Narrative summary with insights and recommendations

5. **Distress Detection**
   - Input: Patient message (text or transcribed speech)
   - Output: Risk level, recommended action

---

### Letta Integration

**Purpose**: Remember patterns and personalize experience

**Setup**:
- Create one agent per patient
- Store agent ID in patients table
- Initialize with patient profile context

**Operations**:

1. **Update Memory**
   - After each interaction, send summary to Letta
   - Include: what happened, patient response, outcome, time

2. **Query Insights**
   - Before sending reminders, ask Letta for personalization tips
   - Get patterns: best times, communication preferences, response tendencies

3. **Generate Recommendations**
   - Periodically ask Letta for schedule optimization suggestions
   - Example: "Patient responds better to afternoon reminders"

---

### Chroma Integration

**Purpose**: Semantic search through past interactions

**Collections**:

1. **Conversations Collection**
   - Store embeddings of all conversation texts
   - Metadata: patient_id, date, type, sentiment
   - Use: Find similar past conversations, identify recurring topics

2. **Insights Collection**
   - Store learned patterns and insights
   - Metadata: patient_id, insight_type, confidence
   - Use: Retrieve relevant insights when generating messages

**Operations**:
- Add conversation after each interaction
- Search for similar situations when responding
- Cluster conversations to identify themes

---

### Twilio Integration

**Voice Calls**:
- Make outbound call with TwiML
- Voice: Use Polly (AWS) voices for natural speech
- Gather speech input with timeout
- Handle status callbacks

**SMS**:
- Send alert notifications to caregivers
- Receive optional SMS responses from patients

**Configuration needed**:
- Twilio phone number
- Account SID and Auth Token
- Webhook URLs configured in Twilio dashboard

---

### Firebase Integration

**Push Notifications**:
- Send to patient's mobile device
- Custom data payload (reminder ID, type, etc.)
- Trigger TTS on device when received

**Setup**:
- Firebase project
- FCM server key
- iOS APNs certificate (for iOS builds)

---

### Vapi Integration (Optional Enhancement)

**Purpose**: More natural voice AI conversations

**Use case**:
- Replace Twilio's basic TTS with Vapi's conversational AI
- More natural back-and-forth dialogue
- Better understanding of accents and speech patterns

**Implementation**:
- Alternative to Twilio voice calls
- Can run in parallel (A/B test)

---

## Implementation Timeline (20 Hours)

### Hour 0-2: Project Setup & Infrastructure
**Tasks**:
- Initialize Git repository
- Set up FastAPI project structure
- Set up React Native Expo project
- Set up Next.js dashboard project
- Create Railway account and provision PostgreSQL
- Get API keys: Claude, Letta, Twilio, Firebase
- Create .env files with configuration
- Set up database connection
- Create initial database schema (run migrations)

**Deliverable**: All three projects initialized, database connected, API keys ready

---

### Hour 2-6: Backend Core (Database + Basic APIs)
**Tasks**:
- Define SQLAlchemy models for all tables
- Create database migration scripts
- Implement authentication (JWT)
- Build CRUD endpoints for patients
- Build CRUD endpoints for caregivers
- Build CRUD endpoints for schedules
- Build CRUD endpoints for reminders
- Test all endpoints with Postman/Thunder Client

**Deliverable**: Working REST API with all core endpoints

---

### Hour 6-10: AI Integration & Reminder System
**Tasks**:
- Integrate Claude API
- Create prompt templates for different scenarios
- Build reminder scheduling service (APScheduler)
- Implement reminder generation logic
- Integrate Twilio for voice calls
- Integrate Firebase for push notifications
- Build voice response handler (Twilio webhook)
- Test complete reminder flow (schedule → send → respond → record)

**Deliverable**: Working reminder system that can call patients and understand responses

---

### Hour 10-13: Learning & Intelligence (Letta + Chroma)
**Tasks**:
- Integrate Letta Cloud
- Create patient agent initialization
- Build memory update service
- Implement insight extraction
- Integrate Chroma vector database
- Store conversation embeddings
- Build semantic search functionality
- Create daily summary generation service

**Deliverable**: AI that learns from interactions and generates insights

---

### Hour 13-16: Mobile App
**Tasks**:
- Build Home screen with next reminder
- Implement voice input (react-native-voice)
- Implement text-to-speech (expo-speech)
- Build Chat screen
- Build Emergency button
- Integrate with backend API
- Implement push notification handling
- Test on physical device (at least one team member's phone)

**Deliverable**: Working mobile app that can receive reminders and respond

---

### Hour 16-18: Caregiver Dashboard
**Tasks**:
- Build authentication pages (login/signup)
- Build dashboard home (patient overview)
- Build schedule management page
- Build conversation history page
- Build alerts page
- Add real-time updates (polling or WebSocket)
- Implement data visualizations (charts)
- Responsive design for desktop and tablet

**Deliverable**: Functional web dashboard for caregivers

---

### Hour 18-20: Polish, Testing & Demo Prep
**Tasks**:
- End-to-end testing of complete user flows
- Bug fixes
- UI/UX improvements (large fonts, colors, etc.)
- Add loading states and error handling
- Create demo data (test patient, schedules, sample conversations)
- Record demo video as backup
- Prepare pitch deck with:
  - Problem statement
  - Solution overview
  - Technical architecture
  - Demo
  - Impact metrics
  - Prize justification
- Practice presentation (5-minute version)
- Deploy to production (Railway + Vercel)

**Deliverable**: Polished MVP ready to demo

---

## Testing Strategy

### Unit Tests (Nice to Have - Not Critical for Hackathon)
- Test reminder generation logic
- Test Claude prompt/response parsing
- Test date/time calculations

### Integration Tests (More Important)
- Test full reminder flow: schedule → send → respond → acknowledge
- Test emergency alert flow
- Test daily summary generation
- Test API authentication

### Manual Testing Checklist
- [ ] Create patient profile via dashboard
- [ ] Add medication schedule
- [ ] Receive reminder on mobile app
- [ ] Respond with voice
- [ ] See response logged in dashboard
- [ ] Trigger emergency button
- [ ] Receive caregiver alert
- [ ] Generate daily summary
- [ ] View conversation history
- [ ] AI learns from 3+ interactions (check Letta)

---

## Deployment Checklist

### Backend (Railway)
- [ ] Create Railway project
- [ ] Provision PostgreSQL database
- [ ] Deploy FastAPI application
- [ ] Set environment variables
- [ ] Run database migrations
- [ ] Configure Twilio webhooks to point to Railway URL
- [ ] Test API endpoints in production

### Web Dashboard (Vercel)
- [ ] Connect GitHub repo
- [ ] Configure environment variables
- [ ] Deploy Next.js app
- [ ] Test authentication
- [ ] Verify API connections

### Mobile App (Expo)
- [ ] Build for iOS (if team has Mac + Apple Developer account)
- [ ] Build for Android (easier, no special requirements)
- [ ] Or use Expo Go for demo (no build needed)
- [ ] Test push notifications in production

---

## Demo Script

### Setup (Before Demo)
- Have test patient profile ready
- Pre-load sample schedules
- Have mobile app open on phone
- Have dashboard open on laptop
- Have backup video ready in case of technical issues

### Demo Flow (5 Minutes)

**Minute 0-1: The Problem**
- Personal story about grandmother/elderly relative
- Statistics: medication errors, loneliness, etc.
- Why existing solutions don't work

**Minute 1-2: The Solution**
- Introduce Elder Companion AI
- Voice-first, AI-powered, learns over time
- Show system architecture diagram

**Minute 2-4: Live Demo**
1. Show dashboard: patient overview, today's schedule
2. Trigger manual reminder from dashboard
3. Show mobile app receiving notification
4. Speak response: "I took the yellow pill"
5. Show Claude analyzing response in real-time
6. Show confirmation back to patient
7. Show conversation logged in dashboard
8. Show AI insight: "Patient responds better at 8:30am"
9. Show daily summary report
10. Trigger emergency button → show alert

**Minute 4-5: Impact & Tech**
- Prizes we're targeting (explain why we qualify)
- Tech stack: Claude, Letta, Chroma, Vapi
- Real-world impact: prevent hospitalizations, reduce loneliness
- Next steps: IoT integration, more sophisticated AI
- Call to action: judges can test app with our demo account

---

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://...
SECRET_KEY=...
CLAUDE_API_KEY=...
LETTA_API_KEY=...
CHROMA_HOST=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
FIREBASE_SERVER_KEY=...
VAPI_API_KEY=... (optional)
FRONTEND_URL=http://localhost:3000
MOBILE_APP_URL=exp://...
```

### Web Dashboard (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Mobile App (.env)
```
API_URL=http://localhost:8000
FIREBASE_CONFIG=...
```

---

## File Structure

### Backend
```
backend/
├── app/
│   ├── main.py                 # FastAPI app initialization
│   ├── database.py             # Database connection
│   ├── models.py               # SQLAlchemy models
│   ├── schemas.py              # Pydantic schemas
│   ├── dependencies.py         # Shared dependencies
│   ├── scheduler.py            # APScheduler setup
│   ├── api/
│   │   ├── auth.py            # Authentication endpoints
│   │   ├── patients.py        # Patient CRUD
│   │   ├── caregivers.py      # Caregiver CRUD
│   │   ├── schedules.py       # Schedule management
│   │   ├── reminders.py       # Reminder operations
│   │   ├── conversations.py   # Chat endpoints
│   │   ├── voice.py           # Twilio webhooks
│   │   ├── alerts.py          # Alert management
│   │   ├── reports.py         # Reports & summaries
│   │   └── mobile.py          # Mobile app endpoints
│   ├── services/
│   │   ├── claude_service.py  # Claude integration
│   │   ├── letta_service.py   # Letta integration
│   │   ├── chroma_service.py  # Chroma integration
│   │   ├── twilio_service.py  # Twilio integration
│   │   ├── firebase_service.py # FCM integration
│   │   ├── reminder_service.py # Reminder logic
│   │   └── alert_service.py   # Alert logic
│   └── utils/
│       ├── auth.py            # JWT helpers
│       ├── time.py            # Time zone helpers
│       └── logging.py         # Logging setup
├── alembic/                   # Database migrations
├── tests/                     # Tests
├── requirements.txt
└── .env
```

### Mobile App
```
mobile/
├── App.js                     # Root component
├── app.json                   # Expo config
├── package.json
├── screens/
│   ├── HomeScreen.js          # Main screen
│   ├── ChatScreen.js          # Voice chat
│   ├── EmergencyScreen.js     # Emergency button
│   └── SettingsScreen.js      # Settings
├── components/
│   ├── ReminderCard.js        # Reminder display
│   ├── VoiceButton.js         # Mic button
│   └── EmergencyButton.js     # Big red button
├── services/
│   ├── api.js                 # Backend API calls
│   ├── voice.js               # Voice input/output
│   └── notifications.js       # Push notification handling
└── utils/
    └── storage.js             # AsyncStorage helpers
```

### Web Dashboard
```
dashboard/
├── app/
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Home page
│   ├── login/
│   ├── dashboard/
│   │   ├── page.tsx          # Dashboard home
│   │   ├── patients/         # Patient management
│   │   ├── schedules/        # Schedule management
│   │   ├── conversations/    # Chat history
│   │   ├── alerts/           # Alert management
│   │   └── reports/          # Reports
│   └── api/                  # Next.js API routes (optional)
├── components/
│   ├── PatientCard.tsx
│   ├── ReminderList.tsx
│   ├── ConversationView.tsx
│   ├── AlertBadge.tsx
│   └── Charts/
│       ├── MoodChart.tsx
│       └── ActivityChart.tsx
├── lib/
│   ├── api.ts                # Backend API client
│   └── auth.ts               # Auth helpers
├── public/
└── package.json
```