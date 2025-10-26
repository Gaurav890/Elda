# Video Recording Checklist for Judges Demo
## Complete Setup and Recording Guide

---

## Pre-Recording Setup (30 minutes before)

### Step 1: Clean and Rebuild Everything

Run the automated setup script:
```bash
cd /Users/gaurav/Elda
./REBUILD_FOR_DEMO.sh
```

**What this does:**
- Kills all running processes
- Cleans mobile app build cache
- Reinstalls dependencies
- Starts backend server
- Generates QR code page
- Builds mobile app

**Choose option 1** (iPhone Simulator) for easier screen recording.

---

### Step 2: Wait for Build to Complete (2-3 minutes)

Watch for:
- ✅ "Build Succeeded" message
- ✅ Simulator opens with app
- ✅ Metro bundler shows "100% complete"

---

### Step 3: Set Up Mobile App with Test Patient

**Important: Use Patient 1 or 2 (they have full data!)**

1. **Open QR code page** (should already be open in browser)
   - Location: `/Users/gaurav/Elda/backend/patient_qr_codes.html`
   - If not open: `open /Users/gaurav/Elda/backend/patient_qr_codes.html`

2. **In Simulator: Scan QR Code**
   - Open app (should show Setup screen)
   - Tap "Scan QR Code"
   - **Problem**: Camera doesn't work in simulator!

**Alternative Method (Recommended for Simulator):**

Create a direct deep link:
```bash
cd /Users/gaurav/Elda/backend
python3 << 'EOF'
from app.database.session import SessionLocal
from app.models.patient import Patient

db = SessionLocal()
# Use Patient 1 (has Letta + schedules)
patient = db.query(Patient).filter(Patient.id == "97dc0241-4734-45dc-be7f-61fc5028b833").first()

if patient:
    print(f"\n✅ Patient: {patient.full_name}")
    print(f"   Setup Token: {patient.setup_token}")
    print(f"\n📱 Manual Setup Data:")
    print(f'   Patient ID: {patient.id}')
    print(f'   Token: {patient.setup_token}')
else:
    print("❌ Patient not found!")
db.close()
EOF
```

**Then in the app:**
- Type or paste the patient ID and token manually
- OR use deep link: `eldercompanion://setup?patient_id=97dc0241-4734-45dc-be7f-61fc5028b833&token=XXXXX`

---

### Step 4: Verify Dashboard is Accessible

```bash
# Check if dashboard is running
curl http://localhost:3000 || echo "Dashboard not running!"

# If not running, start it:
cd /Users/gaurav/Elda/caregiver-dashboard
npm run dev &
```

**Login:**
- URL: http://localhost:3000
- Email: sarah.miller@example.com
- Password: test123

**Verify you see:**
- ✅ Grandma Betty in patient list
- ✅ Patient overview with medications
- ✅ Conversations tab (may be empty initially)

---

### Step 5: Test Voice Chat (Before Recording!)

**In mobile app:**
1. Navigate to "Chat" tab
2. Tap microphone button
3. Say: "Testing, one two three"
4. Watch for:
   - ✅ Transcription appears
   - ✅ AI responds (with voice)
   - ✅ Conversation saved

**If voice chat doesn't work:**
- Check microphone permissions in simulator
- Check backend logs: `tail -f /tmp/elda-backend.log`
- Verify API is responding: `curl http://localhost:8000/docs`

---

## Recording Setup (10 minutes before)

### Screen Recording Options

**Option A: QuickTime (Free, Built-in)**
```bash
# Open QuickTime
open -a "QuickTime Player"

# Then: File → New Screen Recording
# Select: iPhone Simulator window
# Audio: Select microphone for narration
```

**Option B: OBS Studio (Professional, Free)**
- Download: https://obsproject.com
- Better quality and more control
- Can record multiple sources (simulator + webcam)

**Option C: iPhone Mirroring to Mac**
```bash
# Connect iPhone via USB
# Open QuickTime → File → New Movie Recording
# Camera dropdown → Select iPhone
# Then click record button
```

---

### Recording Configuration

**Resolution:**
- 1920x1080 (Full HD) - Recommended
- 3840x2160 (4K) - If you have space

**Frame Rate:**
- 30 FPS (Standard)
- 60 FPS (Smoother)

**Audio:**
- ✅ Enable microphone for narration
- ✅ Enable system audio for app sounds
- Test audio levels before recording!

---

### Clean Up Desktop

