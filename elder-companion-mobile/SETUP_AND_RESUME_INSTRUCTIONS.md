# Elder Companion Mobile App - Setup & Resume Instructions

**Date:** October 25, 2025
**Session Status:** Setting up native folders and preparing to run app
**Next Goal:** Run the app to visualize UI, then apply UserDesign.md styling

---

## 📍 Current State

### ✅ What's Complete
- ✅ Phase 1 (Foundation) - 100% Complete
  - Project structure created (25+ files, 2,500+ lines)
  - 4 screens implemented (Setup, Home, VoiceChat, Settings)
  - Services layer (api.service.ts, storage.service.ts)
  - State management with Zustand (3 stores)
  - Navigation system with React Navigation
  - Backend integration endpoints configured

- ✅ Native Folders Initialized
  - `/ios` folder created with Xcode project
  - `/android` folder created with Gradle project
  - Both folders copied from React Native 0.72.6 template

### ❌ What's NOT Complete
- ❌ CocoaPods not installed yet (needed for iOS)
- ❌ iOS dependencies not installed (need `pod install`)
- ❌ App hasn't been run yet (need to see visual UI)
- ❌ UserDesign.md styling not applied yet

### 📂 Project Location
```
/Users/gaurav/Elda/elder-companion-mobile/
```

---

## 🚀 How to Resume - Quick Start

### Step 1: Install CocoaPods (One-time setup)

Open Terminal and run:

```bash
# Install CocoaPods (enter password when prompted)
sudo gem install cocoapods
```

**Expected output:** `Successfully installed cocoapods-X.X.X`

---

### Step 2: Install iOS Dependencies

```bash
cd /Users/gaurav/Elda/elder-companion-mobile/ios
pod install
cd ..
```

**Expected output:**
```
Analyzing dependencies
Downloading dependencies
Installing [various pods]...
Pod installation complete! X pods installed.
```

**⚠️ If you see errors:**
- Check Xcode is installed: `xcode-select --install`
- Try: `pod repo update` then retry `pod install`

---

### Step 3: Start Metro Bundler

In **Terminal Window #1**, run:

```bash
cd /Users/gaurav/Elda/elder-companion-mobile
npm start
```

**Expected output:**
```
Welcome to Metro!
  Fast - Scalable - Integrated

To reload the app press "r"
To open developer menu press "d"
```

**⚠️ Keep this terminal window open!**

---

### Step 4: Run on iOS Simulator

In **Terminal Window #2** (new window), run:

```bash
cd /Users/gaurav/Elda/elder-companion-mobile
npm run ios
```

**Expected behavior:**
1. iOS Simulator launches automatically
2. App builds and installs (~2-3 minutes first time)
3. App opens showing **Setup Screen**

---

## 📱 What You'll See When App Runs

### First Screen: Setup Screen
```
┌────────────────────────────────┐
│                                │
│    Welcome to Elder            │
│    Companion                   │
│                                │
│    [Scan QR Code]              │
│                                │
│    [🧪 Simulate QR Scan]      │
│    (Dev Mode Only)             │
│                                │
└────────────────────────────────┘
```

### Testing the Flow
1. **Tap "Simulate QR Scan"** (dev button)
2. It will verify with backend
3. Navigate to **Home Screen**
4. See "Talk to Me" button and Emergency button

---

## 🎨 Next Steps: Apply UserDesign.md Styling

Once the app is running, we need to apply the design guidelines from `UserDesign.md`:

### Design System to Implement

**Colors:**
- Primary: `#3566E5` (blue)
- Accent: `#F47C63` (coral/orange)
- Background: `#F9FAFB` (light gray)
- Surface: `#FFFFFF` (white)
- Text: `#1A1A1A` (almost black)
- Success: `#4CAF50` (green)
- Error: `#E53935` (red)

**Typography:**
- Headings: Playfair Display Bold 24pt
- Body: Nunito Sans Regular 16pt
- Buttons: Semi-Bold 18pt

**Layout:**
- 8dp grid system
- 16dp corner radius
- Large tap targets (≥52dp)
- Card shadows with elevation 2

### Files to Modify (in order)

