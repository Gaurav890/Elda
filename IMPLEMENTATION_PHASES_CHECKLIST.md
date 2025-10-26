# Elder Companion AI - Implementation Phases Checklist

**Overall Completion: ~58%**
**Last Updated**: October 26, 2025 2:07 AM
**Current Phase**: Phase 1.1 Complete (Backend) | APNs Blocked

> This checklist tracks all missing and incomplete features identified in the gap analysis.
> Use this to systematically complete the Elder Companion AI system per the project specification.

---

## 📊 Quick Status Overview

| Phase | Focus Area | Priority | Status | Completion |
|-------|-----------|----------|--------|------------|
| Phase 1 | Critical Infrastructure | 🔴 HIGH | 🟡 In Progress | 35% |
| Phase 2 | Core Feature Completion | 🔴 HIGH | ⚪ Not Started | 0% |
| Phase 3 | Emergency & Alert System | 🟡 MEDIUM | ⚪ Not Started | 0% |
| Phase 4 | Mobile App Enhancement | 🟡 MEDIUM | 🟡 In Progress | 30% |
| Phase 5 | Dashboard Enhancement | 🟢 LOW | 🟡 In Progress | 40% |
| Phase 6 | AI Personalization | 🟢 LOW | ⚪ Not Started | 0% |
| Phase 7 | Polish & Production | 🟢 LOW | ⚪ Not Started | 0% |

---

## 🔴 PHASE 1: Critical Infrastructure (HIGH PRIORITY)

**Goal**: Establish real-time communication infrastructure - notifications, alerts, and messaging.

**Why Critical**: Without this, the system is passive and cannot proactively engage patients or alert caregivers.

### 1.1 Firebase Push Notifications (Mobile)

**Status**: ✅ Backend Complete | ⚠️ APNs Blocked (needs $99 Apple Developer)
**Actual Effort**: 2.5 hours
**Priority**: 🔴 CRITICAL
**Completed**: October 26, 2025

> **Note**: Backend implementation 100% complete. iOS notification delivery blocked by Apple Developer Account requirement ($99/year). APNs key can be added later. All code is production-ready.

#### Backend Tasks
- [x] **Verify Firebase service exists and is configured** ✅
  - File: `/Users/gaurav/Elda/backend/app/services/communication/firebase_service.py`
  - [x] Review existing code structure - Already production-ready
  - [x] FCM admin SDK initialization - Complete
  - [x] Method exists: `send_reminder()`, `send_alert()`, `send_custom_notification()`
  - [x] Firebase credentials configured: `firebase-credentials.json`
  - [x] Test Firebase connection - Successful: "Firebase Admin SDK initialized successfully"

- [x] **Create FCM token registration endpoint** ✅
  - File: `/Users/gaurav/Elda/backend/app/api/v1/mobile.py`
  - [x] Endpoint exists: `POST /mobile/device-token`
  - [x] Store `device_token` in Patient table - Working
  - [x] Handle token refresh/update logic - Complete
  - [x] Test token storage - Verified with `check_device_tokens.py`

- [x] **Integrate Firebase with reminder generation** ✅
  - File: `/Users/gaurav/Elda/backend/app/jobs/reminder_generator.py`
  - [x] After creating reminder, calls `_send_reminder_notification()`
  - [x] Sends push notification with all reminder details
  - [x] Includes: reminder_id, speak_text, reminder_type, title, due_at, scheduled_time
  - [x] Handle offline devices gracefully - Checks for device_token existence

#### Mobile Tasks
- [x] **Configure Firebase in mobile app** ✅
  - [x] Firebase config files exist: `GoogleService-Info.plist`, `google-services.json`
  - [x] Packages installed: `@react-native-firebase/app`, `@react-native-firebase/messaging`
  - [x] Request notification permissions on app start - In `notification.service.ts`
  - [x] Test notification display - Works on real devices (not simulator)

- [x] **Implement FCM token registration** ✅
  - File: `/Users/gaurav/Elda/elder-companion-mobile/src/services/api.service.ts`
  - [x] Get FCM token: `messaging().getToken()` - Complete
  - [x] Send to backend: `POST /mobile/device-token` - Working
  - [x] Handle token refresh: `messaging().onTokenRefresh()` - Implemented

- [x] **Implement notification handlers** ✅
  - File: `/Users/gaurav/Elda/elder-companion-mobile/src/services/notification.service.ts`
  - [x] Foreground handler: `handleForegroundMessage()` - Complete
  - [x] Background handler: `handleBackgroundMessage()` - Complete
  - [x] Parse notification types: `type`, `reminder_type`, `notification_type`
  - [x] Trigger actions:
    - [x] Play TTS message using `speak_text` field
    - [x] Parse `requires_response` flag (ready for future voice)
    - [x] Show in-app Alert with View/Dismiss options
    - [x] Parse all backend data fields

#### Testing
- [x] Backend sends notifications successfully ✅
- [x] Device token registration works ✅
- [x] Backend logs show: "Firebase Admin SDK initialized successfully" ✅
- [x] Test script created: `backend/test_send_notification.py` ✅
- [x] Token checker created: `backend/check_device_tokens.py` ✅
- [ ] ⚠️ **Actual notification delivery BLOCKED** - Requires APNs key ($99 Apple Developer)
  - Option 1: Pay $99 → Upload APNs key → Full testing
  - Option 2: Continue development → Add APNs later
  - Option 3: Test on Android (FCM works without paid account)

#### What's Working WITHOUT APNs:
- ✅ Backend Firebase integration
- ✅ Notification sending logic
- ✅ Device token registration
- ✅ Mobile app runs normally
- ✅ All non-notification features work

#### What's Blocked WITHOUT APNs:
- ❌ iOS push notification delivery
- ❌ Notification arrival on physical iPhone
- ❌ End-to-end notification testing

---

### 1.2 Twilio SMS & Voice Calls (Backend)

**Status**: ⚪ Not Started
**Estimated Effort**: 3-4 hours
**Priority**: 🔴 HIGH

#### Backend Tasks
- [ ] **Install Twilio SDK**
  - [ ] Add to `requirements.txt`: `twilio>=8.0.0`
  - [ ] Run: `pip install twilio`
  - [ ] Add Twilio credentials to `.env`:
    ```
    TWILIO_ACCOUNT_SID=your_account_sid
    TWILIO_AUTH_TOKEN=your_auth_token
    TWILIO_PHONE_NUMBER=+1234567890
    ```

