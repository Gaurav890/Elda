# Firebase Setup Guide for Elder Companion Mobile App

## Overview
This guide walks you through setting up Firebase Cloud Messaging (FCM) for push notifications in the Elder Companion mobile app.

**Estimated Time:** 20-30 minutes
**Required:** Google account

---

## Step 1: Create Firebase Project (5 minutes)

### 1.1 Go to Firebase Console
- Open https://console.firebase.google.com/
- Sign in with your Google account

### 1.2 Create New Project
1. Click **"Add project"** or **"Create a project"**
2. **Project name:** `elder-companion-mobile` (or your preferred name)
3. Click **Continue**
4. **Google Analytics:** Disable (optional, not needed for this project)
5. Click **Create project**
6. Wait for project creation (30-60 seconds)
7. Click **Continue** when ready

---

## Step 2: Add iOS App (10 minutes)

### 2.1 Register iOS App
1. In Firebase Console, click **iOS icon** (⊕ Add app → iOS)
2. Fill in the form:
   - **iOS bundle ID:** `org.reactjs.native.example.ElderCompanionTemp`
   - **App nickname:** `Elder Companion iOS` (optional)
   - **App Store ID:** Leave blank (not published yet)
3. Click **Register app**

### 2.2 Download iOS Config File
1. Click **Download GoogleService-Info.plist**
2. **IMPORTANT:** Save this file - you'll need it shortly
3. Click **Next**
4. Skip the SDK setup step (we'll do this via npm) → Click **Next**
5. Skip validation step → Click **Continue to console**

### 2.3 Place iOS Config File
**STOP!** Don't place the file yet. I'll help you with this after you complete all console steps.

---

## Step 3: Add Android App (10 minutes)

### 3.1 Register Android App
1. In Firebase Console, click **Android icon** (⊕ Add app → Android)
2. Fill in the form:
   - **Android package name:** `com.eldercompaniontemp` (check android/app/build.gradle to confirm)
   - **App nickname:** `Elder Companion Android` (optional)
   - **Debug signing certificate SHA-1:** Leave blank (not needed for FCM)
3. Click **Register app**

### 3.2 Download Android Config File
1. Click **Download google-services.json**
2. **IMPORTANT:** Save this file - you'll need it shortly
3. Click **Next**
4. Skip the SDK setup step (we'll do this via npm) → Click **Next**
5. Skip validation step → Click **Continue to console**

### 3.3 Place Android Config File
**STOP!** Don't place the file yet. I'll help you with this after you complete all console steps.

---

## Step 4: Enable Cloud Messaging (2 minutes)

### 4.1 Enable FCM API
1. In Firebase Console, go to **Project Settings** (⚙️ gear icon)
2. Click **Cloud Messaging** tab
3. You should see:
   - **Firebase Cloud Messaging API (V1)** - Enabled by default
   - **Server key** (legacy) - Available

**Note:** The new V1 API is automatically enabled. No additional action needed.

---

## Step 5: iOS APNs Setup (5 minutes)

For iOS push notifications to work, you need an Apple Push Notification service (APNs) certificate.

### 5.1 Development Environment (For Testing)
1. In Firebase Console → **Project Settings** → **Cloud Messaging** tab
2. Scroll down to **Apple app configuration**
3. For development/testing, you can:
   - **Option A:** Upload an APNs Authentication Key (recommended)
   - **Option B:** Upload an APNs Certificate

### 5.2 Create APNs Authentication Key (Recommended)

**If you have an Apple Developer account:**
1. Go to https://developer.apple.com/account/
2. Navigate to **Certificates, Identifiers & Profiles**
3. Click **Keys** → **+** (Create a key)
4. **Key Name:** `Elder Companion APNs Key`
5. Check **Apple Push Notifications service (APNs)**
6. Click **Continue** → **Register**
7. **Download the .p8 file** (SAVE IT - you can't download again)
8. Note the **Key ID** and **Team ID**

**Upload to Firebase:**
1. In Firebase Console → **Cloud Messaging** → **Apple app configuration**
2. Click **Upload** under **APNs Authentication Key**
3. Upload the `.p8` file
4. Enter **Key ID** and **Team ID**
5. Click **Upload**

### 5.3 For Simulator Testing (No APNs Key Needed)
If you're only testing on iOS Simulator (not real device), you can skip APNs setup for now. Simulator will receive notifications without APNs.

---

## Step 6: Verify Setup

### 6.1 Check Configuration
In Firebase Console, verify:
- ✅ iOS app registered: `org.reactjs.native.example.ElderCompanionTemp`
- ✅ Android app registered: `com.eldercompaniontemp`
- ✅ Cloud Messaging enabled
- ✅ (Optional) APNs key uploaded for iOS

### 6.2 Download Config Files
Make sure you have BOTH files downloaded:
- ✅ `GoogleService-Info.plist` (iOS)
- ✅ `google-services.json` (Android)

---

## Step 7: Provide Files to Claude

**You're done with the Firebase Console!** 🎉

Now, tell me:
1. "Firebase setup complete, I have both config files"
2. Share the files (or I'll guide you to place them correctly)

I'll then:
- Place config files in correct locations
- Install Firebase npm packages
- Configure iOS and Android projects
- Implement notification services
- Test push notifications

---

## Troubleshooting

### Issue: Can't find iOS Bundle ID
Run this command:
```bash
grep -A 5 "PRODUCT_BUNDLE_IDENTIFIER" ios/ElderCompanionTemp.xcodeproj/project.pbxproj | head -1
```

### Issue: Can't find Android Package Name
Run this command:
```bash
grep "applicationId" android/app/build.gradle
```

### Issue: Don't have Apple Developer account
- You can still test on iOS Simulator without APNs
- For real devices, you'll need to enroll in Apple Developer Program ($99/year)

### Issue: Firebase asks for billing
- FCM is free for unlimited notifications
- No billing required for this project
- If asked, select **Spark plan (free)**

---

## What's Next?

Once you complete Firebase Console setup:
1. I'll place the config files in the correct locations
2. Install Firebase packages via npm
3. Configure iOS and Android native code
4. Implement notification handlers
5. Test push notifications end-to-end

**Estimated time after you provide config files:** 1-2 hours of implementation + testing

---

## Quick Reference

**Firebase Console:** https://console.firebase.google.com/
**Apple Developer:** https://developer.apple.com/account/

**Config Files Needed:**
- `GoogleService-Info.plist` → Place in `ios/ElderCompanionTemp/`
- `google-services.json` → Place in `android/app/`

**Bundle IDs:**
- iOS: `org.reactjs.native.example.ElderCompanionTemp`
- Android: `com.eldercompaniontemp`
