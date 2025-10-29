# Local Notification-Based Retry System

**Proactive Voice Check-ins WITHOUT Apple Developer Account or Firebase**

---

## Table of Contents
1. [Overview](#overview)
2. [The Problem](#the-problem)
3. [The Solution](#the-solution)
4. [How It Works](#how-it-works)
5. [Architecture](#architecture)
6. [Testing Guide](#testing-guide)
7. [Files Modified](#files-modified)
8. [API Reference](#api-reference)
9. [Troubleshooting](#troubleshooting)

---

## Overview

This system implements **proactive voice check-ins for medication reminders** using only local iOS notifications via `@notifee/react-native`. It does NOT require:
- ❌ Apple Developer account ($99/year)
- ❌ Firebase Cloud Messaging setup
- ❌ APNs certificates
- ❌ Push notification tokens

**What it DOES provide:**
- ✅ Automatic retry notifications at 15, 20, 25 minutes after initial reminder
- ✅ Voice check-in mode: retry notifications auto-open VoiceChat
- ✅ AI speaks first: "Hi! I noticed you haven't responded..."
- ✅ Automatic cancellation of retries when reminder completed
- ✅ 100% reliable timing (scheduled locally on device)

---

## The Problem

**Original Plan (Phase 2):**
- Backend detects "no response after 15 minutes"
- Backend pushes notification to device via Firebase Cloud Messaging
- **Requires Apple Developer account** for APNs setup

**Why Firebase Doesn't Work Without Apple Developer Account:**
- Firebase Cloud Messaging (FCM) requires APNs authentication
- APNs requires Apple Developer account to generate certificates
- Without it, Firebase cannot send push notifications to iOS devices

---

## The Solution

**Pre-Scheduled Local Retry Notifications:**

Instead of backend pushing retries, the **mobile app pre-schedules multiple local notifications** when it fetches a reminder:

```
User opens app
    ↓
App fetches reminders from backend
    ↓
For each reminder, app schedules 4 local notifications:
    - Notification 1: At due time (e.g., 9:00 AM)
    - Notification 2: 15 min later (9:15 AM) ← with voice_check_in flag
    - Notification 3: 20 min later (9:20 AM) ← with voice_check_in flag
    - Notification 4: 25 min later (9:25 AM) ← with voice_check_in flag
    ↓
User completes reminder?
    ├─ YES → Cancel all pending retry notifications
    └─ NO  → Retry notifications fire on schedule
```

**Key Insight:** We schedule ALL notifications upfront. If user responds early, we just cancel the future ones. This eliminates the need for backend push notifications entirely!

---

## How It Works

### 1. Reminder Creation
Backend creates a reminder as usual:
```python
reminder = Reminder(
    patient_id=patient_id,
    title="Take medication",
    message="Take your blood pressure medication",
    due_at=datetime.utcnow() + timedelta(minutes=2),
    status="pending"
)
```

### 2. App Fetches Reminder
Mobile app fetches reminders on startup and periodically:
```typescript
const reminders = await apiService.getReminders(patientId);
```

### 3. App Schedules Multiple Notifications
For each reminder, app schedules 4 notifications (1 initial + 3 retries):

```typescript
await localNotificationService.scheduleReminderWithRetries({
  id: reminder.id,
  title: "Take medication",
  body: "Take your blood pressure medication",
  scheduledTime: new Date(reminder.due_at),
  reminderId: reminder.id,
  reminderType: "medication",
  speakText: "Time to take your blood pressure medication",
  requiresResponse: true,
});
```

This creates:
- `reminder.id` → Initial notification at 9:00 AM
- `reminder.id_retry1` → Retry notification at 9:15 AM (with `voice_check_in: true`)
- `reminder.id_retry2` → Retry notification at 9:20 AM (with `voice_check_in: true`)
- `reminder.id_retry3` → Retry notification at 9:25 AM (with `voice_check_in: true`)

### 4. User Interaction

**Scenario A: User Completes Reminder Early**
```
9:05 AM - User taps checkmark in app
    ↓
App calls API to mark reminder as completed
    ↓
App cancels all pending retry notifications
    ↓
Result: Retry notifications at 9:15, 9:20, 9:25 never fire ✅
```

**Scenario B: User Ignores Initial Notification**
```
9:00 AM - Initial notification fires
    ↓
User ignores it
    ↓
9:15 AM - Retry 1 notification fires
    ↓
User taps retry notification
    ↓
App detects voice_check_in flag
    ↓
App auto-opens VoiceChat with autoStart=true
    ↓
AI speaks first: "Hi! I noticed you haven't responded..."
    ↓
Microphone starts listening automatically
    ↓
User responds: "I took it"
    ↓
App marks reminder as completed
    ↓
App cancels remaining retry notifications (9:20, 9:25) ✅
```

---

## Architecture

### Component Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Mobile App (iOS)                     │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │            HomeScreen Component                   │ │
│  │                                                   │ │
│  │  - Fetches reminders from backend                │ │
│  │  - Calls scheduleReminderWithRetries()           │ │
│  │  - Handles checkmark tap → cancelReminderNotifs  │ │
│  └───────────────────────────────────────────────────┘ │
│                         ↓                               │
│  ┌───────────────────────────────────────────────────┐ │
│  │      LocalNotificationService                     │ │
│  │                                                   │ │
│  │  scheduleReminderWithRetries():                  │ │
│  │    - Schedule initial notification               │ │
│  │    - Schedule retry at +15 min (voice_check_in)  │ │
│  │    - Schedule retry at +20 min (voice_check_in)  │ │
│  │    - Schedule retry at +25 min (voice_check_in)  │ │
│  │                                                   │ │
│  │  cancelReminderNotifications():                  │ │
│  │    - Cancel initial notification                 │ │
│  │    - Cancel all 3 retry notifications            │ │
│  │                                                   │ │
│  │  handleNotificationPress():                      │ │
│  │    - Detect voice_check_in flag                  │ │
│  │    - Navigate to VoiceChat with autoStart=true   │ │
│  └───────────────────────────────────────────────────┘ │
│                         ↓                               │
│  ┌───────────────────────────────────────────────────┐ │
│  │        @notifee/react-native Library              │ │
│  │                                                   │ │
│  │  - Schedules local iOS notifications             │ │
│  │  - Fires at exact scheduled times                │ │
│  │  - No backend/network required                   │ │
│  └───────────────────────────────────────────────────┘ │
│                         ↓                               │
│  ┌───────────────────────────────────────────────────┐ │
│  │           iOS Notification System                 │ │
│  │                                                   │ │
│  │  - Stores scheduled notifications                │ │
│  │  - Triggers at scheduled times                   │ │
│  │  - Works even when app is closed                 │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

**Notification Data Structure:**
```typescript
{
  id: "reminder_id" or "reminder_id_retry1",
  title: "Take medication",
  body: "Take your blood pressure medication",
  data: {
    reminder_id: "uuid-here",
    reminder_type: "medication",
    speak_text: "Time to take your medication",
    requires_response: "true",
    voice_check_in: "false" | "true"  // ← Key flag!
  }
}
```

When `voice_check_in: "true"`:
- Notification press handler detects the flag
- Navigates to VoiceChat with `{ reminderId, autoStart: true }`
- VoiceChat detects `autoStart` and AI speaks first
- Mic starts listening automatically

---

## Testing Guide

### Quick Test (2 minutes)

**Step 1: Create Test Reminder**
```bash
cd /Users/gaurav/Elda/backend
source venv/bin/activate
python3 create_local_notif_test_reminder.py
```

Output will show:
```
✅ LOCAL NOTIFICATION test reminder created successfully!
📋 Reminder Details:
   Due at: 2025-10-26 13:19:58 UTC
   Local time: 06:19:58 AM

📱 TESTING INSTRUCTIONS:
   Notifications scheduled at:
   - Initial: 06:19 AM
   - Retry 1: 06:34 AM (with voice check-in)
   - Retry 2: 06:39 AM (with voice check-in)
   - Retry 3: 06:44 AM (with voice check-in)
```

**Step 2: Open Mobile App**
- Open the app on your iPhone
- App automatically fetches the reminder
- Watch logs for: `✅ Scheduled notification with retries`

**Step 3: Wait for Notification**
- Initial notification fires at scheduled time
- **Don't tap it** (we want to test retries)

**Step 4: Wait for Retry Notification**
- 15 minutes later, retry notification fires
- Tap the retry notification
- **Expected behavior:**
  1. App opens to VoiceChat screen
  2. AI speaks: "Hi! I noticed you haven't responded to a reminder. Did you take your medication?"
  3. Mic starts listening automatically

**Step 5: Respond**
- Say "I took it" or "yes"
- App marks reminder as completed
- **Check:** Remaining retry notifications (at +20, +25 min) should be cancelled

### Full Test Scenarios

#### Test 1: Early Completion
1. Create test reminder
2. Open app (schedules 4 notifications)
3. **Immediately** tap checkmark to complete
4. Wait 15, 20, 25 minutes
5. **Expected:** No retry notifications fire (all were cancelled)

#### Test 2: Retry Notification Opens VoiceChat
1. Create test reminder
2. Open app
3. Ignore initial notification
4. Wait for retry notification (+15 min)
5. Tap retry notification
6. **Expected:** VoiceChat opens, AI speaks first, mic listening

#### Test 3: Multiple Retries
1. Create test reminder
2. Open app
3. Ignore initial notification
4. Ignore retry 1 (+15 min)
5. Ignore retry 2 (+20 min)
6. Tap retry 3 (+25 min)
7. **Expected:** VoiceChat opens with AI speaking

---

## Files Modified

### 1. `/elder-companion-mobile/src/services/local-notification.service.ts`

**New Interface Field:**
```typescript
export interface ReminderNotification {
  // ... existing fields ...
  voiceCheckIn?: boolean; // NEW: Flag for retry notifications
}
```

**New Methods:**
```typescript
// Schedule initial + 3 retry notifications
async scheduleReminderWithRetries(notification: ReminderNotification): Promise<string[]>

// Cancel all notifications for a reminder (including retries)
async cancelReminderNotifications(baseReminderId: string): Promise<void>
```

**Updated Methods:**
```typescript
// Now includes voice_check_in flag in notification data
async scheduleReminder(notification: ReminderNotification): Promise<string>

// Now detects voice_check_in and navigates to VoiceChat
private async handleNotificationPress(detail: any): Promise<void>
```

**Key Implementation:**
```typescript
async scheduleReminderWithRetries(notification: ReminderNotification): Promise<string[]> {
  const notificationIds: string[] = [];

  // Schedule initial notification
  const initialId = await this.scheduleReminder(notification);
  notificationIds.push(initialId);

  // Schedule 3 retry notifications (15, 20, 25 minutes after)
  const retryIntervals = [15, 20, 25];

  for (let i = 0; i < retryIntervals.length; i++) {
    const retryTime = new Date(
      notification.scheduledTime.getTime() + retryIntervals[i] * 60 * 1000
    );
    const retryId = `${notification.id}_retry${i + 1}`;

    const retryNotification: ReminderNotification = {
      ...notification,
      id: retryId,
      scheduledTime: retryTime,
      voiceCheckIn: true, // ← Enable auto-open VoiceChat
    };

    const retryNotifId = await this.scheduleReminder(retryNotification);
    notificationIds.push(retryNotifId);
  }

  return notificationIds;
}
```

### 2. `/elder-companion-mobile/src/screens/HomeScreen.tsx`

**Before:**
```typescript
await localNotificationService.scheduleReminder({
  id: reminder.id,
  title: reminder.title || 'Reminder',
  body: reminder.message || '',
  scheduledTime: dueTime,
  reminderId: reminder.id,
  reminderType: reminder.type || 'other',
  speakText: reminder.message,
  requiresResponse: true,
});
```

**After:**
```typescript
await localNotificationService.scheduleReminderWithRetries({
  id: reminder.id,
  title: reminder.title || 'Reminder',
  body: reminder.message || '',
  scheduledTime: dueTime,
  reminderId: reminder.id,
  reminderType: reminder.type || 'other',
  speakText: reminder.message,
  requiresResponse: true,
});
// Now schedules 4 notifications instead of 1!
```

**Cancellation Before:**
```typescript
await localNotificationService.cancelNotification(reminderId);
```

**Cancellation After:**
```typescript
await localNotificationService.cancelReminderNotifications(reminderId);
// Now cancels initial + all 3 retries!
```

### 3. `/backend/create_local_notif_test_reminder.py`

**New File:** Test script to create reminders for testing local notifications.

**Usage:**
```bash
python3 create_local_notif_test_reminder.py
```

Creates a reminder due in 2 minutes. When app opens, it schedules 4 notifications.

---

## API Reference

### LocalNotificationService

#### `scheduleReminderWithRetries(notification: ReminderNotification): Promise<string[]>`

Schedules a reminder with automatic retry notifications.

**Parameters:**
- `notification: ReminderNotification` - The reminder to schedule

**Returns:**
- `Promise<string[]>` - Array of notification IDs `[initial, retry1, retry2, retry3]`

**Behavior:**
- Schedules initial notification at `notification.scheduledTime`
- Schedules retry 1 at `scheduledTime + 15 minutes` with `voiceCheckIn: true`
- Schedules retry 2 at `scheduledTime + 20 minutes` with `voiceCheckIn: true`
- Schedules retry 3 at `scheduledTime + 25 minutes` with `voiceCheckIn: true`

**Example:**
```typescript
const ids = await localNotificationService.scheduleReminderWithRetries({
  id: 'reminder-123',
  title: 'Take medication',
  body: 'Take your blood pressure medication',
  scheduledTime: new Date('2025-10-26T09:00:00'),
  reminderId: 'reminder-123',
  reminderType: 'medication',
  speakText: 'Time to take your medication',
  requiresResponse: true,
});
// ids = ['reminder-123', 'reminder-123_retry1', 'reminder-123_retry2', 'reminder-123_retry3']
```

#### `cancelReminderNotifications(baseReminderId: string): Promise<void>`

Cancels all notifications for a reminder (initial + all retries).

**Parameters:**
- `baseReminderId: string` - The reminder ID (without retry suffix)

**Behavior:**
- Cancels notification with ID `baseReminderId`
- Cancels notification with ID `baseReminderId_retry1`
- Cancels notification with ID `baseReminderId_retry2`
- Cancels notification with ID `baseReminderId_retry3`

**Example:**
```typescript
await localNotificationService.cancelReminderNotifications('reminder-123');
// Cancels: reminder-123, reminder-123_retry1, reminder-123_retry2, reminder-123_retry3
```

---

## Troubleshooting

### Issue: Retry notifications not firing

**Possible Causes:**
1. **App never opened after reminder creation**
   - Solution: Open the app to fetch reminders and schedule notifications

2. **Notification permissions denied**
   - Solution: Go to iOS Settings → App → Notifications → Enable

3. **Reminder already marked as completed**
   - Solution: Create a new test reminder

4. **Scheduled time is in the past**
   - Solution: Create a new reminder with future due time

**Debugging:**
```typescript
// Check scheduled notifications
const scheduled = await localNotificationService.getScheduledNotifications();
console.log('Scheduled notifications:', scheduled.length);
scheduled.forEach(n => {
  console.log(`ID: ${n.notification.id}, Time: ${new Date(n.trigger.timestamp)}`);
});
```

### Issue: VoiceChat doesn't auto-open on retry notification

**Possible Causes:**
1. **voice_check_in flag not set**
   - Check notification data: should have `voice_check_in: "true"`

2. **Navigation service not initialized**
   - Solution: Ensure app is fully started before notification fires

3. **Tapped initial notification instead of retry**
   - Solution: Wait for retry notification (+15, +20, +25 min)

**Debugging:**
```typescript
// In local-notification.service.ts handleNotificationPress:
console.log('Notification data:', detail?.notification?.data);
console.log('Voice check-in flag:', detail?.notification?.data?.voice_check_in);
```

### Issue: Retries not cancelled after completion

**Possible Causes:**
1. **cancelReminderNotifications() not called**
   - Solution: Check HomeScreen's handleAcknowledgeReminder method

2. **Wrong reminder ID passed**
   - Solution: Ensure passing base ID (without _retry1 suffix)

**Debugging:**
```typescript
// After cancellation, check remaining notifications
const remaining = await localNotificationService.getScheduledNotifications();
console.log('Remaining notifications:', remaining.length);
```

---

## Advantages Over Firebase Push Notifications

| Feature | Local Notifications | Firebase Push |
|---------|-------------------|---------------|
| **Apple Developer Account** | ❌ Not required | ✅ Required ($99/year) |
| **Setup Complexity** | ⭐ Low (just install @notifee) | ⭐⭐⭐ High (Firebase, APNs certs) |
| **Reliability** | ⭐⭐⭐ 100% (scheduled locally) | ⭐⭐ Depends on network/backend |
| **Offline Support** | ✅ Works offline | ❌ Requires network |
| **Timing Accuracy** | ⭐⭐⭐ Exact (iOS native) | ⭐⭐ Can be delayed |
| **Backend Dependency** | ❌ None (after initial fetch) | ✅ Backend must be running |
| **Dynamic Retry Intervals** | ❌ Fixed at schedule time | ✅ Backend can adjust |
| **Cost** | $0 | $99/year (Apple Dev) |

---

## Future Enhancements

### 1. Background Fetch Integration (Optional)

Add iOS Background Fetch to dynamically cancel retries if user responds on another device:

```typescript
// In App.tsx
import BackgroundFetch from 'react-native-background-fetch';

BackgroundFetch.configure({
  minimumFetchInterval: 15, // iOS decides actual interval
}, async (taskId) => {
  console.log('[BackgroundFetch] Checking for completed reminders...');

  // Fetch completed reminders from backend
  const completed = await apiService.getCompletedReminders(patientId);

  // Cancel their retry notifications
  for (const reminder of completed) {
    await localNotificationService.cancelReminderNotifications(reminder.id);
  }

  BackgroundFetch.finish(taskId);
});
```

**Benefit:** If user completes reminder on dashboard, mobile app cancels retries in background.

### 2. Configurable Retry Intervals

Allow caregivers to configure retry intervals per patient:

```typescript
// In patient settings
patient.retry_intervals = [10, 20, 30]; // minutes

// In app
const retryIntervals = patient.retry_intervals || [15, 20, 25];
```

### 3. Escalating Notification Importance

Make later retries more prominent:

```typescript
// Retry 3 uses critical alert (bypasses Do Not Disturb)
if (i === 2) { // Third retry
  notification.ios.criticalAlert = {
    sound: 'default',
    volume: 1.0,
  };
}
```

**Note:** Requires special Apple entitlement.

### 4. Analytics

Track retry effectiveness:

```typescript
// When retry notification tapped
await apiService.logReminderEvent({
  reminder_id: reminderId,
  event_type: 'retry_notification_tapped',
  retry_number: i + 1,
  time_after_due: minutesSinceDue,
});
```

Dashboard shows: "Retry 2 most effective (60% response rate)"

---

## Summary

This system provides **proactive voice check-ins** for medication reminders without requiring expensive Apple Developer accounts or complex Firebase setup. By pre-scheduling retry notifications locally, we achieve the same user experience with:

- ✅ Zero recurring costs
- ✅ Simpler architecture
- ✅ Better reliability
- ✅ Offline support

Perfect for MVP and early-stage development. When you eventually get Apple Developer account (for App Store distribution), you can optionally add Firebase push as an enhancement, but it's not required for core functionality.

---

**Created:** October 26, 2025
**Last Updated:** October 26, 2025
**Status:** ✅ Implemented and Ready for Testing