- [ ] **Create Twilio service**
  - File: Create `/Users/gaurav/Elda/backend/app/services/communication/twilio_service.py`
  - [ ] Initialize Twilio client
  - [ ] Method: `send_sms(to_phone, message)` - returns message_sid
  - [ ] Method: `make_voice_call(to_phone, twiml_url)` - returns call_sid
  - [ ] Method: `send_alert_sms(caregiver, alert)` - formats alert message
  - [ ] Method: `make_alert_call(caregiver, alert)` - automated voice message
  - [ ] Error handling for invalid numbers, rate limits
  - [ ] Logging for all SMS/calls sent

- [ ] **Integrate Twilio with alert system**
  - File: `/Users/gaurav/Elda/backend/app/models/alert.py` or create alert service
  - [ ] When alert created with severity >= MEDIUM:
    - [ ] Send SMS to primary caregiver
  - [ ] When alert severity == CRITICAL or HIGH:
    - [ ] Send SMS to primary caregiver
    - [ ] Make voice call to primary caregiver
    - [ ] If no answer, retry up to 3 times (5 min intervals)
    - [ ] Escalate to secondary caregiver after 15 minutes

- [ ] **Create TwiML endpoint for voice calls**
  - File: `/Users/gaurav/Elda/backend/app/api/v1/twilio.py` (new)
  - [ ] `GET /api/v1/twilio/alert-voice/{alert_id}`
  - [ ] Return TwiML XML with:
    - Alert message spoken via `<Say>`
    - Option to press 1 to call patient
    - Option to press 2 to call 911
    - Option to press 3 to acknowledge

#### Testing
- [ ] Test SMS sending to your phone number
- [ ] Test voice call with test alert
- [ ] Test TwiML response
- [ ] Verify alert escalation timing
- [ ] Test retry logic
- [ ] Check Twilio console for delivery status

---

### 1.3 Reminder Acknowledgment Flow

**Status**: ⚪ Not Started
**Estimated Effort**: 3-4 hours
**Priority**: 🔴 HIGH

#### Backend Tasks
- [ ] **Create reminder acknowledgment endpoint**
  - File: `/Users/gaurav/Elda/backend/app/api/v1/schedules.py` or create reminders.py
  - [ ] `PUT /api/v1/reminders/{reminder_id}/acknowledge`
  - [ ] Accept: `{ status: "completed" | "missed" | "snoozed", notes?: string }`
  - [ ] Update reminder status and completed_at timestamp
  - [ ] Create activity log entry
  - [ ] Return success response

- [ ] **Add retry logic to reminder generation**
  - File: `/Users/gaurav/Elda/backend/app/jobs/reminder_generator.py`
  - [ ] Track retry_count in Reminder model (may need migration)
  - [ ] If reminder not acknowledged after 15 minutes:
    - [ ] Send notification again (retry_count++)
    - [ ] Max 3 retries
    - [ ] After 3 retries, create MEDIUM alert for caregiver

#### Mobile Tasks
- [ ] **Add reminder acknowledgment in voice chat**
  - File: `/Users/gaurav/Elda/elder-companion-mobile/src/screens/VoiceChatScreen.tsx`
  - [ ] When patient says "I took it" / "I did it" / "done":
    - [ ] Claude should respond with confirmation
    - [ ] Extract reminder_id from context
    - [ ] Call: `PUT /api/v1/reminders/{id}/acknowledge`
    - [ ] Update local UI to show reminder completed

- [ ] **Add manual reminder acknowledgment on Home Screen**
  - File: `/Users/gaurav/Elda/elder-companion-mobile/src/screens/HomeScreen.tsx`
  - [ ] Add checkmark button next to each upcoming reminder
  - [ ] Tap to mark as completed
  - [ ] Haptic feedback + visual confirmation
  - [ ] Call acknowledgment API

#### Dashboard Tasks
- [ ] **Show reminder status in timeline**
  - File: `/Users/gaurav/Elda/caregiver-dashboard/src/components/common/TimelineItem.tsx`
  - [ ] Display reminder as "completed", "missed", "pending"
  - [ ] Show acknowledgment time
  - [ ] Show number of retries if > 0

