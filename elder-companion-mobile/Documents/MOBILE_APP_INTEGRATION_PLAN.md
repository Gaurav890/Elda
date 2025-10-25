# Elder Companion AI - Mobile Application Integration Plan

**Date:** October 25, 2025
**Status:** Planning Phase - Ready for Implementation
**Backend Integration:** 96% Complete (49 APIs Ready)
**Target Platform:** React Native (iOS & Android)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Mobile App Architecture](#mobile-app-architecture)
4. [Integration with Backend & Caregiver Dashboard](#integration-with-backend--caregiver-dashboard)
5. [Technology Stack](#technology-stack)
6. [Feature Specifications](#feature-specifications)
7. [API Integration Map](#api-integration-map)
8. [Development Phases](#development-phases)
9. [Testing Strategy](#testing-strategy)
10. [Deployment Strategy](#deployment-strategy)

---

## Executive Summary

### Project Goal
Build a **voice-first mobile application** for elderly patients that integrates seamlessly with the existing **Elder Companion AI backend** and **Caregiver Dashboard**. The app will provide:
- Voice-based AI companionship
- Medication & routine reminders
- Safety monitoring (heartbeat, emergency button)
- Offline support
- Simple, senior-friendly UX

### Current Project Status

**✅ Backend (96% Complete)**
- 49 API endpoints operational
- AI integration complete (Claude + Letta + Chroma)
- 5 background jobs running
- PostgreSQL database with 12 tables
- 318+ seed data records for testing

**✅ Caregiver Dashboard (In Progress)**
- Next.js 14 + TypeScript + Tailwind CSS
- 6 major tabs (Overview, Routine, Reports, Conversations, Alerts, Notes)
- Real-time monitoring capabilities
- Patient management features

**❌ Mobile App (Not Started - This Plan)**
- React Native application
- Voice-first patient interface
- Safety monitoring features
- Offline-first architecture

### Integration Points

```
┌─────────────────────────────────────────────────────────┐
│                MOBILE APP (Patient)                     │
│  - Voice interaction                                    │
│  - Reminders via push notifications                     │
│  - Emergency button                                     │
│  - Background heartbeat every 15 min                    │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ HTTPS REST API + Firebase Push
                 │
┌────────────────▼────────────────────────────────────────┐
│                BACKEND (FastAPI)                        │
│  - 49 endpoints ready                                   │
│  - AI pipeline (Claude + Letta + Chroma)                │
│  - Activity monitoring                                  │
│  - Alert generation                                     │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ Polling (5-10s)
                 │
┌────────────────▼────────────────────────────────────────┐
│          CAREGIVER DASHBOARD (Next.js)                  │
│  - Real-time patient monitoring                         │
│  - Schedule management                                  │
│  - Alert management                                     │
│  - Conversation history                                 │
└─────────────────────────────────────────────────────────┘
```

---

## Current State Analysis

### What's Already Built & Working

#### Backend Services ✅
| Service | Status | Details |
|---------|--------|---------|
| **Authentication** | ✅ Ready | JWT tokens, caregiver login, password management |
| **Patient Management** | ✅ Ready | Full CRUD, 29 profile fields, caregiver relationships |
| **Voice Interaction** | ✅ Ready | POST `/api/v1/voice/interact` - Full AI pipeline |
| **Activity Tracking** | ✅ Ready | POST `/api/v1/patients/{id}/heartbeat` - Public endpoint |
| **Schedules & Reminders** | ✅ Ready | 9 endpoints for schedule/reminder management |
| **Alerts** | ✅ Ready | 3 endpoints, 4 severity levels, inactivity detection |
| **Conversations** | ✅ Ready | Storage, retrieval, analytics |
| **Daily Summaries** | ✅ Ready | Auto-generated at midnight |
| **AI Integration** | ✅ Ready | Claude + Letta + Chroma working together |
| **Background Jobs** | ✅ Running | 5 jobs (reminders, summaries, inactivity detection) |

#### Caregiver Dashboard ✅ (In Progress)
| Feature | Status | Details |
|---------|--------|---------|
| **Care Circle** | ✅ Done | Patient list with status indicators |
| **Patient Detail** | ✅ Done | 6 tabs: Overview, Routine, Reports, Conversations, Alerts, Notes |
| **Schedule Management** | ✅ Done | Calendar view, CRUD operations |
| **Real-time Monitoring** | ✅ Done | Activity timeline, alert feed |
| **Alert Management** | ✅ Done | Prioritization, acknowledgment |
| **Settings & Preferences** | ✅ Done | Notifications, quiet hours, alert thresholds |

### What Needs to Be Built - Mobile App

#### Core Features Required
| Feature | Priority | Backend Support | Complexity |
|---------|----------|----------------|------------|
| **Voice Interaction** | 🔴 Critical | ✅ Ready | High |
| **Push Notifications** | 🔴 Critical | ⚠️ Mocked (Firebase) | Medium |
| **Emergency Button** | 🔴 Critical | ✅ Ready | Low |
| **Background Heartbeat** | 🔴 Critical | ✅ Ready | Medium |
| **Reminder Handling** | 🔴 Critical | ✅ Ready | Medium |
| **Device Setup (QR Scan)** | 🔴 Critical | ⚠️ Needs endpoint | Low |
| **Offline Support** | 🟡 Important | ✅ Ready | High |
| **Home Screen Widget** | 🟢 Nice-to-have | ✅ Ready | Low |

---

## Mobile App Architecture

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│              PATIENT MOBILE APP (React Native)               │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │             UI LAYER (3 Main Screens)                  │ │
│  │  - HomeScreen: Next reminder, Talk button, Emergency  │ │
│  │  - VoiceChatScreen: Conversation interface            │ │
│  │  - SettingsScreen: Volume, preferences (minimal)      │ │
│  └────────────────────────────────────────────────────────┘ │
│                          ↕                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           STATE MANAGEMENT (Zustand)                   │ │
│  │  - Patient ID (stored once, cached)                    │ │
│  │  - Current reminder                                    │ │
│  │  - Conversation state                                  │ │
│  │  - Network status                                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                          ↕                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              SERVICE LAYER                             │ │
│  │                                                        │ │
│  │  ┌─────────────────┐  ┌─────────────────┐           │ │
│  │  │ Voice Service   │  │  API Service    │           │ │
│  │  │ - STT/TTS      │  │  - Axios        │           │ │
│  │  │ - Audio mgmt   │  │  - Patient ID   │           │ │
│  │  └─────────────────┘  └─────────────────┘           │ │
│  │                                                        │ │
│  │  ┌─────────────────┐  ┌─────────────────┐           │ │
│  │  │ Notification    │  │  Storage        │           │ │
│  │  │ Service         │  │  Service        │           │ │
│  │  │ - Firebase FCM  │  │  - AsyncStorage │           │ │
│  │  └─────────────────┘  └─────────────────┘           │ │
│  └────────────────────────────────────────────────────────┘ │
│                          ↕                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           BACKGROUND TASKS                             │ │
│  │  - Heartbeat every 15 minutes                          │ │
│  │  - Pending message queue processor                     │ │
│  │  - Network state monitor                               │ │
│  └────────────────────────────────────────────────────────┘ │
│                          ↕                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           LOCAL STORAGE (AsyncStorage)                 │ │
│  │  - patient_id (from QR setup)                          │ │
│  │  - device_token (Firebase FCM)                         │ │
│  │  - pending_messages (offline queue)                    │ │
│  │  - last_sync_timestamp                                 │ │
│  │  - settings (volume, preferences)                      │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
                              ↕
                    HTTPS REST API + Firebase
                              ↕
                        BACKEND SERVER
```

### Key Architectural Decisions

#### 1. No Patient Login Required ✅
**Decision:** Patients use the app without username/password
**Why:** Simplifies UX for elderly users with memory issues
**Security:** Device-based security via QR code setup
**Implementation:**
- Caregiver generates QR code in dashboard
- Patient scans QR code once during setup
- `patient_id` stored securely in AsyncStorage
- All API calls include patient_id

#### 2. Voice-First Interface ✅
**Decision:** Primary interaction is voice, not touch
**Why:** Easier for elderly users with vision/dexterity issues
**Implementation:**
- Large, always-visible "Talk to Me" button
- Automatic TTS for all AI responses
- Visual feedback during listening
- Text fallback for accessibility

#### 3. Offline-First Architecture ✅
**Decision:** App works without internet, syncs when available
**Why:** Ensures reliability in poor network conditions
**Implementation:**
- Queue messages locally when offline
- Auto-sync when network restored
- Cached data for next reminder display
- Emergency button works offline (direct dial)

#### 4. Background Heartbeat ✅
**Decision:** Send activity ping every 15 minutes
**Why:** Enable inactivity detection for patient safety
**Implementation:**
- `react-native-background-fetch`
- Runs even when app closed
- Includes battery level, movement detection
- Minimal battery impact

---

## Integration with Backend & Caregiver Dashboard

### Integration Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                 COMPLETE SYSTEM FLOW                        │
└─────────────────────────────────────────────────────────────┘

[1] SETUP FLOW
──────────────
Caregiver Dashboard                Backend              Mobile App
      │                               │                     │
      │ Create patient profile        │                     │
      │─────────────────────────────> │                     │
      │                               │                     │
      │ Generate QR code              │                     │
      │ <─────────────────────────────│                     │
      │                               │                     │
      │ Show QR to patient            │                     │
      │                               │                     │
      │                               │  Scan QR code       │
      │                               │ <───────────────────│
      │                               │                     │
      │                               │  Verify setup token │
      │                               │ ───────────────────>│
      │                               │                     │
      │                               │  Store patient_id   │
      │                               │                     │


[2] DAILY OPERATION FLOW
────────────────────────
Scheduled Reminder:
Backend Job → Firebase Push → Mobile App → Patient hears TTS
                                  ↓
                          Patient responds via voice
                                  ↓
                          POST /voice/interact
                                  ↓
                          AI processes (Claude+Letta)
                                  ↓
                          Response to mobile
                                  ↓
                          Dashboard updated (polling)


[3] EMERGENCY FLOW
──────────────────
Mobile App (Emergency Button) → POST /mobile/heartbeat
                                        ↓
                                 Create CRITICAL alert
                                        ↓
                                 Notify caregivers (SMS)
                                        ↓
                                 Dashboard shows alert
                                        ↓
                                 Caregiver acknowledges


[4] MONITORING FLOW
───────────────────
Mobile App (Background) → Heartbeat every 15 min → Backend stores
                                                         ↓
                                        Backend job checks inactivity
                                                         ↓
                                        If > 4hrs, create alert
                                                         ↓
                                        Dashboard shows alert


[5] DATA SYNC FLOW
──────────────────
Caregiver updates schedule → Backend API → Background job generates reminder
                                                         ↓
                                        Firebase push → Mobile app
                                                         ↓
                                        Patient reminded
```

### Critical Integration Points

#### 1. QR Code Setup Flow
**Caregiver Dashboard (New Feature Needed):**
```typescript
// On patient creation success, show QR code
const generatePatientQRCode = async (patientId: string) => {
  const response = await api.post('/api/v1/patients/{id}/generate-code');
  const { setup_token, qr_code_data } = response.data;

  // Display QR code to caregiver
  showQRCodeModal({
    qr_code_data, // Contains: {patient_id, setup_token}
    expiry: "15 minutes"
  });
};
```

**Backend (New Endpoint Needed):**
```python
@router.post("/patients/{id}/generate-code")
async def generate_patient_setup_code(id: UUID, db: Session):
    """Generate one-time setup code for mobile app"""
    patient = await db.get(Patient, id)

    # Generate unique setup token (expires in 15 min)
    setup_token = generate_secure_token()

    patient.setup_token = setup_token
    patient.setup_token_expires = datetime.utcnow() + timedelta(minutes=15)

    await db.commit()

    qr_code_data = {
        "patient_id": str(patient.id),
        "setup_token": setup_token
    }

    return {"qr_code_data": json.dumps(qr_code_data)}
```

**Mobile App:**
```javascript
// Scan QR code and setup device
const setupDevice = async (qrCodeData) => {
  const { patient_id, setup_token } = JSON.parse(qrCodeData);

  // Verify with backend
  const response = await axios.post('/api/v1/mobile/setup', {
    patient_id,
    setup_token
  });

  if (response.data.success) {
    // Store patient ID locally (permanent)
    await AsyncStorage.setItem('patient_id', patient_id);

    // Register for push notifications
    const fcmToken = await messaging().getToken();
    await registerDeviceToken(patient_id, fcmToken);

    // Navigate to home screen
    navigation.replace('Home');
  }
};
```

#### 2. Push Notification Integration
**Backend (Update Needed - Currently Mocked):**
```python
# backend/app/services/communication/firebase_service.py
import firebase_admin
from firebase_admin import credentials, messaging

class FirebaseService:
    def __init__(self):
        cred = credentials.Certificate(FIREBASE_CREDENTIALS_PATH)
        firebase_admin.initialize_app(cred)

    async def send_reminder(
        self,
        device_token: str,
        reminder_id: str,
        speak_text: str
    ):
        message = messaging.Message(
            token=device_token,
            notification=messaging.Notification(
                title="Reminder",
                body=speak_text[:100]
            ),
            data={
                "type": "reminder",
                "reminder_id": reminder_id,
                "speak_text": speak_text
            },
            android=messaging.AndroidConfig(
                priority="high",
                notification=messaging.AndroidNotification(
                    sound="default",
                    channel_id="reminders"
                )
            ),
            apns=messaging.APNSConfig(
                payload=messaging.APNSPayload(
                    aps=messaging.Aps(
                        sound="default",
                        content_available=True
                    )
                )
            )
        )

        return messaging.send(message)
```

**Mobile App:**
```javascript
// Handle incoming push notifications
messaging().onMessage(async remoteMessage => {
  if (remoteMessage.data.type === 'reminder') {
    // Play TTS immediately
    await Speech.speak(remoteMessage.data.speak_text, {
      language: 'en-US',
      rate: 0.9 // Slightly slower for elderly
    });

    // Start listening for response
    await startVoiceRecognition(remoteMessage.data.reminder_id);
  }
});
```

#### 3. Voice Interaction Integration
**Mobile App → Backend:**
```javascript
// Voice interaction flow
const handleVoiceInteraction = async (spokenText) => {
  const patientId = await AsyncStorage.getItem('patient_id');

  try {
    const response = await axios.post('/api/v1/voice/interact', {
      patient_id: patientId,
      message: spokenText,
      conversation_type: 'spontaneous',
      context: {
        app_state: 'active',
        battery_level: await getBatteryLevel()
      }
    }, {
      timeout: 10000 // 10 second timeout
    });

    // Play AI response
    await Speech.speak(response.data.ai_response, {
      language: 'en-US',
      rate: 0.9
    });

    // Continue listening if AI wants follow-up
    if (response.data.continue_conversation) {
      setTimeout(() => startListening(), 1000);
    }

  } catch (error) {
    if (!navigator.onLine) {
      // Queue for later
      await queueMessageForRetry(patientId, spokenText);

      // Play offline response
      await Speech.speak("I'll remember that and tell you more when I'm back online");
    }
  }
};
```

**Backend (Already Implemented):**
- Endpoint: `POST /api/v1/voice/interact`
- Processing: Claude + Letta + Chroma
- Response time: < 5 seconds target
- Auto-creates alerts if urgency detected

#### 4. Heartbeat Integration
**Mobile App:**
```javascript
// Background heartbeat (every 15 minutes)
BackgroundFetch.configure({
  minimumFetchInterval: 15,
  stopOnTerminate: false,
  startOnBoot: true
}, async (taskId) => {

  const patientId = await AsyncStorage.getItem('patient_id');

  await axios.post(`/api/v1/patients/${patientId}/heartbeat`, {
    activity_type: 'heartbeat',
    device_type: Platform.OS,
    app_version: '1.0.0',
    battery_level: await getBatteryLevel(),
    latitude: location?.coords.latitude,
    longitude: location?.coords.longitude
  });

  BackgroundFetch.finish(taskId);
});
```

**Backend → Dashboard:**
- Heartbeat stored in `activity_logs` table
- `last_heartbeat_at` updated on patient record
- Background job checks inactivity every 15 min
- If > 4 hours inactive during daytime → Create alert
- Dashboard polls for alerts every 10 seconds

---

## Technology Stack

### Mobile App Stack

#### Core Framework
**React Native 0.72+**
- Cross-platform (iOS & Android)
- Large community & ecosystem
- Native performance
- Expo workflow for easier development

#### Navigation
**React Navigation 6**
- Simple stack navigator (3 screens max)
- Deep linking for notifications
- State persistence

#### State Management
**Zustand**
- Lightweight & simple
- No boilerplate
- Perfect for small apps
- TypeScript support

#### Voice & Speech
**@react-native-voice/voice** (Speech-to-Text)
- Native iOS/Android speech recognition
- Offline support (device-based)
- Real-time transcription

**expo-speech** (Text-to-Speech)
- Simple API
- Voice customization
- Works offline

#### Push Notifications
**@react-native-firebase/messaging**
- Firebase Cloud Messaging (FCM)
- Background notifications
- Data-only messages
- iOS & Android support

#### Background Tasks
**react-native-background-fetch**
- Periodic background execution
- Reliable on both platforms
- Battery efficient
- Headless mode support

#### Storage
**@react-native-async-storage/async-storage**
- Key-value storage
- Encrypted option
- Persistent
- Simple API

#### HTTP Client
**axios**
- Promise-based
- Interceptors for error handling
- Retry logic
- Timeout support

#### QR Code Scanning
**react-native-camera** + **react-native-qrcode-scanner**
- Camera access
- QR code detection
- One-time setup

#### Additional Libraries
| Library | Purpose |
|---------|---------|
| `react-native-device-info` | Get battery level, app version |
| `@react-native-community/netinfo` | Network state detection |
| `react-native-permissions` | Handle iOS/Android permissions |
| `date-fns` | Date formatting |

### Development Tools
| Tool | Purpose |
|------|---------|
| TypeScript | Type safety |
| ESLint + Prettier | Code quality |
| React Native Debugger | Debugging |
| Flipper | Network inspection |
| Reactotron | State inspection |

---

## Feature Specifications

### Screen 1: Home Screen (Primary Screen)

**Purpose:** Always-visible screen showing next reminder and quick actions

**Layout:**
```
┌────────────────────────────────────────┐
│                                        │
│              [Logo/Icon]               │
│                                        │
│          Hi Margaret! 😊               │
│                                        │
│  ┌────────────────────────────────┐   │
│  │   NEXT REMINDER                │   │
│  │                                │   │
│  │   💊 Morning Medication        │   │
│  │   In 45 minutes (8:00 AM)      │   │
│  └────────────────────────────────┘   │
│                                        │
│  ┌────────────────────────────────┐   │
│  │                                │   │
│  │      🎤 TALK TO ME             │   │
│  │                                │   │
│  └────────────────────────────────┘   │
│       (Giant, blue, pulsing)           │
│                                        │
│  ┌────────────────────────────────┐   │
│  │     🚨 I NEED HELP             │   │
│  └────────────────────────────────┘   │
│        (Red emergency button)          │
│                                        │
│         [⚙️ Settings]                  │
│                                        │
└────────────────────────────────────────┘
```

**Features:**
- **Next Reminder Display**
  - Shows upcoming reminder with countdown
  - Updates in real-time
  - Tap to see details

- **Talk to Me Button**
  - Always visible and prominent
  - Pulsing animation to draw attention
  - Haptic feedback on press
  - Starts listening immediately

- **Emergency Button**
  - Red color, clear icon
  - Requires confirmation (press & hold 2 seconds)
  - Works offline (direct dial to caregiver)
  - Creates critical alert

- **Settings Button**
  - Small, bottom corner
  - Only volume and basic preferences

**Implementation Notes:**
```javascript
const HomeScreen = () => {
  const patientId = usePatientId();
  const { nextReminder } = useNextReminder(patientId);
  const [isListening, setIsListening] = useState(false);

  const handleTalkPress = async () => {
    setIsListening(true);
    await startVoiceRecognition();
  };

  const handleEmergencyPress = async () => {
    // Show confirmation
    const confirmed = await showConfirmationDialog();

    if (confirmed) {
      // Send emergency alert
      await sendEmergencyAlert(patientId);

      // Call caregiver directly
      const caregiverPhone = await getCaregiverPhone();
      Linking.openURL(`tel:${caregiverPhone}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Hi {patientName}! 😊</Text>

      <NextReminderCard reminder={nextReminder} />

      <TalkButton onPress={handleTalkPress} isListening={isListening} />

      <EmergencyButton onPress={handleEmergencyPress} />
    </View>
  );
};
```

### Screen 2: Voice Chat Screen

**Purpose:** Active conversation interface during voice interaction

**Layout:**
```
┌────────────────────────────────────────┐
│                                        │
│          💬 Conversation               │
│                                        │
│  ┌────────────────────────────────┐   │
│  │                                │   │
│  │  🎤 Listening...               │   │
│  │                                │   │
│  │  (Animated waveform)           │   │
│  │                                │   │
│  └────────────────────────────────┘   │
│                                        │
│  Conversation History:                 │
│  ────────────────────────────────      │
│                                        │
│  AI: "Hi Maggie, how are you?"         │
│                                        │
│  You: "I'm feeling dizzy"              │
│                                        │
│  AI: "I'm concerned about your         │
│       dizziness. Have you taken        │
│       your blood pressure meds?"       │
│                                        │
│  You: "Not yet"                        │
│                                        │
│  AI: "Let me remind you to take        │
│       them now. They're on the         │
│       kitchen table."                  │
│                                        │
│                                        │
│         [⏹️ End Conversation]          │
│                                        │
└────────────────────────────────────────┘
```

**Features:**
- **Listening Indicator**
  - Animated waveform while listening
  - Visual feedback that mic is active
  - Shows transcribed text in real-time

- **Conversation History**
  - Scrollable list of messages
  - AI messages on left, patient on right
  - Timestamps
  - Auto-scroll to latest

- **End Button**
  - Stops conversation
  - Returns to home screen

**Implementation Notes:**
```javascript
const VoiceChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');

  useEffect(() => {
    // Start listening when screen opens
    startListening();
  }, []);

  const startListening = async () => {
    setIsListening(true);

    Voice.onSpeechResults = async (e) => {
      const spokenText = e.value[0];
      setTranscribedText(spokenText);

      // Add to messages
      setMessages(prev => [...prev, {
        text: spokenText,
        sender: 'patient',
        timestamp: new Date()
      }]);

      // Send to backend
      const response = await sendVoiceMessage(spokenText);

      // Add AI response to messages
      setMessages(prev => [...prev, {
        text: response.ai_response,
        sender: 'ai',
        timestamp: new Date()
      }]);

      // Play AI response
      await Speech.speak(response.ai_response);

      // Continue listening if needed
      if (response.continue_conversation) {
        setTimeout(() => startListening(), 1000);
      }
    };

    await Voice.start('en-US');
  };

  return (
    <View style={styles.container}>
      <ListeningIndicator
        isListening={isListening}
        transcribedText={transcribedText}
      />

      <MessageList messages={messages} />

      <Button onPress={endConversation}>
        End Conversation
      </Button>
    </View>
  );
};
```

### Screen 3: Settings Screen

**Purpose:** Minimal settings for patient

**Layout:**
```
┌────────────────────────────────────────┐
│                                        │
│              Settings ⚙️                │
│                                        │
│  Volume                                │
│  ├─────────────────●──────┤ 80%       │
│                                        │
│  Voice Speed                           │
│  ├────────────●───────────┤ Normal    │
│                                        │
│  Test Voice                            │
│  [▶️ Play Sample]                      │
│                                        │
│  About                                 │
│  App Version: 1.0.0                    │
│  Patient ID: ****1234                  │
│                                        │
│  [🔗 Re-scan QR Code]                  │
│  (for device reset)                    │
│                                        │
│                                        │
│         [← Back to Home]               │
│                                        │
└────────────────────────────────────────┘
```

**Features:**
- Volume control (for TTS)
- Voice speed adjustment
- Test voice playback
- Basic info display
- Re-scan QR option (reset device)

---

## API Integration Map

### Complete API Integration Overview

| Mobile App Feature | Backend Endpoint | Method | Auth Required | When Called |
|-------------------|-----------------|--------|---------------|-------------|
| **Setup & Device Registration** |
| QR Code Scan | `/api/v1/mobile/setup` | POST | No | Once during setup |
| Register FCM Token | `/api/v1/mobile/device-token` | POST | No | After setup, on token refresh |
| **Voice & Conversation** |
| Voice Interaction | `/api/v1/voice/interact` | POST | No | Every voice message |
| Initialize AI Agent | `/api/v1/voice/initialize-agent` | POST | No | First time only |
| **Activity Tracking** |
| Background Heartbeat | `/api/v1/patients/{id}/heartbeat` | POST | No | Every 15 minutes |
| App Open | `/api/v1/patients/{id}/heartbeat` | POST | No | On app launch |
| App Close | `/api/v1/patients/{id}/heartbeat` | POST | No | On app close |
| Emergency Button | `/api/v1/patients/{id}/heartbeat` | POST | No | Emergency button press |
| **Data Sync (Optional)** |
| Get Next Reminder | `/api/v1/schedules/patients/{id}/reminders` | GET | ⚠️ Needs patient access | On app launch |
| Get Patient Profile | `/api/v1/patients/{id}` | GET | ⚠️ Needs patient access | Rarely |

### API Implementation Details

#### 1. Setup & Device Registration

**Endpoint:** `POST /api/v1/mobile/setup` *(Needs to be created)*

**Request:**
```json
{
  "patient_id": "4c7389e0-9485-487a-9dde-59c14ab97d67",
  "setup_token": "abc123def456" // One-time token from QR code
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "patient_id": "4c7389e0-9485-487a-9dde-59c14ab97d67",
    "patient_name": "Margaret Chen",
    "preferred_name": "Maggie"
  }
}
```

**Backend Logic:**
```python
@router.post("/mobile/setup")
async def setup_mobile_device(
    setup_data: MobileSetup,
    db: Session = Depends(get_db)
):
    """Verify setup token and activate device"""

    patient = await db.get(Patient, setup_data.patient_id)

    # Verify token and not expired
    if (not patient or
        patient.setup_token != setup_data.setup_token or
        patient.setup_token_expires < datetime.utcnow()):
        raise HTTPException(401, "Invalid or expired setup code")

    # Mark as setup complete
    patient.device_setup_completed = True
    patient.setup_token = None  # Invalidate token

    await db.commit()

    return {
        "success": True,
        "data": {
            "patient_id": str(patient.id),
            "patient_name": f"{patient.first_name} {patient.last_name}",
            "preferred_name": patient.preferred_name
        }
    }
```

**Endpoint:** `POST /api/v1/mobile/device-token` *(Needs to be created)*

**Request:**
```json
{
  "patient_id": "4c7389e0-9485-487a-9dde-59c14ab97d67",
  "device_token": "fcm_token_here...",
  "platform": "ios" // or "android"
}
```

**Response:**
```json
{
  "success": true
}
```

#### 2. Voice Interaction

**Endpoint:** `POST /api/v1/voice/interact` *(Already exists)*

**Request:**
```json
{
  "patient_id": "4c7389e0-9485-487a-9dde-59c14ab97d67",
  "message": "I took my medication",
  "conversation_type": "reminder_response", // or "spontaneous", "check_in", "emergency"
  "context": {
    "app_state": "active",
    "battery_level": 85
  }
}
```

**Response:**
```json
{
  "ai_response": "That's wonderful! I'm glad you took your medication, Maggie.",
  "conversation_id": "uuid",
  "sentiment": "positive",
  "urgency_level": "none",
  "alert_created": false,
  "continue_conversation": false
}
```

**Processing Time:** < 5 seconds target

#### 3. Activity Tracking

**Endpoint:** `POST /api/v1/patients/{id}/heartbeat` *(Already exists)*

**Request:**
```json
{
  "activity_type": "heartbeat", // or "app_open", "app_close", "emergency"
  "device_type": "iOS",
  "app_version": "1.0.0",
  "latitude": 37.7749,
  "longitude": -122.4194,
  "battery_level": 85
}
```

**Response:**
```json
{
  "success": true,
  "pending_actions": [] // Future: Could return actions for mobile to take
}
```

**Backend Processing:**
- Stores in `activity_logs` table
- Updates `patient.last_heartbeat_at`
- If `activity_type == "emergency"`, creates CRITICAL alert

### Data Flow Examples

#### Example 1: Scheduled Reminder with Response

```
[08:00 AM] Backend Scheduler
  ↓
  Creates reminder record (status: pending)
  ↓
  Sends Firebase push notification
  ↓
  [Mobile App] Receives notification
  ↓
  Wakes app (even if closed)
  ↓
  Plays TTS: "Hi Maggie, time for your morning medication"
  ↓
  Starts listening (30 second timeout)
  ↓
  [Patient speaks]: "I took it"
  ↓
  POST /api/v1/voice/interact
  {
    "patient_id": "...",
    "message": "I took it",
    "conversation_type": "reminder_response"
  }
  ↓
  [Backend AI Pipeline]
  1. Query Letta for patient context
  2. Send to Claude with full context
  3. Claude analyzes: "Patient confirms medication taken"
  4. Update reminder status to 'completed'
  5. Store conversation
  6. No alert needed
  ↓
  Response: {
    "ai_response": "Great job, Maggie! Have a wonderful day!",
    "continue_conversation": false
  }
  ↓
  [Mobile App] Plays AI response via TTS
  ↓
  [Dashboard] Polling detects updated reminder
  ↓
  [Dashboard] Shows: ✅ Morning Medication - Completed at 8:02 AM
```

#### Example 2: Patient Initiates Emergency

```
[Patient presses Emergency Button]
  ↓
  [Mobile App] Shows confirmation: "Press and hold for 2 seconds"
  ↓
  [Patient confirms]
  ↓
  POST /api/v1/patients/{id}/heartbeat
  {
    "activity_type": "emergency",
    "latitude": 37.7749,
    "longitude": -122.4194,
    "battery_level": 75
  }
  ↓
  [Backend] Receives emergency heartbeat
  ↓
  Creates CRITICAL alert:
  {
    "severity": "critical",
    "type": "emergency",
    "title": "Emergency Button Pressed",
    "description": "Margaret pressed emergency button at 3:45 PM",
    "location": {lat, lng}
  }
  ↓
  Triggers notifications:
  - SMS to primary caregiver
  - Dashboard alert (via polling)
  ↓
  [Mobile App] Directly dials caregiver's phone
  Linking.openURL(`tel:${caregiverPhone}`)
  ↓
  [Dashboard] Shows critical alert banner
  ↓
  [Caregiver] Clicks "Acknowledge" button
  ↓
  PATCH /api/v1/conversations/alerts/{id}/acknowledge
  ↓
  Alert marked as acknowledged
```

#### Example 3: Inactivity Detection

```
[Background - Every 15 minutes]
Mobile App sends heartbeat
  ↓
  POST /api/v1/patients/{id}/heartbeat
  {
    "activity_type": "heartbeat",
    "battery_level": 60
  }
  ↓
  Backend stores in activity_logs
  ↓
  Updates patient.last_heartbeat_at
  ↓
[Patient's phone dies - No more heartbeats]
  ↓
[2 hours later] Background job runs (every 15 min)
  ↓
  Checks: last_heartbeat_at = 2 hours ago
  ↓
  Is daytime? Yes (2 PM)
  ↓
  Creates MEDIUM alert:
  {
    "severity": "medium",
    "type": "inactivity",
    "title": "Patient Inactivity: Margaret Chen",
    "description": "No activity for 2.0 hours",
    "recommended_action": "Check on patient"
  }
  ↓
  Sends SMS to caregiver
  ↓
  Dashboard polls, sees new alert
  ↓
  Dashboard shows alert card
  ↓
[4 hours later] Still no activity
  ↓
  Escalates to HIGH alert
  ↓
[6+ hours] Escalates to CRITICAL
  ↓
  Includes emergency contact info
```

---

## Development Phases

### Phase 1: Setup & Foundation (Week 1)
**Goal:** Basic app structure, QR setup, and API connection

**Tasks:**
| Task | Duration | Dependencies |
|------|----------|--------------|
| 1.1 Initialize React Native project | 2 hours | None |
| 1.2 Setup navigation (3 screens) | 2 hours | 1.1 |
| 1.3 Implement state management (Zustand) | 2 hours | 1.1 |
| 1.4 Setup API service with axios | 3 hours | 1.1 |
| 1.5 Implement AsyncStorage wrapper | 1 hour | 1.1 |
| 1.6 **Backend:** Create QR code generation endpoint | 2 hours | Backend access |
| 1.7 **Backend:** Create mobile setup endpoint | 2 hours | Backend access |
| 1.8 Implement QR scanner in mobile app | 3 hours | 1.2, 1.4 |
| 1.9 Implement device setup flow | 3 hours | 1.6, 1.7, 1.8 |
| 1.10 Test complete setup flow | 2 hours | 1.9 |

**Deliverables:**
- ✅ React Native app runs on iOS & Android
- ✅ QR code scan works
- ✅ Device setup flow complete
- ✅ Patient ID stored locally
- ✅ Basic navigation works

**Testing Checklist:**
- [ ] Generate QR in caregiver dashboard
- [ ] Scan QR with mobile app
- [ ] Verify patient_id stored
- [ ] App navigates to home screen

---

### Phase 2: Voice Interaction (Week 2)
**Goal:** Core voice features - STT, TTS, and API integration

**Tasks:**
| Task | Duration | Dependencies |
|------|----------|--------------|
| 2.1 Setup voice recognition (@react-native-voice/voice) | 2 hours | Phase 1 |
| 2.2 Setup TTS (expo-speech) | 1 hour | Phase 1 |
| 2.3 Implement Home Screen UI | 4 hours | Phase 1 |
| 2.4 Implement Voice Chat Screen UI | 4 hours | Phase 1 |
| 2.5 Integrate voice with backend API | 4 hours | 2.1, 2.2, 2.4 |
| 2.6 Implement conversation state management | 3 hours | 2.5 |
| 2.7 Add visual feedback (listening indicator) | 2 hours | 2.4 |
| 2.8 Implement offline queue | 3 hours | 2.5 |
| 2.9 Test voice flow end-to-end | 4 hours | 2.6 |

**Deliverables:**
- ✅ "Talk to Me" button works
- ✅ Voice recognition converts speech to text
- ✅ Text sent to backend API
- ✅ AI response received
- ✅ TTS plays response
- ✅ Offline queueing works

**Testing Checklist:**
- [ ] Press "Talk to Me"
- [ ] Speak message
- [ ] Verify transcription accurate
- [ ] Verify AI responds < 5 seconds
- [ ] Verify TTS plays correctly
- [ ] Test offline mode

---

### Phase 3: Push Notifications & Reminders (Week 3)
**Goal:** Scheduled reminders via Firebase

**Tasks:**
| Task | Duration | Dependencies |
|------|----------|--------------|
| 3.1 Setup Firebase project (iOS & Android) | 2 hours | Phase 1 |
| 3.2 Integrate @react-native-firebase/messaging | 3 hours | 3.1 |
| 3.3 Request notification permissions | 2 hours | 3.2 |
| 3.4 Implement FCM token registration | 2 hours | 3.2 |
| 3.5 **Backend:** Implement Firebase Admin SDK | 3 hours | Backend access |
| 3.6 **Backend:** Update reminder job to send push | 3 hours | 3.5 |
| 3.7 Handle foreground notifications | 3 hours | 3.2 |
| 3.8 Handle background notifications | 4 hours | 3.2 |
| 3.9 Trigger TTS on notification | 2 hours | 3.7, 3.8 |
| 3.10 Test complete reminder flow | 3 hours | 3.9 |

**Deliverables:**
- ✅ Push notifications work (foreground & background)
- ✅ Notifications trigger TTS
- ✅ Voice recognition starts after TTS
- ✅ Reminder responses work

**Testing Checklist:**
- [ ] Create schedule in dashboard for "now + 2 min"
- [ ] Wait for notification
- [ ] Verify notification received
- [ ] Verify TTS plays
- [ ] Respond to reminder
- [ ] Verify dashboard updates

---

### Phase 4: Background Services (Week 4)
**Goal:** Heartbeat monitoring and emergency features

**Tasks:**
| Task | Duration | Dependencies |
|------|----------|--------------|
| 4.1 Setup react-native-background-fetch | 2 hours | Phase 1 |
| 4.2 Implement heartbeat service | 3 hours | 4.1 |
| 4.3 Test background execution | 2 hours | 4.2 |
| 4.4 Implement Emergency Button UI | 2 hours | Phase 2 |
| 4.5 Implement emergency confirmation | 2 hours | 4.4 |
| 4.6 Integrate emergency with backend | 2 hours | 4.5 |
| 4.7 Implement direct dial functionality | 2 hours | 4.6 |
| 4.8 Add battery level tracking | 1 hour | 4.2 |
| 4.9 Add location tracking (optional) | 3 hours | 4.2 |
| 4.10 Test complete safety flow | 3 hours | 4.7 |

**Deliverables:**
- ✅ Heartbeat sends every 15 minutes
- ✅ Works when app closed
- ✅ Emergency button creates alert
- ✅ Direct dial to caregiver works

**Testing Checklist:**
- [ ] Background app, wait 15 min
- [ ] Verify heartbeat sent
- [ ] Press emergency button
- [ ] Verify alert created
- [ ] Verify SMS sent to caregiver
- [ ] Verify phone dialer opens

---

### Phase 5: Polish & Testing (Week 5)
**Goal:** UX improvements, accessibility, and comprehensive testing

**Tasks:**
| Task | Duration | Dependencies |
|------|----------|--------------|
| 5.1 Implement app state tracking | 2 hours | Phase 4 |
| 5.2 Add network state monitoring | 2 hours | Phase 2 |
| 5.3 Implement retry logic | 3 hours | 5.2 |
| 5.4 Add loading states | 2 hours | All phases |
| 5.5 Add error handling & messages | 3 hours | All phases |
| 5.6 Accessibility improvements | 4 hours | All phases |
| 5.7 Settings screen implementation | 2 hours | Phase 1 |
| 5.8 Performance optimization | 3 hours | All phases |
| 5.9 Battery optimization | 2 hours | Phase 4 |
| 5.10 Comprehensive testing | 8 hours | All phases |

**Deliverables:**
- ✅ App handles all error cases gracefully
- ✅ Loading states for all async operations
- ✅ Accessible for elderly users
- ✅ Optimized battery usage
- ✅ All features tested end-to-end

**Testing Checklist:**
- [ ] Test with real elderly user
- [ ] Test all error scenarios
- [ ] Test offline mode extensively
- [ ] Test background services for 24+ hours
- [ ] Battery drain test
- [ ] Accessibility audit

---

## Testing Strategy

### 1. Unit Testing
**Tools:** Jest + React Native Testing Library

**Coverage:**
- Service layer (API, voice, storage)
- State management (Zustand stores)
- Utility functions

**Example:**
```javascript
describe('VoiceService', () => {
  it('should start voice recognition', async () => {
    const result = await voiceService.startListening();
    expect(Voice.start).toHaveBeenCalledWith('en-US');
  });

  it('should send transcribed text to backend', async () => {
    const mockResponse = { ai_response: 'Great!' };
    axios.post.mockResolvedValue({ data: mockResponse });

    const result = await voiceService.sendMessage('I took my pills');
    expect(result.ai_response).toBe('Great!');
  });
});
```

### 2. Integration Testing
**Tools:** Detox (E2E testing framework)

**Scenarios:**
| Scenario | Steps | Expected Outcome |
|----------|-------|------------------|
| **Setup Flow** | 1. Launch app<br>2. Scan QR code<br>3. Verify setup | Patient ID stored, home screen shown |
| **Voice Interaction** | 1. Tap "Talk to Me"<br>2. Speak message<br>3. Verify response | AI responds within 5s, TTS plays |
| **Emergency** | 1. Press emergency button<br>2. Confirm<br>3. Verify alert | Alert created, phone dialer opens |
| **Push Notification** | 1. Create reminder<br>2. Wait for notification<br>3. Respond | Notification received, TTS plays, response recorded |
| **Offline Mode** | 1. Disable network<br>2. Send message<br>3. Re-enable network | Message queued, sent when online |

**Example:**
```javascript
describe('Voice Interaction Flow', () => {
  it('should complete full voice conversation', async () => {
    await device.launchApp();

    // Tap Talk to Me button
    await element(by.id('talk-button')).tap();

    // Wait for listening state
    await waitFor(element(by.id('listening-indicator')))
      .toBeVisible()
      .withTimeout(2000);

    // Simulate voice input (in real test, use recorded audio)
    await mockVoiceInput('I took my medication');

    // Wait for AI response
    await waitFor(element(by.text('Great job!')))
      .toBeVisible()
      .withTimeout(6000);
  });
});
```

### 3. Manual Testing Checklist

**Setup & Onboarding:**
- [ ] App installs successfully (iOS & Android)
- [ ] Camera permission requested for QR scan
- [ ] QR code scanning works
- [ ] Invalid QR code shows error
- [ ] Setup completes and navigates to home

**Voice Interaction:**
- [ ] Microphone permission requested
- [ ] "Talk to Me" button starts listening
- [ ] Visual feedback during listening (waveform)
- [ ] Voice transcription accurate
- [ ] API call completes < 5 seconds
- [ ] TTS plays AI response clearly
- [ ] Voice speed appropriate for elderly
- [ ] Conversation state persists
- [ ] Multiple turns work correctly

**Push Notifications:**
- [ ] Notification permission requested
- [ ] Foreground notifications display
- [ ] Background notifications wake app
- [ ] TTS plays automatically on notification
- [ ] Voice recognition starts after TTS
- [ ] Reminder response updates backend
- [ ] Dashboard shows updated status

**Emergency Features:**
- [ ] Emergency button visible and accessible
- [ ] Press-and-hold confirmation works
- [ ] Alert created in backend
- [ ] SMS sent to caregiver
- [ ] Phone dialer opens
- [ ] Emergency works offline

**Background Services:**
- [ ] Heartbeat sends every 15 minutes
- [ ] Works when app in background
- [ ] Works when app closed
- [ ] Battery level included
- [ ] Inactivity detected after 4 hours
- [ ] Alert created and caregiver notified

**Offline Mode:**
- [ ] Offline indicator shown
- [ ] Messages queued locally
- [ ] Queue processed when back online
- [ ] No data loss
- [ ] Emergency button still works (direct dial)

**Settings:**
- [ ] Volume control works
- [ ] Voice speed adjustment works
- [ ] Test voice playback works
- [ ] Re-scan QR option works

**Performance:**
- [ ] App launches < 3 seconds
- [ ] Voice response < 5 seconds
- [ ] Smooth animations
- [ ] No crashes during 24-hour test
- [ ] Battery drain acceptable (< 10% per day)

### 4. User Acceptance Testing (UAT)

**Test with Actual Elderly Users:**
- Recruit 3-5 users aged 65+
- Observe them using the app without guidance
- Note pain points and confusion
- Gather feedback on:
  - Button sizes
  - Voice clarity
  - Response times
  - Overall ease of use

**Success Criteria:**
- User can setup device with minimal help
- User can initiate voice conversation independently
- User can respond to reminder within 2 attempts
- User can find emergency button easily
- User reports feeling confident using the app

---

## Deployment Strategy

### iOS Deployment

**Step 1: Apple Developer Account**
- Enroll in Apple Developer Program ($99/year)
- Create App ID: `com.eldercompanion.patient`
- Enable capabilities: Push Notifications, Background Modes

**Step 2: Certificates & Provisioning**
- Create Push Notification certificate
- Create Development & Distribution certificates
- Create provisioning profiles

**Step 3: App Store Connect**
- Create app record
- Add app name, description, screenshots
- Set age rating: 4+
- Category: Medical / Health & Fitness

**Step 4: TestFlight Beta**
- Upload build via Xcode or CI/CD
- Add internal testers (development team)
- Add external testers (caregivers & patients)
- Collect feedback

**Step 5: Production Release**
- Submit for App Review
- Wait for approval (1-3 days typically)
- Release to App Store

**Required Info for App Store:**
- Privacy Policy URL
- Support URL
- HIPAA compliance statement (if applicable)
- Screenshots (iPhone, iPad)
- App preview video (optional)

### Android Deployment

**Step 1: Google Play Console**
- Create developer account ($25 one-time)
- Create app: "Elder Companion"
- Package name: `com.eldercompanion.patient`

**Step 2: Build Signed APK/Bundle**
```bash
cd android
./gradlew bundleRelease
# Output: android/app/build/outputs/bundle/release/app-release.aab
```

**Step 3: Internal Testing**
- Upload AAB to Play Console
- Create internal testing track
- Add testers via email list
- Collect feedback

**Step 4: Closed Testing (Beta)**
- Create closed testing track
- Share opt-in URL with beta testers
- Monitor crash reports
- Iterate based on feedback

**Step 5: Production Release**
- Create production release
- Add store listing:
  - App title, description
  - Screenshots
  - Feature graphic
  - Icon
- Submit for review
- Gradual rollout (10% → 50% → 100%)

### CI/CD Pipeline

**Recommended: GitHub Actions + Fastlane**

```yaml
# .github/workflows/deploy-mobile.yml
name: Deploy Mobile App

on:
  push:
    branches: [main]
    paths:
      - 'mobile/**'

jobs:
  deploy-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: |
          cd mobile
          npm install
      - name: Build iOS
        run: |
          cd mobile/ios
          fastlane beta
      - name: Upload to TestFlight
        run: fastlane upload_testflight

  deploy-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: |
          cd mobile
          npm install
      - name: Build Android
        run: |
          cd mobile/android
          ./gradlew bundleRelease
      - name: Upload to Play Console
        run: fastlane upload_playstore
```

### Version Management

**Semantic Versioning:**
- `1.0.0` - Initial release
- `1.0.1` - Bug fixes
- `1.1.0` - New features
- `2.0.0` - Major changes

**Update in 3 places:**
```javascript
// package.json
"version": "1.0.0"

// ios/ElderCompanion/Info.plist
<key>CFBundleShortVersionString</key>
<string>1.0.0</string>
<key>CFBundleVersion</key>
<string>1</string>

// android/app/build.gradle
versionCode 1
versionName "1.0.0"
```

### Over-the-Air Updates (Optional)

**Expo Updates or CodePush:**
- Push JavaScript bundle updates without app store review
- Useful for bug fixes and minor updates
- Cannot update native code

**Implementation:**
```javascript
// Use Expo Updates
import * as Updates from 'expo-updates';

const checkForUpdates = async () => {
  const update = await Updates.checkForUpdateAsync();
  if (update.isAvailable) {
    await Updates.fetchUpdateAsync();
    await Updates.reloadAsync();
  }
};
```

---

## Risk Mitigation

### Technical Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| **Voice recognition accuracy** | High | Medium | Use native device STT (iOS/Android), test with elderly users, provide text fallback |
| **Push notification reliability** | Critical | Low | Use Firebase (99.9% uptime), implement retry logic, fallback to SMS |
| **Background task termination** | High | Medium | Use react-native-background-fetch (OS-approved), test on various devices |
| **Battery drain** | Medium | Medium | Optimize heartbeat frequency, use low-power sensors, test on real devices |
| **Offline message loss** | High | Low | Implement persistent queue (AsyncStorage), retry mechanism, confirm delivery |
| **API timeout** | Medium | Medium | Set reasonable timeouts (10s), implement retry with exponential backoff |

### User Experience Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| **Confusion during setup** | Critical | High | In-person caregiver assistance required, video tutorial, clear instructions |
| **Forgetting to charge phone** | High | Medium | Daily low-battery reminders, notify caregiver if < 20% |
| **Difficulty pressing buttons** | Medium | Low | Large buttons (min 60pt), high contrast, haptic feedback |
| **Cannot hear TTS** | Critical | Medium | Volume control in settings, visual text display, vibration alerts |
| **Privacy concerns** | Medium | Low | Clear privacy policy, explain data usage, HIPAA compliance if needed |

---

## Next Steps & Recommendations

### Immediate Actions (Week 1)

1. **Backend Updates Required:**
   - [ ] Create `POST /api/v1/patients/{id}/generate-code` endpoint (QR generation)
   - [ ] Create `POST /api/v1/mobile/setup` endpoint (verify setup token)
   - [ ] Create `POST /api/v1/mobile/device-token` endpoint (register FCM token)
   - [ ] Integrate Firebase Admin SDK for push notifications
   - [ ] Update reminder generation job to send push via Firebase

2. **Caregiver Dashboard Updates:**
   - [ ] Add "Generate Device Code" button on patient detail page
   - [ ] Display QR code modal after patient creation
   - [ ] Add "Device Status" indicator (online/offline) based on last_heartbeat_at

3. **Development Environment Setup:**
   - [ ] Setup React Native project (Expo or bare workflow)
   - [ ] Configure iOS development environment
   - [ ] Configure Android development environment
   - [ ] Setup Firebase project (get config files)
   - [ ] Create test patient in backend for development

### Phase Execution Recommendations

**Phase 1 (Week 1): Foundation First**
- Focus on getting QR setup working end-to-end
- Test on both iOS and Android early
- Don't move to Phase 2 until setup is solid

**Phase 2 (Week 2): Voice is Critical**
- Spend extra time on voice recognition accuracy
- Test with multiple accents and speech patterns
- Get TTS voice speed right for elderly users
- Test in noisy environments

**Phase 3 (Week 3): Push Reliability**
- Test notifications extensively on real devices
- Test background notifications (app closed)
- Verify notifications work on both platforms
- Test notification sound and vibration

**Phase 4 (Week 4): Background Jobs**
- Test heartbeat for 24+ hours
- Measure battery impact
- Test on various device models
- Test emergency button in realistic scenarios

**Phase 5 (Week 5): Polish Counts**
- Get feedback from actual elderly users
- Iterate based on usability testing
- Don't skip accessibility features
- Test for edge cases

### Success Metrics

**Technical Metrics:**
- Voice response time: < 5 seconds (P95)
- Push notification delivery: > 99%
- Background heartbeat reliability: > 95%
- App crash rate: < 0.1%
- API success rate: > 99.5%

**User Metrics:**
- Setup completion rate: > 90%
- Daily active usage: > 80% of patients
- Reminder response rate: > 80%
- Voice interaction success rate: > 85%
- User satisfaction: > 4/5 stars

**Safety Metrics:**
- Inactivity alerts accuracy: > 90%
- Emergency button response time: < 3 seconds
- False positive rate: < 5%
- Alert acknowledgment time: < 15 minutes

---

## Appendix

### A. Project Structure

```
elder-companion-mobile/
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── VoiceChatScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   └── SetupScreen.tsx
│   ├── components/
│   │   ├── TalkButton.tsx
│   │   ├── EmergencyButton.tsx
│   │   ├── NextReminderCard.tsx
│   │   ├── ListeningIndicator.tsx
│   │   └── MessageList.tsx
│   ├── services/
│   │   ├── api.service.ts
│   │   ├── voice.service.ts
│   │   ├── notification.service.ts
│   │   ├── storage.service.ts
│   │   ├── heartbeat.service.ts
│   │   └── offline.service.ts
│   ├── stores/
│   │   ├── patient.store.ts
│   │   ├── conversation.store.ts
│   │   └── settings.store.ts
│   ├── navigation/
│   │   └── AppNavigator.tsx
│   ├── utils/
│   │   ├── permissions.ts
│   │   ├── network.ts
│   │   └── constants.ts
│   └── types/
│       └── index.ts
├── ios/
├── android/
├── package.json
├── tsconfig.json
└── README.md
```

### B. API Endpoint Summary

**Mobile App Uses These Endpoints:**

| Endpoint | Method | Purpose | Frequency |
|----------|--------|---------|-----------|
| `/api/v1/mobile/setup` | POST | Device setup | Once |
| `/api/v1/mobile/device-token` | POST | Register FCM | Setup + token refresh |
| `/api/v1/voice/interact` | POST | Voice messages | Per conversation |
| `/api/v1/patients/{id}/heartbeat` | POST | Activity tracking | Every 15 min |

**Caregiver Dashboard Uses These:**
- All 40 existing endpoints
- Plus new: `POST /api/v1/patients/{id}/generate-code`

### C. Firebase Configuration

**firebase.json:**
```json
{
  "react-native": {
    "crashlytics_debug_enabled": true
  }
}
```

**iOS: GoogleService-Info.plist**
- Download from Firebase Console
- Place in `ios/` directory

**Android: google-services.json**
- Download from Firebase Console
- Place in `android/app/` directory

---

## Conclusion

This comprehensive plan provides a complete roadmap for building the Elder Companion AI mobile application. The app will:

✅ **Integrate seamlessly** with the existing backend (96% complete)
✅ **Complement** the caregiver dashboard perfectly
✅ **Provide** voice-first interaction for elderly patients
✅ **Enable** safety monitoring via heartbeats and emergency features
✅ **Support** offline usage with automatic syncing
✅ **Deliver** push notifications for scheduled reminders

**Key Success Factors:**
1. **Backend is ready** - 49 APIs operational, minor additions needed
2. **Architecture is sound** - Voice-first, offline-first, safety-first
3. **Phases are realistic** - 5 weeks with clear milestones
4. **Integration is clear** - Detailed flows and examples provided
5. **Testing is comprehensive** - Unit, integration, and UAT planned

**Estimated Timeline:**
- **5 weeks** for full mobile app development
- **+1 week** for minor backend additions
- **+1 week** for beta testing and refinement
- **Total: 7 weeks to production-ready mobile app**

**Team Required:**
- 2 Mobile Developers (React Native + iOS/Android)
- 1 Backend Developer (Python/FastAPI) - part-time for integrations
- 1 QA Engineer - for comprehensive testing
- 1 UX Designer - for elderly-friendly UI (optional, can use existing designs)

**Let's build an app that helps elderly people maintain their independence and gives caregivers peace of mind! 🚀**

---

**Document Version:** 1.0
**Last Updated:** October 25, 2025
**Created By:** Claude Code Assistant
**Status:** Ready for Implementation
