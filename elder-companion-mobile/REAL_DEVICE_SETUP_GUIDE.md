# Real iPhone Setup Guide

**Date:** October 25, 2025

---

## 📱 Prerequisites

- ✅ iPhone (you have "Gaurav's iphone" - detected earlier)
- ✅ USB cable to connect to Mac
- ✅ Xcode installed on Mac
- ✅ Apple ID (for code signing)

---

## 🚀 Quick Setup Steps

### Step 1: Connect iPhone to Mac

1. **Connect** your iPhone to Mac with USB cable
2. **Unlock** your iPhone
3. iPhone will show: **"Trust This Computer?"**
4. Tap **"Trust"**
5. Enter your iPhone passcode

---

### Step 2: Configure Code Signing in Xcode

We need to set up code signing so you can run the app on your iPhone.

#### Option A: Using Xcode GUI (Recommended for first time)

1. **Open project in Xcode:**
   ```bash
   cd /Users/gaurav/Elda/elder-companion-mobile/ios
   open ElderCompanionTemp.xcworkspace
   ```

2. **In Xcode:**
   - Click on **"ElderCompanionTemp"** project (blue icon, top of left sidebar)
   - Select **"ElderCompanionTemp"** target (under "TARGETS")
   - Click **"Signing & Capabilities"** tab

3. **Enable Automatic Signing:**
   - Check ✅ **"Automatically manage signing"**
   - Select your **Team** (your Apple ID)
   - If no team: Click "Add Account..." and sign in with Apple ID

4. **Xcode will automatically:**
   - Create a provisioning profile
   - Register your device
   - Set up code signing certificate

#### Option B: Using Command Line (If you prefer)

The device is already detected: `00008140-001A69611A12801C`

---

### Step 3: Build and Install on iPhone

**From Terminal:**

```bash
cd /Users/gaurav/Elda/elder-companion-mobile

# Build and install on your iPhone
npm run ios -- --device="Gaurav's iphone"
```

**Or from Xcode:**

1. In Xcode top bar, click device selector (next to play button)
2. Select **"Gaurav's iphone"** instead of simulator
3. Click **▶ Play** button (or press Cmd+R)

---

### Step 4: Trust Developer on iPhone

**First time only:**

1. App will install but won't open
2. On your iPhone: Go to **Settings** > **General** > **VPN & Device Management**
3. Find your Apple ID under **"DEVELOPER APP"**
4. Tap it
5. Tap **"Trust [Your Apple ID]"**
6. Tap **"Trust"** again in the popup

---

### Step 5: Launch the App

1. Find **"ElderCompanionTemp"** app on your iPhone home screen
2. Tap to open
3. App should launch! 🎉

---

## ✅ What to Test on Real iPhone

### 1. Voice Recognition (Finally works!)

**Test:**
- Tap "TALK TO ME" button
- Speak: "Hello, how are you today?"
- Watch it transcribe in real-time
- AI responds with voice

**Expected:**
- No more 🧪 Test button needed!
- Real microphone works
- Real speech recognition
- TTS plays through speaker

---

### 2. Emergency Button with Vibrations

**Test:**
- Press and hold "I NEED HELP" button for 2 seconds
- Feel short vibration on press
- Keep holding...
- Feel pattern vibration (long-short-long) at 2 seconds
- Confirm dialog appears
- Send alert
- Feel success vibration

**Expected:**
- Real haptic feedback!
- All vibration patterns work
- Alert sent to backend

---

### 3. Push Notifications

**Test:**

**Method 1: From Firebase Console**
1. Go to: https://console.firebase.google.com/
2. Select project: **"elda-ai"**
3. Cloud Messaging → **"Send your first message"**
4. Title: "Test Reminder"
5. Text: "Time to take your medication"
6. Target: Select iOS app
7. Click **"Send test message"**
8. Enter your FCM token (check app logs)

**Expected:**
- Notification appears on lock screen
- Tap to open app
- TTS plays the message

---

### 4. Background Heartbeat

**Test:**
1. Launch app
2. Press home button (send app to background)
3. Wait 15-20 minutes
4. Check backend logs for heartbeat arrivals

**Expected:**
- Heartbeat sent every 15 minutes
- Battery level updates
- App state changes tracked

**Check Logs:**
```bash
# On your Mac terminal, watch device logs:
xcrun simctl spawn 00008140-001A69611A12801C log stream --predicate 'processImagePath CONTAINS "ElderCompanionTemp"' --level debug
```

---

### 5. Battery Tracking

**Test:**
1. Check initial battery level in heartbeat
2. Plug/unplug charger
3. Next heartbeat should show `is_charging: true/false`

**Expected:**
- Accurate battery percentage
- Charging state updates
- Low battery alert if < 20%

---

### 6. Network Connectivity

**Test:**
1. Turn on WiFi → heartbeat shows `network_type: "wifi"`
2. Turn off WiFi → heartbeat shows `network_type: "cellular"`
3. Airplane mode → heartbeat shows `network_type: "none"`

**Expected:**
- Network state tracked accurately
- Offline messages queued
- Auto-sync when reconnected

---

## 🐛 Common Issues & Fixes

### Issue 1: "Code Signing Error"

**Fix:**
```bash
# Open Xcode
open ios/ElderCompanionTemp.xcworkspace

# Go to Signing & Capabilities
# Select your Team (Apple ID)
# Xcode will fix automatically
```