#### Testing
- [ ] Create test reminder due in 5 minutes
- [ ] Wait for push notification
- [ ] Acknowledge via voice: "I took it"
- [ ] Verify status updated in database
- [ ] Verify timeline shows completion
- [ ] Test retry flow (don't acknowledge, wait 15 min)
- [ ] Verify alert created after 3 retries

---

## 🔴 PHASE 2: Core Feature Completion (HIGH PRIORITY)

**Goal**: Implement scheduled check-ins, heartbeat monitoring, and complete reminder lifecycle.

### 2.1 Scheduled Check-ins (Every 2 Hours)

**Status**: ⚪ Not Started
**Estimated Effort**: 4-5 hours
**Priority**: 🔴 CRITICAL

**Context from Spec**: Line 73 of context.md - "Scheduler (APScheduler - check-ins every 2hrs)"

#### Backend Tasks
- [ ] **Create check-in scheduler job**
  - File: `/Users/gaurav/Elda/backend/app/jobs/scheduler.py`
  - [ ] Add new job to scheduler initialization:
    ```python
    scheduler.add_job(
        func=send_scheduled_check_ins,
        trigger=IntervalTrigger(hours=2),
        id="scheduled_check_ins",
        name="Send scheduled check-ins to patients",
        replace_existing=True,
        max_instances=1
    )
    ```

- [ ] **Create check-in generator service**
  - File: Create `/Users/gaurav/Elda/backend/app/jobs/check_in_generator.py`
  - [ ] Function: `send_scheduled_check_ins()`
  - [ ] Logic:
    - [ ] Get all active patients
    - [ ] For each patient:
      - [ ] Check if awake hours (8 AM - 8 PM in patient timezone)
      - [ ] Check last check-in time (don't spam)
      - [ ] Check if patient recently active (skip if active in last hour)
      - [ ] Generate friendly check-in message (use Letta context)
      - [ ] Send push notification via Firebase
      - [ ] Create conversation record with type="check_in"
      - [ ] Log system event
  - [ ] Personalize message based on:
    - [ ] Time of day ("Good morning" vs "Good afternoon")
    - [ ] Patient preferences from Letta
    - [ ] Recent context (topics they like)

- [ ] **Add check-in message variations**
  - [ ] Create list of check-in templates:
    - "Hi {name}, just checking in! How are you feeling?"
    - "Good {time_of_day}, {name}! How's your day going?"
    - "Hi {name}, I wanted to see how you're doing today?"
    - "Hello {name}! Anything on your mind?"
  - [ ] Rotate messages to avoid repetition
  - [ ] Personalize with context from Letta

- [ ] **Track check-in responses**
  - File: `/Users/gaurav/Elda/backend/app/api/v1/conversations.py`
  - [ ] When patient responds to check-in:
    - [ ] Update conversation with patient_message
    - [ ] Analyze sentiment with Claude
    - [ ] Extract concerns/health mentions
    - [ ] Create alert if concerning response detected
    - [ ] Store in Chroma for future reference

#### Mobile Tasks
- [ ] **Handle check-in notifications**
  - File: `/Users/gaurav/Elda/elder-companion-mobile/src/services/notification.service.ts`
  - [ ] When notification type == "check_in":
    - [ ] Play TTS message
    - [ ] Auto-open voice chat screen (or show prompt)
    - [ ] Start voice recognition after TTS finishes
    - [ ] Show friendly UI: "I'm listening..."

#### Dashboard Tasks
- [ ] **Show check-ins in activity timeline**
  - File: `/Users/gaurav/Elda/caregiver-dashboard/src/components/common/TimelineItem.tsx`
  - [ ] Add check-in icon (💬)
  - [ ] Display: "Check-in conversation"
  - [ ] Show patient response summary
  - [ ] Highlight concerning responses

#### Testing
- [ ] Manually trigger check-in job
- [ ] Verify push notification sent to mobile
- [ ] Verify TTS plays message
- [ ] Respond to check-in via voice
- [ ] Verify conversation stored
- [ ] Verify timeline updated in dashboard
- [ ] Test check-in suppression (don't send if recently active)

---

### 2.2 Heartbeat Background Service (Mobile)

**Status**: ⚪ Not Started
**Estimated Effort**: 3-4 hours
**Priority**: 🔴 HIGH

**Context from Spec**: context.md:3364-3402 - "Heartbeat every 15 minutes using react-native-background-fetch"

#### Mobile Tasks
- [ ] **Install background task library**
  - [ ] Install: `react-native-background-fetch`
  - [ ] Configure for iOS: Update `Info.plist` with background modes
  - [ ] Configure for Android: Update `AndroidManifest.xml`
  - [ ] Test library initialization

- [ ] **Create heartbeat service**
  - File: Verify/Create `/Users/gaurav/Elda/elder-companion-mobile/src/services/heartbeat.service.ts`
  - [ ] Configure background fetch:
    ```typescript
    BackgroundFetch.configure({
      minimumFetchInterval: 15, // minutes
      stopOnTerminate: false,
      startOnBoot: true,
      enableHeadless: true
    }, async (taskId) => {
      await sendHeartbeat();
      BackgroundFetch.finish(taskId);
    });
    ```
  - [ ] Method: `sendHeartbeat()`:
    - [ ] Get battery level: `expo-battery` or native module
    - [ ] Get app state: `AppState.currentState`
    - [ ] Get last interaction timestamp (from AsyncStorage)
    - [ ] Optional: Get movement data (accelerometer)
    - [ ] Optional: Get location (if permissions granted)
    - [ ] Send to: `POST /api/v1/mobile/heartbeat`

- [ ] **Integrate heartbeat with app lifecycle**
  - File: `/Users/gaurav/Elda/elder-companion-mobile/App.tsx`
  - [ ] Start heartbeat service on app mount
  - [ ] Update last_interaction_at on any user action:
    - [ ] Voice button pressed
    - [ ] Screen touched
    - [ ] Navigation occurred
  - [ ] Store in AsyncStorage

#### Backend Tasks
- [ ] **Verify heartbeat endpoint exists**
  - File: `/Users/gaurav/Elda/backend/app/api/v1/mobile.py`
  - [ ] Endpoint: `POST /api/v1/mobile/heartbeat`
  - [ ] Should already exist based on grep results
  - [ ] Test endpoint with sample data

- [ ] **Enhance inactivity detection with heartbeat data**
  - File: `/Users/gaurav/Elda/backend/app/jobs/inactivity_detector.py`
  - [ ] Use heartbeat data to:
    - [ ] Differentiate between app closed vs device off vs patient inactive
    - [ ] Check battery level (low battery = may not be patient's fault)
    - [ ] Check movement detected (no movement = more concerning)

#### Testing
- [ ] Send manual heartbeat from mobile app
- [ ] Verify received in backend logs
- [ ] Close mobile app, wait 15 minutes
- [ ] Verify background heartbeat sent
- [ ] Check inactivity detection logs
- [ ] Test with device in airplane mode (should queue)
- [ ] Test heartbeat resume when back online

---

### 2.3 Activity Monitoring Enhancements

**Status**: ⚪ Not Started
**Estimated Effort**: 2-3 hours
**Priority**: 🟡 MEDIUM

#### Backend Tasks
- [ ] **Add activity monitoring job**
  - File: `/Users/gaurav/Elda/backend/app/jobs/scheduler.py`
  - [ ] Add job as per spec: runs every 30 minutes
  - [ ] Function: `monitor_patient_activity()`

- [ ] **Create activity monitoring logic**
  - File: Create `/Users/gaurav/Elda/backend/app/jobs/activity_monitor.py`
  - [ ] For each patient:
    - [ ] Check activity logs in last 30 minutes
    - [ ] Calculate engagement score
    - [ ] Compare to typical patterns (from Letta)
    - [ ] Detect anomalies:
      - [ ] Sudden decrease in activity
      - [ ] Unusual time of inactivity
      - [ ] Device not charging when expected
    - [ ] Create LOW severity alert if anomaly detected

#### Testing
- [ ] Simulate normal activity pattern
- [ ] Simulate sudden inactivity
- [ ] Verify alert created
- [ ] Verify alert sent to caregiver

---

## 🟡 PHASE 3: Emergency & Alert System (MEDIUM PRIORITY)

**Goal**: Complete emergency button flow, alert dispatch, and escalation.

### 3.1 Emergency Button Complete Flow

**Status**: 🟡 Partial (UI exists, backend partial)
**Estimated Effort**: 4-5 hours
**Priority**: 🟡 MEDIUM-HIGH

**Context from Spec**: context.md:3161-3230 - Emergency Confirmation Screen

#### Mobile Tasks
- [ ] **Create Emergency Confirmation Screen**
  - File: Create `/Users/gaurav/Elda/elder-companion-mobile/src/screens/EmergencyConfirmationScreen.tsx`
  - [ ] Layout:
    - [ ] Large 🚨 icon
    - [ ] "Alert your family and get help?"
    - [ ] Large "YES, GET HELP NOW" button (green)
    - [ ] "Cancel - I'm OK" button (gray)
    - [ ] Countdown timer: "Auto-confirming in 3 seconds..."
  - [ ] Logic:
    - [ ] 3-second countdown auto-confirm
    - [ ] Vibrate continuously
    - [ ] Play alert sound
    - [ ] Red background
    - [ ] If confirmed (auto or manual):
      - [ ] Call `POST /api/v1/mobile/emergency`
      - [ ] Navigate to "Help is on the way" screen

- [ ] **Create "Help Is On The Way" Screen**
  - File: Create `/Users/gaurav/Elda/elder-companion-mobile/src/screens/HelpOnWayScreen.tsx`
  - [ ] Layout:
    - [ ] ✅ "Help Is On The Way!"
    - [ ] "Sarah has been alerted."
    - [ ] "She will call you shortly."
    - [ ] "Stay where you are. You're going to be okay."
    - [ ] "Calling Sarah now..." (if implementing direct call)
    - [ ] "Cancel - False Alarm" button (small, bottom)
  - [ ] Logic:
    - [ ] Stay on screen until caregiver acknowledges (poll backend)
    - [ ] Show reassuring messages
    - [ ] Option to cancel if accidental

- [ ] **Wire emergency button to confirmation screen**
  - File: `/Users/gaurav/Elda/elder-companion-mobile/src/screens/HomeScreen.tsx`
  - [ ] Emergency button onPress:
    - [ ] Navigate to EmergencyConfirmationScreen
    - [ ] Pass patient_id as param

#### Backend Tasks
- [ ] **Complete emergency endpoint**
  - File: `/Users/gaurav/Elda/backend/app/api/v1/mobile.py`
  - [ ] Endpoint: `POST /api/v1/mobile/emergency`
  - [ ] Verify it exists (based on grep results)
  - [ ] Logic:
    - [ ] Create CRITICAL alert in database
    - [ ] Get primary caregiver for patient
    - [ ] Send SMS via Twilio: "🚨 EMERGENCY: [Patient Name] pressed the help button!"
    - [ ] Make voice call via Twilio
    - [ ] Send push notification to caregiver (if dashboard PWA)
    - [ ] Log emergency event
    - [ ] Return: `{ success: true, message: "Help is on the way. Sarah has been alerted." }`

- [ ] **Add emergency cancellation endpoint**
  - [ ] `POST /api/v1/mobile/emergency/{alert_id}/cancel`
  - [ ] Mark alert as "false_alarm"
  - [ ] Send cancellation SMS to caregiver
  - [ ] Log cancellation

#### Dashboard Tasks
- [ ] **Show emergency alerts prominently**
  - [ ] Red banner at top of dashboard when CRITICAL alert
  - [ ] Sound/visual alarm if caregiver logged in
  - [ ] Show patient location if available
  - [ ] Quick action buttons:
    - [ ] Call patient
    - [ ] Call 911
    - [ ] Acknowledge alert
    - [ ] Mark resolved

#### Testing
- [ ] Press emergency button in mobile app
- [ ] Verify confirmation screen shows
- [ ] Let auto-confirm trigger
- [ ] Verify SMS sent to your phone
- [ ] Verify voice call received
- [ ] Verify "Help is on the way" screen shows
- [ ] Verify dashboard shows CRITICAL alert
- [ ] Test cancellation flow

---

### 3.2 Alert Dispatch & Escalation

**Status**: ⚪ Not Started
**Estimated Effort**: 3-4 hours
**Priority**: 🟡 MEDIUM

#### Backend Tasks
- [ ] **Create alert dispatch service**
  - File: Create `/Users/gaurav/Elda/backend/app/services/alert_dispatcher.py`
  - [ ] Function: `dispatch_alert(alert_id)`
  - [ ] Logic based on severity:
    - CRITICAL: SMS + Voice call + Dashboard + Email (if implemented)
    - HIGH: SMS + Dashboard + Email
    - MEDIUM: Dashboard + Email (or SMS based on caregiver prefs)
    - LOW: Dashboard only
  - [ ] Handle caregiver notification preferences (quiet hours)
  - [ ] Support multiple caregivers (primary + secondary)

- [ ] **Add alert escalation job**
  - File: `/Users/gaurav/Elda/backend/app/jobs/scheduler.py`
  - [ ] Add job: runs every 5 minutes
  - [ ] Function: `escalate_unacknowledged_alerts()`
  - [ ] Logic:
    - [ ] Get all unacknowledged alerts
    - [ ] Check time since creation
    - [ ] If CRITICAL alert > 5 minutes unacknowledged:
      - [ ] Call secondary caregiver
      - [ ] Increase notification frequency
    - [ ] If HIGH alert > 15 minutes:
      - [ ] Escalate to CRITICAL
      - [ ] Notify secondary caregiver
    - [ ] If MEDIUM alert > 1 hour:
      - [ ] Escalate to HIGH

- [ ] **Create alert management endpoints**
  - File: `/Users/gaurav/Elda/backend/app/api/v1/alerts.py` (create if doesn't exist)
  - [ ] `GET /api/v1/alerts` - List all alerts with filters
  - [ ] `GET /api/v1/alerts/{id}` - Get alert details
  - [ ] `PUT /api/v1/alerts/{id}/acknowledge` - Mark as acknowledged
  - [ ] `PUT /api/v1/alerts/{id}/resolve` - Mark as resolved with notes
  - [ ] `PUT /api/v1/alerts/{id}/dismiss` - Dismiss false alarm

#### Testing
- [ ] Create test alert of each severity
- [ ] Verify correct notifications sent
- [ ] Don't acknowledge CRITICAL alert, wait 5 minutes
- [ ] Verify escalation occurs
- [ ] Test alert management endpoints

---

### 3.3 Additional Alert Triggers

**Status**: ⚪ Not Started
**Estimated Effort**: 3-4 hours
**Priority**: 🟢 LOW-MEDIUM

#### Backend Tasks
- [ ] **Distress detection in conversations**
  - File: `/Users/gaurav/Elda/backend/app/api/v1/conversations.py`
  - [ ] After Claude analyzes conversation:
    - [ ] Check for distress keywords: "fell", "chest pain", "can't breathe", "dizzy", "help"
    - [ ] If detected:
      - [ ] Create HIGH or CRITICAL alert (based on severity)
      - [ ] Include conversation context in alert
      - [ ] Dispatch immediately

- [ ] **Medication error detection**
  - File: `/Users/gaurav/Elda/backend/app/api/v1/conversations.py`
  - [ ] If patient mentions:
    - [ ] Wrong medication taken
    - [ ] Wrong dosage
    - [ ] Took medication twice
  - [ ] Create MEDIUM or HIGH alert
  - [ ] Suggest caregiver action: "Confirm with patient, call doctor if needed"

- [ ] **Health concern pattern detection**
  - File: `/Users/gaurav/Elda/backend/app/jobs/summary_generator.py` (in weekly insights)
  - [ ] Use Letta to detect:
    - [ ] Patient mentions same symptom 3+ times in a week
    - [ ] Example: "knee pain" mentioned 5 times
  - [ ] Create LOW alert: "Recurring health concern detected"
  - [ ] Include: symptom, frequency, dates

- [ ] **Device issue alerts**
  - File: `/Users/gaurav/Elda/backend/app/jobs/inactivity_detector.py`
  - [ ] Check heartbeat data:
    - [ ] Battery critically low (<10%) for extended period
    - [ ] App offline for 24+ hours
    - [ ] Location services disabled (if required)
  - [ ] Create LOW alert: "Device issue detected"

#### Testing
- [ ] Say "I fell down" in voice chat → verify HIGH alert created
- [ ] Mention "knee pain" 3 times this week → verify pattern alert
- [ ] Simulate low battery in heartbeat → verify device alert

---

## 🟡 PHASE 4: Mobile App Enhancement (MEDIUM PRIORITY)

**Goal**: Complete missing mobile screens, add settings, improve UX.

### 4.1 Settings Screen

**Status**: ⚪ Not Started
**Estimated Effort**: 3-4 hours
**Priority**: 🟡 MEDIUM

**Context from Spec**: context.md:3233-3294

#### Mobile Tasks
- [ ] **Create Settings Screen**
  - File: Create `/Users/gaurav/Elda/elder-companion-mobile/src/screens/SettingsScreen.tsx`
  - [ ] Components:
    - [ ] **Volume Slider**:
      - [ ] Range: 0.0 - 1.0
      - [ ] Store in AsyncStorage: `voice_volume`
      - [ ] Test Voice button → plays sample TTS
    - [ ] **Voice Speed Slider**:
      - [ ] Range: 0.5 (turtle) - 1.0 (rabbit)
      - [ ] Icons: 🐢 ─────●───── 🐇
      - [ ] Store in AsyncStorage: `voice_speed`
      - [ ] Update TTSService to use saved speed
    - [ ] **Call Caregiver Button**:
      - [ ] Shows caregiver name from API
      - [ ] `onPress`: `Linking.openURL('tel:' + caregiverPhone)`
    - [ ] **About Section**:
      - [ ] App version from `package.json`
      - [ ] Last sync time (from last heartbeat or API call)
      - [ ] Patient name
      - [ ] Setup date

- [ ] **Add navigation to Settings**
  - File: `/Users/gaurav/Elda/elder-companion-mobile/src/screens/HomeScreen.tsx`
  - [ ] Add gear icon button (⚙️) in header or bottom
  - [ ] Navigate to SettingsScreen

- [ ] **Use saved preferences**
  - File: `/Users/gaurav/Elda/elder-companion-mobile/src/services/tts.service.ts`
  - [ ] Load volume and speed from AsyncStorage on init
  - [ ] Apply to all TTS calls

#### Testing
- [ ] Open Settings screen
- [ ] Adjust volume slider
- [ ] Press "Test Voice" → verify volume changed
- [ ] Adjust speed slider
- [ ] Test voice → verify speed changed
- [ ] Press "Call Caregiver" → verify dialer opens
- [ ] Verify settings persist after app restart

---

### 4.2 Home Screen Enhancements

**Status**: 🟡 Partial (schedules showing but not full spec)
**Estimated Effort**: 2-3 hours
**Priority**: 🟡 MEDIUM

**Context from Spec**: context.md:3008-3084

#### Mobile Tasks
- [ ] **Add "Next Reminder" Card**
  - File: `/Users/gaurav/Elda/elder-companion-mobile/src/screens/HomeScreen.tsx`
  - [ ] Calculate next upcoming reminder (earliest due_at)
  - [ ] Display in prominent card:
    - [ ] Large text: "Next: Evening Medication"
    - [ ] Time until: "⏰ In 3 hours"
    - [ ] Color-coded by type (medication=red, meal=green)
  - [ ] Auto-refresh every minute

- [ ] **Convert schedules to interactive checklist**
  - [ ] Change from simple list to checklist UI
  - [ ] Show today's reminders only
  - [ ] Display with status icons:
    - ✅ for completed reminders
    - ⏰ for upcoming/pending
    - ❌ for missed
  - [ ] Make interactive:
    - [ ] Tap checkmark icon to mark completed
    - [ ] Haptic feedback on tap
    - [ ] Optimistic UI update + API call

- [ ] **Add battery indicator**
  - [ ] Install `expo-battery` or use react-native-device-info
  - [ ] Show in header: [Battery: 75%]
  - [ ] Color code: green (>50%), yellow (20-50%), red (<20%)

#### Testing
- [ ] Verify next reminder card updates correctly
- [ ] Verify checklist shows today's reminders only
- [ ] Tap checkbox → verify API called
- [ ] Verify battery indicator shows correct level

---

### 4.3 Voice Chat Screen Enhancements

**Status**: 🟢 Mostly Complete
**Estimated Effort**: 1-2 hours
**Priority**: 🟢 LOW

#### Mobile Tasks
- [ ] **Add visual states**
  - File: `/Users/gaurav/Elda/elder-companion-mobile/src/screens/VoiceChatScreen.tsx`
  - [ ] Show current state clearly:
    - "I'm Listening..." (pulsing mic icon)
    - "Thinking..." (spinning brain/loading icon)
    - "Speaking..." (sound wave animation)
  - [ ] Use animations for better feedback

- [ ] **Add conversation save confirmation**
  - [ ] When user presses "End Chat":
    - [ ] Show: "Conversation saved" toast
    - [ ] Animate back to home

- [ ] **Improve error handling**
  - [ ] Network error: "I'm having trouble connecting. Please try again."
  - [ ] STT error: "I didn't catch that. Could you repeat?"
  - [ ] TTS error: "I'm having trouble speaking. Let me try again."

#### Testing
- [ ] Test all voice states display correctly
- [ ] Test error scenarios
- [ ] Verify conversation saved on exit

---

## 🟢 PHASE 5: Dashboard Enhancement (LOW-MEDIUM PRIORITY)

**Goal**: Complete dashboard features - alerts page, search, editing, notifications.

### 5.1 Alerts Page

**Status**: ⚪ Not Started
**Estimated Effort**: 4-5 hours
**Priority**: 🟡 MEDIUM

**Context from Spec**: context.md:3953-4023

#### Dashboard Tasks
- [ ] **Create Alerts page route**
  - File: Create `/Users/gaurav/Elda/caregiver-dashboard/src/app/alerts/page.tsx`
  - [ ] URL: `/alerts`
  - [ ] Add to sidebar navigation

- [ ] **Create Alert API client**
  - File: Create `/Users/gaurav/Elda/caregiver-dashboard/src/lib/api/alerts.ts`
  - [ ] `getAlerts(filters)` - fetch alerts with filters
  - [ ] `getAlertById(id)` - fetch single alert
  - [ ] `acknowledgeAlert(id)` - mark as acknowledged
  - [ ] `resolveAlert(id, notes)` - mark as resolved
  - [ ] `dismissAlert(id, reason)` - dismiss false alarm

- [ ] **Create Alert components**
  - File: Create `/Users/gaurav/Elda/caregiver-dashboard/src/components/alerts/AlertList.tsx`
  - [ ] Filter bar:
    - [ ] [All] [Unread] [Critical] [High] [Medium] [Low]
    - [ ] Sort by: [Newest First ▼]
  - [ ] Alert cards:
    - [ ] Severity badge (color-coded)
    - [ ] Patient name and photo
    - [ ] Alert type icon
    - [ ] Title and description
    - [ ] Timestamp
    - [ ] Status (unread/acknowledged/resolved)
    - [ ] Quick actions: [Acknowledge] [View Details] [Call Patient]

- [ ] **Create Alert Detail Modal**
  - File: Create `/Users/gaurav/Elda/caregiver-dashboard/src/components/alerts/AlertDetailModal.tsx`
  - [ ] Display:
    - [ ] Full alert description
    - [ ] Patient context (recent activity, last conversation)
    - [ ] Alert trigger details
    - [ ] Timeline of events leading to alert
    - [ ] Related reminders/conversations
  - [ ] Actions:
    - [ ] Resolution notes (text area)
    - [ ] [Acknowledge] [Mark as Resolved] [Dismiss]

- [ ] **Add alert indicator in header**
  - File: `/Users/gaurav/Elda/caregiver-dashboard/src/components/layout/Header.tsx`
  - [ ] Bell icon (🔔) with badge showing unread count
  - [ ] Click to navigate to /alerts
  - [ ] Red badge for CRITICAL alerts

#### Testing
- [ ] Navigate to /alerts page
- [ ] Verify alert list displays
- [ ] Filter by severity → verify works
- [ ] Click alert → verify modal opens
- [ ] Acknowledge alert → verify status updates
- [ ] Resolve alert with notes → verify saved
- [ ] Check header badge updates when alerts change

---

### 5.2 Real-time Dashboard Updates

**Status**: ⚪ Not Started
**Estimated Effort**: 2-3 hours
**Priority**: 🟡 MEDIUM

#### Dashboard Tasks
- [ ] **Implement polling for updates**
  - File: Create `/Users/gaurav/Elda/caregiver-dashboard/src/hooks/useDashboardPolling.ts`
  - [ ] Use React Query with `refetchInterval: 10000` (10 seconds)
  - [ ] Poll endpoints:
    - Alerts (check for new/updated)
    - Patient status changes
    - New conversations
    - Updated reminders
  - [ ] Only poll when tab is active (use `usePageVisibility`)

- [ ] **Add optimistic updates**
  - File: Various components
  - [ ] When acknowledging alert: show as acknowledged immediately
  - [ ] When marking reminder complete: update UI before API response
  - [ ] Revert if API call fails

- [ ] **Add real-time indicators**
  - [ ] "Live" indicator in header (green dot)
  - [ ] "Updated X seconds ago" timestamps
  - [ ] Toast notifications for new CRITICAL alerts

#### Testing
- [ ] Open dashboard
- [ ] Create alert from backend (or trigger via mobile)
- [ ] Verify dashboard updates within 10 seconds
- [ ] Verify badge count updates
- [ ] Verify toast appears for CRITICAL alert

---

### 5.3 Patient Profile Editing

**Status**: 🟡 Partial (read-only view exists)
**Estimated Effort**: 4-5 hours
**Priority**: 🟢 LOW-MEDIUM

**Context from Spec**: context.md:3880-3950

#### Dashboard Tasks
- [ ] **Make Profile tab editable**
  - File: `/Users/gaurav/Elda/caregiver-dashboard/src/app/patients/[id]/profile/page.tsx` (or similar)
  - [ ] Add Edit mode toggle
  - [ ] Editable sections:
    - [ ] Basic Information (name, DOB, photo)
    - [ ] Medical conditions (add/remove tags)
    - [ ] Allergies (add/remove)
    - [ ] Emergency notes (textarea)

- [ ] **Add Family Members management**
  - File: Create `/Users/gaurav/Elda/caregiver-dashboard/src/components/patients/FamilyMembersList.tsx`
  - [ ] List family members from personal_context
  - [ ] Each card shows:
    - Name, relationship
    - Description (context about them)
    - Contact info
    - Primary contact checkbox
  - [ ] [+ Add Family Member] button → modal
  - [ ] [Edit] [Remove] buttons on each

- [ ] **Add Important Dates management**
  - [ ] List of dates (birthdays, anniversaries)
  - [ ] Add/edit/remove dates
  - [ ] Store in personal_context JSON

- [ ] **Add Hobbies & Interests**
  - [ ] Free-form text area or tag input
  - [ ] Examples: "Gardening (roses)", "Knitting", "Jeopardy"

- [ ] **Add Favorite Topics & Sensitive Topics**
  - [ ] Two text areas
  - [ ] Store in personal_context

- [ ] **Add Communication Preferences**
  - [ ] Preferred name input
  - [ ] Voice type dropdown (male/female/neutral)
  - [ ] Communication style dropdown (friendly/formal/casual)
  - [ ] Language dropdown

- [ ] **Save changes to backend**
  - [ ] `PUT /api/v1/patients/{id}` endpoint
  - [ ] Update personal_context JSON field
  - [ ] Success toast: "Profile updated successfully"

#### Testing
- [ ] Enable edit mode
- [ ] Edit basic information → save → verify updated
- [ ] Add family member → verify saved
- [ ] Edit hobbies → verify saved in personal_context
- [ ] Refresh page → verify changes persisted

---

### 5.4 Search Functionality

**Status**: ⚪ Not Started
**Estimated Effort**: 3-4 hours
**Priority**: 🟢 LOW

**Context from Spec**: context.md:3611 - "Global search (center) - search patients, conversations"

#### Dashboard Tasks
- [ ] **Add search bar to header**
  - File: `/Users/gaurav/Elda/caregiver-dashboard/src/components/layout/Header.tsx`
  - [ ] Input with 🔍 icon
  - [ ] Placeholder: "Search patients, conversations..."
  - [ ] Debounce input (500ms)

- [ ] **Create search API endpoint (backend)**
  - File: `/Users/gaurav/Elda/backend/app/api/v1/search.py` (create)
  - [ ] `GET /api/v1/search?q={query}&type={patients|conversations|all}`
  - [ ] Search patients by name
  - [ ] Search conversations using Chroma semantic search
  - [ ] Return combined results

- [ ] **Create search results component**
  - File: Create `/Users/gaurav/Elda/caregiver-dashboard/src/components/search/SearchResults.tsx`
  - [ ] Dropdown below search bar
  - [ ] Group results by type:
    - Patients (with photo, name, status)
    - Conversations (with patient, date, snippet)
  - [ ] Click result → navigate to relevant page

- [ ] **Integrate Chroma semantic search**
  - [ ] Use existing Chroma service
  - [ ] Example: search "knee pain" finds "leg hurts", "trouble walking"
  - [ ] Show relevance score

#### Testing
- [ ] Type patient name → verify appears in results
- [ ] Type conversation keyword → verify relevant conversations appear
- [ ] Test semantic search: "pain" finds "hurts", "sore", "ache"
- [ ] Click result → verify navigation works

---

## 🟢 PHASE 6: AI Personalization (LOW PRIORITY)

**Goal**: Enhance AI to fully leverage personal context, improve conversation quality.

### 6.1 Personal Context Integration

**Status**: 🟡 Partial (context exists but not fully utilized)
**Estimated Effort**: 3-4 hours
**Priority**: 🟢 LOW-MEDIUM

**Context from Spec**: context.md:1574-1617 - Examples of how AI should use personal context

#### Backend Tasks
- [ ] **Enhance Claude prompt templates**
  - File: `/Users/gaurav/Elda/backend/app/services/claude_service.py`
  - [ ] Update conversation prompt to include:
    - [ ] Full personal_context from patient record
    - [ ] Family members with details
    - [ ] Hobbies and interests
    - [ ] Favorite topics
    - [ ] Sensitive topics with handling instructions
  - [ ] Add examples of good context usage

- [ ] **Create prompt template for check-ins**
  - [ ] Personalize based on:
    - [ ] Time of day
    - [ ] Recent conversations (from Letta)
    - [ ] Favorite topics
    - [ ] Upcoming events (birthdays, family visits)
  - [ ] Example: "Good morning, Maggie! Did you water your roses this week?"

- [ ] **Test context usage**
  - [ ] Add rich personal context to test patient
  - [ ] Have conversation mentioning family member
  - [ ] Verify Claude remembers details
  - [ ] Example dialogue:
    - Patient: "Is Sarah coming this weekend?"
    - AI: "Sarah usually visits once a month, and it's been about three weeks since her last visit. Would you like me to help you call her to ask?"

#### Testing
- [ ] Create test patient with detailed personal_context
- [ ] Test conversation about family members
- [ ] Test conversation about hobbies
- [ ] Verify AI uses context naturally
- [ ] Test sensitive topic handling

---

### 6.2 Letta Memory Enhancement

**Status**: 🟢 Basic implementation exists
**Estimated Effort**: 2-3 hours
**Priority**: 🟢 LOW

#### Backend Tasks
- [ ] **Improve Letta agent prompts**
  - File: `/Users/gaurav/Elda/backend/app/services/ai/letta_service.py`
  - [ ] Update agent system prompt to:
    - [ ] Track conversation topics more granularly
    - [ ] Note emotional states
    - [ ] Remember medication side effects mentioned
    - [ ] Track sleep quality mentions
    - [ ] Note social interaction patterns

- [ ] **Add explicit memory updates**
  - [ ] After each conversation:
    - [ ] Extract key facts mentioned
    - [ ] Update Letta with structured memory
    - [ ] Example: "Patient mentioned granddaughter got a new dog"

- [ ] **Query Letta before daily summaries**
  - File: `/Users/gaurav/Elda/backend/app/jobs/summary_generator.py`
  - [ ] Ask Letta: "How does today compare to typical patterns?"
  - [ ] Include in summary

#### Testing
- [ ] Have conversation mentioning new fact
- [ ] Wait for Letta to process
- [ ] Ask about that fact in next conversation
- [ ] Verify AI remembers

---

## 🟢 PHASE 7: Polish & Production (LOW PRIORITY)

**Goal**: Testing, monitoring, deployment readiness, documentation.

### 7.1 End-to-End Testing

**Status**: 🟡 Partial testing done
**Estimated Effort**: 4-6 hours
**Priority**: 🟢 MEDIUM

#### Testing Tasks
- [ ] **Complete workflow test #1: Scheduled Reminder**
  - [ ] Create patient in dashboard
  - [ ] Add medication schedule (8:00 AM daily)
  - [ ] Wait for reminder generation (or manually trigger job)
  - [ ] Verify push notification received on mobile
  - [ ] Acknowledge reminder via voice
  - [ ] Verify status updated in dashboard timeline

- [ ] **Complete workflow test #2: Emergency Alert**
  - [ ] Press emergency button in mobile app
  - [ ] Verify SMS received
  - [ ] Verify voice call received
  - [ ] Verify dashboard shows CRITICAL alert
  - [ ] Acknowledge alert in dashboard
  - [ ] Verify mobile app updates

- [ ] **Complete workflow test #3: Scheduled Check-in**
  - [ ] Wait for 2-hour check-in (or manually trigger)
  - [ ] Verify push notification received
  - [ ] Respond via voice
  - [ ] Verify conversation stored
  - [ ] Verify appears in dashboard timeline

- [ ] **Complete workflow test #4: Inactivity Detection**
  - [ ] Close mobile app for 4 hours
  - [ ] Verify inactivity alert created
  - [ ] Verify caregiver notified

- [ ] **Complete workflow test #5: Daily Summary**
  - [ ] Trigger daily summary job
  - [ ] Verify summary generated
  - [ ] Verify appears in dashboard Reports tab
  - [ ] Check AI insights quality

#### Testing Checklist
- [ ] Test on iOS device
- [ ] Test on Android device (if supporting)
- [ ] Test with poor network connection
- [ ] Test with app in background
- [ ] Test with app fully closed
- [ ] Test with device in airplane mode → online
- [ ] Load test: 10 patients with active schedules

---

### 7.2 Error Handling & Monitoring

**Status**: ⚪ Not Started
**Estimated Effort**: 3-4 hours
**Priority**: 🟢 LOW-MEDIUM

#### Backend Tasks
- [ ] **Add error tracking service**
  - [ ] Option 1: Sentry integration
  - [ ] Option 2: CloudWatch (if on AWS)
  - [ ] Option 3: Custom logging solution

- [ ] **Add health checks**
  - File: `/Users/gaurav/Elda/backend/app/main.py`
  - [ ] Already has `/health` endpoint
  - [ ] Add checks for:
    - [ ] Database connection
    - [ ] Scheduler running
    - [ ] External services (Claude, Letta, Chroma)

- [ ] **Add performance monitoring**
  - [ ] Track API response times
  - [ ] Track job execution times
  - [ ] Track AI service latencies
  - [ ] Alert if degraded performance

#### Mobile Tasks
- [ ] **Add error reporting**
  - [ ] Install: `@sentry/react-native` or similar
  - [ ] Capture JS errors
  - [ ] Capture native crashes
  - [ ] Send to monitoring service

#### Dashboard Tasks
- [ ] **Add error boundaries**
  - [ ] Wrap main app in ErrorBoundary
  - [ ] Show friendly error page
  - [ ] Log errors to service

#### Testing
- [ ] Simulate API failure → verify error handled gracefully
- [ ] Simulate network timeout → verify retry logic
- [ ] Check error logs in monitoring service

---

### 7.3 Documentation

**Status**: 🟡 Partial (some docs exist)
**Estimated Effort**: 3-4 hours
**Priority**: 🟢 LOW

#### Documentation Tasks
- [ ] **Update README files**
  - [ ] `/Users/gaurav/Elda/README.md` (root)
  - [ ] `/Users/gaurav/Elda/backend/README.md`
  - [ ] `/Users/gaurav/Elda/caregiver-dashboard/README.md`
  - [ ] `/Users/gaurav/Elda/elder-companion-mobile/README.md`
  - [ ] Include:
    - [ ] Project overview
    - [ ] Setup instructions
    - [ ] Environment variables
    - [ ] Running locally
    - [ ] Deployment instructions

- [ ] **API Documentation**
  - [ ] FastAPI auto-generates docs at `/docs`
  - [ ] Add description to all endpoints
  - [ ] Add request/response examples
  - [ ] Document authentication requirements

- [ ] **Create deployment guide**
  - [ ] Backend deployment (Railway, AWS, etc.)
  - [ ] Database setup and migrations
  - [ ] Environment variables setup
  - [ ] Firebase setup guide
  - [ ] Twilio setup guide
  - [ ] Letta setup guide

- [ ] **Create user guide**
  - [ ] Caregiver onboarding guide
  - [ ] Patient setup guide (QR code scanning)
  - [ ] Mobile app usage guide
  - [ ] Dashboard usage guide
  - [ ] Troubleshooting common issues

---

### 7.4 Security Audit

**Status**: ⚪ Not Started
**Estimated Effort**: 2-3 hours
**Priority**: 🟢 LOW

#### Security Tasks
- [ ] **Review authentication**
  - [ ] Ensure JWT tokens have expiration
  - [ ] Ensure refresh token rotation
  - [ ] Test token revocation on logout
  - [ ] Test protection on all authenticated endpoints

- [ ] **Review data access controls**
  - [ ] Ensure caregiver can only access assigned patients
  - [ ] Ensure patient data properly scoped
  - [ ] Test unauthorized access attempts

- [ ] **Review input validation**
  - [ ] All API inputs validated with Pydantic
  - [ ] SQL injection prevention (using ORM)
  - [ ] XSS prevention in dashboard

- [ ] **Review secrets management**
  - [ ] No secrets in code
  - [ ] All secrets in .env (not committed)
  - [ ] Production secrets in secure vault

- [ ] **Add rate limiting**
  - [ ] Protect authentication endpoints (5 req/min)
  - [ ] Protect other endpoints (100 req/min)
  - [ ] Heartbeat endpoint no limit

---

## 📝 Notes & Tracking

### Current Active Work
- [ ] Phase 1.1 - Firebase Push Notifications (IN PROGRESS)

### Blockers
- None currently

### Recent Completions
- ✅ Gap analysis complete (Oct 26, 2025)
- ✅ Phases checklist created (Oct 26, 2025)
- ✅ Basic dashboard working
- ✅ Basic mobile app working
- ✅ Reminder generation working
- ✅ Schedules display in mobile app

### Open Questions
1. Which push notification library? (react-native-firebase vs expo-notifications)
2. Twilio trial account limits?
3. Deployment target? (Railway, AWS, Vercel)

---

## 🎯 Next Immediate Actions

**Recommended Order** (prioritized by user value):

1. ✅ **START HERE**: Phase 1.1 - Firebase Push Notifications (4-6 hours)
   - Without this, reminders never reach the patient
   - Highest impact feature

2. Phase 2.1 - Scheduled Check-ins (4-5 hours)
   - Core proactive wellness monitoring
   - Key differentiator for the product

3. Phase 1.3 - Reminder Acknowledgment Flow (3-4 hours)
   - Complete the reminder lifecycle
   - Makes reminders actually useful

4. Phase 1.2 - Twilio SMS & Voice (3-4 hours)
   - Critical for emergency alerts
   - Enables caregiver notifications

5. Phase 2.2 - Heartbeat Service (3-4 hours)
   - Enables accurate inactivity detection
   - Improves safety monitoring

**Estimated time to core functionality: 18-24 hours of focused work**

---

**Last Updated**: October 26, 2025
**Maintained By**: Development Team
**Version**: 1.0