**Before you start recording:**
- [ ] Close all unnecessary browser tabs
- [ ] Hide desktop icons (optional)
- [ ] Close Slack, email, notifications
- [ ] Put phone on Do Not Disturb
- [ ] Close terminal windows (or organize cleanly)
- [ ] Have only these windows open:
  - iPhone Simulator (full screen)
  - Browser with QR code page
  - Browser with Dashboard (http://localhost:3000)

---

## During Recording (5-7 minutes)

### Recording Script Flow

Follow this exact sequence:

---

#### **SCENE 1: Introduction (30 seconds)**

**Show on screen:**
- Your desktop with prepared windows
- Or a title slide (optional)

**Say:**
> "Hi, I'm demonstrating Elder Companion AI - a complete elderly care platform that uses Letta for long-term memory and ChromaDB for semantic search to provide personalized support for elderly individuals.
>
> According to the CDC, 38 million elderly Americans need daily support, and medication non-adherence causes 125,000 deaths per year. Our solution combines an AI companion mobile app, smart reminders, and a caregiver dashboard to address this crisis."

---

#### **SCENE 2: Mobile App - Setup (45 seconds)**

**Show on screen:**
- Switch to browser with QR code page
- Zoom in on one of the QR codes (Patient 1 or 2)

**Say:**
> "Setup is simple. Each patient gets a secure QR code. Let me show you on the mobile app."

**Actions:**
- Switch to iPhone Simulator
- Show setup screen
- Enter patient data manually (since camera doesn't work in simulator)
  - OR if on real iPhone, scan the QR code

**Say:**
> "The app validates the setup token with our backend API and loads Grandma Betty's profile including her medications, medical conditions, and preferences."

**Wait for:**
- ✅ Setup completes
- ✅ Home screen appears with reminders

---

#### **SCENE 3: Voice Chat - Medication Confirmation (60 seconds)**

**Show on screen:**
- Mobile app home screen

**Say:**
> "Now let's see the core feature - voice chat with AI memory."

**Actions:**
1. Tap "Chat" tab
2. Tap microphone button
3. Say clearly:
   **"Good morning! I just took my medication."**
4. Wait for transcription
5. Wait for AI response (with voice)

**Say (while AI is responding):**
> "Notice the AI responds personally - it knows Betty's name, personality, and medication history. Behind the scenes, we're using Letta for long-term memory, ChromaDB for semantic search of past conversations, and Claude for natural language generation. This creates continuity - Betty doesn't have to repeat context every time."

---

#### **SCENE 4: Voice Chat - Health Concern (60 seconds)**

**Show on screen:**
- Still in Chat tab

**Say:**
> "Let me demonstrate how the system handles health concerns."

**Actions:**
1. Tap microphone again
2. Say clearly:
   **"My knee hurts today."**
3. Wait for AI response

**Say (while showing response):**
> "See how it remembered her knee issue? That's ChromaDB finding semantically similar past conversations combined with Letta's long-term memory that Betty has arthritis that worsens after gardening. This semantic search works by meaning, not keywords - it would match 'my leg aches' with 'knee pain' because they're semantically similar."

---

#### **SCENE 5: Smart Reminders (45 seconds)**

**Show on screen:**
- Navigate to Home tab in app
- Show list of reminders

**Say:**
> "Here's where our notification system gets innovative. When a reminder is due, we schedule 4 local notifications: the initial one at due time, then 3 retry notifications at 15, 20, and 25 minutes later. The retry notifications auto-open the voice chat, and the AI speaks first saying 'Hi, I noticed you haven't responded to your medication reminder.'
>
> What's special: this uses local notifications with the @notifee library - no Apple Developer account needed, no Firebase, zero cost, and 100% reliable."

---

#### **SCENE 6: Web Dashboard (90 seconds)**

**Show on screen:**
- Switch to browser with dashboard (http://localhost:3000)
- Should already be logged in as Sarah Miller

**Say:**
> "Now let's see the caregiver side. Sarah, Betty's daughter, can monitor everything from her dashboard."

**Actions:**
1. Show patient overview
   - Point out medications (Metformin, Lisinopril, Aspirin)
   - Show adherence percentage (e.g., 92%)

**Say:**
> "Sarah sees Betty's medical conditions, current medications, and most importantly - adherence metrics."

**Actions:**
2. Click "Conversations" tab
   - Show the conversations you just had

**Say:**
> "Here are the conversations we just had. They appeared automatically - no delay. Each includes sentiment analysis, health mention detection, and timestamps. Notice our 'knee pain' conversation is flagged with a concerned sentiment."

**Actions:**
3. Click "Alerts" tab (if any alerts exist)

**Say:**
> "If Betty misses a medication after 3 retry attempts, the system automatically creates an alert for Sarah. This reduces caregiver burden - no constant check-in calls needed."

---

#### **SCENE 7: Technical Architecture (60 seconds)**

**Show on screen:**
- You can show a diagram, or just talk with dashboard visible

**Say:**
> "Let me explain the technical architecture. When Betty speaks, her voice message goes to our FastAPI backend, which runs through our AI Orchestrator pipeline.
>
> The orchestrator does three things in parallel:
> 1. ChromaDB searches for semantically similar past conversations - this takes about 100 milliseconds
> 2. Letta retrieves long-term memory context including Betty's personality and behavioral patterns - about 500 milliseconds
> 3. Then we send everything to Claude to generate a personalized response - about 2.5 seconds
>
> The result gets stored back in PostgreSQL, ChromaDB as vector embeddings, and Letta updates its memory. Total response time is about 3 seconds - well under our 5-second target.
>
> ChromaDB and Letta work together as a multi-layer memory system. Letta provides structured long-term memory like personality and preferences, while ChromaDB provides semantic search of specific past conversations. Together, they give both breadth and depth of context."

---

#### **SCENE 8: Impact & Closing (45 seconds)**

**Show on screen:**
- Dashboard showing overall patient health

**Say:**
> "Why does this matter? For elderly individuals, this maintains independence longer, reduces anxiety about forgetting medications, and provides companionship to address social isolation.
>
> For caregivers, it's 24/7 monitoring without constant phone calls, an early warning system with alerts, and peace of mind.
>
> For the healthcare system, this reduces hospital readmissions, improves medication adherence which saves lives, and enables aging in place which is far cheaper than facilities.
>
> We estimate this could reduce caregiver burden by 40% and improve medication adherence by 30%.
>
> To recap: We've integrated Letta for long-term memory, ChromaDB for semantic search, and built a complete end-to-end system with mobile app, AI backend, and caregiver dashboard. This is production-ready, scales to millions, and addresses the $300 billion elderly care market.
>
> Thank you for watching!"

---

## Post-Recording (Immediately After)

### Step 1: Stop Recording
- Save video file
- **Recommended filename**: `elder-companion-demo-[date].mov`

### Step 2: Review Recording
- [ ] Watch entire video
- [ ] Check audio quality
- [ ] Check screen visibility (text readable?)
- [ ] Check for any glitches or freezes

### Step 3: Edit (Optional but Recommended)

**Use iMovie (free on Mac) or DaVinci Resolve (free, professional)**

**Editing checklist:**
- [ ] Add title slide at beginning
  - "Elder Companion AI"
  - "Demo for [Competition Name]"
  - Your name/team
- [ ] Add text overlays for key points:
  - "Letta API for Long-Term Memory"
  - "ChromaDB for Semantic Search"
  - "3-second response time"
- [ ] Speed up slow parts (like waiting for build)
- [ ] Add background music (low volume, non-distracting)
- [ ] Add end screen with:
  - Summary of features
  - Contact information
  - GitHub link (if public)

### Step 4: Export Video

**Settings:**
- Format: H.264 (most compatible)
- Resolution: 1920x1080 (Full HD)
- Frame Rate: 30 FPS
- Quality: High (at least 10 Mbps bitrate)

### Step 5: Upload

**Recommended platforms:**
- YouTube (unlisted or public)
- Vimeo (better for professional demos)
- Google Drive (if sharing privately with judges)

---

## Troubleshooting During Recording

### Problem: Voice chat not working
**Solution:**
- Check microphone permissions
- Check backend logs: `tail -f /tmp/elda-backend.log`
- Restart backend if needed
- Fall back to showing pre-recorded demo or screenshots

### Problem: Simulator is slow/laggy
**Solution:**
- Close other apps
- Restart simulator
- Use physical iPhone instead
- Or record in segments and edit together

### Problem: Backend API not responding
**Solution:**
```bash
# Check if running
curl http://localhost:8000/docs

# Restart if needed
cd /Users/gaurav/Elda/backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Problem: Dashboard not showing conversations
**Solution:**
- Refresh browser
- Check browser console for errors
- Verify API calls are succeeding
- Use screenshots as backup

### Problem: You make a mistake while recording
**Solution:**
- Pause recording
- Take a breath
- Resume from a clean point
- Edit out the mistake later
- OR just keep going and re-record that section

---

## Backup Plan

### If Live Demo Fails

**Have these ready:**
1. **Screenshots** of every screen
2. **Pre-recorded video** of working system
3. **Slide deck** with key points
4. **Architecture diagram**

**Say this:**
> "I have a live system here, but in case of any technical issues, let me show you this pre-recorded demonstration of the full workflow."

---

## Quick Command Reference

### Start Everything
```bash
cd /Users/gaurav/Elda
./REBUILD_FOR_DEMO.sh
```

### Check Backend
```bash
curl http://localhost:8000/docs
tail -f /tmp/elda-backend.log
```

### Restart Backend
```bash
pkill -f uvicorn
cd /Users/gaurav/Elda/backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Rebuild Mobile App
```bash
cd /Users/gaurav/Elda/elder-companion-mobile
rm -rf ios/build
npx react-native run-ios
```

### Open QR Code Page
```bash
open /Users/gaurav/Elda/backend/patient_qr_codes.html
```

### Start Dashboard
```bash
cd /Users/gaurav/Elda/caregiver-dashboard
npm run dev
```

---

## Final Checklist Before You Press Record

- [ ] Backend running and responding
- [ ] Mobile app built and running
- [ ] Dashboard accessible and loaded
- [ ] Test patient set up in mobile app
- [ ] Voice chat tested and working
- [ ] QR code page open in browser
- [ ] Desktop clean and organized
- [ ] Notifications turned off
- [ ] Recording software ready
- [ ] Microphone tested
- [ ] Script reviewed
- [ ] Water nearby (stay hydrated!)
- [ ] Deep breath taken 😊

---

## Good luck! You've got this! 🎬🚀

Remember:
- Speak slowly and clearly
- Show enthusiasm for your project
- If something goes wrong, stay calm
- You can always edit or re-record
- The judges want to see your passion and innovation

**Your project is amazing. Now show it off!**