### Issue 2: "Could not launch ElderCompanionTemp"

**Fix:**
- On iPhone: Settings > General > VPN & Device Management
- Trust your developer certificate

### Issue 3: "Build Failed - Provisioning Profile Error"

**Fix:**
```bash
# Clean and rebuild
cd ios
rm -rf build
rm -rf ~/Library/Developer/Xcode/DerivedData/ElderCompanionTemp-*
pod install
cd ..
npm run ios -- --device="Gaurav's iphone"
```

### Issue 4: "Device Not Found"

**Fix:**
```bash
# List available devices
xcrun xctrace list devices

# Should see "Gaurav's iphone" with ID: 00008140-001A69611A12801C
# If not, unplug/replug USB cable and trust computer again
```

---

## 📊 Monitoring & Debugging

### View Console Logs (Real-time)

**Method 1: Xcode**
- In Xcode, with device connected
- Window → Devices and Simulators
- Select your iPhone
- Click "Open Console" button
- Filter: "ElderCompanionTemp"

**Method 2: Terminal**
```bash
# Stream logs from device
idevicesyslog | grep "ElderCompanionTemp"
```

### Check Heartbeat Status

**In app console logs, look for:**
```
[HeartbeatService] Initializing...
[HeartbeatService] BackgroundFetch status: 2 (available)
[HeartbeatService] Sending heartbeat...
[HeartbeatService] Payload: { battery_level: 85, app_state: "active", ... }
[HeartbeatService] Heartbeat sent successfully
```

### Check FCM Token

**In app console logs:**
```
[NotificationService] FCM Token: <token>...
[NotificationService] Token registered with backend
```

**Save this token** - you'll need it to send test notifications from Firebase Console!

---

## 🎯 Full Testing Checklist

### Setup Phase:
- [ ] iPhone connected and trusted
- [ ] Code signing configured
- [ ] App installed on device
- [ ] Developer certificate trusted
- [ ] App launches successfully

### Voice Features:
- [ ] Microphone permission granted
- [ ] "TALK TO ME" button works
- [ ] Real speech recognition works
- [ ] Backend responds to voice
- [ ] TTS plays AI response
- [ ] Conversation continues if flagged

### Emergency Features:
- [ ] Press and hold works (2 seconds)
- [ ] Short vibration on press
- [ ] Pattern vibration at 2 seconds
- [ ] Confirmation dialog appears
- [ ] Emergency sent to backend
- [ ] Success vibration after sending
- [ ] "Help is on the way" message shows

### Notifications:
- [ ] Notification permission granted
- [ ] FCM token registered
- [ ] Test notification sent from Firebase
- [ ] Notification appears on lock screen
- [ ] Tap opens app
- [ ] TTS plays notification message

### Background Services:
- [ ] Heartbeat service initializes (no errors)
- [ ] Initial heartbeat sent
- [ ] App sent to background
- [ ] Wait 15+ minutes
- [ ] Check backend for heartbeat arrivals
- [ ] Battery level accurate
- [ ] Charging state correct
- [ ] Network type correct

### Edge Cases:
- [ ] Offline mode (airplane mode)
- [ ] Message queuing works
- [ ] Auto-sync on reconnection
- [ ] Low battery alert (if < 20%)
- [ ] App restart persists settings

---

## 🚀 Quick Start Commands

```bash
# 1. Connect iPhone to Mac (USB cable)

# 2. Build and run on iPhone
cd /Users/gaurav/Elda/elder-companion-mobile
npm run ios -- --device="Gaurav's iphone"

# 3. If build fails, try clean build:
cd ios
rm -rf build
pod install
cd ..
npm run ios -- --device="Gaurav's iphone"

# 4. Watch logs
# (Open Xcode → Window → Devices → Console)
# Or use terminal:
idevicesyslog | grep "ElderCompanionTemp"
```

---

## 📱 What's Different on Real Device?

| Feature | Simulator | Real iPhone |
|---------|-----------|-------------|
| Voice Recognition | ❌ Doesn't work | ✅ Works perfectly |
| TTS | ✅ Works | ✅ Works (better quality) |
| Vibrations | ❌ No physical feedback | ✅ Real haptic feedback |
| Push Notifications | ⚠️ Limited | ✅ Full support (APNs) |
| Background Tasks | ❌ Doesn't work | ✅ Works (heartbeat every 15min) |
| Battery Tracking | 🔋 Always 100% | ✅ Real battery level |
| Network Detection | ✅ Works | ✅ Works (more accurate) |
| Performance | Slower | ✅ Faster, smoother |

---

## 🎊 Success Criteria

You'll know everything is working when:

✅ App installs and launches on iPhone
✅ Voice recognition works without test button
✅ Emergency button vibrates on press/hold
✅ Push notifications appear on lock screen
✅ Heartbeat logs show in console every 15min
✅ Battery level shows real value (not 100%)
✅ All animations smooth and responsive

---

## 🆘 Need Help?

**If stuck:**
1. Check Xcode console for errors
2. Verify iPhone is unlocked and connected
3. Trust computer and developer certificate
4. Clean build and try again
5. Check that backend is running (http://10.0.18.14:8000)

**Backend must be accessible from iPhone:**
- If iPhone on same WiFi as Mac: ✅ Should work
- Backend running: `http://10.0.18.14:8000`
- Test: Open Safari on iPhone, go to backend URL

---

Ready to install! Connect your iPhone and let's get it running on real hardware! 🚀📱
