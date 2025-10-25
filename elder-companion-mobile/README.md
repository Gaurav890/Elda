# Elder Companion Mobile App

Voice-enabled mobile application for elderly patients to interact with AI companion and receive care reminders.

## 🎯 Project Overview

This mobile app is part of the Elder Companion AI system, designed specifically for elderly patients. It provides:

- 📱 **Simple, Voice-First Interface** - Large buttons, clear text, easy navigation
- 🎤 **Voice Interaction** - Talk naturally with AI companion
- 🔔 **Push Notifications** - Receive medication and meal reminders
- 🚨 **Emergency Button** - Quick access to caregiver help
- 📊 **Activity Tracking** - Automatic heartbeat monitoring for safety
- 📴 **Offline Support** - Works without internet, syncs when available

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 16.x or higher
- **npm** or **yarn**
- **React Native CLI** (`npm install -g react-native-cli`)
- **Xcode** (for iOS development) or **Android Studio** (for Android)
- **CocoaPods** (for iOS: `sudo gem install cocoapods`)

## 🚀 Quick Start

### 1. Install Dependencies

\`\`\`bash
cd elder-companion-mobile
npm install

# For iOS
cd ios && pod install && cd ..
\`\`\`

### 2. Configure Environment

\`\`\`bash
cp .env.example .env
\`\`\`

Edit `.env` and set your backend URL:

\`\`\`env
API_URL=http://localhost:8000  # or your backend URL
API_TIMEOUT=10000
APP_VERSION=1.0.0
\`\`\`

### 3. Run the App

**iOS:**
\`\`\`bash
npm run ios
# or
react-native run-ios
\`\`\`

**Android:**
\`\`\`bash
npm run android
# or
react-native run-android
\`\`\`

### 4. Development Mode

The app includes development-only features:

- **Simulate QR Scan** button on Setup screen
- **Simulate Voice** button on Voice Chat screen
- Test patient ID: `0a25b63d-eb49-4ba5-b2fa-9f1594162a7a`

## 📁 Project Structure

\`\`\`
elder-companion-mobile/
├── src/
│   ├── screens/          # Main app screens
│   │   ├── SetupScreen.tsx        # QR code scanner
│   │   ├── HomeScreen.tsx         # Main screen with Talk button
│   │   ├── VoiceChatScreen.tsx    # Active conversation
│   │   └── SettingsScreen.tsx     # App settings
│   │
│   ├── services/         # Business logic layer
│   │   ├── api.service.ts         # Backend API communication
│   │   └── storage.service.ts     # Local data persistence
│   │
│   ├── stores/           # State management (Zustand)
│   │   ├── patient.store.ts       # Patient data state
│   │   ├── conversation.store.ts  # Active conversation state
│   │   └── settings.store.ts      # App settings state
│   │
│   ├── navigation/       # Navigation configuration
│   │   └── AppNavigator.tsx       # Main navigator
│   │
│   ├── components/       # Reusable components
│   ├── config/           # App configuration
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
│
├── ios/                  # iOS native code
├── android/              # Android native code
├── App.tsx               # Root component
├── index.js              # Entry point
└── package.json          # Dependencies
\`\`\`

## 🔧 Configuration

### API Endpoints

The app connects to these backend endpoints:

- **POST /api/v1/mobile/setup** - Device setup verification
- **POST /api/v1/mobile/device-token** - FCM token registration
- **POST /api/v1/voice/interact** - Voice message processing
- **POST /api/v1/patients/{id}/heartbeat** - Activity tracking

Configuration is in `src/config/api.ts`.

### App Constants

Key configuration values in `src/config/constants.ts`:

- Heartbeat interval: 15 minutes
- TTS rate: 0.9 (slower for elderly)
- Button sizes: Extra large
- Font sizes: Larger than standard

## 🎨 Key Features

### 1. Setup Flow (QR Code)

1. Patient opens app for first time
2. Caregiver generates QR code in dashboard
3. Patient taps "Scan QR Code"
4. Camera scans QR code
5. App verifies token with backend
6. Patient ID stored locally
7. Navigate to Home screen

**Implementation:** `src/screens/SetupScreen.tsx`

### 2. Home Screen

Main screen with:
- Greeting with patient name
- Next reminder card
- Large "TALK TO ME" button (blue, pulsing)
- Emergency "I NEED HELP" button (red)
- Settings button

**Implementation:** `src/screens/HomeScreen.tsx`

### 3. Voice Interaction

1. Patient taps "TALK TO ME"
2. Microphone activates (listening indicator)
3. Patient speaks message
4. Speech-to-text transcription
5. Send to backend API
6. AI processes and responds
7. Text-to-speech plays response
8. Continue conversation if needed

**Implementation:** `src/screens/VoiceChatScreen.tsx`

### 4. Background Heartbeat

- Runs every 15 minutes
- Works when app closed
- Tracks battery level
- Enables inactivity detection

**To implement:** Add `react-native-background-fetch` logic

### 5. Push Notifications

- Receive reminder notifications
- Trigger TTS automatically
- Start voice recognition
- Background and foreground support

**To implement:** Add Firebase messaging handlers

## 📦 Dependencies

### Core
- **react-native** 0.72.6 - Framework
- **typescript** 5.2.0 - Type safety
- **react** 18.2.0 - UI library

### Navigation
- **@react-navigation/native** 6.1.9 - Navigation framework
- **@react-navigation/stack** 6.3.20 - Stack navigator

### State Management
- **zustand** 4.4.6 - Lightweight state management

### Storage
- **@react-native-async-storage/async-storage** 1.19.5 - Local persistence

### API Communication
- **axios** 1.6.0 - HTTP client

### Voice & Speech (To Install)
- **@react-native-voice/voice** 3.2.4 - Speech-to-text
- **react-native-tts** 4.1.0 - Text-to-speech

### Push Notifications (To Install)
- **@react-native-firebase/app** 18.6.1 - Firebase core
- **@react-native-firebase/messaging** 18.6.1 - FCM

### Camera & QR Code (To Install)
- **react-native-vision-camera** 3.6.4 - Camera access
- **vision-camera-code-scanner** 0.2.0 - QR scanning

### Background Tasks (To Install)
- **react-native-background-fetch** 4.2.0 - Background execution

## 🔨 Development

### Install All Dependencies

\`\`\`bash
npm install
\`\`\`

### Run TypeScript Check

\`\`\`bash
npx tsc --noEmit
\`\`\`

### Run Linter

\`\`\`bash
npm run lint
\`\`\`

### Clear Metro Cache

\`\`\`bash
npm start -- --reset-cache
\`\`\`

## 🧪 Testing

### Manual Testing Checklist

**Setup Flow:**
- [ ] QR code scan works
- [ ] Invalid QR shows error
- [ ] Setup completes and navigates to Home
- [ ] Patient ID stored correctly

**Home Screen:**
- [ ] Greeting shows patient name
- [ ] Talk button navigates to Voice Chat
- [ ] Emergency button shows confirmation
- [ ] Settings button opens Settings

**Voice Chat:**
- [ ] Listening indicator shows
- [ ] Messages appear in conversation
- [ ] End conversation returns to Home

**Settings:**
- [ ] Volume/speed settings display
- [ ] Test voice button works
- [ ] Reset device clears data

## 📱 Platform-Specific Setup

### iOS

1. **Install Pods:**
   \`\`\`bash
   cd ios && pod install && cd ..
   \`\`\`

2. **Open Xcode:**
   \`\`\`bash
   open ios/ElderCompanion.xcworkspace
   \`\`\`

3. **Configure Signing:**
   - Select project in Xcode
   - Go to "Signing & Capabilities"
   - Select your team

4. **Permissions (Info.plist):**
   - Camera: "We need camera access to scan QR codes"
   - Microphone: "We need microphone access for voice chat"
   - Speech Recognition: "We need speech recognition for conversations"

### Android

1. **Configure Gradle:**
   Edit `android/app/build.gradle` - ensure `minSdkVersion` is 23+

2. **Permissions (AndroidManifest.xml):**
   \`\`\`xml
   <uses-permission android:name="android.permission.CAMERA" />
   <uses-permission android:name="android.permission.RECORD_AUDIO" />
   <uses-permission android:name="android.permission.INTERNET" />
   <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
   \`\`\`

3. **Run on Device:**
   \`\`\`bash
   adb devices  # Check device connected
   npm run android
   \`\`\`

## 🔐 Security

- Patient ID stored securely in AsyncStorage
- All API calls use HTTPS in production
- Setup tokens expire in 15 minutes
- One-time use QR codes
- No passwords required for patients

## 🐛 Troubleshooting

### Metro Bundler Won't Start

\`\`\`bash
npm start -- --reset-cache
\`\`\`

### iOS Build Fails

\`\`\`bash
cd ios && pod install && cd ..
rm -rf ~/Library/Developer/Xcode/DerivedData
\`\`\`

### Android Build Fails

\`\`\`bash
cd android && ./gradlew clean && cd ..
\`\`\`

### App Crashes on Launch

Check console logs:
\`\`\`bash
# iOS
npx react-native log-ios

# Android
npx react-native log-android
\`\`\`

## 📚 Next Steps

### Phase 2: Voice Implementation (Week 2)
- [ ] Integrate @react-native-voice/voice
- [ ] Integrate react-native-tts
- [ ] Add voice recognition logic
- [ ] Add TTS playback logic
- [ ] Test voice flow end-to-end

### Phase 3: Push Notifications (Week 3)
- [ ] Setup Firebase project
- [ ] Add google-services.json (Android)
- [ ] Add GoogleService-Info.plist (iOS)
- [ ] Implement FCM handlers
- [ ] Test notification flow

### Phase 4: Background Services (Week 4)
- [ ] Implement background heartbeat
- [ ] Test background execution
- [ ] Implement emergency button
- [ ] Add location tracking (optional)

### Phase 5: Polish (Week 5)
- [ ] UX improvements
- [ ] Accessibility features
- [ ] Error handling
- [ ] Performance optimization
- [ ] User testing

## 📖 Documentation

- **Backend API:** See `backend/MASTER_BACKEND_DOCUMENTATION.md`
- **Mobile Integration Plan:** See `MOBILE_APP_INTEGRATION_PLAN.md`
- **Backend Implementation:** See `MOBILE_BACKEND_IMPLEMENTATION_SUMMARY.md`
- **Dashboard QR Feature:** See `DASHBOARD_QR_CODE_IMPLEMENTATION.md`

## 🤝 Contributing

1. Follow React Native best practices
2. Use TypeScript for all code
3. Add comments for complex logic
4. Keep components simple and focused
5. Test on both iOS and Android

## 📄 License

Copyright © 2025 Elder Companion AI

## 🆘 Support

For help or questions:
- Check existing documentation
- Review backend API docs
- Contact development team

---

**Version:** 1.0.0 (Phase 1 Complete)
**Last Updated:** October 25, 2025
**Status:** ✅ Foundation Ready - Phase 2 can begin
