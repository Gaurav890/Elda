# Mobile App - Backend Communication Design

## Document Purpose

This document explains how the patient mobile app (React Native) will communicate with the backend, even though we're starting with backend development first. Understanding this is crucial for designing backend APIs correctly.

**Last Updated:** 2025-10-24

---

## Table of Contents

1. [Mobile App Architecture](#mobile-app-architecture)
2. [Communication Patterns](#communication-patterns)
3. [Voice Interaction Flow](#voice-interaction-flow)
4. [Push Notification Flow](#push-notification-flow)
5. [Background Tasks](#background-tasks)
6. [Offline Handling](#offline-handling)
7. [Security & Authentication](#security--authentication)
8. [Backend API Requirements](#backend-api-requirements)

---

## Mobile App Architecture

### High-Level Mobile App Structure

```
┌──────────────────────────────────────────────────────────────┐
│              PATIENT MOBILE APP (React Native)               │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │             UI LAYER (Screens)                         │ │
│  │  - HomeScreen: Next reminder, Talk button, Emergency  │ │
│  │  - VoiceChatScreen: Conversation interface            │ │
│  │  - EmergencyScreen: One-tap help                      │ │
│  │  - SettingsScreen: Volume, preferences                │ │
│  └────────────────────────────────────────────────────────┘ │
│                          ↕                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           STATE MANAGEMENT (React Context)             │ │
│  │  - Patient profile (loaded once, cached)               │ │
│  │  - Current reminders                                   │ │
│  │  - Conversation state                                  │ │
│  │  - Network status                                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                          ↕                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              SERVICE LAYER                             │ │
│  │                                                        │ │
│  │  ┌─────────────────┐  ┌─────────────────┐           │ │
│  │  │ Voice Service   │  │  API Service    │           │ │
│  │  │ - STT          │  │  - HTTP client  │           │ │
│  │  │ - TTS          │  │  - Token mgmt   │           │ │
│  │  └─────────────────┘  └─────────────────┘           │ │
│  │                                                        │ │
│  │  ┌─────────────────┐  ┌─────────────────┐           │ │
│  │  │ Notification    │  │  Storage        │           │ │
│  │  │ Service         │  │  Service        │           │ │
│  │  │ - Push handler  │  │  - AsyncStorage │           │ │
│  │  └─────────────────┘  └─────────────────┘           │ │
│  └────────────────────────────────────────────────────────┘ │
│                          ↕                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           BACKGROUND TASKS                             │ │
│  │  - Heartbeat every 15 minutes                          │ │
│  │  - Pending message queue processor                     │ │
│  │  - Activity tracker                                    │ │
│  └────────────────────────────────────────────────────────┘ │
│                          ↕                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           LOCAL STORAGE (AsyncStorage)                 │ │
│  │  - patient_id                                          │ │
│  │  - device_token (Firebase)                             │ │
│  │  - pending_messages (offline queue)                    │ │
│  │  - last_sync_timestamp                                 │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
                              ↕
                    HTTPS / REST API
                              ↕
                        BACKEND SERVER
```

---

## Communication Patterns

### Pattern 1: Request-Response (Standard HTTP)

**Used for:**
- Submitting voice messages
- Checking reminders
- Fetching patient profile
- Emergency button

**How it works:**
```
Mobile App                           Backend API
    │                                    │
    │  POST /conversations/patient       │
    │  {                                 │
    │    "patient_id": "uuid",          │
    │    "message": "I took my pills",  │
    │    "timestamp": "..."             │
    │  }                                 │
    │─────────────────────────────────> │
    │                                    │
    │                                    │ Processing:
    │                                    │ 1. Query Letta
    │                                    │ 2. Query Chroma
    │                                    │ 3. Send to Claude
    │                                    │ 4. Generate response
    │                                    │
    │  Response:                         │
    │  {                                 │
    │    "success": true,                │
    │    "data": {                       │
    │      "response": "Great job!",     │
    │      "speak": true,                │
    │      "conversation_id": "uuid"     │
    │    }                               │
    │  }                                 │
    │ <─────────────────────────────────│
    │                                    │
```

**Implementation:**
```javascript
// Mobile: services/api.service.js
async function submitMessage(patientId, message) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/conversations/patient`,
      {
        patient_id: patientId,
        message: message,
        timestamp: new Date().toISOString(),
        context: {
          triggered_by: "manual",
          app_state: "active"
        }
      },
      {
        timeout: 10000 // 10 second timeout
      }
    );

    return response.data;
  } catch (error) {
    // Queue for retry if offline
    if (!navigator.onLine) {
      await queueMessageForRetry(patientId, message);
    }
    throw error;
  }
}
```

---

### Pattern 2: Push Notifications (Firebase → Mobile)

**Used for:**
- Scheduled reminders
- Check-in notifications
- Alert acknowledgments
- Wake app from background

**How it works:**
```
Backend Scheduler                Firebase Cloud          Mobile App
                                 Messaging (FCM)
    │                                │                       │
    │ Time for reminder              │                       │
    │ (APScheduler triggers)         │                       │
    │                                │                       │
    │  Send push notification        │                       │
    │  {                             │                       │
    │    "to": "device_token",       │                       │
    │    "notification": {           │                       │
    │      "title": "Medication",    │                       │
    │      "body": "Time for pills" │                       │
    │    },                          │                       │
    │    "data": {                   │                       │
    │      "type": "reminder",       │                       │
    │      "reminder_id": "uuid",    │                       │
    │      "speak_text": "Hi Maggie" │                       │
    │    }                           │                       │
    │  }                             │                       │
    │─────────────────────────────>  │                       │
    │                                │                       │
    │                                │  Deliver notification │
    │                                │──────────────────────>│
    │                                │                       │
    │                                │                       │ Notification
    │                                │                       │ received!
    │                                │                       │
    │                                │                       │ 1. Wake app
    │                                │                       │ 2. Play TTS
    │                                │                       │ 3. Start
    │                                │                       │    listening
    │                                │                       │
    │                                │     POST response     │
    │ <──────────────────────────────────────────────────── │
    │                                │                       │
```

**Backend Implementation:**
```python
# backend/app/services/communication/firebase_service.py
class FirebaseService:
    async def send_reminder_notification(
        self,
        device_token: str,
        reminder_id: str,
        title: str,
        speak_text: str
    ):
        """Send push notification for reminder"""

        message = messaging.Message(
            token=device_token,
            notification=messaging.Notification(
                title=title,
                body=speak_text[:100]  # Preview text
            ),
            data={
                "type": "reminder",
                "reminder_id": reminder_id,
                "speak_text": speak_text,
                "timestamp": datetime.utcnow().isoformat()
            },
            android=messaging.AndroidConfig(
                priority="high",  # Wake device
                notification=messaging.AndroidNotification(
                    sound="default",
                    channel_id="reminders"
                )
            ),
            apns=messaging.APNSConfig(
                payload=messaging.APNSPayload(
                    aps=messaging.Aps(
                        sound="default",
                        content_available=True  # Wake iOS app
                    )
                )
            )
        )

        try:
            response = messaging.send(message)
            return response
        except Exception as e:
            logger.error(f"Failed to send notification: {e}")
            raise
```

**Mobile Implementation:**
```javascript
// Mobile: services/notification.service.js
import messaging from '@react-native-firebase/messaging';
import { playSpeech } from './voice.service';

// Handle foreground notifications
messaging().onMessage(async remoteMessage => {
  console.log('Notification received:', remoteMessage);

  if (remoteMessage.data.type === 'reminder') {
    // Play TTS immediately
    await playSpeech(remoteMessage.data.speak_text);

    // Start voice listening
    await startVoiceRecognition(remoteMessage.data.reminder_id);
  }
});

// Handle background notifications (app closed)
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Background notification:', remoteMessage);

  // Wake app and prepare to handle reminder
  await handleReminderInBackground(remoteMessage.data);
});
```

---

### Pattern 3: Background Heartbeat (Periodic Updates)

**Used for:**
- Activity monitoring
- Inactivity detection
- Location updates (if enabled)
- Device health status

**How it works:**
```
Mobile App                           Backend API
(Background Task)
    │                                    │
    │ Every 15 minutes:                  │
    │                                    │
    │  POST /mobile/heartbeat            │
    │  {                                 │
    │    "patient_id": "uuid",          │
    │    "timestamp": "...",             │
    │    "activity_type": "heartbeat",   │
    │    "app_state": "background",      │
    │    "last_interaction_at": "...",   │
    │    "context": {                    │
    │      "battery_level": 0.75,        │
    │      "movement_detected": true,    │
    │      "location": {...},            │
    │      "network_type": "wifi"        │
    │    }                               │
    │  }                                 │
    │─────────────────────────────────> │
    │                                    │
    │                                    │ Store in
    │                                    │ activity_logs
    │                                    │ table
    │                                    │
    │  Response: 200 OK                  │
    │  {                                 │
    │    "success": true,                │
    │    "pending_actions": []           │
    │  }                                 │
    │ <─────────────────────────────────│
    │                                    │
```

**Mobile Implementation:**
```javascript
// Mobile: services/background.service.js
import BackgroundFetch from 'react-native-background-fetch';

// Configure background task
BackgroundFetch.configure({
  minimumFetchInterval: 15, // 15 minutes
  stopOnTerminate: false,    // Continue after app closed
  startOnBoot: true,         // Start after device reboot
  enableHeadless: true       // Run even if app not opened
}, async (taskId) => {
  console.log('[BackgroundFetch] Task executing:', taskId);

  try {
    // Send heartbeat
    await sendHeartbeat();

    // Mark task complete
    BackgroundFetch.finish(taskId);
  } catch (error) {
    console.error('[BackgroundFetch] Error:', error);
    BackgroundFetch.finish(taskId);
  }
}, (taskId) => {
  // Task timeout (after 30 seconds)
  console.log('[BackgroundFetch] Task timeout:', taskId);
  BackgroundFetch.finish(taskId);
});

async function sendHeartbeat() {
  const patientId = await AsyncStorage.getItem('patient_id');
  const lastInteraction = await AsyncStorage.getItem('last_interaction');

  const heartbeat = {
    patient_id: patientId,
    timestamp: new Date().toISOString(),
    activity_type: 'heartbeat',
    app_state: await getAppState(),
    last_interaction_at: lastInteraction,
    context: {
      battery_level: await getBatteryLevel(),
      movement_detected: await checkMovement(),
      location: await getLocation(), // If permission granted
      network_type: await getNetworkType()
    }
  };

  await axios.post(`${API_BASE_URL}/mobile/heartbeat`, heartbeat);
}
```

---

## Voice Interaction Flow

### Complete Voice Conversation Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    VOICE INTERACTION TIMELINE                       │
└─────────────────────────────────────────────────────────────────────┘

Mobile App                           Backend API                     AI Services

[User taps "Talk to Me"]
    │
    │ Start listening
    │ (Show pulsing mic)
    │
[User speaks: "I'm dizzy"]
    │
    │ Speech-to-Text
    │ (react-native-voice)
    │
    │ Convert audio → text
    │ "I'm dizzy"
    │
    │ POST /conversations/patient
    │ { message: "I'm dizzy" }
    │─────────────────────────>
    │                               Receive request
    │                                     │
    │                                     │ Query Letta
    │                                     │────────────────> Get patient context
    │                                     │                 (patterns, preferences)
    │                                     │ <────────────────
    │                                     │
    │                                     │ Query Chroma
    │                                     │────────────────> Find similar
    │                                     │                 conversations
    │                                     │ <────────────────
    │                                     │
    │                                     │ Send to Claude
    │                                     │────────────────> Analyze with
    │                                     │                 full context
    │                                     │                 Generate response
    │                                     │ <────────────────
    │                                     │
    │                                     │ Update Letta
    │                                     │────────────────> Store interaction
    │                                     │ <────────────────
    │                                     │
    │                                     │ Store in Chroma
    │                                     │────────────────> Save embedding
    │                                     │ <────────────────
    │                                     │
    │                                     │ Create alert?
    │                                     │ (if needed)
    │                                     │
    │   Response:                         │
    │   {                                 │
    │     "response": "I'm concerned...", │
    │     "speak": true,                  │
    │     "keep_listening": true          │
    │   }                                 │
    │ <─────────────────────────
    │
    │ Receive response
    │
    │ Text-to-Speech
    │ (expo-speech)
    │
[AI speaks: "I'm concerned
 about your dizziness..."]
    │
    │ Continue listening
    │ (keep_listening: true)
    │
[User responds: "No water"]
    │
    │ [Loop continues...]
    │

Total time: 3-5 seconds (target)
```

### Voice Service Implementation

**Mobile Side:**
```javascript
// Mobile: services/voice.service.js
import Voice from '@react-native-voice/voice';
import * as Speech from 'expo-speech';

class VoiceService {
  constructor() {
    Voice.onSpeechStart = this.onSpeechStart;
    Voice.onSpeechResults = this.onSpeechResults;
    Voice.onSpeechError = this.onSpeechError;
  }

  async startListening() {
    try {
      await Voice.start('en-US');
      console.log('Started listening');
    } catch (error) {
      console.error('Error starting voice recognition:', error);
    }
  }

  async stopListening() {
    try {
      await Voice.stop();
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
    }
  }

  onSpeechResults = async (event) => {
    const spokenText = event.value[0];
    console.log('User said:', spokenText);

    // Send to backend
    const response = await submitMessage(patientId, spokenText);

    // Play AI response
    if (response.data.speak) {
      await this.speak(response.data.response);
    }

    // Continue listening if requested
    if (response.data.keep_listening) {
      await this.startListening();
    }
  }

  async speak(text) {
    return new Promise((resolve) => {
      Speech.speak(text, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.9, // Slightly slower for elderly
        onDone: resolve
      });
    });
  }
}

export default new VoiceService();
```

**Backend API Endpoint:**
```python
# backend/app/api/v1/conversations.py
@router.post("/patient")
async def submit_patient_message(
    message: ConversationCreate,
    db: Session = Depends(get_db)
):
    """
    Process patient voice message

    Flow:
    1. Query Letta for context
    2. Query Chroma for similar conversations
    3. Send to Claude with full context
    4. Execute recommended actions
    5. Update Letta and Chroma
    6. Return response for TTS
    """

    # Get patient
    patient = await db.get(Patient, message.patient_id)

    # Process through conversation service
    result = await conversation_service.process_patient_message(
        patient_id=message.patient_id,
        message=message.message,
        context=message.context
    )

    return APIResponse(
        success=True,
        data={
            "response": result["ai_response"],
            "speak": True,
            "keep_listening": result["continue_conversation"],
            "conversation_id": result["conversation_id"],
            "alert_sent": result.get("alert_created", False)
        }
    )
```

---

## Push Notification Flow

### Complete Reminder Flow with Push Notifications

```
┌──────────────────────────────────────────────────────────────┐
│         SCHEDULED REMINDER WITH PUSH NOTIFICATION            │
└──────────────────────────────────────────────────────────────┘

Backend Scheduler          Firebase           Mobile App          User
    │                        │                    │                │
    │ 8:00 AM - Time for     │                    │                │
    │ morning medication     │                    │                │
    │                        │                    │                │
    │ 1. Create reminder     │                    │                │
    │    record in DB        │                    │                │
    │                        │                    │                │
    │ 2. Send push via FCM   │                    │                │
    │────────────────────────>                    │                │
    │                        │                    │                │
    │                        │ 3. Deliver push    │                │
    │                        │─────────────────>  │                │
    │                        │                    │                │
    │                        │                    │ 4. Wake app    │
    │                        │                    │    (even if    │
    │                        │                    │     closed)    │
    │                        │                    │                │
    │                        │                    │ 5. Show        │
    │                        │                    │    notification │
    │                        │                    │────────────────>
    │                        │                    │                │
    │                        │                    │                │ [Notification
    │                        │                    │                │  appears on
    │                        │                    │                │  lock screen]
    │                        │                    │                │
    │                        │                    │ 6. Play TTS:   │
    │                        │                    │   "Hi Maggie,  │
    │                        │                    │    time for    │
    │                        │                    │    your pills" │
    │                        │                    │────────────────>
    │                        │                    │                │
    │                        │                    │                │ [User hears
    │                        │                    │                │  voice]
    │                        │                    │                │
    │                        │                    │ 7. Start       │
    │                        │                    │    listening   │
    │                        │                    │    for 30s     │
    │                        │                    │                │
    │                        │                    │                │ [User speaks:
    │                        │                    │                │  "I took it"]
    │                        │                    │                │
    │                        │                    │ 8. STT         │
    │                        │                    │   "I took it"  │
    │                        │                    │                │
    │ 9. POST response       │                    │                │
    │ <────────────────────────────────────────── │                │
    │                        │                    │                │
    │ 10. Process via AI     │                    │                │
    │     pipeline           │                    │                │
    │                        │                    │                │
    │ 11. Response           │                    │                │
    │─────────────────────────────────────────>   │                │
    │                        │                    │                │
    │                        │                    │ 12. TTS:       │
    │                        │                    │    "Great job, │
    │                        │                    │     Maggie!"   │
    │                        │                    │────────────────>
    │                        │                    │                │
    │ 13. Update reminder    │                    │                │
    │     status: completed  │                    │                │
    │                        │                    │                │
```

### Device Token Management

**Mobile App Initialization:**
```javascript
// Mobile: App initialization
import messaging from '@react-native-firebase/messaging';

async function initializeApp() {
  // Request permission for notifications
  const authStatus = await messaging().requestPermission();

  if (authStatus === messaging.AuthorizationStatus.AUTHORIZED) {
    // Get device token
    const token = await messaging().getToken();
    console.log('FCM Token:', token);

    // Send token to backend
    await updateDeviceToken(patientId, token);

    // Store locally
    await AsyncStorage.setItem('device_token', token);
  }
}

async function updateDeviceToken(patientId, token) {
  await axios.post(`${API_BASE_URL}/mobile/device-token`, {
    patient_id: patientId,
    device_token: token,
    platform: Platform.OS // 'ios' or 'android'
  });
}

// Handle token refresh (Firebase may refresh tokens)
messaging().onTokenRefresh(async token => {
  console.log('Token refreshed:', token);
  await updateDeviceToken(patientId, token);
});
```

**Backend Storage:**
```python
# backend/app/api/v1/mobile.py
@router.post("/device-token")
async def update_device_token(
    token_data: DeviceTokenUpdate,
    db: Session = Depends(get_db)
):
    """Store/update device token for push notifications"""

    patient = await db.get(Patient, token_data.patient_id)
    patient.device_token = token_data.device_token
    patient.device_platform = token_data.platform

    await db.commit()

    return APIResponse(success=True)
```

---

## Background Tasks

### What Runs in Background?

```
┌──────────────────────────────────────────────────────────────┐
│           MOBILE APP BACKGROUND TASKS                        │
└──────────────────────────────────────────────────────────────┘

Task 1: Heartbeat Service (Every 15 minutes)
────────────────────────────────────────────
Purpose: Send activity status to backend
Runs: Even when app closed
Data sent:
  - Battery level
  - Movement detected (accelerometer)
  - Location (if enabled)
  - Last interaction timestamp
  - App state (background/active)

Task 2: Notification Handler
────────────────────────────────────────────
Purpose: Process incoming reminders
Runs: When notification received
Actions:
  - Wake app
  - Play TTS
  - Start voice recognition
  - Handle response

Task 3: Message Queue Processor (When online)
────────────────────────────────────────────
Purpose: Send queued messages from offline period
Runs: When network reconnects
Actions:
  - Check pending_messages queue
  - Send each message in order
  - Clear queue on success

Task 4: Movement Detection (Optional)
────────────────────────────────────────────
Purpose: Detect if patient has moved
Runs: Continuously (low power mode)
Data: Accelerometer readings every 5 min
Use: Enhance inactivity detection
```

### Background Task Implementation

**iOS (via BackgroundFetch):**
```javascript
// Mobile: ios/AppDelegate.m (or AppDelegate.swift)
- (void)application:(UIApplication *)application
    performFetchWithCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler {

  // This is called by iOS periodically in background
  [RNBackgroundFetch performFetchWithCompletionHandler:completionHandler];
}
```

**Android (via HeadlessJS):**
```javascript
// Mobile: android/app/src/main/java/.../MainApplication.java
@Override
public void onCreate() {
  super.onCreate();

  // Register headless task
  HeadlessJsTaskService.acquireWakeLockNow(this);
}
```

**JavaScript Background Handler:**
```javascript
// Mobile: index.js (root)
import { AppRegistry } from 'react-native';
import App from './App';
import { backgroundMessageHandler } from './services/background.service';

// Register main app
AppRegistry.registerComponent('ElderCompanionApp', () => App);

// Register background handler (runs even when app closed)
AppRegistry.registerHeadlessTask(
  'BackgroundTask',
  () => backgroundMessageHandler
);
```

---

## Offline Handling

### How the App Works Offline

```
┌──────────────────────────────────────────────────────────────┐
│                    OFFLINE SCENARIO                          │
└──────────────────────────────────────────────────────────────┘

Scenario: Patient has no internet connection

Mobile App State                    Local Storage
────────────────────────────────────────────────────

1. User speaks message
   "I took my medication"
        │
        ↓
2. Try to send to backend
   → Network error!
        │
        ↓
3. Detect offline state
   (navigator.onLine === false)
        │
        ↓
4. Queue message locally         pending_messages: [
   with timestamp                  {
                                     message: "I took my medication",
                                     timestamp: "2025-10-24T08:05:00Z",
                                     retry_count: 0,
                                     context: {...}
                                   }
                                 ]
        │
        ↓
5. Show user feedback:
   "Message saved. Will send
   when connection restored."
        │
        ↓
6. Play pre-recorded response:
   "Thank you, Maggie. I've
   noted that."
        │
        ↓
...Time passes...
        │
        ↓
7. Connection restored
        │
        ↓
8. Background task detects
   network is back
        │
        ↓
9. Process message queue         → Send each message
        │                        → Get AI responses
        ↓                        → Update UI if app open
10. Clear queue                  pending_messages: []
```

### Offline Implementation

```javascript
// Mobile: services/offline.service.js
class OfflineService {
  async queueMessage(patientId, message, context) {
    const queue = await this.getMessageQueue();

    queue.push({
      id: uuid(),
      patient_id: patientId,
      message: message,
      context: context,
      timestamp: new Date().toISOString(),
      retry_count: 0,
      created_at: Date.now()
    });

    await AsyncStorage.setItem(
      'pending_messages',
      JSON.stringify(queue)
    );

    console.log(`Message queued (total: ${queue.length})`);
  }

  async processQueue() {
    const queue = await this.getMessageQueue();

    if (queue.length === 0) return;

    console.log(`Processing ${queue.length} pending messages`);

    for (const queuedMessage of queue) {
      try {
        // Try to send message
        await apiService.submitMessage(
          queuedMessage.patient_id,
          queuedMessage.message,
          queuedMessage.context
        );

        // Success - remove from queue
        await this.removeFromQueue(queuedMessage.id);

      } catch (error) {
        console.error('Failed to process queued message:', error);

        // Increment retry count
        queuedMessage.retry_count++;

        // If too many retries, remove (data loss, but prevent infinite queue)
        if (queuedMessage.retry_count > 5) {
          await this.removeFromQueue(queuedMessage.id);

          // Log to analytics/error tracking
          console.error('Message dropped after 5 retries:', queuedMessage);
        }
      }
    }
  }

  async getMessageQueue() {
    const queue = await AsyncStorage.getItem('pending_messages');
    return queue ? JSON.parse(queue) : [];
  }

  async removeFromQueue(messageId) {
    const queue = await this.getMessageQueue();
    const filtered = queue.filter(msg => msg.id !== messageId);
    await AsyncStorage.setItem('pending_messages', JSON.stringify(filtered));
  }
}

// Listen for network state changes
import NetInfo from '@react-native-community/netinfo';

NetInfo.addEventListener(state => {
  if (state.isConnected) {
    console.log('Network connected - processing queue');
    offlineService.processQueue();
  } else {
    console.log('Network disconnected - entering offline mode');
  }
});
```

---

## Security & Authentication

### Mobile App Security Model

**Key Principle:** Mobile app does NOT require login

**Why?**
- Patient app is for elderly users (login would be confusing)
- Device itself is the authentication (physical possession)
- Patient ID is stored locally after initial setup

**Setup Process:**
```
1. Caregiver sets up patient account in web dashboard
2. Caregiver generates QR code or setup link
3. Caregiver helps patient scan QR code on their device
4. Patient ID is stored in AsyncStorage
5. Mobile app always uses that patient ID for all requests
```

**Security Measures:**
```javascript
// Mobile: services/auth.service.js
class AuthService {
  async setupPatient(qrCodeData) {
    // Parse QR code
    const { patient_id, setup_token } = JSON.parse(qrCodeData);

    // Verify setup token with backend (one-time use)
    const response = await axios.post(
      `${API_BASE_URL}/mobile/setup`,
      {
        patient_id,
        setup_token
      }
    );

    if (response.data.success) {
      // Store patient ID locally
      await AsyncStorage.setItem('patient_id', patient_id);

      // Get Firebase token and register device
      const deviceToken = await messaging().getToken();
      await this.registerDevice(patient_id, deviceToken);

      return { success: true };
    } else {
      throw new Error('Invalid setup code');
    }
  }

  async getPatientId() {
    // All API calls use this
    return await AsyncStorage.getItem('patient_id');
  }
}
```

**Backend Validation:**
```python
# backend/app/api/v1/mobile.py
@router.post("/setup")
async def setup_mobile_device(
    setup_data: MobileSetup,
    db: Session = Depends(get_db)
):
    """
    One-time device setup
    Validates setup_token and activates device
    """

    # Verify setup token (generated by caregiver)
    patient = await db.get(Patient, setup_data.patient_id)

    if not patient or patient.setup_token != setup_data.setup_token:
        raise HTTPException(status_code=401, detail="Invalid setup code")

    # Check if token already used
    if patient.device_setup_completed:
        raise HTTPException(status_code=400, detail="Device already set up")

    # Mark as completed (token can't be reused)
    patient.device_setup_completed = True
    patient.setup_token = None  # Invalidate

    await db.commit()

    return APIResponse(
        success=True,
        data={"patient_id": patient.id}
    )
```

---

## Backend API Requirements

### Mobile-Specific Endpoints

**All these endpoints need to be implemented in backend:**

#### 1. Device Setup
```
POST /api/v1/mobile/setup
Purpose: One-time device registration
Body: { patient_id, setup_token }
Response: { success: true }
```

#### 2. Device Token Management
```
POST /api/v1/mobile/device-token
Purpose: Store/update FCM token
Body: { patient_id, device_token, platform }
Response: { success: true }
```

#### 3. Heartbeat
```
POST /api/v1/mobile/heartbeat
Purpose: Activity tracking (every 15 min)
Body: {
  patient_id,
  timestamp,
  activity_type: "heartbeat",
  app_state,
  last_interaction_at,
  context: { battery, movement, location, network }
}
Response: { success: true, pending_actions: [] }
```

#### 4. Submit Patient Message
```
POST /api/v1/conversations/patient
Purpose: Voice message from patient
Body: {
  patient_id,
  message: "transcribed text",
  timestamp,
  context: { triggered_by, app_state }
}
Response: {
  success: true,
  data: {
    response: "AI response text",
    speak: true,
    keep_listening: true/false,
    conversation_id,
    alert_sent: false
  }
}
Processing time: < 5 seconds target
```

#### 5. Emergency Button
```
POST /api/v1/mobile/emergency
Purpose: Emergency help button pressed
Body: {
  patient_id,
  timestamp,
  location,
  battery_level
}
Response: {
  success: true,
  data: {
    alert_created: true,
    alert_id,
    caregivers_notified: ["Sarah", "John"]
  }
}
Processing time: < 3 seconds (CRITICAL)
```

#### 6. Get Upcoming Reminders
```
GET /api/v1/mobile/reminders?patient_id={id}&upcoming=true
Purpose: Display next reminder on home screen
Response: {
  success: true,
  data: {
    next_reminder: {
      title: "Morning Medication",
      time: "08:00:00",
      minutes_until: 45
    }
  }
}
```

---

## Data Synchronization

### What Data is Synced?

```
┌──────────────────────────────────────────────────────────────┐
│                  DATA SYNC STRATEGY                          │
└──────────────────────────────────────────────────────────────┘

Mobile App Local Storage          Backend Database
─────────────────────────────────────────────────────────────

READ-ONLY (Cached):               SOURCE OF TRUTH:
───────────────────               ─────────────────
- Patient profile                 - Patient profile
- Today's schedule                - All schedules
- Recent conversations            - All conversations
  (last 10)                       - All reminders
                                  - All alerts

WRITE (Synced to backend):        RECEIVES:
──────────────────────────        ─────────
- Voice messages                  - Voice messages
- Activity heartbeats             - Heartbeats
- Emergency button press          - Emergency events

NEVER STORED ON DEVICE:
───────────────────────
- Other patients' data
- Caregiver information
- Full conversation history (only recent)
- Sensitive medical details (only what's needed)
```

### Sync Implementation

```javascript
// Mobile: services/sync.service.js
class SyncService {
  async syncPatientData() {
    const patientId = await AsyncStorage.getItem('patient_id');

    try {
      // Get patient profile (changes rarely)
      const profile = await apiService.getPatientProfile(patientId);
      await AsyncStorage.setItem('patient_profile', JSON.stringify(profile));

      // Get today's schedule
      const schedule = await apiService.getTodaySchedule(patientId);
      await AsyncStorage.setItem('today_schedule', JSON.stringify(schedule));

      // Get recent conversations (last 10)
      const conversations = await apiService.getRecentConversations(patientId, 10);
      await AsyncStorage.setItem('recent_conversations', JSON.stringify(conversations));

      console.log('Sync completed successfully');
    } catch (error) {
      console.error('Sync failed:', error);
      // Continue with cached data
    }
  }

  // Sync on app start
  async onAppStart() {
    await this.syncPatientData();
  }

  // Sync periodically (every hour when app active)
  startPeriodicSync() {
    setInterval(async () => {
      if (await this.isAppActive()) {
        await this.syncPatientData();
      }
    }, 60 * 60 * 1000); // 1 hour
  }
}
```

---

## Testing Mobile-Backend Communication

### Manual Testing Checklist

```
□ Voice Message Flow
  □ Open app → Tap "Talk to Me"
  □ Speak message
  □ Verify STT converts correctly
  □ Verify message sent to backend
  □ Verify AI response received < 5 seconds
  □ Verify TTS plays response
  □ Verify conversation logged in backend

□ Push Notification Flow
  □ Create schedule for "now + 2 minutes"
  □ Close/background app
  □ Wait for notification
  □ Verify notification received
  □ Verify TTS plays automatically
  □ Verify voice recognition starts

□ Heartbeat Flow
  □ Background app
  □ Wait 15 minutes
  □ Check backend logs for heartbeat received
  □ Verify activity_logs table updated

□ Emergency Button Flow
  □ Press emergency button
  □ Verify alert created < 3 seconds
  □ Check backend: alert sent to caregivers
  □ Verify SMS sent (check Twilio logs)

□ Offline Mode
  □ Disable device internet
  □ Try to send message
  □ Verify queued locally
  □ Re-enable internet
  □ Verify message sent automatically

□ Device Setup
  □ Generate QR code from dashboard
  □ Scan QR code in mobile app
  □ Verify patient_id stored
  □ Verify device token registered
```

---

## Performance Targets

### Response Time Goals

```
┌──────────────────────────────────────────────────────────────┐
│               PERFORMANCE REQUIREMENTS                       │
└──────────────────────────────────────────────────────────────┘

Voice Message Processing:
─────────────────────────
Target: < 5 seconds from user speaking to AI response
Breakdown:
  - STT conversion: 1-2 seconds
  - API call + processing: 2-3 seconds
    * Letta query: 0.5s
    * Chroma query: 0.3s
    * Claude analysis: 1-2s
    * Database updates: 0.2s
  - TTS conversion: 1 second
Total: ~4 seconds (good) | 3 seconds (excellent)

Emergency Button:
─────────────────
Target: < 3 seconds from press to alert sent
Breakdown:
  - API call: 0.5s
  - Database write: 0.2s
  - Twilio SMS: 1-2s (parallel)
  - Response to mobile: 0.5s
Total: ~2.5 seconds

Heartbeat:
──────────
Target: < 1 second (low priority, background)
Breakdown:
  - API call: 0.3s
  - Database write: 0.2s
  - Response: 0.1s
Total: ~0.6 seconds

Push Notification:
──────────────────
Target: < 10 seconds from trigger to device
Breakdown:
  - Scheduler detects: 1-5s (runs every minute)
  - FCM delivery: 1-3s
  - App processes: 1-2s
Total: 3-10 seconds (acceptable for reminders)
```

---

## Conclusion

### Key Takeaways for Backend Development

1. **No Authentication on Mobile**
   - Patient ID stored locally after setup
   - Backend validates patient_id exists for every request

2. **Push Notifications Are Critical**
   - Backend must integrate Firebase Admin SDK
   - Store device tokens in patients table
   - Send notifications for reminders

3. **Voice Processing Must Be Fast**
   - Target: < 5 seconds total response time
   - Optimize AI service calls (parallel where possible)
   - Use async/await throughout

4. **Heartbeat for Monitoring**
   - Expect heartbeat POST every 15 minutes
   - Store in activity_logs table
   - Use for inactivity detection

5. **Emergency Button is Highest Priority**
   - Must respond < 3 seconds
   - Immediate Twilio SMS
   - Create critical alert

6. **Offline Support on Mobile**
   - Mobile queues messages locally
   - Backend might receive delayed messages
   - Include timestamps in all requests

7. **Testing Strategy**
   - Use Postman to simulate mobile requests
   - Test push notifications manually
   - Verify response times meet targets

---

**Ready to build the backend with mobile communication in mind!**

**Last Updated:** 2025-10-24