1. **Create Design System**
   ```
   src/styles/colors.ts
   src/styles/typography.ts
   src/styles/spacing.ts
   ```

2. **Update Screens**
   ```
   src/screens/SetupScreen.tsx
   src/screens/HomeScreen.tsx
   src/screens/VoiceChatScreen.tsx
   src/screens/SettingsScreen.tsx
   ```

3. **Create Reusable Components**
   ```
   src/components/Button.tsx
   src/components/Card.tsx
   src/components/VoiceIndicator.tsx
   ```

---

## 🔧 Troubleshooting Guide

### Issue: "pod: command not found"
**Solution:**
```bash
sudo gem install cocoapods
```

### Issue: "xcrun: error: SDK 'iphoneos' cannot be located"
**Solution:**
```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

### Issue: Metro bundler won't start
**Solution:**
```bash
npm start -- --reset-cache
```

### Issue: "Build failed" in Xcode
**Solution:**
```bash
cd ios
pod deintegrate
pod install
cd ..
npm run ios
```

### Issue: App crashes on launch
**Solution:**
```bash
# Check logs
npx react-native log-ios

# Clear derived data
rm -rf ~/Library/Developer/Xcode/DerivedData
```

### Issue: "Cannot connect to Metro"
**Solution:**
1. Make sure Metro is running in Terminal Window #1
2. In simulator: Cmd+D → Settings → Debug Server Host → `localhost:8081`

---

## 📂 Project Structure Reference

```
elder-companion-mobile/
├── src/
│   ├── screens/              # Main app screens
│   │   ├── SetupScreen.tsx        (QR scanner)
│   │   ├── HomeScreen.tsx         (Main screen)
│   │   ├── VoiceChatScreen.tsx    (Conversation)
│   │   └── SettingsScreen.tsx     (Preferences)
│   │
│   ├── services/             # Business logic
│   │   ├── api.service.ts         (Backend API)
│   │   └── storage.service.ts     (AsyncStorage)
│   │
│   ├── stores/               # State management
│   │   ├── patient.store.ts
│   │   ├── conversation.store.ts
│   │   └── settings.store.ts
│   │
│   ├── navigation/
│   │   └── AppNavigator.tsx       (Main navigator)
│   │
│   ├── config/
│   │   ├── api.ts                 (API endpoints)
│   │   └── constants.ts           (App constants)
│   │
│   ├── types/
│   │   └── index.ts               (TypeScript types)
│   │
│   ├── components/           # TO CREATE (for styling)
│   ├── styles/               # TO CREATE (for styling)
│   └── utils/                # Utility functions
│
├── ios/                      # iOS native code ✅
├── android/                  # Android native code ✅
├── App.tsx                   # Root component
├── index.js                  # Entry point
├── package.json              # Dependencies
├── UserDesign.md            # 🎨 DESIGN GUIDELINES (use this!)
└── README.md                # Project documentation
```

---

## 📋 Phase Checklist

### Phase 1: Foundation ✅ COMPLETE
- [x] Project structure
- [x] Navigation system
- [x] State management
- [x] API service layer
- [x] All 4 screens
- [x] Native folders initialized

### Phase 2: Voice Implementation (NEXT - Week 2)
- [ ] Install @react-native-voice/voice
- [ ] Install react-native-tts
- [ ] Implement STT service
- [ ] Implement TTS service
- [ ] Update VoiceChat screen with real voice
- [ ] Test end-to-end voice flow

### Phase 3: Push Notifications (Week 3)
- [ ] Setup Firebase project
- [ ] Add Firebase config files
- [ ] Implement FCM handlers
- [ ] Test notification flow

### Phase 4: Background Services (Week 4)
- [ ] Implement background heartbeat
- [ ] Emergency button functionality
- [ ] Test background execution

### Phase 5: Polish (Week 5)
- [ ] Apply UserDesign.md styling ⭐ CURRENT
- [ ] Error handling
- [ ] Accessibility features
- [ ] Performance optimization

---

## 🎯 Immediate Next Actions (When You Resume)

### Option A: Run the app first, style later (Recommended)
```bash
# 1. Install CocoaPods
sudo gem install cocoapods

# 2. Install iOS dependencies
cd /Users/gaurav/Elda/elder-companion-mobile/ios && pod install && cd ..

# 3. Start Metro (Terminal 1)
npm start

# 4. Run iOS (Terminal 2)
npm run ios
```

### Option B: Apply styling first, then run
1. Ask Claude to create design system files
2. Update all screen components with new styles
3. Then run the app to see styled UI

---

## 🆘 Quick Commands Reference

```bash
# Navigate to project
cd /Users/gaurav/Elda/elder-companion-mobile

# Install dependencies
npm install

# Start Metro bundler
npm start

# Run iOS
npm run ios

# Run Android
npm run android

# Clear cache
npm start -- --reset-cache

# Check TypeScript
npx tsc --noEmit

# View iOS logs
npx react-native log-ios

# View Android logs
npx react-native log-android

# Restart everything
killall node
rm -rf node_modules
npm install
npm start -- --reset-cache
```

---

## 📞 Backend Status

**Backend is READY** and running at:
```
http://localhost:8000
```

**Available Endpoints:**
- POST /api/v1/mobile/setup - Device setup
- POST /api/v1/mobile/device-token - FCM token
- POST /api/v1/voice/interact - Voice messages
- POST /api/v1/patients/{id}/heartbeat - Activity tracking

**To start backend:**
```bash
cd /Users/gaurav/Elda/backend
source venv/bin/activate
python3 -m uvicorn app.main:app --reload
```

---

## 📖 Documentation Files

- `README.md` - Main project documentation
- `MOBILE_APP_PROJECT_SETUP_SUMMARY.md` - Phase 1 completion summary
- `MOBILE_APP_INTEGRATION_PLAN.md` - Complete integration plan
- `MOBILE_BACKEND_IMPLEMENTATION_SUMMARY.md` - Backend endpoints
- `UserDesign.md` - 🎨 **DESIGN GUIDELINES (IMPORTANT!)**
- `Documents/mobile-backend-communication.md` - API communication details

---

## 🎨 UserDesign.md Key Points

**What to implement:**
1. **Brand Colors** - Primary blue (#3566E5), Accent coral (#F47C63)
2. **Typography** - Playfair Display (headings), Nunito Sans (body)
3. **Large Buttons** - ≥52dp tap targets for elderly users
4. **Voice Feedback** - Every action has speech feedback
5. **High Contrast** - WCAG AA compliant
6. **Simple Navigation** - Stack navigator with 3 tabs max
7. **Calm Animations** - Gentle fades, mic pulse at 1.2s interval

**Screen-specific styling:**
- **Home:** Pulsing "Talk to Me" button, red Emergency button
- **Voice Chat:** Animated waveform, live transcript captions
- **Settings:** Large toggles, voice speed controls
- **Reminders:** Status chips (completed/pending/escalated)

---

## ✅ Success Criteria

You'll know the setup is successful when:
- [ ] iOS Simulator opens automatically
- [ ] App installs without errors
- [ ] Setup Screen displays
- [ ] "Simulate QR Scan" button works
- [ ] Navigation to Home Screen works
- [ ] No red error screens

---

## 🚨 Emergency Restart Commands

If everything breaks:

```bash
# Kill all Node processes
killall node

# Clean everything
cd /Users/gaurav/Elda/elder-companion-mobile
rm -rf node_modules
rm -rf ios/Pods
rm -rf ios/build
rm -rf android/app/build

# Reinstall
npm install
cd ios && pod install && cd ..

# Start fresh
npm start -- --reset-cache
npm run ios
```

---

## 📝 Notes for Next Session

- **Current blocker:** Need to install CocoaPods to run iOS app
- **Estimated time:** 5-10 minutes for setup, then instant app launches
- **After app runs:** Apply UserDesign.md styling (2-3 hours)
- **Design files to create:** colors.ts, typography.ts, spacing.ts, Button.tsx, Card.tsx

---

**Last Updated:** October 25, 2025
**Next Session:** Run app → See UI → Apply UserDesign.md styling
**Status:** Ready to resume! 🚀
